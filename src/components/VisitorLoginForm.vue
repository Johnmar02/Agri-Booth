<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update-field', 'submit', 'login']);

const isLoginMode = ref(true);

const isFormValid = computed(() => {
  if (isLoginMode.value) {
    return props.form.email && props.form.password;
  }
  return props.form.name && props.form.email && props.form.address && props.form.password;
});

const handleSubmission = async () => {
  if (!isFormValid.value) return;
  if (isLoginMode.value) {
    emit('login');
  } else {
    emit('submit');
  }
};

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  emit('update-field', { field: 'form', value: '' }); // Clear main error
};
</script>

<template>
  <div class="auth-card">
    <header class="auth-header">
      <h2>{{ isLoginMode ? 'Sign In' : 'Create Account' }}</h2>
      <p>{{ isLoginMode ? 'Welcome back! Please enter your credentials.' : 'Join us to access exclusive agricultural resources.' }}</p>
    </header>

    <form @submit.prevent="handleSubmission" class="auth-form">
      <div v-if="!isLoginMode" class="form-group" :class="{ 'has-error': errors.name }">
        <label>Full Name</label>
        <input 
          :value="form.name" 
          @input="$emit('update-field', { field: 'name', value: $event.target.value })"
          type="text" placeholder="Juan dela Cruz" 
        />
        <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
      </div>
      
      <div class="form-group" :class="{ 'has-error': errors.email }">
        <label>Email Address</label>
        <input 
          :value="form.email" 
          @input="$emit('update-field', { field: 'email', value: $event.target.value })"
          type="email" placeholder="juan@example.com" 
        />
        <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.password }">
        <label>Password</label>
        <input 
          :value="form.password" 
          @input="$emit('update-field', { field: 'password', value: $event.target.value })"
          type="password" placeholder="••••••••" 
        />
        <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
      </div>

      <template v-if="!isLoginMode">
        <div class="form-group" :class="{ 'has-error': errors.address }">
          <label>Address</label>
          <input 
            :value="form.address" 
            @input="$emit('update-field', { field: 'address', value: $event.target.value })"
            type="text" placeholder="City, Province" 
          />
          <span v-if="errors.address" class="error-text">{{ errors.address }}</span>
        </div>

        <div class="form-grid">
          <div class="form-group" :class="{ 'has-error': errors.gender }">
            <label>Gender</label>
            <select 
              :value="form.gender"
              @change="$emit('update-field', { field: 'gender', value: $event.target.value })"
            >
              <option value="">Select...</option>
              <option>Male</option>
              <option>Female</option>
              <option>Non-binary</option>
            </select>
            <span v-if="errors.gender" class="error-text">{{ errors.gender }}</span>
          </div>

          <div class="form-group" :class="{ 'has-error': errors.clientType }">
            <label>Client Type</label>
            <select 
              :value="form.clientType"
              @change="$emit('update-field', { field: 'clientType', value: $event.target.value })"
            >
              <option value="">Select...</option>
              <option>Farmer</option>
              <option>Student</option>
              <option>Researcher</option>
              <option>Other</option>
            </select>
            <span v-if="errors.clientType" class="error-text">{{ errors.clientType }}</span>
          </div>
        </div>
      </template>

      <div class="form-actions">
        <span v-if="errors.form" class="main-error">{{ errors.form }}</span>
        <button 
          type="submit"
          class="submit-btn" 
          :disabled="!isFormValid || isSubmitting"
        >
          {{ isSubmitting ? (isLoginMode ? 'Signing in...' : 'Registering...') : (isLoginMode ? 'Sign In' : 'Register') }}
        </button>

        <button type="button" class="toggle-btn" @click="toggleMode">
          {{ isLoginMode ? "Don't have an account? Register" : "Already have an account? Sign In" }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.auth-card {
  background: white;
  width: 100%;
  max-width: 440px;
  padding: 2.5rem;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h2 {
  font-size: 1.75rem;
  color: #1a6ab4;
  margin: 0 0 0.5rem;
}

.auth-header p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #1a6ab4;
}

input, select {
  padding: 0.8rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: #1a6ab4;
  background: #f8fafc;
  box-shadow: 0 0 0 4px rgba(26, 106, 180, 0.1);
}

.has-error input, .has-error select {
  border-color: #ef4444;
}

.error-text {
  font-size: 0.75rem;
  color: #ef4444;
}

.main-error {
  display: block;
  font-size: 0.85rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #1a6ab4 0%, #124d85 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 10px 15px -3px rgba(26, 106, 180, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 20px -3px rgba(26, 106, 180, 0.4);
}

.submit-btn:disabled {
  background: #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
}

.toggle-btn {
  width: 100%;
  background: none;
  border: none;
  color: #1a6ab4;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem;
  margin-top: 0.5rem;
  text-decoration: underline;
}

.toggle-btn:hover {
  color: #124d85;
}
</style>
