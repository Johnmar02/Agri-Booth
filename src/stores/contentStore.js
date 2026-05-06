import { defineStore } from 'pinia';
import { getBoothModules, getOutcomeMetrics, AGRI_BOOTH_BRAND } from '@/models/boothModel';
import { apiClient } from '@/services/apiClient';

function mapTriviaQuestion(question) {
  const id = question.id ?? question.Id;
  const correctAnswer = String(question.correctAnswer ?? question.CorrectAnswer ?? 'A').toLowerCase();

  return {
    id,
    prompt: question.question ?? question.Question ?? '',
    options: [
      { id: 'a', label: question.optionA ?? question.OptionA ?? '' },
      { id: 'b', label: question.optionB ?? question.OptionB ?? '' },
      { id: 'c', label: question.optionC ?? question.OptionC ?? '' },
      { id: 'd', label: question.optionD ?? question.OptionD ?? '' }
    ],
    correctOptionId: correctAnswer,
    explanation: `Correct answer: ${correctAnswer.toUpperCase()}`
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
          apiClient.getTrainingPrograms()
        ]);

        const [materialsRes, programsRes] = results;

        if (materialsRes.status === 'fulfilled' && materialsRes.value.ok) {
          const iecModule = this.modules.find(m => m.id === 'iec-materials');
          if (iecModule) {
            // Backend returns IECMaterialDto list
            iecModule.materials = materialsRes.value.data || materialsRes.value;
          }
        }

        if (programsRes.status === 'fulfilled' && programsRes.value.ok) {
          const trainingModule = this.modules.find(m => m.id === 'training-programs');
          if (trainingModule) {
            // Backend returns TrainingDto list
            trainingModule.programs = programsRes.value.data || programsRes.value;
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
        if (statsRes.ok) {
          this.stats = {
            ...this.stats,
            totalRegistrations: statsRes.totalVisitors || statsRes.totalRegistrations,
            totalResourceDownloads: statsRes.totalDownloads,
            totalFeedbacks: statsRes.totalFeedbacks,
            averageRating: statsRes.averageRating
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
        if (visitorsRes.ok) {
          // Backend returns a list of visitors with properties matching our log structure
          // but we might need to map them if names differ (e.g. FullName vs name)
          const visitors = visitorsRes.data || visitorsRes;
          if (Array.isArray(visitors)) {
            this.visitorLogs = visitors.map(v => ({
              id: v.id,
              name: v.fullName || v.FullName || v.name,
              email: v.email || v.Email,
              affiliations: v.affiliation || v.Affiliation || v.affiliations,
              clientType: v.clientType || v.ClientType,
              gender: v.gender || v.Gender,
              address: v.address || v.Address,
              submittedAt: v.visitedAt || v.VisitedAt || new Date().toISOString(),
              itemsCollected: [] // Backend doesn't return these in the summary list usually
            }));
          }
        }
      } catch (e) {
        console.error('Failed to fetch visitor logs');
      }
    },

    async fetchBebuQuestions() {
      const questionsRes = await apiClient.getBebuQuestions();

      if (questionsRes.ok) {
        this.setBebuQuestions(questionsRes.data || questionsRes);
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
        return;
      }

      module.resources = (module.resources || []).filter((resource) => resource.id !== resourceId);
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
