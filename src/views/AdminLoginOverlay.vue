<script setup>
/**
 * VIEW: AdminLoginOverlay
 * A premium, secure-looking modal for administrative entry.
 * Strictly aligned with the RegistrationPortal (Virtual Logbook) style.
 */
defineProps({
  form: {
    type: Object,
    required: true
  },
  isVisible: {
    type: Boolean,
    required: true
  }
});

defineEmits(['close', 'update-username', 'update-password', 'submit']);
</script>

<template>
  <Transition name="scale">
    <div v-if="isVisible" class="portal-overlay" @click.self="$emit('close')">
      <div class="portal-card">
        <div class="header">
          <h2>Admin Login</h2>
          <button
            class="close-btn"
            type="button"
            aria-label="Close"
            @click="$emit('close')"
          >
            <span class="close-icon">&times;</span>
          </button>
        </div>

        <div class="form-container">
          <p class="subtitle">
            Please enter your administrative credentials to access the Digital Twin ecosystem management portal.
          </p>
          
          <form @submit.prevent="$emit('submit')" class="reg-form">
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="admin-username">Username</label>
                <input 
                  id="admin-username"
                  type="text" 
                  placeholder="Admin username"
                  :value="form.username"
                  @input="$emit('update-username', $event.target.value)"
                  autofocus
                  autocomplete="username"
                />
              </div>

              <div class="form-group full-width" :class="{ 'has-error': form.error }">
                <label for="admin-password">Password</label>
                <input 
                  id="admin-password"
                  type="password" 
                  placeholder="••••••••••••"
                  :value="form.password"
                  @input="$emit('update-password', $event.target.value)"
                  autocomplete="current-password"
                />
                <Transition name="shake">
                  <span v-if="form.error" class="error-text">{{ form.error }}</span>
                </Transition>
              </div>
            </div>

            <div class="form-actions">
              <button 
                type="submit"
                class="submit-btn" 
              >
                Unlock Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.portal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
  padding: 20px;
}

.portal-card {
  background: #fff;
  width: 100%;
  max-width: 440px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px 32px;
  background: linear-gradient(135deg, #1a6ab4 0%, #124d85 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
  font-weight: 700;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.close-btn:hover {
  background: #d17c24;
  transform: rotate(90deg) scale(1.1);
}

.form-container {
  padding: 32px;
}

.subtitle {
  color: #64748b;
  margin-bottom: 24px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.full-width {
  grid-column: span 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #1a6ab4;
}

input {
  padding: 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #1a6ab4;
  background: #f8fafc;
}

.has-error input {
  border-color: #ef4444 !important;
}

.error-text {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 2px;
  font-weight: 600;
}

.submit-btn {
  margin-top: 24px;
  width: 100%;
  padding: 16px;
  background: #d17c24;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.submit-btn:hover {
  background: #b86a18;
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(209, 124, 36, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

/* Transitions */
.scale-enter-active, .scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from, .scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

.shake-enter-active {
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
