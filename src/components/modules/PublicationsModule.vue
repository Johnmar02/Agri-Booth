<script setup>
/**
 * COMPONENT: PublicationsModule
 * Extracted from ModuleDrawerView to isolate the Corporate Materials (corp-materials) UI.
 */
const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
});

const publicationCoverStyle = (publication) => ({
  '--publication-accent': publication.accent || '#1a6ab4',
});
</script>

<template>
  <section class="body-section corp-materials-portal">
    <div class="corp-materials-header">
      <div class="corp-materials-copy">
        <h2 class="section-label">Publication Shelf</h2>
        <p class="corp-materials-text">{{ module.description }}</p>
      </div>
      <a
        v-if="module.externalLink"
        :href="module.externalLink"
        target="_blank"
        rel="noreferrer"
        class="corp-materials-hub-link"
      >
        Open materials hub
      </a>
    </div>

    <div
      v-for="publication in module.publications"
      :key="publication.id"
      class="publication-card"
    >
      <div class="publication-cover" :style="publicationCoverStyle(publication)">
        <img
          v-if="publication.image"
          :src="publication.image"
          :alt="publication.title"
          class="publication-cover-img"
          @error="$event.target.style.display='none'"
        />
        <div v-else class="publication-cover-fallback">
          <span class="publication-cover-kicker">{{ publication.subtitle }}</span>
          <strong class="publication-cover-label">
            {{ publication.coverLabel || publication.title }}
          </strong>
        </div>
      </div>

      <div class="publication-info">
        <p class="publication-type">{{ publication.subtitle }}</p>
        <h2 class="publication-title">{{ publication.title }}</h2>
        <p class="publication-desc">{{ publication.description }}</p>
        <a
          :href="publication.href || module.externalLink"
          target="_blank"
          rel="noreferrer"
          class="publication-action"
        >
          {{ publication.actionLabel || 'View publication' }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.body-section { margin-bottom: 3rem; }
.section-label { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #1a6ab4; border-left: 4px solid #d17c24; padding-left: 12px; margin-bottom: 1.5rem; display: block; }

/* Corp Materials Portal */
.corp-materials-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
.corp-materials-copy { flex: 1; }
.corp-materials-text { font-size: 1.1rem; color: #64748b; }
.corp-materials-hub-link { color: #1a6ab4; font-weight: 700; text-decoration: none; }
.publication-card { background: white; border: 1px solid #e2e8f0; border-radius: 24px; display: grid; grid-template-columns: 200px 1fr; overflow: hidden; margin-bottom: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
.publication-cover { background: var(--publication-accent); color: white; padding: 2rem; display: flex; flex-direction: column; justify-content: center; text-align: center; min-height: 250px; position: relative; }
.publication-cover-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.publication-cover-kicker { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; opacity: 0.8; margin-bottom: 0.5rem; display: block; }
.publication-cover-label { font-size: 1.1rem; font-weight: 900; line-height: 1.2; }
.publication-info { padding: 2rem; display: flex; flex-direction: column; }
.publication-type { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.5rem; }
.publication-title { font-size: 1.4rem; font-weight: 800; color: #1a6ab4; margin-bottom: 1rem; }
.publication-desc { font-size: 0.95rem; color: #64748b; line-height: 1.6; margin-bottom: 1.5rem; flex: 1; }
.publication-action { color: #1a6ab4; font-weight: 700; text-decoration: none; align-self: flex-start; }
</style>
