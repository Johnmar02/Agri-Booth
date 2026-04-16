<script setup>
import { computed } from 'vue';
import { useBoothStore } from '@/stores/booth';
import { useBooth } from '@/composables/useBooth';

/**
 * VIEW: HotspotPanel
 * DUMB UI Component that displays informational content for the active hotspot.
 * Style: Glassmorphism / Modern ITCPH Branding.
 */

const boothStore = useBoothStore();
const boothController = useBooth();

const hotspot = computed(() => boothStore.activeHotspot);
const isVisible = computed(() => !!hotspot.value && hotspot.value.id !== 'dot_table');

const close = () => {
  boothController.closeOverlay();
};
</script>

<template>
  <Transition name="slide-fade">
    <div v-if="isVisible" class="hotspot-panel">
      <div class="panel-header">
        <h2>{{ hotspot.title }}</h2>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      
      <div class="panel-content">
        <p class="description">{{ hotspot.content.description }}</p>
        
        <ul v-if="hotspot.content.points" class="styled-list">
          <li v-for="point in hotspot.content.points" :key="point">{{ point }}</li>
        </ul>
        
        <div v-if="hotspot.content.metrics" class="metrics-grid">
          <div v-for="metric in hotspot.content.metrics" :key="metric.label" class="metric-card">
            <span class="label">{{ metric.label }}</span>
            <span class="value">{{ metric.value }}</span>
          </div>
        </div>

        <ul v-if="hotspot.content.items" class="download-list">
          <li v-for="item in hotspot.content.items" :key="item" class="download-item">
            <span>{{ item }}</span>
            <button class="dl-btn">Download</button>
          </li>
        </ul>

        <div v-if="hotspot.content.stories" class="stories-container">
          <div v-for="story in hotspot.content.stories" :key="story" class="story-item">
            <h4>Outcome Success</h4>
            <p>{{ story }}</p>
          </div>
        </div>
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
