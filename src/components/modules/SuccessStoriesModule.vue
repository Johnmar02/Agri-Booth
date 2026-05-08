<script setup>
/**
 * COMPONENT: SuccessStoriesModule
 * Extracted from ModuleDrawerView to isolate the Success Stories (corporate-materials) UI.
 */
const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <section class="body-section success-article-portal">
    <div class="article-stack-v3">
      <article v-for="story in module.stories" :key="story.title" class="official-article-v3">
        <header class="article-header-v3">
          <h2 class="article-title-v3">{{ story.title }}</h2>
          <div class="article-date-v3">📅 Published: {{ story.date }}</div>
        </header>

        <div class="article-visual-v3">
          <img :src="story.image" :alt="story.title" class="article-img-v3" />
        </div>

        <div class="article-content-v3">
          <div v-if="story.quote" class="article-pullquote-v3">
            “{{ story.quote }}”
          </div>
          <p class="article-body-p-v3">{{ story.text }}</p>
        </div>
        
        <div class="article-divider-v3"></div>
      </article>

      <div class="article-footer-v3">
        <a 
          href="https://www.atiitcph.com/articles" 
          target="_blank" 
          class="prime-action-btn footer-redirect-btn-v3"
        >
          View More Official Stories ➔
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.body-section { margin-bottom: 3rem; }
.prime-action-btn { background: #1a6ab4; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; }
.prime-action-btn:hover { background: #124d85; }

/* Success Articles specialized styles */
.article-stack-v3 {
  max-width: 800px;
  margin: 0 auto;
}
.official-article-v3 {
  margin-bottom: 4rem;
}
.article-title-v3 {
  font-size: 2rem;
  font-weight: 900;
  color: #1a6ab4;
  margin-bottom: 0.5rem;
}
.article-date-v3 {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
}
.article-visual-v3 {
  margin-bottom: 2rem;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}
.article-img-v3 {
  width: 100%;
  height: auto;
  display: block;
}
.article-pullquote-v3 {
  font-size: 1.4rem;
  font-style: italic;
  color: #d17c24;
  border-left: 5px solid #d17c24;
  padding-left: 2rem;
  margin: 2rem 0;
  font-weight: 600;
  line-height: 1.4;
}
.article-body-p-v3 {
  font-size: 1.15rem;
  line-height: 1.8;
  color: #334155;
  white-space: pre-wrap;
}
.article-divider-v3 {
  height: 1px;
  background: #e2e8f0;
  margin-top: 4rem;
}
.article-footer-v3 {
  text-align: center;
  padding-top: 2rem;
}
</style>
