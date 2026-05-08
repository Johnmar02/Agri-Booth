import { defineStore } from 'pinia';
import { getBoothModules, getOutcomeMetrics, AGRI_BOOTH_BRAND } from '@/models/boothModel';
import { apiClient } from '@/services/apiClient';

function mapTriviaQuestion(question) {
  const id = question.id ?? question.Id;
  const correctAnswer = String(question.correctAnswer ?? question.CorrectAnswer ?? 'A').toUpperCase();

  return {
    id,
    prompt: question.question ?? question.Question ?? '',
    category: question.category ?? question.Category ?? 'General',
    difficulty: question.difficulty ?? question.Difficulty ?? 'Easy',
    options: [
      { id: 'a', label: question.optionA ?? question.OptionA ?? '' },
      { id: 'b', label: question.optionB ?? question.OptionB ?? '' },
      { id: 'c', label: question.optionC ?? question.OptionC ?? '' },
      { id: 'd', label: question.optionD ?? question.OptionD ?? '' }
    ],
    correctOptionId: correctAnswer.toLowerCase(),
    explanation: `Correct answer: ${correctAnswer}`
  };
}

/**
 * STORE: contentStore
 * Manages the dynamic resource catalog and engagement analytics.
 * Synchronized with .NET backend controllers.
 */
export const useContentStore = defineStore('content', {
  state: () => ({
    brand: AGRI_BOOTH_BRAND,
    modules: getBoothModules(),
    outcomes: getOutcomeMetrics(),
    visitorLogs: [],
    notifications: [],
    stats: {
      totalRegistrations: 0,
      totalResourceDownloads: 0,
      hotspotInteractions: {},
    },
    loading: false,
    initialized: false
  }),

  actions: {
    /**
     * Fetches dynamic content from the .NET backend.
     */
    async initialize() {
      if (this.initialized) return;
      this.loading = true;
      try {
        const results = await Promise.allSettled([
          apiClient.getIECMaterials(),
          apiClient.getTrainingPrograms(),
          apiClient.getCourses(),
          this.fetchBebuQuestions()
        ]);

        const [materialsRes, programsRes, coursesRes] = results;

        if (materialsRes.status === 'fulfilled' && materialsRes.value.ok) {
          const iecModule = this.modules.find(m => m.id === 'iec-materials');
          if (iecModule) {
            iecModule.materials = materialsRes.value.data || [];
          }
        }

        if (programsRes.status === 'fulfilled' && programsRes.value.ok) {
          const trainingModule = this.modules.find(m => m.id === 'training-programs');
          if (trainingModule) {
            trainingModule.programs = programsRes.value.data || [];
          }
        }

        if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
          const lmsModule = this.modules.find(m => m.id === 'e-learning');
          if (lmsModule) {
            lmsModule.courses = coursesRes.value.data || [];
          }
        }

        this.initialized = true;
      } catch (error) {
        console.warn('Backend content unreachable. Using static local content.');
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetches protected stats (Admin only).
     */
    async fetchStats() {
      try {
        const statsRes = await apiClient.getStats();
        if (statsRes.ok && statsRes.data) {
          const s = statsRes.data;
          this.stats = {
            ...this.stats,
            totalRegistrations: s.totalVisitors || s.totalRegistrations || 0,
            totalResourceDownloads: s.totalDownloads || 0,
            totalFeedbacks: s.totalFeedbacks || 0,
            averageRating: s.averageRating || 0
          };
        }
        
        // Also fetch the actual visitor list for the logbook
        await this.fetchVisitors();
      } catch (e) {
        console.error('Failed to fetch admin stats');
      }
    },

    /**
     * Fetches the full list of visitors (Admin only).
     */
    async fetchVisitors() {
      try {
        const visitorsRes = await apiClient.getVisitors();
        if (visitorsRes.ok && visitorsRes.data) {
          const visitors = visitorsRes.data;
          if (Array.isArray(visitors)) {
            this.visitorLogs = visitors.map(v => ({
              id: v.id || v.Id,
              name: v.fullName || v.FullName || v.name,
              email: v.email || v.Email,
              affiliations: v.affiliation || v.Affiliation || v.affiliations,
              clientType: v.clientType || v.ClientType,
              gender: v.gender || v.Gender,
              address: v.address || v.Address,
              submittedAt: v.visitedAt || v.VisitedAt || new Date().toISOString(),
              itemsCollected: []
            }));
          }
        }
      } catch (e) {
        console.error('Failed to fetch visitor logs');
      }
    },

    async fetchBebuQuestions() {
      const questionsRes = await apiClient.getBebuQuestions();

      if (questionsRes.ok && questionsRes.data) {
        this.setBebuQuestions(questionsRes.data);
      }
    },

    setBebuQuestions(questions) {
      const bebuModule = this.modules.find((module) => module.id === 'bebu-game');
      if (!bebuModule || !Array.isArray(questions)) return;

      bebuModule.questions = questions
        .filter((question) => question.isActive ?? question.IsActive ?? true)
        .map(mapTriviaQuestion);
    },

    /**
     * Tracks a hotspot hit for heat-mapping via AnalyticsController.
     */
    async trackHotspotInteraction(hotspotId) {
      if (!this.stats.hotspotInteractions[hotspotId]) {
        this.stats.hotspotInteractions[hotspotId] = 0;
      }
      this.stats.hotspotInteractions[hotspotId]++;
      
      try {
        // Optional: Send interaction to backend
        // await apiClient.trackInteraction(hotspotId);
      } catch (e) {
        // Silent fail for analytics
      }
    },

    addResourceToModule(moduleId, resource) {
      const module = this.modules.find((entry) => entry.id === moduleId);
      if (!module) return;

      if (moduleId === 'bebu-game') {
        module.questions = [...(module.questions || []), resource];
        return;
      }

      module.resources = [...(module.resources || []), resource];
    },

    removeResourceFromModule(moduleId, resourceId) {
      const module = this.modules.find((entry) => entry.id === moduleId);
      if (!module) return;

      if (moduleId === 'bebu-game') {
        module.questions = (module.questions || []).filter((question) => question.id !== resourceId);
      } else if (moduleId === 'iec-materials') {
        module.materials = (module.materials || []).filter((mat) => mat.id !== resourceId);
      } else if (moduleId === 'training-programs') {
        module.programs = (module.programs || []).filter((prog) => prog.id !== resourceId);
      } else {
        module.resources = (module.resources || []).filter((resource) => resource.id !== resourceId);
      }
    },

    recordVisitorSubmission(payload) {
      this.visitorLogs.push(payload);
      this.stats.totalRegistrations++;

      if (payload.itemsCollected) {
        this.stats.totalResourceDownloads += payload.itemsCollected.length;
      }
    },

    addNotification(notification) {
      this.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        ...notification
      });
      // Limit to 50 notifications
      if (this.notifications.length > 50) {
        this.notifications.pop();
      }
    }
  }
});
