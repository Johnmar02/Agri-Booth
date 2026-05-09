import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    // Modal state
    modal: {
      isOpen: false,
      title: '',
      message: '',
      type: 'info', // 'info' or 'confirm'
      onConfirm: null,
      onCancel: null,
      confirmText: 'OK',
      cancelText: 'Cancel'
    },
    // Toasts state
    toasts: []
  }),

  actions: {
    /**
     * Shows a simple information modal (replaces alert)
     */
    showAlert(title, message, confirmText = 'OK') {
      this.modal = {
        isOpen: true,
        title,
        message,
        type: 'info',
        onConfirm: () => { this.closeModal(); },
        onCancel: null,
        confirmText,
        cancelText: ''
      };
    },

    /**
     * Shows a confirmation modal (replaces confirm)
     */
    showConfirm(title, message, onConfirm, onCancel = null, confirmText = 'Yes, Proceed', cancelText = 'No, Cancel') {
      this.modal = {
        isOpen: true,
        title,
        message,
        type: 'confirm',
        onConfirm: () => {
          if (onConfirm) onConfirm();
          this.closeModal();
        },
        onCancel: () => {
          if (onCancel) onCancel();
          this.closeModal();
        },
        confirmText,
        cancelText
      };
    },

    closeModal() {
      this.modal.isOpen = false;
    },

    /**
     * Shows a temporary toast notification
     */
    showToast(message, type = 'success', duration = 3000) {
      const id = Date.now();
      this.toasts.push({ id, message, type });

      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    },

    removeToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }
  }
});
