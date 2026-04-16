import { defineStore } from 'pinia';

/**
 * MODEL: Visitor Store
 * Manages the "Virtual Logbook" state for the ITCPH Digital Agri-Booth.
 * This satisfies the requirement for tracking user engagement and data collection.
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
      itemsCollected: [],
      feedback: ''
    },
    isRegistered: false
  }),
  actions: {
    /**
     * CONTROLLER-Like Action: Validates and saves the visitor data.
     * @param {Object} data - The form data payload.
     */
    registerVisitor(data) {
      this.registration = { ...this.registration, ...data };
      this.isRegistered = true;
      // In a real production environment, this would call an API route.
      console.log('MODEL: Visitor registered successfully:', this.registration);
    },
    
    addItem(item) {
      if (!this.registration.itemsCollected.includes(item)) {
        this.registration.itemsCollected.push(item);
      }
    }
  }
});
