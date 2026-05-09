<script setup>
import { useUiStore } from '@/stores/uiStore';

const uiStore = useUiStore();
</script>

<template>
  <div class="global-overlay-container">
    <!-- MODAL OVERLAY -->
    <Transition name="fade">
      <div v-if="uiStore.modal.isOpen" class="modal-backdrop" @click.self="uiStore.closeModal">
        <Transition name="scale" appear>
          <div class="modal-content" :class="uiStore.modal.type">
            <div class="modal-header">
              <h3>{{ uiStore.modal.title }}</h3>
            </div>
            <div class="modal-body">
              <p>{{ uiStore.modal.message }}</p>
            </div>
            <div class="modal-footer">
              <button 
                v-if="uiStore.modal.type === 'confirm'" 
                class="btn-cancel" 
                @click="uiStore.modal.onCancel"
              >
                {{ uiStore.modal.cancelText || 'No, Cancel' }}
              </button>
              <button 
                class="btn-confirm" 
                @click="uiStore.modal.onConfirm"
              >
                {{ uiStore.modal.confirmText || (uiStore.modal.type === 'confirm' ? 'Yes, Proceed' : 'OK') }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- TOAST NOTIFICATIONS -->
    <div class="toast-stack">
      <TransitionGroup name="slide">
        <div 
          v-for="toast in uiStore.toasts" 
          :key="toast.id" 
          class="toast-item" 
          :class="toast.type"
        >
          <div class="toast-icon">
            <span v-if="toast.type === 'success'">✓</span>
            <span v-else-if="toast.type === 'error'">✕</span>
            <span v-else>ℹ</span>
          </div>
          <p>{{ toast.message }}</p>
          <button class="toast-close" @click="uiStore.removeToast(toast.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.global-overlay-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
}

/* MODAL STYLES */
.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  pointer-events: auto;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem 2rem 0.5rem;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
}

.modal-body {
  padding: 1rem 2rem 2rem;
}

.modal-body p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

.modal-footer {
  padding: 1.25rem 2rem;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm {
  background: #1a6ab4;
  color: white;
  border: none;
}

.btn-confirm:hover {
  background: #124d85;
  transform: translateY(-1px);
}

.btn-cancel {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-cancel:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-content.confirm .btn-confirm {
  background: #ef4444;
}

.modal-content.confirm .btn-confirm:hover {
  background: #dc2626;
}

/* TOAST STYLES */
.toast-stack {
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 350px;
}

.toast-item {
  pointer-events: auto;
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid #1a6ab4;
  animation: slide-in 0.3s ease;
}

.toast-item.success { border-left-color: #22c55e; }
.toast-item.error { border-left-color: #ef4444; }
.toast-item.info { border-left-color: #3b82f6; }

.toast-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.success .toast-icon { background: #dcfce7; color: #15803d; }
.error .toast-icon { background: #fee2e2; color: #b91c1c; }
.info .toast-icon { background: #dbeafe; color: #1e40af; }

.toast-item p {
  margin: 0;
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 600;
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #94a3b8;
  padding: 0;
  margin: 0;
  width: auto;
}

.toast-close:hover { color: #1e293b; }

/* ANIMATIONS */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.scale-enter-active, .scale-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-enter-from, .scale-leave-to { transform: scale(0.9); opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from { transform: translateX(100%); opacity: 0; }
.slide-leave-to { transform: translateX(100%); opacity: 0; }

@media (max-width: 480px) {
  .toast-stack {
    top: auto;
    bottom: 2rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}
</style>
