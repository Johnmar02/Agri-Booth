<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBoothController } from '@/controllers/useBoothController';
import { useContentStore } from '@/stores/contentStore';
import ThreeCanvas from '@/components/ThreeCanvas.vue';
import RegistrationPortal from '@/components/RegistrationPortal.vue';
import ModuleDrawerView from '@/views/ModuleDrawerView.vue';

const router = useRouter();
const contentStore = useContentStore();
const booth = useBoothController();
const threeCanvasRef = ref(null);

const handleLogbookSubmit = async () => {
  const nameBeforeSubmit = booth.logbookForm.name;
  await booth.submitLogbook();

  if (booth.visitorSession.isRegistered) {
    contentStore.recordVisitorSubmission({
      name: nameBeforeSubmit,
      affiliations: booth.logbookForm.affiliations,
      clientType: booth.logbookForm.clientType,
      itemsCollected: booth.collectedItems.value,
      submittedAt: new Date().toISOString()
    });
  }
};

const handleLogbookLogin = async () => {
  await booth.loginLogbook();
};

const handle3DClick = ({ id, object }) => {
  if (booth.isLogbookOpen.value) {
    return;
  }

  // Always zoom to the clicked object to give visual feedback
  threeCanvasRef.value?.focusOnTarget(object);
  
  // Then handle the logic for opening the module or logbook
  booth.selectHotspot(id);
};

const handle3DBackgroundClick = () => {
  booth.closeActiveModule();
  booth.closeLogbook();
};

const closePanel = () => {
  booth.closeActiveModule();
  booth.closeLogbook();
};

const openAdminLogin = () => {
  router.push({ name: 'AdminLogin' });
};

const handleLogout = () => {
  booth.logoutVisitor();
};
</script>

<template>
  <div id="agri-booth-app">
    <ThreeCanvas 
      ref="threeCanvasRef"
      @hotspot-click="handle3DClick"
      @background-click="handle3DBackgroundClick"
    />

    <div id="overlay-ui">
      <div v-if="booth.visitorSession.isRegistered" class="visitor-top-actions">
        <span class="visitor-name">Welcome, {{ booth.visitorSession.displayName }}</span>
        <button class="profile-btn" @click="booth.openProfile">Manage Profile</button>
        <button class="logout-btn" @click="handleLogout">Logout</button>
      </div>

      <RegistrationPortal
        v-if="booth.isLogbookOpen.value"
        :form="booth.logbookForm"
        :field-options="booth.logbookFieldOptions"
        :errors="booth.logbookErrors"
        :is-submitting="booth.isLogbookSubmitting.value"
        :is-registered="booth.visitorSession?.isRegistered || false"
        :is-profile-mode="booth.isProfileMode.value"
        @update-field="booth.updateLogbookField"
        @submit="handleLogbookSubmit"
        @login="handleLogbookLogin"
        @close="closePanel"
      />

      <ModuleDrawerView
        v-if="booth.activeModule.value"
        :module="booth.activeModule.value"
        :tracked-resource-ids="booth.trackedResourceIds.value"
        :chat-state="booth.chatState.value"
        :trivia-state="booth.triviaState.value"
        :calculator-state="booth.calculatorState.value"
        :feedback-draft="booth.feedbackDraft"
        @close="booth.closeActiveModule"
        @resource-track="booth.trackResource"
        @chat-draft-change="booth.updateChatDraft"
        @chat-submit="booth.submitChatMessage"
        @trivia-answer="booth.answerTrivia"
        @trivia-next="booth.advanceTrivia"
        @trivia-reset="booth.resetTrivia"
        @calculator-change="booth.updateCalculatorInput"
        @training-register="booth.registerForTraining"
        @feedback-submit="booth.submitFeedback"
        />

    </div>

    <Transition name="fade-fast">
      <div v-if="!booth.isLogbookOpen.value && !booth.activeModule.value" class="booth-watermark">
        <img src="/be-booth.png" alt="ITCPH Logo" class="mini-logo" />
        <div class="text">
          <h1 class="brand-title">Be-Booth</h1>
          <p class="brand-subtitle">ITCPH Digital Agri-Booth</p>
        </div>
      </div>
    </Transition>

    <button class="admin-corner-btn" @click="openAdminLogin">
      Admin Login
    </button>

    <!-- Global Feedback Button (Bottom Left) -->
    <div v-if="booth.visitorSession.isRegistered" class="feedback-corner-container">
      <Transition name="fade-up">
        <div v-if="booth.showGlobalFeedback.value" class="global-feedback-panel">
          <div class="feedback-header">
            <h3>Share your feedback</h3>
            <button class="close-mini" @click="booth.toggleGlobalFeedback()">&times;</button>
          </div>
          
          <div v-if="booth.feedbackDraft.success" class="feedback-success-state">
            <span class="check-icon">✓</span>
            <p>Thank you!</p>
          </div>
          <div v-else class="feedback-form-content">
            <div class="stars-row">
              <button 
                v-for="i in 5" 
                :key="i" 
                class="star-mini" 
                :class="{ active: booth.feedbackDraft.rating >= i }"
                @click="booth.feedbackDraft.rating = i"
              >★</button>
            </div>
            <textarea 
              v-model="booth.feedbackDraft.message" 
              placeholder="Tell us about your experience..."
            ></textarea>
            <button 
              class="send-feedback-btn" 
              :disabled="booth.feedbackDraft.isSubmitting || !booth.feedbackDraft.message.trim()"
              @click="booth.submitFeedback"
            >
              {{ booth.feedbackDraft.isSubmitting ? 'Sending...' : 'Send Feedback' }}
            </button>
            <p v-if="booth.feedbackDraft.error" class="mini-error">{{ booth.feedbackDraft.error }}</p>
          </div>
        </div>
      </Transition>

      <button 
        class="feedback-corner-btn" 
        :class="{ 'is-active': booth.showGlobalFeedback.value }"
        @click="booth.toggleGlobalFeedback()"
      >
        <span class="icon">💬</span>
        <span class="label">Feedback</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
#agri-booth-app {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

#overlay-ui {
  position: relative;
  z-index: 10;
}

.feedback-corner-container {
  position: fixed;
  left: 1.5rem;
  bottom: 1.5rem;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.feedback-corner-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #d17c24; /* Orange */
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 25px rgba(209, 124, 36, 0.25);
  backdrop-filter: blur(8px);
}

.feedback-corner-btn:hover {
  background: #b56a1d;
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(209, 124, 36, 0.35);
}

.feedback-corner-btn.is-active {
  background: #64748b;
  box-shadow: none;
}

.global-feedback-panel {
  width: 300px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(26, 106, 180, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.feedback-header {
  padding: 1rem 1.25rem;
  background: #1a6ab4;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feedback-header h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
}

.close-mini {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
}

.close-mini:hover { opacity: 1; }

.feedback-form-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stars-row {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
}

.star-mini {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #e2e8f0;
  cursor: pointer;
}

.star-mini.active { color: #f59e0b; }

.feedback-form-content textarea {
  width: 100%;
  height: 80px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem;
  font-size: 0.85rem;
  resize: none;
  font-family: inherit;
}

.feedback-form-content textarea:focus {
  outline: none;
  border-color: #1a6ab4;
}

.send-feedback-btn {
  background: #1a6ab4;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.send-feedback-btn:disabled {
  background: #cbd5e1;
}

.feedback-success-state {
  padding: 2rem;
  text-align: center;
}

.check-icon {
  font-size: 2.5rem;
  color: #10b981;
  display: block;
  margin-bottom: 0.5rem;
}

.mini-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin: 0;
  text-align: center;
}

/* Animations */
.fade-up-enter-active, .fade-up-leave-active {
  transition: all 0.3s ease;
}
.fade-up-enter-from, .fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.booth-watermark {
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 15;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.2rem 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(26, 106, 180, 0.15);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

.booth-watermark .mini-logo {
  width: 4.5rem;
  height: 4.5rem;
  object-fit: contain;
}

.booth-watermark .text {
  display: grid;
  gap: 0.1rem;
}

.booth-watermark .brand-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 900;
  color: #d17c24; /* Orange */
  letter-spacing: -0.01em;
}

.booth-watermark .brand-subtitle {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a6ab4; /* Blue */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.admin-corner-btn {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 15;
  background: rgba(26, 106, 180, 0.9);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 10px 25px rgba(26, 106, 180, 0.25);
  backdrop-filter: blur(8px);
}

.admin-corner-btn:hover {
  background: #1a6ab4;
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(26, 106, 180, 0.35);
}

.admin-corner-btn:active {
  transform: translateY(0);
}

.visitor-top-actions {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 99px;
  border: 1px solid rgba(26, 106, 180, 0.15);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
}

.visitor-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1a6ab4;
}

.profile-btn {
  background: #f1f5f9;
  color: #1a6ab4;
  border: 1px solid rgba(26, 106, 180, 0.2);
  padding: 0.4rem 1rem;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.profile-btn:hover {
  background: #e2e8f0;
  border-color: #1a6ab4;
}

.logout-btn {
  background: #d17c24;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #b56a1d;
  transform: translateY(-1px);
}

/* Animations */
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.25s ease;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .booth-watermark {
    top: 1rem;
    left: 1rem;
    gap: 0.8rem;
    padding: 0.8rem 1rem;
  }
  
  .booth-watermark .mini-logo {
    width: 3.5rem;
    height: 3.5rem;
  }
  
  .booth-watermark .brand-title {
    font-size: 1.4rem;
  }
  
  .booth-watermark .brand-subtitle {
    font-size: 0.8rem;
  }
}


@media (max-width: 520px) {
  .booth-watermark {
    top: 0.75rem;
    left: 0.5rem;
    right: 0.5rem;
    padding: 0.65rem 0.85rem;
    gap: 0.7rem;
  }

  .booth-watermark .mini-logo {
    width: 2.6rem;
    height: 2.6rem;
  }

}
</style>
