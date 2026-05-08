<script setup>
import { ref, watch } from 'vue';
import { useLmsStore } from '@/stores/lms';
import { useVisitorStore } from '@/stores/visitor';
import TriviaModule from '@/components/modules/TriviaModule.vue';
import ChatModule from '@/components/modules/ChatModule.vue';
import SuccessStoriesModule from '@/components/modules/SuccessStoriesModule.vue';
import PublicationsModule from '@/components/modules/PublicationsModule.vue';
import IecMaterialsModule from '@/components/modules/IecMaterialsModule.vue';
import TrainingProgramsModule from '@/components/modules/TrainingProgramsModule.vue';
import CalculatorsModule from '@/components/modules/CalculatorsModule.vue';
import NewsletterModule from '@/components/modules/NewsletterModule.vue';
import VirtualTourModule from '@/components/modules/VirtualTourModule.vue';
import LmsModule from '@/components/modules/LmsModule.vue';

/**
 * VIEW: ModuleDrawerView
 * Renders the right-hand detail drawer for the currently selected hotspot module.
 * Now refactored to orchestrate specialized sub-modules.
 */
const props = defineProps({
  module: {
    type: Object,
    default: null,
  },
  trackedResourceIds: {
    type: Array,
    required: true,
  },
  chatState: {
    type: Object,
    required: true,
  },
  triviaState: {
    type: Object,
    required: true,
  },
  calculatorState: {
    type: Object,
    required: true,
  },
  feedbackDraft: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits([
  "close",
  "resource-track",
  "chat-draft-change",
  "chat-submit",
  "trivia-answer",
  "trivia-next",
  "trivia-reset",
  "calculator-change",
  "training-register",
  "feedback-submit",
]);

const lmsStore = useLmsStore();
const visitorStore = useVisitorStore();

const showFeedbackForm = ref(false);

const downloadResource = (resource) => {
  emit("resource-track", resource.id);
  const content = `ITCPH Digital Agri-Booth Asset\n\nTitle: ${resource.title}\nFormat: ${resource.format}\nDescription: ${resource.description}`;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${resource.title.replace(/[\\s\\W]+/g, "_")}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

watch(
  () => props.module?.id,
  (newId) => {
    if (newId === 'e-learning') {
      lmsStore.initialize(visitorStore.visitorId);
    }
    showFeedbackForm.value = false;
  }
);

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7198/api';
</script>

<template>
  <Transition name="premium-modal">
    <div v-if="module" class="experience-overlay">
      <div class="experience-card">
        <!-- Hero Header -->
        <header class="experience-hero">
          <div class="hero-content">
            <span class="hero-badge">{{ module.badge }}</span>
            <h1 class="hero-title">{{ module.title }}</h1>
            <p class="hero-subtitle">{{ module.summary }}</p>
          </div>
          <button
            class="experience-close"
            type="button"
            aria-label="Close"
            @click="$emit('close')"
          >
            <span class="close-icon">&times;</span>
          </button>
        </header>

        <div class="experience-body">
          <template v-if="module.id === 'virtual-tour'">
            <VirtualTourModule :module="module" />
          </template>

          <template v-else-if="module.id === 'chat-with-us'">
            <ChatModule
              :chat-state="chatState"
              @chat-draft-change="$emit('chat-draft-change', $event)"
              @chat-submit="$emit('chat-submit')"
            />
          </template>

          <template v-else-if="module.id === 'corporate-materials'">
            <SuccessStoriesModule :module="module" />
          </template>

          <template v-else-if="module.id === 'iec-materials'">
            <IecMaterialsModule :module="module" :api-base-url="apiBaseUrl" />
          </template>

          <template v-else-if="module.id === 'corp-materials'">
            <PublicationsModule :module="module" />
          </template>

          <template v-else-if="module.id === 'training-programs'">
            <TrainingProgramsModule :module="module" @training-register="$emit('training-register', $event)" />
          </template>

          <template v-else-if="module.id === 'digital-calculators'">
            <CalculatorsModule :module="module" />
          </template>

          <template v-else-if="module.id === 'newsletters'">
            <NewsletterModule :module="module" />
          </template>

          <template v-else-if="module.id === 'bebu-game'">
            <TriviaModule
              :module="module"
              :trivia-state="triviaState"
              @trivia-answer="$emit('trivia-answer', $event)"
              @trivia-next="$emit('trivia-next')"
              @trivia-reset="$emit('trivia-reset')"
            />
          </template>

          <!-- Fallback Main Layout for standard/generic modules -->
          <div v-else class="main-layout">
            <div class="narrative-stack">
              <section class="body-section">
                <h2 class="section-label">Overview</h2>
                <p class="body-text">{{ module.description }}</p>
              </section>

              <section v-if="module.resources?.length" class="body-section">
                <span class="section-label">Digital Library & Materials</span>
                <div class="library-grid">
                  <div 
                    v-for="res in module.resources" 
                    :key="res.id" 
                    class="resource-card"
                    :class="{ 'is-collected': trackedResourceIds.includes(res.id) }"
                  >
                    <div class="res-icon">📄</div>
                    <div class="res-content">
                      <h4 class="res-title">{{ res.title }}</h4>
                      <p class="res-desc">{{ res.description }}</p>
                      <button 
                        class="prime-action-btn res-btn"
                        @click="downloadResource(res)"
                        :disabled="trackedResourceIds.includes(res.id)"
                      >
                        {{ trackedResourceIds.includes(res.id) ? 'Collected' : 'Download Now' }}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section v-if="module.quickStats?.length" class="body-section">
                <h2 class="section-label">Strategic Metrics</h2>
                <div class="premium-stats">
                  <div v-for="metric in module.quickStats" :key="metric.label" class="premium-stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-data">
                      <span class="stat-val">{{ metric.value }}</span>
                      <span class="stat-lab">{{ metric.label }}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div class="action-stack">
              <!-- Special case for LMS within the standard layout -->
              <LmsModule v-if="module.id === 'e-learning'" :module="module" />
            </div>
          </div>
        </div>

        <!-- Feedback Footer -->
        <footer v-if="visitorStore.isRegistered" class="drawer-footer-feedback">
          <div class="feedback-toggle" @click="showFeedbackForm = !showFeedbackForm">
            <span class="feedback-icon">💬</span>
            <span class="feedback-label">{{ showFeedbackForm ? 'Minimize Feedback' : 'How was your experience? Leave feedback' }}</span>
          </div>

          <Transition name="fade-up">
            <div v-if="showFeedbackForm" class="feedback-mini-form">
              <div v-if="feedbackDraft.success" class="feedback-success">
                <span class="success-icon">✓</span>
                <p>Thank you for your feedback!</p>
                <button class="btn-text" @click="showFeedbackForm = false; feedbackDraft.success = false">Close</button>
              </div>
              <div v-else class="feedback-inputs">
                <div class="rating-stars">
                  <button v-for="i in 5" :key="i" class="star-btn" :class="{ active: feedbackDraft.rating >= i }" @click="feedbackDraft.rating = i">★</button>
                </div>
                <div class="message-row">
                  <textarea v-model="feedbackDraft.message" placeholder="Your message (optional)..." :disabled="feedbackDraft.isSubmitting"></textarea>
                  <button class="feedback-submit-btn" :disabled="feedbackDraft.isSubmitting || !feedbackDraft.message.trim()" @click="$emit('feedback-submit')">{{ feedbackDraft.isSubmitting ? '...' : 'Send' }}</button>
                </div>
                <p v-if="feedbackDraft.error" class="feedback-error">{{ feedbackDraft.error }}</p>
              </div>
            </div>
          </Transition>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.experience-overlay { position: fixed; inset: 0; background: rgba(10, 25, 18, 0.6); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 2rem; }
.experience-card { background: #ffffff; width: 95%; height: 95vh; border-radius: 32px; box-shadow: 0 50px 150px rgba(0, 0, 0, 0.4); overflow: hidden; display: grid; grid-template-rows: auto 1fr; }
.experience-hero { padding: 1rem 2.5rem; background: linear-gradient(135deg, #1a6ab4 0%, #124d85 100%); color: white; display: flex; justify-content: space-between; align-items: center; }
.hero-title { font-size: 1.5rem; font-weight: 900; }
.experience-close {
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
.experience-close:hover {
  background: #d17c24;
  transform: rotate(90deg) scale(1.1);
}
.experience-body { padding: 2.5rem; overflow-y: auto; }
.main-layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 3rem; }
.body-section { margin-bottom: 3rem; }
.section-label { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #1a6ab4; border-left: 4px solid #d17c24; padding-left: 12px; margin-bottom: 1.5rem; display: block; }
.body-text { font-size: 1.1rem; line-height: 1.8; color: #334155; }

/* Library & Resources */
.library-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
.resource-card { background: #f8fafc; border-radius: 16px; padding: 1.25rem; border: 1px solid #e2e8f0; }
.res-title { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; }
.res-desc { font-size: 0.8rem; color: #64748b; margin-bottom: 1rem; }

/* Premium Stats */
.premium-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.premium-stat-card { background: #f8fafc; padding: 1.25rem; border-radius: 16px; display: flex; align-items: center; gap: 1rem; }
.stat-val { font-size: 1.4rem; font-weight: 800; color: #1a6ab4; }
.stat-lab { font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; }

/* Feedback UX */
.drawer-footer-feedback { border-top: 1px solid #e2e8f0; background: #f8fafc; }
.feedback-toggle { padding: 0.75rem 2rem; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; background: white; }
.feedback-label { font-size: 0.85rem; font-weight: 700; color: #1a6ab4; }
.feedback-mini-form { padding: 1.5rem 2rem; background: white; border-top: 1px solid #e2e8f0; }
.rating-stars { display: flex; gap: 0.4rem; margin-bottom: 1rem; }
.star-btn { background: none; border: none; font-size: 1.5rem; color: #e2e8f0; cursor: pointer; }
.star-btn.active { color: #f59e0b; }
.message-row { display: flex; gap: 1rem; }
.message-row textarea { flex: 1; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px; font-size: 0.9rem; height: 40px; resize: none; }
.feedback-submit-btn { background: #1a6ab4; color: white; border: none; border-radius: 10px; padding: 0 1.25rem; font-weight: 700; cursor: pointer; }
.feedback-submit-btn:disabled { opacity: 0.5; }
.feedback-success { text-align: center; padding: 0.5rem; }
.success-icon { color: #10b981; font-size: 1.5rem; display: block; }
.feedback-error { color: #ef4444; font-size: 0.7rem; margin-top: 0.4rem; }

.prime-action-btn { background: #1a6ab4; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
.prime-action-btn:hover { background: #124d85; }

/* Transitions */
.premium-modal-enter-active, .premium-modal-leave-active { transition: all 0.4s ease; }
.premium-modal-enter-from, .premium-modal-leave-to { opacity: 0; transform: scale(0.95); }
.fade-up-enter-active, .fade-up-leave-active { transition: all 0.3s ease; }
.fade-up-enter-from, .fade-up-leave-to { opacity: 0; transform: translateY(10px); }

@media (max-width: 1000px) {
  .main-layout { grid-template-columns: 1fr; }
}
</style>
