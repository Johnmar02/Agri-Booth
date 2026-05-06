import { ref, reactive, computed } from 'vue';
import { useContentStore } from '@/stores/contentStore';
import { apiClient } from '@/services/apiClient';

const ADMIN_TOKEN_KEY = 'itcph_admin_token';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

let contentStore;
const getContentStore = () => {
  if (!contentStore) {
    contentStore = useContentStore();
  }
  return contentStore;
};

const isAuthenticated = ref(false);
const loginForm = reactive({
  username: '',
  password: '',
  error: ''
});
const isAddingResource = ref(false);
const resourceDraft = reactive({
  title: '',
  description: '',
  format: 'PDF Document',
  status: 'Ready',
  file: null,
  imageFile: null,
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOptionId: 'a'
});
const uploadProgress = ref(0);
let autoLogoutTimer = null;

function readAdminSession() {
  const rawSession = window.localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession);
  } catch (error) {
    return null;
  }
}

function writeAdminSession() {
  window.localStorage.setItem(
    ADMIN_TOKEN_KEY,
    JSON.stringify({
      role: 'admin',
      exp: Date.now() + SESSION_TIMEOUT_MS
    })
  );
}

function isSessionValid(session) {
  return session?.role === 'admin' && session.exp && session.exp > Date.now();
}

function clearAutoLogoutTimer() {
  if (autoLogoutTimer) {
    clearTimeout(autoLogoutTimer);
    autoLogoutTimer = null;
  }
}

function scheduleAutoLogout() {
  clearAutoLogoutTimer();
  if (!isAuthenticated.value) return;
  autoLogoutTimer = window.setTimeout(() => {
    clearAdminSession();
  }, SESSION_TIMEOUT_MS);
}

function refreshAdminSession() {
  if (!isAuthenticated.value) return;
  const session = readAdminSession();
  if (!isSessionValid(session)) {
    clearAdminSession();
    return;
  }

  writeAdminSession();
  scheduleAutoLogout();
}

function restoreAdminSession() {
  const session = readAdminSession();
  if (isSessionValid(session)) {
    isAuthenticated.value = true;
    scheduleAutoLogout();
    
    // We can't easily call fetch methods here because they are inside useAdminController
    // But we can use the store directly if needed, or let the view call them.
  } else {
    clearAdminSession();
  }
}

function clearAdminSession() {
  isAuthenticated.value = false;
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  clearAutoLogoutTimer();
}

function activityWatcher() {
  if (isAuthenticated.value) {
    refreshAdminSession();
  }
}

if (typeof window !== 'undefined') {
  ACTIVITY_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, activityWatcher, { passive: true });
  });
}

/**
 * CONTROLLER: useAdminController
 * Manages the administrative session, mock authentication, 
 * and resource management logic.
 */
export function useAdminController() {
  const login = async () => {
    loginForm.error = '';
    const result = await apiClient.loginAdmin(loginForm.username, loginForm.password);
    
    if (result.ok) {
      isAuthenticated.value = true;
      writeAdminSession();
      scheduleAutoLogout();
      // Fetch initial data
      await fetchStats();
      await fetchLogs();
      return true;
    }

    loginForm.error = result.message || 'Access denied.';
    return false;
  };

  const logout = async () => {
    try {
      // Clear cookie on server
      await apiClient.logoutAdmin?.();
    } catch (e) {
      // Continue with local logout
    }
    isAuthenticated.value = false;
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    loginForm.username = '';
    loginForm.password = '';
    loginForm.error = '';
    clearAutoLogoutTimer();
  };

  const fetchStats = async () => {
    const store = getContentStore();
    await store.fetchStats();
  };

  const fetchLogs = async () => {
    const store = getContentStore();
    await store.fetchVisitors();
  };

  const startAddResource = () => {
    resourceDraft.title = '';
    resourceDraft.description = '';
    resourceDraft.format = 'PDF Document';
    resourceDraft.file = null;
    resourceDraft.imageFile = null;
    resourceDraft.question = '';
    resourceDraft.optionA = '';
    resourceDraft.optionB = '';
    resourceDraft.optionC = '';
    resourceDraft.optionD = '';
    resourceDraft.correctOptionId = 'a';
    isAddingResource.value = true;
  };

  const commitResource = async (moduleId) => {
    const isBebuQuestion = moduleId === 'bebu-game';
    const trimmedQuestion = resourceDraft.question.trim();
    const options = [
      resourceDraft.optionA.trim(),
      resourceDraft.optionB.trim(),
      resourceDraft.optionC.trim(),
      resourceDraft.optionD.trim()
    ];

    if (isBebuQuestion && (!trimmedQuestion || options.some((option) => !option))) return;
    if (!isBebuQuestion && (!resourceDraft.title || !resourceDraft.description)) return;
    
    // Simulate upload progress
    uploadProgress.value = 10;
    const interval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.floor(Math.random() * 15);
      }
    }, 200);

    const payload = isBebuQuestion
      ? {
          Question: trimmedQuestion,
          OptionA: options[0],
          OptionB: options[1],
          OptionC: options[2],
          OptionD: options[3],
          CorrectAnswer: (resourceDraft.correctOptionId || 'a').toUpperCase(),
          Category: 'General',
          Difficulty: 'Easy'
        }
      : resourceDraft;

    const result = isBebuQuestion
      ? await apiClient.createBebuQuestion(payload)
      : apiClient.addResource
        ? await apiClient.addResource(moduleId, payload)
        : { ok: true, id: `resource-${Date.now()}` };
    
    clearInterval(interval);
    uploadProgress.value = 100;

    if (result.ok) {
      const store = getContentStore();
      const savedResource = isBebuQuestion
        ? {
            id: result.questionId,
            prompt: payload.Question,
            options: [
              { id: 'a', label: payload.OptionA },
              { id: 'b', label: payload.OptionB },
              { id: 'c', label: payload.OptionC },
              { id: 'd', label: payload.OptionD }
            ],
            correctOptionId: payload.CorrectAnswer.toLowerCase(),
            explanation: `Correct answer: ${payload.CorrectAnswer}`
          }
        : {
            ...payload,
            id: result.id,
            fileName: resourceDraft.file?.name || 'internal_asset.pdf'
          };

      store.addResourceToModule(moduleId, savedResource);
      
      // Delay closing to show 100%
      setTimeout(() => {
        isAddingResource.value = false;
        uploadProgress.value = 0;
      }, 500);
    }
  };

  const updateDraft = (updates) => {
    Object.assign(resourceDraft, updates);
  };

  const deleteResource = async (moduleId, resourceId) => {
    if (confirm('Are you sure you want to remove this material? visitors will no longer be able to download it.')) {
      const result = moduleId === 'bebu-game'
        ? await apiClient.deleteBebuQuestion(resourceId)
        : apiClient.deleteResource
          ? await apiClient.deleteResource(moduleId, resourceId)
          : { ok: true };
      if (result.ok) {
        const store = getContentStore();
        store.removeResourceFromModule(moduleId, resourceId);
      }
    }
  };

  const analyticsSummary = computed(() => {
    const store = getContentStore();
    const interactionEntries = Object.entries(store.stats.hotspotInteractions);
    const topHotspotId = interactionEntries.length 
      ? interactionEntries.sort((a, b) => b[1] - a[1])[0][0]
      : 'None yet';

    return {
      totalVisitors: store.stats.totalRegistrations,
      totalDownloads: store.stats.totalResourceDownloads,
      popularModule: topHotspotId.replace('hotspot-', '').replace('-', ' ').toUpperCase()
    };
  });

  return {
    isAuthenticated,
    loginForm,
    isAddingResource,
    resourceDraft,
    analyticsSummary,
    uploadProgress,
    visitorLogs: computed(() => getContentStore().visitorLogs),
    login,
    logout,
    startAddResource,
    updateDraft,
    commitResource,
    deleteResource
  };
}

restoreAdminSession();
