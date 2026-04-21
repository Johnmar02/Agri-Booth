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
  key: '',
  error: ''
});
const isAddingResource = ref(false);
const resourceDraft = reactive({
  title: '',
  description: '',
  format: 'PDF',
  status: 'Ready',
  file: null
});
const uploadProgress = ref(0);
let autoLogoutTimer = null;

function parseAdminToken(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token));
  } catch (error) {
    return null;
  }
}

function isTokenValid(token) {
  const payload = parseAdminToken(token);
  return payload?.role === 'admin' && payload.exp && payload.exp > Date.now();
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
    logout();
  }, SESSION_TIMEOUT_MS);
}

function refreshAdminSession() {
  if (!isAuthenticated.value) return;
  const token = window.localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!isTokenValid(token)) {
    logout();
    return;
  }

  const payload = parseAdminToken(token);
  payload.exp = Date.now() + SESSION_TIMEOUT_MS;
  window.localStorage.setItem(ADMIN_TOKEN_KEY, btoa(JSON.stringify(payload)));
  scheduleAutoLogout();
}

function restoreAdminSession() {
  const token = window.localStorage.getItem(ADMIN_TOKEN_KEY);
  if (isTokenValid(token)) {
    isAuthenticated.value = true;
    scheduleAutoLogout();
  } else {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    isAuthenticated.value = false;
  }
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
    
    const result = await apiClient.loginAdmin(loginForm.key);
    
    if (result.ok) {
      isAuthenticated.value = true;
      
      if (result.token) {
        window.localStorage.setItem(ADMIN_TOKEN_KEY, result.token);
      }

      scheduleAutoLogout();
      return true;
    }

    loginForm.error = result.message || 'Access denied.';
    return false;
  };

  const logout = () => {
    isAuthenticated.value = false;
    loginForm.key = '';
    loginForm.error = '';
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    clearAutoLogoutTimer();
  };

  const startAddResource = () => {
    resourceDraft.title = '';
    resourceDraft.description = '';
    isAddingResource.value = true;
  };

  const commitResource = async (moduleId) => {
    if (!resourceDraft.title || !resourceDraft.description) return;
    
    // Simulate upload progress
    uploadProgress.value = 10;
    const interval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.floor(Math.random() * 15);
      }
    }, 200);

    const result = await apiClient.addResource(moduleId, resourceDraft);
    
    clearInterval(interval);
    uploadProgress.value = 100;

    if (result.ok) {
      const store = getContentStore();
      store.addResourceToModule(moduleId, { 
        ...resourceDraft, 
        id: result.id, 
        fileName: resourceDraft.file?.name || 'internal_asset.pdf' 
      });
      
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
      const result = await apiClient.deleteResource(moduleId, resourceId);
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
