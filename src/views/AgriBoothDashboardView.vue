<script setup>
import HotspotMapView from '@/views/HotspotMapView.vue';

/**
 * VIEW: AgriBoothDashboardView
 * Presents the main dashboard, hero messaging, visitor status, and module cards.
 *
 * WHY THIS FILE EXISTS:
 * The dashboard is the public-facing shell of the booth. It needs to remain a pure
 * presentation layer so branding, layout, and interaction design can evolve without
 * rewriting the application rules held by the controller.
 */
defineProps({
  brand: {
    type: Object,
    required: true,
  },
  outcomes: {
    type: Array,
    required: true,
  },
  hotspots: {
    type: Array,
    required: true,
  },
  modules: {
    type: Array,
    required: true,
  },
  visitorStatus: {
    type: Object,
    required: true,
  },
  collectedItems: {
    type: Array,
    required: true,
  },
});

defineEmits(['hotspot-select', 'module-select', 'open-logbook']);
</script>

<template>
  <main class="dashboard">
    <section class="hero-card">
      <div class="hero-card__content">
        <div class="hero-card__brand">
          <img class="hero-card__logo" src="/ITCPH_icon.png" alt="ITCPH booth logo" />
          <div>
            <p class="hero-card__eyebrow">{{ brand.shortName }}</p>
            <h1>{{ brand.name }}</h1>
          </div>
        </div>

        <p class="hero-card__strapline">{{ brand.strapline }}</p>
        <p class="hero-card__mission">{{ brand.mission }}</p>

        <div class="hero-card__actions">
          <button class="hero-button hero-button--primary" type="button" @click="$emit('open-logbook')">
            Open secure logbook
          </button>
          <button class="hero-button hero-button--secondary" type="button" @click="$emit('module-select', 'virtual-tour')">
            Explore virtual tour
          </button>
        </div>
      </div>

      <div class="hero-card__outcomes">
        <article v-for="outcome in outcomes" :key="outcome.label" class="outcome-card">
          <p class="outcome-card__label">{{ outcome.label }}</p>
          <p class="outcome-card__value">{{ outcome.value }}</p>
        </article>
      </div>
    </section>

    <section class="overview-grid">
      <HotspotMapView :hotspots="hotspots" @hotspot-select="$emit('hotspot-select', $event)" />

      <aside class="status-card" aria-labelledby="status-title">
        <div class="status-card__header">
          <p class="status-card__eyebrow">Visitor control</p>
          <h2 id="status-title">{{ visitorStatus.heading }}</h2>
        </div>

        <div class="status-card__pills">
          <span class="status-pill">{{ visitorStatus.accessLabel }}</span>
          <span class="status-pill status-pill--soft">
            {{ visitorStatus.unlockedModuleCount }}/{{ visitorStatus.totalModuleCount }} modules available
          </span>
        </div>

        <p class="status-card__copy">{{ visitorStatus.description }}</p>

        <div class="status-card__collection">
          <p class="status-card__section-title">Items collected</p>
          <div v-if="collectedItems.length" class="collection-list">
            <span v-for="item in collectedItems" :key="item" class="collection-chip">
              {{ item }}
            </span>
          </div>
          <p v-else class="status-card__empty">
            Tracked resource interactions will appear here once a visitor opens mock downloads or portal tiles.
          </p>
        </div>
      </aside>
    </section>

    <section class="module-section" aria-labelledby="modules-title">
      <div class="module-section__header">
        <div>
          <p class="module-section__eyebrow">Educational hub</p>
          <h2 id="modules-title">Interactive learning modules</h2>
        </div>
        <p class="module-section__copy">
          Each module is modeled as a hotspot-backed panel so the current lightweight dashboard can grow into a richer living digital twin.
        </p>
      </div>

      <div class="module-grid">
        <article
          v-for="module in modules"
          :key="module.id"
          class="module-card"
          :class="{ 'module-card--active': module.isActive }"
        >
          <div class="module-card__topline">
            <span class="module-badge">{{ module.badge }}</span>
            <span v-if="module.isLocked" class="module-lock">Requires logbook</span>
          </div>

          <h3>{{ module.title }}</h3>
          <p class="module-card__summary">{{ module.summary }}</p>

          <ul class="module-card__highlights">
            <li v-for="highlight in module.highlights.slice(0, 2)" :key="highlight">
              {{ highlight }}
            </li>
          </ul>

          <button class="module-card__button" type="button" @click="$emit('module-select', module.id)">
            {{ module.isLocked ? 'Register to access' : 'Open module' }}
          </button>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  width: min(1180px, calc(100vw - 2rem));
  margin: 0 auto;
  padding: 1.4rem 0 3rem;
  display: grid;
  gap: 1.3rem;
}

.hero-card {
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 1.25rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  border-radius: 32px;
  background:
    radial-gradient(circle at top right, rgba(255, 224, 163, 0.56), transparent 30%),
    linear-gradient(140deg, rgba(253, 252, 247, 0.96), rgba(245, 249, 243, 0.94));
  border: 1px solid rgba(20, 55, 34, 0.08);
  box-shadow: 0 28px 70px rgba(21, 55, 35, 0.11);
}

.hero-card__content {
  display: grid;
  gap: 1rem;
}

.hero-card__brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hero-card__logo {
  width: 4rem;
  height: 4rem;
  object-fit: contain;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.84);
  padding: 0.5rem;
  border: 1px solid rgba(20, 55, 34, 0.08);
}

.hero-card__eyebrow {
  margin: 0 0 0.2rem;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-brand);
}

.hero-card h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  line-height: 0.96;
  color: var(--color-ink);
}

.hero-card__strapline,
.hero-card__mission {
  margin: 0;
  max-width: 68ch;
  color: var(--color-muted);
  line-height: 1.7;
}

.hero-card__strapline {
  font-size: 1.05rem;
  color: var(--color-ink-soft);
}

.hero-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.hero-button {
  min-height: 3rem;
  padding: 0.75rem 1.15rem;
  border-radius: 999px;
  border: 0;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.hero-button--primary {
  color: #fff;
  background: linear-gradient(180deg, var(--color-brand), var(--color-brand-strong));
  box-shadow: 0 14px 28px rgba(31, 107, 82, 0.2);
}

.hero-button--secondary {
  color: var(--color-brand-strong);
  background: rgba(31, 107, 82, 0.1);
  border: 1px solid rgba(31, 107, 82, 0.1);
}

.hero-card__outcomes {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.outcome-card {
  padding: 1rem;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(20, 55, 34, 0.08);
}

.outcome-card__label {
  margin: 0 0 0.45rem;
  font-size: 0.77rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-brand);
}

.outcome-card__value {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 800;
  color: var(--color-ink);
}

.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(18rem, 0.95fr);
  gap: 1.2rem;
}

.status-card {
  background: rgba(253, 252, 247, 0.88);
  border: 1px solid rgba(20, 55, 34, 0.1);
  border-radius: 28px;
  box-shadow: 0 22px 50px rgba(24, 55, 39, 0.08);
  padding: 1.35rem;
  display: grid;
  gap: 1rem;
  align-content: start;
}

.status-card__header h2 {
  margin: 0.2rem 0 0;
  font-family: var(--font-display);
  font-size: 1.75rem;
  color: var(--color-ink);
}

.status-card__eyebrow,
.module-section__eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-brand);
}

.status-card__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.status-pill {
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(31, 107, 82, 0.14);
  color: var(--color-brand-strong);
  font-weight: 700;
  font-size: 0.8rem;
}

.status-pill--soft {
  background: rgba(217, 152, 43, 0.16);
  color: #7d5b1d;
}

.status-card__copy,
.status-card__empty,
.module-section__copy {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.65;
}

.status-card__section-title {
  margin: 0 0 0.7rem;
  font-weight: 800;
  color: var(--color-ink);
}

.collection-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.collection-chip {
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: rgba(20, 55, 34, 0.06);
  border: 1px solid rgba(20, 55, 34, 0.08);
  color: var(--color-ink-soft);
  font-weight: 600;
  font-size: 0.8rem;
}

.module-section {
  display: grid;
  gap: 1rem;
}

.module-section__header {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 1rem;
  align-items: end;
}

.module-section__header h2 {
  margin: 0.25rem 0 0;
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  color: var(--color-ink);
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.module-card {
  display: grid;
  gap: 1rem;
  min-height: 100%;
  padding: 1.1rem;
  border-radius: 24px;
  background: rgba(253, 252, 247, 0.82);
  border: 1px solid rgba(20, 55, 34, 0.08);
  box-shadow: 0 18px 40px rgba(24, 55, 39, 0.08);
}

.module-card--active {
  border-color: rgba(31, 107, 82, 0.28);
  box-shadow: 0 24px 42px rgba(31, 107, 82, 0.12);
}

.module-card__topline {
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
  align-items: flex-start;
}

.module-badge,
.module-lock {
  padding: 0.32rem 0.65rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.module-badge {
  background: rgba(31, 107, 82, 0.1);
  color: var(--color-brand-strong);
}

.module-lock {
  background: rgba(217, 152, 43, 0.18);
  color: #7b5712;
}

.module-card h3 {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-ink);
}

.module-card__summary {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.65;
}

.module-card__highlights {
  margin: 0;
  padding-left: 1rem;
  color: var(--color-ink-soft);
  line-height: 1.55;
}

.module-card__button {
  margin-top: auto;
  min-height: 2.9rem;
  border: 0;
  border-radius: 16px;
  background: rgba(20, 55, 34, 0.08);
  color: var(--color-brand-strong);
  font-weight: 800;
}

@media (max-width: 1080px) {
  .hero-card__outcomes,
  .module-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .overview-grid,
  .module-section__header {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .dashboard {
    width: min(100vw - 1rem, 100%);
    padding-top: 0.8rem;
  }

  .hero-card__brand {
    align-items: flex-start;
  }

  .hero-card__logo {
    width: 3.7rem;
    height: 3.7rem;
  }

  .hero-card__outcomes,
  .module-grid {
    grid-template-columns: 1fr;
  }
}
</style>
