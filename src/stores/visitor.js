import { defineStore } from 'pinia';
import { apiClient } from '@/services/apiClient';

/**
 * MODEL: Visitor Store
 * Manages the "Virtual Logbook" state for the ITCPH Digital Agri-Booth.
 */
export const useVisitorStore = defineStore('visitor', {
  state: () => ({
    registration: {
      name: '',
      address: '',
      affiliations: '',
      gender: '',
      clientType: '',
      email: '',
      password: '',
      itemsCollected: [],
      feedback: ''
    },
    visitorId: null,
    visitorProfile: null,
    isRegistered: false,
    loading: false,
    error: null
  }),
  actions: {
    /**
     * Authenticates a visitor using the backend login endpoint.
     */
    async loginVisitor(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const result = await apiClient.loginVisitor(email, password);
        
        if (result.ok) {
          this.visitorProfile = result;
          this.visitorId = result.visitorId || result.id;
          this.isRegistered = true;
          this.registration.name = result.fullName;
          this.registration.email = result.email;
          return result;
        } else {
          throw new Error(result.message || 'Login failed');
        }
      } catch (err) {
        this.error = err.message;
        console.error('Failed to login visitor:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Sends the logbook data to the .NET backend via VisitorsController.
     * @param {Object} data - The form data payload.
     */
    async registerVisitor(data) {
      this.loading = true;
      this.error = null;
      try {
        const payload = { ...this.registration, ...data };
        const result = await apiClient.submitLogbook(payload);
        
        if (result.ok) {
          this.visitorProfile = result;
          this.registration = { ...payload, ...result };
          this.visitorId = result.visitorId || result.id;
          this.isRegistered = true;
          return result;
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (err) {
        this.error = err.message;
        console.error('Failed to register visitor:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Logs out the visitor and clears local state.
     */
    async logoutVisitor() {
      try {
        await apiClient.logoutVisitor();
      } catch (e) {
        console.warn('Backend logout failed or unreachable');
      } finally {
        this.visitorId = null;
        this.visitorProfile = null;
        this.isRegistered = false;
        this.registration = {
          name: '',
          address: '',
          affiliations: '',
          gender: '',
          clientType: '',
          email: '',
          password: '',
          itemsCollected: [],
          feedback: ''
        };
      }
    },
    
    addItem(item) {
      if (!this.registration.itemsCollected.includes(item)) {
        this.registration.itemsCollected.push(item);
      }
    }
  }
});
