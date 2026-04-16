<script setup>
import { computed } from 'vue';
import { useBoothStore } from '@/stores/booth';
import { useBooth } from '@/composables/useBooth';
import { useFormManager } from '@/composables/useFormManager';
import { useVisitorStore } from '@/stores/visitor';

/**
 * VIEW: RegistrationPortal (Virtual Logbook)
 * Centered UI portal for collecting visitor data.
 * Adheres to the "Zero Biosecurity Risk" and "IOP Outreach" goals by digitizing site tracking.
 */

const boothStore = useBoothStore();
const boothController = useBooth();
const visitorStore = useVisitorStore();
const { formData, isSubmitting, isFormValid, submitForm } = useFormManager();

const isVisible = computed(() => boothStore.activeHotspotId === 'dot_table');

const handleRegistration = async () => {
  await submitForm();
  // Don't close immediately if form is invalid, but if it succeeded:
  if (visitorStore.isRegistered) {
    // Show success for 1 sec then close
    setTimeout(() => {
      boothController.closeOverlay();
    }, 1500);
  }
};

const close = () => {
  boothController.closeOverlay();
};
</script>

<template>
  <Transition name="scale">
    <div v-if="isVisible" class="portal-overlay">
      <div class="portal-card">
        <div class="header">
          <h2>Virtual Logbook</h2>
          <button class="close-btn" @click="close">&times;</button>
        </div>

        <div v-if="!visitorStore.isRegistered" class="form-container">
          <p class="subtitle">Please provide your details to access special IEC materials and training resources.</p>
          
          <div class="reg-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Full Name *</label>
                <input v-model="formData.name" type="text" placeholder="Juan dela Cruz" />
              </div>
              
              <div class="form-group">
                <label>Email Address *</label>
                <input v-model="formData.email" type="email" placeholder="juan@example.com" />
              </div>

              <div class="form-group full-width">
                <label>Address *</label>
                <input v-model="formData.address" type="text" placeholder="City, Province" />
              </div>

              <div class="form-group">
                <label>Affiliations</label>
                <input v-model="formData.affiliations" type="text" placeholder="Organization / Agency" />
              </div>

              <div class="form-group">
                <label>Gender</label>
                <select v-model="formData.gender">
                  <option value="">Select...</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label>Type of Client</label>
                <select v-model="formData.clientType">
                  <option value="">Select client type...</option>
                  <option>Farmer</option>
                  <option>Student</option>
                  <option>Researcher</option>
                  <option>Extension Worker</option>
                  <option>Other</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label>Feedback / Concerns</label>
                <textarea v-model="formData.feedback" rows="3" placeholder="How can ITCPH better serve you?"></textarea>
              </div>
            </div>

            <button 
              class="submit-btn" 
              :disabled="!isFormValid || isSubmitting"
              @click="handleRegistration"
            >
              {{ isSubmitting ? 'Recording Entry...' : 'Submit to ITCPH' }}
            </button>
          </div>
        </div>

        <div v-else class="success-container">
          <div class="success-icon">✓</div>
          <h3>Registration Complete</h3>
          <p>Welcome, {{ visitorStore.registration.name }}. You can now access all booth modules.</p>
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
