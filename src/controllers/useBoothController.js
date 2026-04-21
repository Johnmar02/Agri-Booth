import { computed, reactive, ref, watch } from 'vue';
import { useContentStore } from '@/stores/contentStore';
import {
  AGRI_BOOTH_BRAND,
  getAdvisoryResponseLibrary,
  getAdvisorySeedMessages,
  getBoothModules,
  getCalculatorDefaults,
  getCalculatorFieldDefinitions,
  getHotspotLayout,
  getOutcomeMetrics,
  getTriviaDeck,
} from '@/models/boothModel';
import { useLogbookController } from '@/controllers/useLogbookController';

/**
 * CONTROLLER: useBoothController
 * Coordinates the Agri-Booth dashboard, gated access flow, resource tracking, mock chat,
 * trivia, and calculators.
 *
 * WHY THIS FILE EXISTS:
 * The booth needs one orchestration layer that can connect models to views without
 * letting the view components own business rules. This controller becomes the secure
 * bridge where access policy, state transitions, and mock behavior are enforced.
 */

const ACCESS_SESSION_KEY = 'itcph-bebooth-access';
const TRACKED_RESOURCES_SESSION_KEY = 'itcph-bebooth-tracked-resources';

/**
 * Safely parses JSON from session storage and falls back when storage is unavailable.
 *
 * WHY THIS EXISTS:
 * The booth uses session storage only for lightweight access continuity. Guarding every
 * storage read prevents private browsing restrictions or malformed values from breaking
 * the UI.
 *
 * @param {string} key
 * @param {unknown} fallback
 * @returns {unknown}
 */
function readSessionJson(key, fallback) {
  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

/**
 * Safely writes JSON into session storage.
 *
 * WHY THIS EXISTS:
 * The booth should never fail because a browser blocks storage writes. Failing silently
 * is preferable to crashing a public-facing educational dashboard.
 *
 * @param {string} key
 * @param {unknown} value
 */
function writeSessionJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Intentionally ignored to keep the kiosk experience resilient.
  }
}

/**
 * Builds a resource lookup so the controller can convert tracked IDs back into human
 * labels for the virtual logbook and status summaries.
 *
 * WHY THIS EXISTS:
 * Views should not need to search the whole module catalog when rendering collected
 * assets. A normalized controller lookup keeps tracking fast and predictable.
 *
 * @param {ReturnType<typeof getBoothModules>} modules
 * @returns {Map<string, { id: string, title: string }>}
 */
function buildResourceIndex(modules) {
  return new Map(
    modules
      .flatMap((module) => module.resources ?? [])
      .map((resource) => [resource.id, { id: resource.id, title: resource.title }]),
  );
}

/**
 * Keeps numeric calculator input inside safe, realistic ranges.
 *
 * WHY THIS EXISTS:
 * Clamping protects the calculator UI from invalid values, runaway scientific notation,
 * and awkward negative states that would not make sense in an agricultural planning
 * context.
 *
 * @param {number} value
 * @param {{ min: number, max: number }} definition
 * @returns {number}
 */
function clampNumericInput(value, definition) {
  if (!Number.isFinite(value)) {
    return definition.min;
  }

  return Math.min(definition.max, Math.max(definition.min, value));
}

/**
 * Produces a deterministic advisory reply using keyword matches.
 *
 * WHY THIS EXISTS:
 * The project explicitly excludes backend services. A deterministic reply model gives the
 * UI a polished advisory feel without making unsupported network or AI calls.
 *
 * @param {string} message
 * @param {{ keywords: string[], response: string }[]} responseLibrary
 * @returns {string}
 */
function buildAdvisoryReply(message, responseLibrary) {
  const normalizedMessage = message.toLowerCase();
  const matchedReply = responseLibrary.find((entry) =>
    entry.keywords.some((keyword) => normalizedMessage.includes(keyword)),
  );

  if (matchedReply) {
    return matchedReply.response;
  }

  return 'This secure mock advisory assistant can currently guide visitors on biosecurity, training flows, low-bandwidth delivery, and calculator-style planning questions.';
}

/**
 * Formats numbers for calculator results in a way that feels professional but still
 * compact on mobile layouts.
 *
 * @param {number} value
 * @returns {string}
 */
function formatNumber(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Computes lightweight farm-planning outputs from the calculator state.
 *
 * WHY THIS EXISTS:
 * The calculator module should demonstrate practical value, not just placeholder forms.
 * Keeping these formulas in the controller preserves a clean separation from the view.
 *
 * @param {{ sowCount: number, pigletsPerSow: number, feedCostPerKg: number, dailyFeedKg: number, growOutDays: number }} inputs
 * @returns {{ label: string, value: string }[]}
 */
function getCalculatorResults(inputs) {
  const projectedPiglets = inputs.sowCount * inputs.pigletsPerSow;
  const dailyFeedSpend = inputs.feedCostPerKg * inputs.dailyFeedKg;
  const cycleFeedSpend = dailyFeedSpend * inputs.growOutDays;
  const feedPerPiglet = projectedPiglets > 0 ? cycleFeedSpend / projectedPiglets : 0;

  return [
    { label: 'Projected piglets / cycle', value: formatNumber(projectedPiglets) },
    { label: 'Daily feed spend', value: formatNumber(dailyFeedSpend) },
    { label: 'Grow-out feed spend', value: formatNumber(cycleFeedSpend) },
    { label: 'Feed spend per projected piglet', value: formatNumber(feedPerPiglet) },
  ];
}

export function useBoothController() {
  const contentStore = useContentStore();
  
  const outcomeMetrics = computed(() => contentStore.outcomes);
  // Modules and Hotspots are now reactive from the store
  const moduleCatalog = computed(() => contentStore.modules);
  const hotspotCatalog = getHotspotLayout(); // Layout (coordinates) remains static
  
  const responseLibrary = getAdvisoryResponseLibrary();
  const triviaDeck = getTriviaDeck();
  const calculatorFields = getCalculatorFieldDefinitions();
  const calculatorFieldMap = new Map(calculatorFields.map((field) => [field.id, field]));
  
  const resourceIndex = computed(() => buildResourceIndex(moduleCatalog.value));
  const moduleMap = computed(() => new Map(moduleCatalog.value.map((module) => [module.id, module])));
  const hotspotMap = new Map(hotspotCatalog.map((hotspot) => [hotspot.id, hotspot]));

  const activeModuleId = ref(null);
  const isLogbookOpen = ref(false);
  const pendingModuleId = ref(null);

  const initialTrackedResources = readSessionJson(TRACKED_RESOURCES_SESSION_KEY, []);
  const trackedResourceIds = ref(Array.isArray(initialTrackedResources) ? initialTrackedResources : []);

  /**
   * CONTROLLER STATE: Only a minimal access snapshot is persisted across refreshes.
   * Visitor identity stays in memory only to reduce exposure of personal data in the browser.
   */
  const visitorSession = reactive({
    isRegistered: Boolean(readSessionJson(ACCESS_SESSION_KEY, false)),
    displayName: '',
  });

  const advisoryMessages = ref(getAdvisorySeedMessages());
  const advisoryDraft = ref('');
  const advisoryIsBusy = ref(false);

  const triviaStateInternal = reactive({
    currentIndex: 0,
    selectedOptionId: '',
    hasAnswered: false,
    score: 0,
    isComplete: false,
  });

  const calculatorInputs = reactive(getCalculatorDefaults());

  const logbook = useLogbookController({
    getTrackedItems: () => collectedItems.value,
  });

  /**
   * Persists the minimal access flag and tracked resources after state changes.
   *
   * WHY THIS EXISTS:
   * Session continuity improves kiosk usability, but persisting only non-sensitive data
   * avoids storing names, addresses, or emails in browser storage.
   */
  watch(
    () => visitorSession.isRegistered,
    (isRegistered) => {
      writeSessionJson(ACCESS_SESSION_KEY, isRegistered);
    },
    { immediate: true },
  );

  watch(
    trackedResourceIds,
    (resourceIds) => {
      writeSessionJson(TRACKED_RESOURCES_SESSION_KEY, resourceIds);
    },
    { deep: true, immediate: true },
  );

  /**
   * Derived list of collected titles shown in the visitor summary and the controlled form.
   */
  const collectedItems = computed(() =>
    trackedResourceIds.value
      .map((resourceId) => resourceIndex.get(resourceId)?.title)
      .filter(Boolean),
  );

  /**
   * Derived hotspot list enriched with active and locked state so the view remains dumb.
   */
  const hotspots = computed(() =>
    hotspotCatalog.map((hotspot) => {
      const module = moduleMap.value.get(hotspot.moduleId);
      // Universal gating: Everything is locked if the user is not registered.
      const isLocked = !visitorSession.isRegistered;

      return {
        ...hotspot,
        isActive: module?.id === activeModuleId.value,
        isLocked,
      };
    }),
  );

  /**
   * Derived module cards enriched with current access state.
   */
  const modules = computed(() =>
    moduleCatalog.value.map((module) => ({
      ...module,
      // Universal gating: Everything is locked if the user is not registered.
      isLocked: !visitorSession.isRegistered,
      isActive: module.id === activeModuleId.value,
    })),
  );

  /**
   * The active drawer module, if one is currently open.
   */
  const activeModule = computed(() => modules.value.find((module) => module.id === activeModuleId.value) ?? null);

  /**
   * Human-readable context for the logbook modal.
   */
  const pendingModuleTitle = computed(
    () => moduleMap.value.get(pendingModuleId.value)?.title ?? 'restricted modules',
  );

  /**
   * Visitor summary displayed in the dashboard status panel.
   */
  const visitorStatus = computed(() => ({
    heading: visitorSession.displayName || (visitorSession.isRegistered ? 'Verified visitor session' : 'Guest access'),
    accessLabel: visitorSession.isRegistered ? 'Restricted modules unlocked' : 'Guest mode',
    description: visitorSession.isRegistered
      ? 'Personal details are kept in memory only for this tab, while access status and tracked item labels may persist for the current browser session.'
      : 'Register once to unlock controlled publications and advisory tools. The booth does not persist personal details in browser storage.',
    unlockedModuleCount: modules.value.filter((module) => !module.isLocked).length,
    totalModuleCount: modules.value.length,
  }));

  /**
   * Chat state prepared for the advisory view.
   */
  const chatState = computed(() => ({
    draft: advisoryDraft.value,
    isBusy: advisoryIsBusy.value,
    messages: advisoryMessages.value,
    prompts: moduleMap.value.get('chat-with-us')?.prompts ?? [],
  }));

  /**
   * Trivia state prepared for the Bebu module view.
   */
  const triviaState = computed(() => ({
    question: triviaDeck[triviaStateInternal.currentIndex] ?? null,
    currentIndex: triviaStateInternal.currentIndex + 1,
    totalQuestions: triviaDeck.length,
    selectedOptionId: triviaStateInternal.selectedOptionId,
    hasAnswered: triviaStateInternal.hasAnswered,
    score: triviaStateInternal.score,
    isComplete: triviaStateInternal.isComplete,
  }));

  /**
   * Calculator state prepared for the digital calculators view.
   */
  const calculatorState = computed(() => ({
    fields: calculatorFields,
    inputs: { ...calculatorInputs },
    results: getCalculatorResults(calculatorInputs),
  }));

  /**
   * Opens a module when access policy allows it or redirects the visitor into the logbook
   * when the requested module is gated.
   *
   * @param {string} moduleId
   */
  const selectModule = (moduleId) => {
    // If the logbook is currently open, we prevent switching to other modules
    // until the user has addressed the registration first.
    if (isLogbookOpen.value) {
      return;
    }

    const module = moduleMap.value.get(moduleId);

    if (!module) {
      return;
    }

    // Standard Dashboard Gating: Data collection first
    if (!visitorSession.isRegistered) {
      openLogbook(moduleId);
      return;
    }

    activeModuleId.value = module.id;
  };

  /**
   * Resolves a hotspot into its associated module and then delegates to the access-aware
   * module selection flow.
   *
   * @param {string} hotspotId
   */
  const selectHotspot = (hotspotId) => {
    const hotspot = hotspotMap.get(hotspotId);

    if (!hotspot) {
      return;
    }

    selectModule(hotspot.moduleId);
  };

  /**
   * Closes the active right-hand drawer.
   */
  const closeActiveModule = () => {
    activeModuleId.value = null;
  };

  /**
   * Opens the logbook modal and optionally remembers which module triggered it.
   *
   * WHY THIS EXISTS:
   * The access flow should feel supportive rather than punitive. Preserving the user's
   * requested destination lets the app return them to the intended module after success.
   *
   * @param {string | null} moduleId
   */
  const openLogbook = (moduleId = null) => {
    pendingModuleId.value = moduleId;
    isLogbookOpen.value = true;
    activeModuleId.value = null;
  };

  /**
   * Closes the logbook modal without changing the current access state.
   */
  const closeLogbook = () => {
    isLogbookOpen.value = false;
    pendingModuleId.value = null;
  };

  /**
   * Records a resource interaction in a deduplicated tracking list.
   *
   * WHY THIS EXISTS:
   * "Items Collected" should be derived from actual booth interactions so reporting stays
   * consistent even before backend analytics are available.
   *
   * @param {string} resourceId
   */
  const trackResource = (resourceId) => {
    if (!resourceIndex.has(resourceId) || trackedResourceIds.value.includes(resourceId)) {
      return;
    }

    trackedResourceIds.value = [...trackedResourceIds.value, resourceId];
  };

  /**
   * Updates a single logbook field through the dedicated form controller.
   *
   * @param {{ field: string, value: string }} payload
   */
  const updateLogbookField = (payload) => {
    if (!payload?.field) {
      return;
    }

    logbook.updateField(payload.field, payload.value);
  };

  /**
   * Completes the mock registration flow, unlocks gated modules for the current browser
   * session, and returns the visitor to the module that originally required access.
   */
  const submitLogbook = async () => {
    const result = await logbook.submit();

    if (!result.ok || !result.payload) {
      return;
    }

    visitorSession.isRegistered = true;
    visitorSession.displayName = result.payload.name;
    isLogbookOpen.value = false;

    const requestedModuleId = pendingModuleId.value;
    pendingModuleId.value = null;

    logbook.resetForm();

    if (requestedModuleId) {
      selectModule(requestedModuleId);
    }
  };

  /**
   * Normalizes the draft message used by the advisory composer.
   *
   * WHY THIS EXISTS:
   * Chat input still needs the same frontend hygiene as the logbook, but with a lighter
   * touch suitable for conversational prompts.
   *
   * @param {string} rawValue
   */
  const updateChatDraft = (rawValue) => {
    advisoryDraft.value = String(rawValue ?? '')
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/[<>]/g, '')
      .replace(/\s+/g, ' ')
      .trimStart()
      .slice(0, 280);
  };

  /**
   * Simulates a deterministic advisory response for the chat module.
   */
  const submitChatMessage = async () => {
    const trimmedMessage = advisoryDraft.value.trim();

    if (!trimmedMessage || advisoryIsBusy.value) {
      return;
    }

    advisoryMessages.value = [
      ...advisoryMessages.value,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmedMessage,
      },
    ];

    advisoryDraft.value = '';
    advisoryIsBusy.value = true;

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 320));

      advisoryMessages.value = [
        ...advisoryMessages.value,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: buildAdvisoryReply(trimmedMessage, responseLibrary),
        },
      ];
    } finally {
      advisoryIsBusy.value = false;
    }
  };

  /**
   * Scores the current trivia question one time only.
   *
   * @param {string} optionId
   */
  const answerTrivia = (optionId) => {
    const question = triviaDeck[triviaStateInternal.currentIndex];

    if (!question || triviaStateInternal.hasAnswered || triviaStateInternal.isComplete) {
      return;
    }

    triviaStateInternal.selectedOptionId = optionId;
    triviaStateInternal.hasAnswered = true;

    if (optionId === question.correctOptionId) {
      triviaStateInternal.score += 1;
    }
  };

  /**
   * Advances to the next trivia question or marks the round complete when the visitor
   * reaches the end of the deck.
   */
  const advanceTrivia = () => {
    if (!triviaStateInternal.hasAnswered) {
      return;
    }

    if (triviaStateInternal.currentIndex >= triviaDeck.length - 1) {
      triviaStateInternal.isComplete = true;
      return;
    }

    triviaStateInternal.currentIndex += 1;
    triviaStateInternal.selectedOptionId = '';
    triviaStateInternal.hasAnswered = false;
  };

  /**
   * Resets the trivia round so the public engagement module can be replayed at events.
   */
  const resetTrivia = () => {
    triviaStateInternal.currentIndex = 0;
    triviaStateInternal.selectedOptionId = '';
    triviaStateInternal.hasAnswered = false;
    triviaStateInternal.score = 0;
    triviaStateInternal.isComplete = false;
  };

  /**
   * Updates one calculator input and immediately refreshes derived results.
   *
   * @param {{ field: string, value: string | number }} payload
   */
  const updateCalculatorInput = (payload) => {
    if (!payload?.field || !calculatorFieldMap.has(payload.field)) {
      return;
    }

    const fieldDefinition = calculatorFieldMap.get(payload.field);
    const numericValue = clampNumericInput(Number(payload.value), fieldDefinition);

    calculatorInputs[payload.field] = numericValue;
  };

  return {
    brand: AGRI_BOOTH_BRAND,
    outcomes: outcomeMetrics,
    hotspots,
    modules,
    activeModule,
    collectedItems,
    trackedResourceIds,
    visitorStatus,
    isLogbookOpen,
    pendingModuleTitle,
    logbookForm: logbook.form,
    logbookErrors: logbook.errors,
    logbookFieldOptions: logbook.fieldOptions,
    isLogbookSubmitting: logbook.isSubmitting,
    chatState,
    triviaState,
    calculatorState,
    selectModule,
    selectHotspot,
    closeActiveModule,
    openLogbook,
    closeLogbook,
    trackResource,
    updateLogbookField,
    submitLogbook,
    updateChatDraft,
    submitChatMessage,
    answerTrivia,
    advanceTrivia,
    resetTrivia,
    updateCalculatorInput,
  };
}
