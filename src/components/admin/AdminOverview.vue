<script setup>
/**
 * COMPONENT: AdminOverview
 * Summary of key performance metrics for the Agri-Booth.
 */
const props = defineProps({
  analytics: {
    type: Object,
    required: true,
  },
  visitorLogs: {
    type: Array,
    required: true,
  }
});
</script>

<template>
  <section class="section-container overview-section">
    <div class="overview-header">
      <div class="title-area">
        <h3>Management Overview</h3>
        <p>Key performance metrics and visitor engagement summary.</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Total Registrations</span>
        <div class="stat-main">
          <strong class="stat-value">{{ analytics.totalVisitors || visitorLogs.length }}</strong>
          <span class="stat-unit">Entries</span>
        </div>
        <div class="stat-trend positive">Total visitor engagement</div>
      </div>
      
      <div class="stat-card">
        <span class="stat-label">Resources Distributed</span>
        <div class="stat-main">
          <strong class="stat-value">{{ analytics.totalDownloads }}</strong>
          <span class="stat-unit">Downloads</span>
        </div>
        <div class="stat-trend">Knowledge outreach</div>
      </div>

      <div class="stat-card">
        <span class="stat-label">Popular Module</span>
        <div class="stat-main">
          <strong class="stat-value mini">{{ analytics.popularModule }}</strong>
        </div>
        <div class="stat-trend">Top interaction point</div>
      </div>
    </div>

    <div class="welcome-banner booth-banner">
      <div class="banner-content">
        <div class="banner-text">
          <h3>Digital Agri-Booth Systems</h3>
          <p>Welcome to the administrative portal. All interactive modules, including the Bebu Trivia Game and IEC Materials catalog, are currently live and synchronized with the 3D environment.</p>
        </div>
        <div class="banner-decoration">
          <img src="/ITCPH_icon.png" alt="Booth Icon" class="decoration-img" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-container { padding: 2.5rem; }
.overview-header { margin-bottom: 2rem; }
.title-area h3 { font-size: 1.75rem; font-weight: 800; color: var(--primary); margin-bottom: 0.25rem; }
.title-area p { color: var(--text-soft); font-size: 1rem; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--white);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.stat-label {
  display: block;
  color: var(--text-soft);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--primary);
}

.stat-value.mini {
  font-size: 1.25rem;
  color: var(--secondary);
}

.stat-main {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.stat-unit {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-soft);
  text-transform: uppercase;
}

.stat-trend {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-soft);
}

.welcome-banner {
  background: linear-gradient(135deg, var(--primary), #0d4a82);
  color: white;
  padding: 2rem;
  border-radius: 16px;
}

.booth-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.banner-text h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
.banner-text p { opacity: 0.9; max-width: 600px; line-height: 1.6; }

.decoration-img {
  width: 120px;
  height: 120px;
  opacity: 0.2;
  filter: brightness(0) invert(1);
}
</style>
