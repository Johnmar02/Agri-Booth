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
const adminList = ref([]);
const feedbacksList = ref([]);
const detailedAnalytics = reactive({
  dailyVisitors: [],
  byGender: [],
  byClientType: [],
  byAddress: [],
  topDownloads: [],
  downloadsByCategory: [],
  trainingSummary: [],
  feedbackRatings: { distribution: [], averageRating: 0 }
});
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

async function restoreAdminSession() {
  const session = readAdminSession();
  if (isSessionValid(session)) {
    // Verify with backend that the cookie is still valid
    const result = await apiClient.isAdminAuthenticated();
    if (result.ok) {
      isAuthenticated.value = true;
      scheduleAutoLogout();
    } else {
      clearAdminSession();
    }
  } else {
    clearAdminSession();
  }
}

function clearAdminSession() {
  isAuthenticated.value = false;
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  clearAutoLogoutTimer();
}

// Register global 401 handler
apiClient.onUnauthorized(() => {
  if (isAuthenticated.value) {
    console.warn('Session expired or unauthorized. Logging out...');
    clearAdminSession();
  }
});

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

    loginForm.error = result.data?.message || result.message || 'Invalid username or password.';
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

  const fetchAdmins = async () => {
    const result = await apiClient.getAdmins();
    if (result.ok) {
      adminList.value = result.data;
    }
  };

  const fetchFeedbacks = async () => {
    const result = await apiClient.getFeedbacks();
    if (result.ok) {
      feedbacksList.value = result.data;
    }
  };

  const fetchDetailedAnalytics = async () => {
    const [
      daily, gender, client, address, downloads, category, training, ratings
    ] = await Promise.all([
      apiClient.getDailyVisitors(),
      apiClient.getVisitorsByGender(),
      apiClient.getVisitorsByClientType(),
      apiClient.getVisitorsByAddress(),
      apiClient.getTopDownloads(),
      apiClient.getDownloadsByCategory(),
      apiClient.getTrainingSummary(),
      apiClient.getFeedbackRatings()
    ]);

    if (daily.ok) detailedAnalytics.dailyVisitors = daily.data;
    if (gender.ok) detailedAnalytics.byGender = gender.data;
    if (client.ok) detailedAnalytics.byClientType = client.data;
    if (address.ok) detailedAnalytics.byAddress = address.data;
    if (downloads.ok) detailedAnalytics.topDownloads = downloads.data;
    if (category.ok) detailedAnalytics.downloadsByCategory = category.data;
    if (training.ok) detailedAnalytics.trainingSummary = training.data;
    if (ratings.ok) detailedAnalytics.feedbackRatings = ratings.data;
  };

  const createAdmin = async (payload) => {
    const result = await apiClient.registerAdmin(payload);
    if (result.ok) {
      await fetchAdmins();
      return true;
    }
    return result;
  };

  const removeAdmin = async (id) => {
    if (confirm("Are you sure you want to remove this admin? This action cannot be undone.")) {
      const result = await apiClient.deleteAdmin(id);
      if (result.ok) {
        await fetchAdmins();
        return true;
      }
    }
    return false;
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
    const isIECMaterial = moduleId === 'iec-materials';
    
    const trimmedQuestion = resourceDraft.question.trim();
    const options = [
      resourceDraft.optionA.trim(),
      resourceDraft.optionB.trim(),
      resourceDraft.optionC.trim(),
      resourceDraft.optionD.trim()
    ];

    if (isBebuQuestion && (!trimmedQuestion || options.some((option) => !option))) return;
    if (!isBebuQuestion && (!resourceDraft.title || !resourceDraft.description)) return;
    
    // Simulate upload progress for UI feedback
    uploadProgress.value = 10;
    const interval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.floor(Math.random() * 15);
      }
    }, 200);

    let result;
    if (isBebuQuestion) {
      const payload = {
        Question: trimmedQuestion,
        OptionA: options[0],
        OptionB: options[1],
        OptionC: options[2],
        OptionD: options[3],
        CorrectAnswer: (resourceDraft.correctOptionId || 'a').toUpperCase(),
        Category: 'General',
        Difficulty: 'Easy'
      };
      result = await apiClient.createBebuQuestion(payload);
    } else if (isIECMaterial) {
      const formData = new FormData();
      formData.append('Title', resourceDraft.title);
      formData.append('Description', resourceDraft.description);
      formData.append('Category', 'General');
      if (resourceDraft.file) {
        formData.append('File', resourceDraft.file);
      }
      if (resourceDraft.imageFile) {
        formData.append('Thumbnail', resourceDraft.imageFile);
      }
      result = await apiClient.uploadIECMaterial(formData);
    } else if (moduleId === 'training-programs') {
      const payload = {
        Title: resourceDraft.title,
        Description: resourceDraft.description,
        StartDate: resourceDraft.startDate,
        EndDate: resourceDraft.endDate,
        Venue: resourceDraft.venue,
        Slots: parseInt(resourceDraft.slots || '0', 10)
      };
      result = await apiClient.createTrainingProgram(payload);
    } else if (moduleId === 'e-learning') {
      const payload = {
        Title: resourceDraft.title,
        Description: resourceDraft.description,
        ThumbnailPath: resourceDraft.thumbnailPath || '/images/course-default.jpg',
        Level: resourceDraft.level || 'Beginner',
        DurationMinutes: parseInt(resourceDraft.durationMinutes || '0', 10)
      };
      result = await apiClient.createCourse(payload);
    } else {
      // Fallback for other modules if any
      result = apiClient.addResource
        ? await apiClient.addResource(moduleId, resourceDraft)
        : { ok: true, data: { id: `resource-${Date.now()}` } };
    }
    
    clearInterval(interval);
    uploadProgress.value = 100;

    if (result.ok) {
      const store = getContentStore();
      const d = result.data;
      
      // We might want to re-fetch instead of manually adding to keep state perfectly in sync
      if (isIECMaterial) {
        const refreshRes = await apiClient.getIECMaterials();
        if (refreshRes.ok) {
          const iecModule = store.modules.find(m => m.id === 'iec-materials');
          if (iecModule) iecModule.materials = refreshRes.data;
        }
      } else if (moduleId === 'training-programs') {
        const refreshRes = await apiClient.getTrainingPrograms();
        if (refreshRes.ok) {
          const trainingModule = store.modules.find(m => m.id === 'training-programs');
          if (trainingModule) trainingModule.programs = refreshRes.data;
        }
      } else if (isBebuQuestion) {
        await store.fetchBebuQuestions();
      } else {
        const savedResource = {
            ...resourceDraft,
            id: d.id || d.Id,
            fileName: resourceDraft.file?.name || 'internal_asset.pdf'
          };
        store.addResourceToModule(moduleId, savedResource);
      }
      
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
      let result;
      if (moduleId === 'bebu-game') {
        result = await apiClient.deleteBebuQuestion(resourceId);
      } else if (moduleId === 'iec-materials') {
        result = await apiClient.deleteIECMaterial(resourceId);
      } else if (moduleId === 'training-programs') {
        result = await apiClient.deleteTrainingProgram(resourceId);
      } else {
        result = apiClient.deleteResource
          ? await apiClient.deleteResource(moduleId, resourceId)
          : { ok: true };
      }

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
      popularModule: topHotspotId.replace('hotspot-', '').replace('-', ' ').toUpperCase(),
      recentVisitors: store.stats.recentVisitors,
      monthlyVisitors: store.stats.monthlyVisitors,
      averageRating: store.stats.averageRating,
      totalFeedbacks: store.stats.totalFeedbacks
    };
  });

  return {
    isAuthenticated,
    loginForm,
    isAddingResource,
    resourceDraft,
    analyticsSummary,
    uploadProgress,
    adminList,
    feedbacksList,
    detailedAnalytics,
    visitorLogs: computed(() => getContentStore().visitorLogs),
    login,
    logout,
    fetchAdmins,
    fetchFeedbacks,
    fetchDetailedAnalytics,
    createAdmin,
    removeAdmin,
    startAddResource,
    updateDraft,
    commitResource,
    deleteResource
  };
}

restoreAdminSession();
