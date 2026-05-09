<script setup>
import { ref, watch } from 'vue';

/**
 * COMPONENT: NewsletterModule
 * Extracted from ModuleDrawerView to isolate the Newsletter slider UI and logic.
 */
const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
});

const slideIndex = ref(0);

const prevSlide = () => {
  if (!props.module?.images?.length) return;
  slideIndex.value = (slideIndex.value - 1 + props.module.images.length) % props.module.images.length;
};

const nextSlide = () => {
  if (!props.module?.images?.length) return;
  slideIndex.value = (slideIndex.value + 1) % props.module.images.length;
};

// Reset index when module content potentially changes (safety)
watch(() => props.module?.id, () => {
  slideIndex.value = 0;
});
</script>

<template>
  <section class="body-section newsletter-slider-container">
    <div class="slider-viewport-v5">
      <button class="slider-nav-btn prev" @click="prevSlide" aria-label="Previous">
        <span>❮</span>
      </button>

      <div class="active-slide-v5">
        <Transition name="fade-fast" mode="out-in">
          <img
            :key="slideIndex"
            :src="module.images[slideIndex]"
            class="newsletter-page-img"
            alt="Newsletter edition"
          />
        </Transition>
        <div class="slide-counter-v5">
          Edition {{ slideIndex + 1 }} of {{ module.images.length }}
        </div>
      </div>

      <button class="slider-nav-btn next" @click="nextSlide" aria-label="Next">
        <span>❯</span>
      </button>
    </div>

    <div class="article-footer-v3">
      <a
        href="https://www.atiitcph.com/newsletters"
        target="_blank"
        class="prime-action-btn footer-redirect-btn-v3"
      >
        View More Official Newsletters
      </a>
    </div>
  </section>
</template>

<style scoped>
.body-section { margin-bottom: 3rem; }
.prime-action-btn { background: #1a6ab4; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; }
.prime-action-btn:hover { background: #124d85; }

/* Newsletter Slider */
.newsletter-slider-container {
  max-width: 900px;
  margin: 0 auto;
}
.slider-viewport-v5 {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}
.active-slide-v5 {
  flex: 1;
  position: relative;
  background: #f8fafc;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.newsletter-page-img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}
.slide-counter-v5 {
  padding: 1rem;
  font-weight: 800;
  color: #1a6ab4;
}
.slider-nav-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  color: #1a6ab4;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}
.slider-nav-btn:hover {
  background: #f1f5f9;
  transform: scale(1.1);
}

.article-footer-v3 {
  text-align: center;
  padding-top: 2rem;
}

/* Transitions */
.fade-fast-enter-active, .fade-fast-leave-active { transition: opacity 0.2s ease; }
.fade-fast-enter-from, .fade-fast-leave-to { opacity: 0; }
</style>
