/**
 * MODEL: boothModel.js
 * Centralizes every mock educational module, hotspot coordinate, and guided-content
 * seed used by the ITCPH Digital Agri-Booth.
 *
 * WHY THIS FILE EXISTS:
 * The booth is meant to standardize IOP-driven swine farming knowledge across many
 * touchpoints. Keeping content definitions in a dedicated model layer prevents Views
 * from hard-coding business content, which makes audits, updates, and localization
 * safer and more predictable over time.
 */

/**
 * @typedef {'public' | 'gated'} ModuleAccessLevel
 *
 * @typedef {Object} BoothMetric
 * @property {string} label
 * @property {string} value
 *
 * @typedef {Object} BoothResource
 * @property {string} id
 * @property {string} title
 * @property {string} format
 * @property {string} description
 * @property {string} status
 *
 * @typedef {Object} BoothModule
 * @property {string} id
 * @property {string} hotspotId
 * @property {string} title
 * @property {ModuleAccessLevel} access
 * @property {string} badge
 * @property {string} summary
 * @property {string} description
 * @property {string[]} highlights
 * @property {BoothMetric[]} quickStats
 * @property {BoothResource[]} resources
 * @property {string[]} stories
 * @property {string[]} prompts
 * @property {{ title: string, caption: string } | null} placeholder
 *
 * @typedef {Object} HotspotDefinition
 * @property {string} id
 * @property {string} moduleId
 * @property {string} label
 * @property {string} shortLabel
 * @property {number} x
 * @property {number} y
 * @property {string} zone
 */

/**
 * Returns a deep copy of frozen mock data so controllers can safely derive local state
 * without mutating the source of truth.
 *
 * WHY THIS EXISTS:
 * The same mock catalog is reused in multiple controllers and views. Returning clones
 * prevents accidental cross-component mutation, which is especially important when the
 * booth is used as a reference implementation for future integrations.
 *
 * @template T
 * @param {T} value
 * @returns {T}
 */
function cloneValue(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

/**
 * MODEL: Brand constants stay immutable because they express the public mission of the
 * booth and should not drift as interactive modules open and close.
 */
export const AGRI_BOOTH_BRAND = Object.freeze({
  name: 'ITCPH Digital Agri-Booth',
  shortName: 'Be-Booth',
  strapline: 'Living digital twin of the ATI International Training Center on Pig Husbandry.',
  mission:
    'Standardize and broadcast IOP-driven swine farming practices as a benchmark for smart agriculture in the ASEAN region.',
});

/**
 * MODEL: Outcome metrics are rendered in the hero area to keep the strategic goals
 * visible, not buried inside module drawers.
 */
const OUTCOMES = Object.freeze([
  { label: 'Biosecurity risk', value: 'Zero contact' },
  { label: 'Availability', value: '24/7 access' },
  { label: 'Data sharing', value: 'Real-time ready' },
  { label: 'Logistics cost', value: 'Low overhead' },
]);

/**
 * MODEL: Hotspot positions are normalized percentages so the layout scales cleanly
 * across phones, tablets, and desktops without relying on a heavy 3D runtime.
 *
 * @type {readonly HotspotDefinition[]}
 */
const HOTSPOTS = Object.freeze([
  {
    id: 'hotspot-virtual-tour',
    moduleId: 'virtual-tour',
    label: 'Virtual Tour',
    shortLabel: 'VT',
    x: 52,
    y: 24,
    zone: 'Entry map',
  },
  {
    id: 'hotspot-iec',
    moduleId: 'iec-materials',
    label: 'IEC Materials',
    shortLabel: 'IEC',
    x: 34,
    y: 36,
    zone: 'Resource wall',
  },
  {
    id: 'hotspot-corporate',
    moduleId: 'corporate-materials',
    label: 'Corporate Materials',
    shortLabel: 'CM',
    x: 18,
    y: 56,
    zone: 'Center backdrop',
  },
  {
    id: 'hotspot-newsletters',
    moduleId: 'newsletters',
    label: 'Newsletters',
    shortLabel: 'NL',
    x: 72,
    y: 34,
    zone: 'Publication stack',
  },
  {
    id: 'hotspot-chat',
    moduleId: 'chat-with-us',
    label: 'Chat With Us',
    shortLabel: 'AI',
    x: 80,
    y: 56,
    zone: 'Advisory desk',
  },
  {
    id: 'hotspot-elearning',
    moduleId: 'e-learning',
    label: 'E-Learning',
    shortLabel: 'LMS',
    x: 62,
    y: 72,
    zone: 'Training kiosk',
  },
  {
    id: 'hotspot-bebu',
    moduleId: 'bebu-game',
    label: 'Bebu Game',
    shortLabel: 'BG',
    x: 40,
    y: 74,
    zone: 'Trivia corner',
  },
  {
    id: 'hotspot-calculators',
    moduleId: 'digital-calculators',
    label: 'Digital Calculators',
    shortLabel: 'DC',
    x: 24,
    y: 76,
    zone: 'Decision tools',
  },
]);

/**
 * MODEL: Module definitions intentionally separate "access policy" from "content".
 * That design allows the controller to enforce gated access without the view needing to
 * know why a given module should be locked.
 *
 * @type {readonly BoothModule[]}
 */
const MODULES = Object.freeze([
  {
    id: 'virtual-tour',
    hotspotId: 'hotspot-virtual-tour',
    title: 'Virtual Tour',
    access: 'public',
    badge: 'Low-bandwidth default',
    summary: 'Inspect the booth through a live local 3D preview while keeping the hotspot map available for guided navigation.',
    description:
      'This module now pairs a locally hosted GLB booth preview with the schematic hotspot map so visitors can inspect the structure while still keeping navigation understandable on phones and event-floor connections.',
    highlights: [
      'Loads the booth from a local GLB asset instead of relying on third-party streaming.',
      'Keeps the hotspot map visible so the 3D preview does not make navigation harder on smaller screens.',
      'Reserves room for future narrated camera stops, 360 media, and richer spatial annotations.',
    ],
    quickStats: [
      { label: 'Current mode', value: '3D preview + map' },
      { label: 'Model source', value: 'Local GLB asset' },
      { label: 'Next step', value: '360 annotations' },
    ],
    resources: [],
    stories: [],
    prompts: [],
    externalTourUrl: 'https://s3.ap-southeast-1.amazonaws.com/tours.exsight360.com/itcph/v5/tour.html',
    placeholder: {
      title: 'ITCPH 360 Explorer',
      caption:
        'Access the official high-resolution 360 immersive walkthrough of the ITCPH facilities, integrated directly into the Agri-Booth dashboard.',
    },
  },
  {
    id: 'iec-materials',
    hotspotId: 'hotspot-iec',
    title: 'IEC Materials',
    access: 'gated',
    badge: 'Controlled download zone',
    summary: 'Trackable mock downloads for standard operating guides, checklists, and pig husbandry references.',
    description:
      'IEC assets are gated because they represent measurable knowledge-transfer outputs. The booth records what visitors collect before exposing resource-heavy training materials.',
    highlights: [
      'Supports biosecurity-safe distribution of reference guides without physical handling.',
      'Provides a mock download flow that can later be connected to a document service.',
      'Feeds the virtual logbook with measurable engagement data for future reporting.',
    ],
    quickStats: [
      { label: 'Format', value: 'Mock PDFs' },
      { label: 'Tracking', value: 'Per asset' },
      { label: 'Access', value: 'Registered' },
    ],
    resources: [
      {
        id: 'res-biosecurity-checklist',
        title: 'Biosecurity Entry Checklist',
        format: 'PDF mock',
        description: 'Visitor flow, footbath discipline, and sanitation checkpoints for controlled farm access.',
        status: 'Ready for tracking',
      },
      {
        id: 'res-feeding-guide',
        title: 'Swine Feeding Guide',
        format: 'PDF mock',
        description: 'A structured feeding reference for growth stages, ration monitoring, and cost discipline.',
        status: 'Ready for tracking',
      },
      {
        id: 'res-breed-selection',
        title: 'Breed Selection Primer',
        format: 'PDF mock',
        description: 'Decision support notes for matching genetics with farm goals and extension training needs.',
        status: 'Ready for tracking',
      },
    ],
    stories: [],
    prompts: [],
    placeholder: null,
  },
  {
    id: 'corporate-materials',
    hotspotId: 'hotspot-corporate',
    title: 'Corporate Materials & Success Stories',
    access: 'gated',
    badge: 'Institutional showcase',
    summary: 'A leadership and impact area for ATI, ITCPH, and partner success narratives.',
    description:
      'This section translates organizational credibility into reusable digital proof points, helping the booth serve both advocacy and extension learning roles.',
    highlights: [
      'Presents ATI and ITCPH as a benchmark site for smart swine agriculture.',
      'Pairs formal materials with outcomes so the booth feels evidence-driven, not promotional only.',
      'Keeps success stories in the same content model used for future case study feeds.',
    ],
    quickStats: [
      { label: 'Narratives', value: 'Case-based' },
      { label: 'Audience', value: 'ASEAN-ready' },
      { label: 'Use case', value: 'Advocacy + training' },
    ],
    resources: [
      {
        id: 'res-capability-profile',
        title: 'ITCPH Capability Profile',
        format: 'Brochure mock',
        description: 'Core services, learning site strengths, and digital extension positioning.',
        status: 'Ready for tracking',
      },
      {
        id: 'res-training-calendar',
        title: 'Training Calendar Snapshot',
        format: 'One-pager mock',
        description: 'A mock listing of short courses, extension activities, and public advisory schedules.',
        status: 'Ready for tracking',
      },
    ],
    stories: [
      'A farm cluster replicated visitor screening and feed discipline after using the digital booth as a remote orientation aid.',
      'A training cohort used the digital booth to standardize pre-session materials, reducing paper logistics during on-site workshops.',
    ],
    prompts: [],
    placeholder: null,
  },
  {
    id: 'newsletters',
    hotspotId: 'hotspot-newsletters',
    title: 'Newsletters',
    access: 'gated',
    badge: 'Publication archive',
    summary: 'Issue-based updates that keep stakeholders informed about innovations, trainings, and farm performance themes.',
    description:
      'Newsletter access is controlled so the booth can measure recurring stakeholder interest and understand which publication topics matter most to visitors.',
    highlights: [
      'Organizes recurring updates into a consistent publication shelf.',
      'Allows future analytics on which issue themes are requested most often.',
      'Supports asynchronous learning when live training is not available.',
    ],
    quickStats: [
      { label: 'Cadence', value: 'Issue-based' },
      { label: 'Purpose', value: 'Retention' },
      { label: 'Access', value: 'Registered' },
    ],
    resources: [
      {
        id: 'res-news-jan',
        title: 'Newsletter Issue 01',
        format: 'PDF mock',
        description: 'Farm biosecurity wins, extension highlights, and smart agriculture briefings.',
        status: 'Ready for tracking',
      },
      {
        id: 'res-news-feb',
        title: 'Newsletter Issue 02',
        format: 'PDF mock',
        description: 'Pig husbandry training recaps and new digital support opportunities.',
        status: 'Ready for tracking',
      },
      {
        id: 'res-news-mar',
        title: 'Newsletter Issue 03',
        format: 'PDF mock',
        description: 'Operational lessons from remote engagement and booth-assisted outreach.',
        status: 'Ready for tracking',
      },
    ],
    stories: [],
    prompts: [],
    placeholder: null,
  },
  {
    id: 'chat-with-us',
    hotspotId: 'hotspot-chat',
    title: 'Chat With Us',
    access: 'gated',
    badge: 'Automated advisory UI',
    summary: 'A mock farm business advisory conversation surface for frequently asked questions and guided support.',
    description:
      'The advisory chat is gated because it simulates personalized engagement. Requiring the logbook first mirrors how future support services can stay measurable and responsibly exposed.',
    highlights: [
      'Designed as a safe mock chat without backend transmission or external AI calls.',
      'Demonstrates how visitor questions can be routed into future advisory workflows.',
      'Uses canned logic only, preventing accidental disclosure of unsupported advice.',
    ],
    quickStats: [
      { label: 'Mode', value: 'Mock assistant' },
      { label: 'Backend', value: 'None' },
      { label: 'Auditability', value: 'Deterministic' },
    ],
    resources: [],
    stories: [],
    prompts: [
      'How do I start a farm biosecurity checklist?',
      'What should a low-bandwidth advisory workflow look like?',
      'How can the booth support extension training at scale?',
    ],
    placeholder: null,
  },
  {
    id: 'e-learning',
    hotspotId: 'hotspot-elearning',
    title: 'E-Learning',
    access: 'gated',
    badge: 'Portal placeholder',
    summary: 'A launch point for future LMS and digital learning integrations without coupling the frontend to a live platform yet.',
    description:
      'The portal stays mocked in this frontend-only build so the interface can be validated now while LMS handshakes, enrollment rules, and back-office flows are handled later.',
    highlights: [
      'Supports a future handoff to ATI and ITCPH learning portals.',
      'Keeps portal navigation visible even before live authentication is attached.',
      'Protects the frontend from broken deep links while requirements are still evolving.',
    ],
    quickStats: [
      { label: 'Status', value: 'Frontend mock' },
      { label: 'Auth', value: 'Deferred' },
      { label: 'Purpose', value: 'Learning gateway' },
    ],
    resources: [
      {
        id: 'res-lms-orientation',
        title: 'LMS Orientation Tile',
        format: 'Portal mock',
        description: 'Placeholder card for orientation videos, schedules, and course walkthroughs.',
        status: 'Ready for tracking',
      },
      {
        id: 'res-course-catalog',
        title: 'Course Catalog Tile',
        format: 'Portal mock',
        description: 'Placeholder card for pig husbandry lessons, quizzes, and certificate pathways.',
        status: 'Ready for tracking',
      },
    ],
    stories: [],
    prompts: [],
    placeholder: null,
  },
  {
    id: 'bebu-game',
    hotspotId: 'hotspot-bebu',
    title: 'Bebu Game',
    access: 'public',
    badge: 'Engagement module',
    summary: 'A light trivia experience that turns core pig husbandry lessons into repeatable recall checks.',
    description:
      'The trivia layer keeps the booth playful without diluting its training purpose. It is public by design so visitors can engage even before completing the logbook.',
    highlights: [
      'Supports informal learning and event-floor engagement.',
      'Creates a pathway from curiosity into deeper gated modules.',
      'Uses deterministic scoring suitable for future badge logic.',
    ],
    quickStats: [
      { label: 'Audience', value: 'Open access' },
      { label: 'Mode', value: 'Single-question flow' },
      { label: 'Goal', value: 'Recall practice' },
    ],
    resources: [],
    stories: [],
    prompts: [],
    placeholder: null,
  },
  {
    id: 'digital-calculators',
    hotspotId: 'hotspot-calculators',
    title: 'Digital Calculators',
    access: 'public',
    badge: 'Decision support',
    summary: 'Simple farm calculators that preview how the booth can support cost and planning decisions.',
    description:
      'These calculators stay public because they are a strong demonstration of practical value. They also prove how the booth can bridge education with operational decision support.',
    highlights: [
      'Focused on lightweight calculations that run fully in the browser.',
      'Avoids network calls so farm users can still work offline or on poor signal.',
      'Acts as a foundation for future ROI and feed analytics modules.',
    ],
    quickStats: [
      { label: 'Mode', value: 'Browser-only' },
      { label: 'Latency', value: 'Instant' },
      { label: 'Use case', value: 'Planning aid' },
    ],
    resources: [],
    stories: [],
    prompts: [],
    placeholder: null,
  },
]);

/**
 * MODEL: Chat responses are deterministic and keyword-driven because the user asked for a
 * secure frontend-only build. We intentionally avoid any hidden network dependency.
 */
const ADVISORY_RESPONSE_LIBRARY = Object.freeze([
  {
    keywords: ['biosecurity', 'visitor', 'checklist', 'sanitize', 'sanitation'],
    response:
      'Start with a controlled visitor log, clear entry and exit points, sanitation steps, and a non-negotiable separation between clean and dirty workflows.',
  },
  {
    keywords: ['bandwidth', 'mobile', 'offline', 'signal'],
    response:
      'Design for text-first delivery, cache lightweight reference cards, and only introduce heavier media after a user explicitly requests it on a stable connection.',
  },
  {
    keywords: ['training', 'lms', 'extension', 'learning'],
    response:
      'Use the booth as an orientation layer first, then hand visitors to scheduled lessons, downloadable references, and short assessments inside the LMS.',
  },
  {
    keywords: ['cost', 'roi', 'calculator', 'feed'],
    response:
      'Keep the advisory focused on decision support: estimate feed cost, expected output, and labor implications before recommending any operational change.',
  },
]);

/**
 * MODEL: Seed chat messages guide the first interaction so the advisory module never
 * appears empty or broken on first load.
 */
const ADVISORY_SEED_MESSAGES = Object.freeze([
  {
    id: 'assistant-seed',
    role: 'assistant',
    text: 'Welcome to the mock Farm Business Advisory desk. Ask about biosecurity, low-bandwidth delivery, or training pathways.',
  },
]);

/**
 * MODEL: Trivia remains immutable so scoring can be reproduced consistently across
 * sessions and future QA checks.
 */
const TRIVIA_QUESTIONS = Object.freeze([
  {
    id: 'trivia-1',
    prompt: 'Which booth outcome is most directly tied to avoiding farm contamination during outreach?',
    options: [
      { id: 'a', label: 'Zero Biosecurity Risk' },
      { id: 'b', label: 'Low Logistics Cost' },
      { id: 'c', label: '24/7 Availability' },
    ],
    correctOptionId: 'a',
    explanation:
      'The booth reduces physical contact and material handling, which directly supports a zero-biosecurity-risk outreach model.',
  },
  {
    id: 'trivia-2',
    prompt: 'Why is the current virtual tour delivered as a lightweight hotspot map?',
    options: [
      { id: 'a', label: 'To avoid documenting the booth layout' },
      { id: 'b', label: 'To support low-bandwidth mobile access' },
      { id: 'c', label: 'To replace all future training modules' },
    ],
    correctOptionId: 'b',
    explanation:
      'The fallback map keeps the interface accessible even when visitors are on weak mobile or event-floor connections.',
  },
]);

/**
 * MODEL: Calculator field definitions stay outside the view so labels, limits, and
 * semantics are auditable in one place.
 */
const CALCULATOR_FIELDS = Object.freeze([
  {
    id: 'sowCount',
    label: 'Breeding sows',
    min: 0,
    max: 1000,
    step: 1,
    suffix: 'heads',
  },
  {
    id: 'pigletsPerSow',
    label: 'Piglets per sow / cycle',
    min: 0,
    max: 30,
    step: 0.5,
    suffix: 'piglets',
  },
  {
    id: 'feedCostPerKg',
    label: 'Feed cost per kilogram',
    min: 0,
    max: 500,
    step: 0.1,
    suffix: 'currency/kg',
  },
  {
    id: 'dailyFeedKg',
    label: 'Daily feed consumption',
    min: 0,
    max: 500,
    step: 0.1,
    suffix: 'kg/day',
  },
  {
    id: 'growOutDays',
    label: 'Grow-out days',
    min: 1,
    max: 365,
    step: 1,
    suffix: 'days',
  },
]);

/**
 * MODEL: Default calculator inputs create meaningful sample outputs immediately so the
 * calculator demonstrates value before the user enters custom values.
 */
const CALCULATOR_DEFAULTS = Object.freeze({
  sowCount: 12,
  pigletsPerSow: 10,
  feedCostPerKg: 24.5,
  dailyFeedKg: 38,
  growOutDays: 120,
});

/**
 * Returns a clone of the immutable outcome metrics.
 *
 * @returns {BoothMetric[]}
 */
export function getOutcomeMetrics() {
  return cloneValue(OUTCOMES);
}

/**
 * Returns a clone of the booth hotspot layout.
 *
 * @returns {HotspotDefinition[]}
 */
export function getHotspotLayout() {
  return cloneValue(HOTSPOTS);
}

/**
 * Returns a clone of the complete booth module catalog.
 *
 * @returns {BoothModule[]}
 */
export function getBoothModules() {
  return cloneValue(MODULES);
}

/**
 * Returns a clone of the advisory response catalog used by the chat controller.
 *
 * @returns {{ keywords: string[], response: string }[]}
 */
export function getAdvisoryResponseLibrary() {
  return cloneValue(ADVISORY_RESPONSE_LIBRARY);
}

/**
 * Returns a clone of the initial advisory conversation.
 *
 * @returns {{ id: string, role: string, text: string }[]}
 */
export function getAdvisorySeedMessages() {
  return cloneValue(ADVISORY_SEED_MESSAGES);
}

/**
 * Returns a clone of the trivia deck for the Bebu game module.
 *
 * @returns {{ id: string, prompt: string, options: { id: string, label: string }[], correctOptionId: string, explanation: string }[]}
 */
export function getTriviaDeck() {
  return cloneValue(TRIVIA_QUESTIONS);
}

/**
 * Returns the calculator field metadata used by the digital calculators module.
 *
 * @returns {{ id: string, label: string, min: number, max: number, step: number, suffix: string }[]}
 */
export function getCalculatorFieldDefinitions() {
  return cloneValue(CALCULATOR_FIELDS);
}

/**
 * Returns default calculator input values for the controller's reactive state.
 *
 * @returns {{ sowCount: number, pigletsPerSow: number, feedCostPerKg: number, dailyFeedKg: number, growOutDays: number }}
 */
export function getCalculatorDefaults() {
  return cloneValue(CALCULATOR_DEFAULTS);
}
