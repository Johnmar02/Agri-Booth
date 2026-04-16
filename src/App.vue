<script setup>
import ThreeCanvas from '@/components/ThreeCanvas.vue';
import RegistrationPortal from '@/components/RegistrationPortal.vue';
import HotspotPanel from '@/components/HotspotPanel.vue';

/**
 * VIEW: App.vue
 * Main orchestrator for the ITCPH Digital Agri-Booth.
 * Mounts the 3D scene and the UI overlays.
 */
</script>

<template>
  <div id="agri-booth-app">
    <!-- 3D Layer -->
    <ThreeCanvas />

    <!-- UI Overlay Layer -->
    <div id="overlay-ui">
      <RegistrationPortal />
      <HotspotPanel />
    </div>

    <!-- Branding Watermark -->
    <div class="booth-watermark">
      <img src="/favicon.svg" alt="ITCPH Logo" class="mini-logo" />
      <div class="text">
        <h1>ITCPH Digital Agri-Booth</h1>
        <p>IOP Smart Agriculture Hub</p>
      </div>
    </div>
  </div>
</template>

<style>
@import './style.css';

#agri-booth-app {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

#overlay-ui {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

#overlay-ui > * {
  pointer-events: auto;
}

.booth-watermark {
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  padding: 12px 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

.mini-logo {
  width: 40px;
  height: 40px;
}

.booth-watermark h1 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #1a6ab4;
}

.booth-watermark p {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  color: #d17c24;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
