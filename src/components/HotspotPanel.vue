<script setup>
/**
 * VIEW: HotspotPanel
 * DUMB UI Component that displays informational content for the active hotspot.
 * Consumes props from the coordinating controller.
 */
defineProps({
  activeModule: {
    type: Object,
    default: null
  },
  trackedIds: {
    type: Array,
    required: true
  }
});

defineEmits(['close', 'track-resource']);

const downloadResource = (res, emitFn) => {
  emitFn('track-resource', res.id);
  
  const content = `[ITCPH Digital Agri-Booth Asset]\n\nTitle: ${res.title}\nFormat: ${res.format}\nDescription: ${res.description}\n\n*NOTE: This is a system-generated file demonstrating the real browser download workflow.*`;
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `ITCPH_${res.title.replace(/[\s\W]+/g, '_')}.txt`;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <Transition name="slide-fade">
    <div v-if="activeModule" class="hotspot-panel">
      <div class="panel-header">
        <div class="header-text">
          <span class="badge">{{ activeModule.badge }}</span>
          <h2>{{ activeModule.title }}</h2>
        </div>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="panel-content">
        <p class="description">{{ activeModule.description }}</p>
        
        <div v-if="activeModule.quickStats && activeModule.quickStats.length" class="metrics-grid">
          <div v-for="metric in activeModule.quickStats" :key="metric.label" class="metric-card">
            <span class="label">{{ metric.label }}</span>
            <span class="value">{{ metric.value }}</span>
          </div>
        </div>

        <section v-if="activeModule.resources && activeModule.resources.length" class="resource-section">
          <h3>Downloads & Materials</h3>
          <ul class="download-list">
            <li v-for="res in activeModule.resources" :key="res.id" class="download-item">
              <div class="resource-info">
                <strong>{{ res.title }}</strong>
                <p>{{ res.description }}</p>
              </div>
              <button 
                class="dl-btn" 
                :disabled="trackedIds.includes(res.id)"
                @click="downloadResource(res, $emit)"
              >
                {{ trackedIds.includes(res.id) ? 'Collected' : 'Download' }}
              </button>
            </li>
          </ul>
        </section>

        <section v-if="activeModule.stories && activeModule.stories.length" class="drawer-section">
          <h3>Impact Stories</h3>
          <div v-for="story in activeModule.stories" :key="story" class="story-item">
            <p>{{ story }}</p>
          </div>
        </section>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.hotspot-panel {
  position: fixed;
  top: 50%;
  right: 40px;
  transform: translateY(-50%);
  width: 420px;
  max-width: 90vw;
  max-height: 80vh;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow: hidden;
}

.panel-header {
  padding: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h2 {
  margin: 0;
  color: #1a6ab4;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.panel-content {
  padding: 24px;
  overflow-y: auto;
}

.description {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #444;
}

.styled-list {
  padding-left: 20px;
}

.styled-list li {
  margin-bottom: 10px;
  font-weight: 500;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 10px;
}

.metric-card {
  background: rgba(26, 106, 180, 0.05);
  padding: 15px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.metric-card .label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #1a6ab4;
  font-weight: 700;
}

.metric-card .value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.download-list {
  list-style: none;
  padding: 0;
  margin-top: 15px;
}

.download-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.dl-btn {
  padding: 6px 12px;
  background: #d17c24;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.story-item {
  background: #fff;
  border-left: 4px solid #1a6ab4;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 4px;
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translate(20px, -50%);
  opacity: 0;
}
</style>
