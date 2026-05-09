import { ref, reactive, computed } from 'vue';
import { useContentStore } from '@/stores/contentStore';
import { useUiStore } from '@/stores/uiStore';
import { apiClient } from '@/services/apiClient';

const ADMIN_TOKEN_KEY = 'itcph_admin_token';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

let contentStore;
const getContentStore = () => {
  try {
    if (!contentStore) {
      contentStore = useContentStore();
    }
    return contentStore;
  } catch (e) {
    return null;
  }
};

function readAdminSession() {
  if (typeof window === 'undefined') return null;
  const rawSession = window.localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!rawSession) return null;
  try {
    return JSON.parse(rawSession);
  } catch (error) {
    return null;
  }
}

function writeAdminSession() {
  if (typeof window === 'undefined') return;
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

const isAuthenticated = ref(typeof window !== 'undefined' && isSessionValid(readAdminSession()));

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

function clearAutoLogoutTimer() {
  if (autoLogoutTimer) {
    clearTimeout(autoLogoutTimer);
    autoLogoutTimer = null;
  }
}

function scheduleAutoLogout() {
  clearAutoLogoutTimer();
  if (!isAuthenticated.value) return;
  
  const session = readAdminSession();
  const remainingTime = session ? session.exp - Date.now() : SESSION_TIMEOUT_MS;
  
  autoLogoutTimer = window.setTimeout(() => {
    logoutUserOnly();
  }, Math.max(0, remainingTime));
}

function refreshAdminSession() {
  if (!isAuthenticated.value) return;
  writeAdminSession();
  scheduleAutoLogout();
}

function clearAdminSession() {
  isAuthenticated.value = false;
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
  clearAutoLogoutTimer();
}

function logoutUserOnly() {
  clearAdminSession();
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
    window.location.replace('/admin/login');
  }
}

async function restoreAdminSession() {
  const session = readAdminSession();
  if (session && isSessionValid(session)) {
    scheduleAutoLogout();
    const result = await apiClient.isAdminAuthenticated();
    if (result.ok) {
      isAuthenticated.value = true;
      writeAdminSession();
      scheduleAutoLogout();
      const store = getContentStore();
      if (store) store.fetchStats();
    } else {
      clearAdminSession();
    }
  } else {
    clearAdminSession();
  }
}

apiClient.onUnauthorized(() => {
  if (isAuthenticated.value) {
    logoutUserOnly();
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

export function useAdminController() {
  const login = async () => {
    loginForm.error = '';
    const result = await apiClient.loginAdmin(loginForm.username, loginForm.password);
    if (result.ok) {
      isAuthenticated.value = true;
      writeAdminSession();
      scheduleAutoLogout();
      const store = getContentStore();
      if (store) await store.fetchStats();
      return true;
    }
    loginForm.error = result.data?.message || result.message || 'Invalid username or password.';
    loginForm.password = '';
    return false;
  };

  const logout = async () => {
    try {
      await apiClient.logoutAdmin();
    } catch (e) {}
    clearAdminSession();
    if (typeof window !== 'undefined') {
      window.location.replace('/admin/login');
    }
  };

  const fetchStats = async () => {
    const store = getContentStore();
    if (store) await store.fetchStats();
  };

  const fetchLogs = async () => {
    const store = getContentStore();
    if (store) await store.fetchVisitors();
  };

  const fetchAdmins = async () => {
    const result = await apiClient.getAdmins();
    if (result.ok && Array.isArray(result.data)) {
      adminList.value = result.data.map(admin => ({
        id: admin.id || admin.Id,
        username: admin.username || admin.Username || 'Unknown',
        email: admin.email || admin.Email || 'No Email',
        role: admin.role || admin.Role || 'Admin',
        createdAt: admin.createdAt || admin.CreatedAt || new Date().toISOString()
      }));
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
    const uiStore = useUiStore();
    uiStore.showConfirm(
      "Remove Administrator",
      "Are you sure you want to remove this admin? This action cannot be undone.",
      async () => {
        const result = await apiClient.deleteAdmin(id);
        if (result.ok) {
          await fetchAdmins();
          uiStore.showToast("Administrator removed.");
        }
      },
      null,
      "Yes, Remove",
      "No, Keep"
    );
  };

  const startAddResource = () => {
    Object.assign(resourceDraft, {
      title: '', description: '', format: 'PDF Document',
      file: null, imageFile: null, question: '',
      optionA: '', optionB: '', optionC: '', optionD: '',
      correctOptionId: 'a'
    });
    isAddingResource.value = true;
  };

  const commitResource = async (moduleId) => {
    const uiStore = useUiStore();
    const isBebuQuestion = moduleId === 'bebu-game';
    const isIECMaterial = moduleId === 'iec-materials';
    uploadProgress.value = 10;
    const interval = setInterval(() => {
      if (uploadProgress.value < 90) uploadProgress.value += 10;
    }, 200);
    let result;
    if (isBebuQuestion) {
      result = await apiClient.createBebuQuestion({
        Question: resourceDraft.question,
        OptionA: resourceDraft.optionA,
        OptionB: resourceDraft.optionB,
        OptionC: resourceDraft.optionC,
        OptionD: resourceDraft.optionD,
        CorrectAnswer: (resourceDraft.correctOptionId || 'a').toUpperCase(),
        Category: 'General', Difficulty: 'Easy'
      });
    } else if (isIECMaterial) {
      const formData = new FormData();
      formData.append('Title', resourceDraft.title);
      formData.append('Description', resourceDraft.description);
      if (resourceDraft.file) formData.append('File', resourceDraft.file);
      if (resourceDraft.imageFile) formData.append('Thumbnail', resourceDraft.imageFile);
      result = await apiClient.uploadIECMaterial(formData);
    } else if (moduleId === 'training-programs') {
      result = await apiClient.createTrainingProgram({
        Title: resourceDraft.title, Description: resourceDraft.description,
        StartDate: resourceDraft.startDate, EndDate: resourceDraft.endDate,
        Venue: resourceDraft.venue, Slots: parseInt(resourceDraft.slots || '0', 10)
      });
    } else if (moduleId === 'e-learning') {
      result = await apiClient.createCourse({
        Title: resourceDraft.title, Description: resourceDraft.description,
        ThumbnailPath: resourceDraft.thumbnailPath || '/images/course-default.jpg',
        Level: resourceDraft.level || 'Beginner',
        DurationMinutes: parseInt(resourceDraft.durationMinutes || '0', 10)
      });
    } else {
      result = { ok: true };
    }
    clearInterval(interval);
    uploadProgress.value = 100;
    if (result.ok) {
      uiStore.showToast('Material saved successfully.');
      const store = getContentStore();
      if (store) {
        if (isIECMaterial) await store.initialize();
        else if (isBebuQuestion) await store.fetchBebuQuestions();
        else await store.fetchStats();
      }
      setTimeout(() => { isAddingResource.value = false; uploadProgress.value = 0; }, 500);
    } else {
      uiStore.showAlert('Save Failed', result.data?.message || 'Failed to save material.');
    }
  };

  const updateDraft = (updates) => { Object.assign(resourceDraft, updates); };

  const deleteResource = async (moduleId, resourceId) => {
    const uiStore = useUiStore();
    uiStore.showConfirm(
      'Remove Material',
      'Are you sure you want to remove this material? This action cannot be undone.',
      async () => {
        const result = moduleId === 'bebu-game' ? await apiClient.deleteBebuQuestion(resourceId) :
                       moduleId === 'iec-materials' ? await apiClient.deleteIECMaterial(resourceId) :
                       moduleId === 'training-programs' ? await apiClient.deleteTrainingProgram(resourceId) :
                       { ok: true };
        if (result.ok) {
          const store = getContentStore();
          if (store) store.removeResourceFromModule(moduleId, resourceId);
          uiStore.showToast('Material removed successfully.');
        } else {
          uiStore.showAlert('Error', result.data?.message || 'Failed to remove material.');
        }
      },
      null,
      "Yes, Delete",
      "No, Cancel"
    );
  };

  const analyticsSummary = computed(() => {
    const store = getContentStore();
    if (!store) return {};
    return {
      totalVisitors: store.stats.totalRegistrations,
      totalDownloads: store.stats.totalResourceDownloads,
      popularModule: 'N/A',
      recentVisitors: store.stats.recentVisitors,
      monthlyVisitors: store.stats.monthlyVisitors,
      averageRating: store.stats.averageRating,
      totalFeedbacks: store.stats.totalFeedbacks
    };
  });

  return {
    isAuthenticated, loginForm, isAddingResource, resourceDraft,
    analyticsSummary, uploadProgress, adminList, feedbacksList, detailedAnalytics,
    visitorLogs: computed(() => getContentStore()?.visitorLogs || []),
    login, logout, restoreAdminSession, fetchAdmins, fetchFeedbacks, fetchDetailedAnalytics,
    createAdmin, removeAdmin, startAddResource, updateDraft, commitResource, deleteResource
  };
}
