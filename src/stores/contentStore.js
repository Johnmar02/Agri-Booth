import { defineStore } from 'pinia';
import { getBoothModules, getOutcomeMetrics, AGRI_BOOTH_BRAND } from '@/models/boothModel';

const STORAGE_KEY = 'itcph-booth-v6-final';

/**
 * STORE: contentStore
 * Manages the dynamic resource catalog and engagement analytics.
 * 
 * WHY THIS EXISTS:
 * To support the "Admin Ecosystem", the booth needs a mutable data layer that 
 * persists across reloads. This store allows admins to "upload" new materials 
 * that visitors can immediately see and track.
 */
export const useContentStore = defineStore('content', {
  state: () => {
    const defaultModules = getBoothModules();
    const defaultOutcomes = getOutcomeMetrics();

    // Attempt to load from localStorage first
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedModulesById = new Map((parsed.modules || []).map((module) => [module.id, module]));

        return {
          ...parsed,
          brand: AGRI_BOOTH_BRAND,
          outcomes: defaultOutcomes,
          modules: defaultModules.map((module) => {
            const savedModule = savedModulesById.get(module.id);

            if (!savedModule) {
              return module;
            }

            return {
              ...module,
              resources: savedModule.resources ?? module.resources,
            };
          }),
        };
      } catch (e) {
        console.error('Failed to parse saved content:', e);
      }
    }

    // Default state derived from static models
    return {
      brand: AGRI_BOOTH_BRAND,
      modules: defaultModules,
      outcomes: defaultOutcomes,
      // Analytics & Logs are stored in memory for the session but could be persisted
      visitorLogs: [],
      stats: {
        totalRegistrations: 0,
        totalResourceDownloads: 0,
        hotspotInteractions: {},
      }
    };
  },

  actions: {
    /**
     * Persists the current state to localStorage.
     */
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state));
    },

    /**
     * Adds a new resource to a specific module (Admin action).
     */
    addResourceToModule(moduleId, resource) {
      const module = this.modules.find(m => m.id === moduleId);
      if (module) {
        if (!module.resources) module.resources = [];
        // Sequential ID generation for the mock env
        const id = `res-custom-${Date.now()}`;
        module.resources.push({ ...resource, id });
        this.persist();
      }
    },

    /**
     * Removes a resource from a module (Admin action).
     */
    removeResourceFromModule(moduleId, resourceId) {
      const module = this.modules.find(m => m.id === moduleId);
      if (module && module.resources) {
        module.resources = module.resources.filter(r => r.id !== resourceId);
        this.persist();
      }
    },

    /**
     * Records a visitor registration in the admin log.
     */
    recordVisitorSubmission(payload) {
      this.visitorLogs.push(payload);
      this.stats.totalRegistrations++;
      // Increment download counts based on item list
      if (payload.itemsCollected) {
        this.stats.totalResourceDownloads += payload.itemsCollected.length;
      }
      this.persist();
    },

    /**
     * Tracks a hotspot hit for heat-mapping.
     */
    trackHotspotInteraction(hotspotId) {
      if (!this.stats.hotspotInteractions[hotspotId]) {
        this.stats.hotspotInteractions[hotspotId] = 0;
      }
      this.stats.hotspotInteractions[hotspotId]++;
      this.persist();
    }
  }
});
