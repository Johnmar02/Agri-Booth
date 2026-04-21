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

  if (booth.visitorStatus.value.isRegistered) {
    contentStore.recordVisitorSubmission({
      name: nameBeforeSubmit,
      affiliations: booth.logbookForm.affiliations,
      clientType: booth.logbookForm.clientType,
      itemsCollected: booth.collectedItems.value,
      submittedAt: new Date().toISOString()
    });
  }
};

const handle3DClick = ({ id, object }) => {
  if (booth.isLogbookOpen.value) {
    return;
  }

  booth.selectHotspot(id);

  if (booth.activeModule.value) {
    threeCanvasRef.value?.focusOnTarget(object);
  }
};

const handle3DBackgroundClick = () => {
  booth.closeActiveModule();
  booth.closeLogbook();
  threeCanvasRef.value?.focusOnTarget(null);
};

const closePanel = () => {
  booth.closeActiveModule();
  booth.closeLogbook();
  threeCanvasRef.value?.focusOnTarget(null);
};

const openAdminLogin = () => {
  router.push({ name: 'AdminLogin' });
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
      <RegistrationPortal
        v-if="booth.isLogbookOpen.value"
        :form="booth.logbookForm"
        :errors="booth.logbookErrors"
        :is-submitting="booth.isLogbookSubmitting.value"
        @update-field="booth.updateLogbookField"
        @submit="handleLogbookSubmit"
        @close="closePanel"
      />

      <ModuleDrawerView
        v-if="booth.activeModule.value"
        :module="booth.activeModule.value"
        :tracked-resource-ids="booth.trackedResourceIds.value"
        :chat-state="booth.chatState.value"
        :trivia-state="booth.triviaState.value"
        :calculator-state="booth.calculatorState.value"
        @close="closePanel"
        @resource-track="booth.trackResource"
        @chat-draft-change="booth.updateChatDraft"
        @chat-submit="booth.submitChatMessage"
        @trivia-answer="booth.answerTrivia"
        @trivia-next="booth.advanceTrivia"
        @trivia-reset="booth.resetTrivia"
        @calculator-change="booth.updateCalculatorInput"
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
