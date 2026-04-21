<script setup>
import { computed, ref, watch } from 'vue';

/**
 * VIEW: RegistrationPortal (Virtual Logbook)
 * Centered UI portal for collecting visitor data.
 * Refactored to act as a dumb component controlled by useBoothController.
 */

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

const emit = defineEmits(['update-field', 'submit', 'close']);

const showSuccess = ref(false);

const isFormValid = computed(() => {
  return props.form.name && props.form.email && props.form.address;
});

const handleRegistration = async () => {
  if (!isFormValid.value) return;
  emit('submit');
};
</script>

<template>
  <Transition name="scale">
    <div class="portal-overlay">
      <div class="portal-card">
        <div class="header">
          <h2>Virtual Logbook</h2>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>

        <div class="form-container">
          <p class="subtitle">Please provide your details to access special IEC materials and training resources.</p>
          
          <div class="reg-form">
            <div class="form-grid">
              <div class="form-group" :class="{ 'has-error': errors.name }">
                <label>Full Name *</label>
                <input 
                  :value="form.name" 
                  @input="$emit('update-field', { field: 'name', value: $event.target.value })"
                  type="text" placeholder="Juan dela Cruz" 
                />
                <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
              </div>
              
              <div class="form-group" :class="{ 'has-error': errors.email }">
                <label>Email Address *</label>
                <input 
                  :value="form.email" 
                  @input="$emit('update-field', { field: 'email', value: $event.target.value })"
                  type="email" placeholder="juan@example.com" 
                />
                <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
              </div>

              <div class="form-group full-width" :class="{ 'has-error': errors.address }">
                <label>Address *</label>
                <input 
                  :value="form.address" 
                  @input="$emit('update-field', { field: 'address', value: $event.target.value })"
                  type="text" placeholder="City, Province" 
                />
                <span v-if="errors.address" class="error-text">{{ errors.address }}</span>
              </div>

              <div class="form-group" :class="{ 'has-error': errors.affiliations }">
                <label>Affiliations</label>
                <input 
                  :value="form.affiliations" 
                  @input="$emit('update-field', { field: 'affiliations', value: $event.target.value })"
                  type="text" placeholder="Organization / Agency" 
                />
                <span v-if="errors.affiliations" class="error-text">{{ errors.affiliations }}</span>
              </div>

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

              <div class="form-group full-width" :class="{ 'has-error': errors.clientType }">
                <label>Type of Client</label>
                <select 
                  :value="form.clientType"
                  @change="$emit('update-field', { field: 'clientType', value: $event.target.value })"
                >
                  <option value="">Select client type...</option>
                  <option>Farmer</option>
                  <option>Student</option>
                  <option>Researcher</option>
                  <option>Extension Worker</option>
                  <option>Other</option>
                </select>
                <span v-if="errors.clientType" class="error-text">{{ errors.clientType }}</span>
              </div>

              <div class="form-group full-width" :class="{ 'has-error': errors.feedback }">
                <label>Feedback / Concerns</label>
                <textarea 
                  :value="form.feedback" 
                  @input="$emit('update-field', { field: 'feedback', value: $event.target.value })"
                  rows="3" placeholder="How can ITCPH better serve you?"></textarea>
                <span v-if="errors.feedback" class="error-text">{{ errors.feedback }}</span>
              </div>
            </div>

            <div class="form-actions">
              <span v-if="errors.form" class="main-error">{{ errors.form }}</span>
              <button 
                class="submit-btn" 
                :disabled="!isFormValid || isSubmitting"
                @click="handleRegistration"
              >
                {{ isSubmitting ? 'Recording Entry...' : 'Submit to ITCPH' }}
              </button>
            </div>
          </div>
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
  z-index: 200;
  padding: 20px;
}

.portal-card {
  background: #fff;
  width: 100%;
  max-width: 580px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 24px 32px;
  background: linear-gradient(135deg, #1a6ab4 0%, #124d85 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: -0.02em;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  padding: 32px;
  overflow-y: auto;
  max-height: 70vh;
}

.subtitle {
  color: #64748b;
  margin-bottom: 24px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.full-width {
  grid-column: span 2;
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

input, select, textarea {
  padding: 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #1a6ab4;
  background: #f8fafc;
}

.has-error input, .has-error select, .has-error textarea {
  border-color: #ef4444 !important;
}

.error-text {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 2px;
}

.main-error {
  display: block;
  font-size: 0.85rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  text-align: center;
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

.submit-btn:hover:not(:disabled) {
  background: #b86a18;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.success-container {
  padding: 60px 40px;
  text-align: center;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: #22c55e;
  color: white;
  border-radius: 50%;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.scale-enter-active, .scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from, .scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
}
</style>
