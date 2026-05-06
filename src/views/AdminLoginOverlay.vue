<script setup>
/**
 * VIEW: AdminLoginOverlay
 * A premium, secure-looking modal for administrative entry.
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
  <Transition name="fade">
    <div v-if="isVisible" class="admin-login" @click.self="$emit('close')">
      <div class="admin-login__card">
        <header class="admin-login__header">
          <div class="lock-icon">🔒</div>
          <h2>Admin Login</h2>
          <p>Please enter your administrative key to access the Digital Twin ecosystem management portal.</p>
        </header>

        <form @submit.prevent="$emit('submit')" class="admin-login__form">
          <div class="input-group">
            <label for="admin-username">Username</label>
            <input 
              id="admin-username"
              type="text" 
              placeholder="Admin Username"
              :value="form.username"
              @input="$emit('update-username', $event.target.value)"
              autofocus
            />
          </div>

          <div class="input-group">
            <label for="admin-password">Password</label>
            <input 
              id="admin-password"
              type="password" 
              placeholder="••••••••••••"
              :value="form.password"
              @input="$emit('update-password', $event.target.value)"
            />
            <Transition name="shake">
              <p v-if="form.error" class="error-text">{{ form.error }}</p>
            </Transition>
          </div>

          <div class="actions">
            <button type="button" class="btn btn--secondary" @click="$emit('close')">Cancel</button>
            <button type="submit" class="btn btn--primary">Unlock Dashboard</button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.admin-login {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(10, 25, 18, 0.4);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 1.5rem;
}

.admin-login__card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  padding: 2.5rem;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.lock-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.admin-login__header h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: #1a6ab4;
}

.admin-login__header p {
  margin: 0.75rem 0 2rem;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
}

.admin-login__form {
  display: grid;
  gap: 1.5rem;
  text-align: left;
}

.input-group {
  display: grid;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #1a6ab4;
}

.input-group input {
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
  font-size: 1rem;
}

.error-text {
  margin: 0.25rem 0 0;
  color: #d17c24;
  font-size: 0.8rem;
  font-weight: 700;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.9rem;
  border-radius: 12px;
  font-weight: 800;
  border: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn:active {
  transform: scale(0.96);
}

.btn--primary {
  background: linear-gradient(135deg, #1a6ab4, #124d85);
  color: white;
}

.btn--secondary {
  background: rgba(0, 0, 0, 0.05);
  color: #666;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

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
