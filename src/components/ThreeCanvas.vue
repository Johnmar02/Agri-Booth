<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import { SceneView } from "@/views/SceneView";
import { getHotspotLayout } from "@/models/boothModel";

/**
 * VIEW: ThreeCanvas
 * Renders the 3D environment of the ITCPH Digital Agri-Booth.
 * This is now a thin wrapper around the SceneView class.
 */

const emit = defineEmits(["hotspot-click", "background-click"]);

const hotspotCatalog = getHotspotLayout();
const hotspotLabels = Object.fromEntries(
  hotspotCatalog.map((h) => [h.id, h.label])
);

const canvasContainer = ref(null);
const hoveredLabel = ref("");
const tooltipPos = ref({ x: 0, y: 0 });
const loadingProgress = ref(0);
const isLoaded = ref(false);
const webglSupported = ref(true);

let sceneView = null;

const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
};

const handleHoverChange = (data) => {
  if (data) {
    hoveredLabel.value = hotspotLabels[data.id] || "";
    tooltipPos.value = { x: data.clientX + 20, y: data.clientY + 20 };
  } else {
    hoveredLabel.value = "";
  }
};

const handleProgress = (progress) => {
  loadingProgress.value = progress;
  if (progress >= 100) {
    // Artificial delay for smooth transition
    setTimeout(() => {
      isLoaded.value = true;
    }, 500);
  }
};

onMounted(() => {
  if (!checkWebGLSupport()) {
    webglSupported.value = false;
    isLoaded.value = true;
    return;
  }

  sceneView = new SceneView(canvasContainer.value, {
    onHotspotClick: (data) => emit("hotspot-click", data),
    onBackgroundClick: () => emit("background-click"),
    onHoverChange: handleHoverChange,
    onProgress: handleProgress
  });
});

onUnmounted(() => {
  sceneView?.dispose();
});

defineExpose({
  focusOnTarget: (object) => sceneView?.focusOnTarget(object)
});
</script>

<template>
  <div ref="canvasContainer" class="canvas-container">
    <Transition name="fade">
      <div v-if="!isLoaded" class="loading-overlay">
        <div class="loading-card">
          <img src="/ITCPH_icon.png" alt="Loading" class="loading-logo" />
          <div class="loading-text">
            <h3>Preparing Booth...</h3>
            <p>Gathering resources for your visit</p>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: loadingProgress + '%' }"></div>
          </div>
          <span class="progress-number">{{ loadingProgress }}%</span>
        </div>
      </div>
    </Transition>

    <div v-if="!webglSupported" class="webgl-fallback">
      <div class="fallback-card">
        <div class="fallback-icon">⚠️</div>
        <h3>3D Booth Unavailable</h3>
        <p>Your device or browser doesn't support WebGL, which is required for the 3D experience.</p>
        <p class="suggestion">You can still explore using the 2D Hotspot Map below.</p>
      </div>
    </div>

    <Transition name="tooltip-fade">
      <div
        v-if="hoveredLabel"
        class="hotspot-tooltip"
        :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }"
      >
        <div class="tooltip-icon">✦</div>
        <span>{{ hoveredLabel }}</span>
      </div>
    </Transition>
  </div>
</template>


<style scoped>
.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #d0d0d6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem;
  background: white;
  border-radius: 32px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12);
  width: min(400px, 90vw);
}

.loading-logo {
  width: 5rem;
  height: 5rem;
  object-fit: contain;
  animation: pulse-soft 2s infinite ease-in-out;
}

.loading-text {
  text-align: center;
}

.loading-text h3 {
  margin: 0;
  color: #1a6ab4;
  font-size: 1.5rem;
  font-weight: 800;
}

.loading-text p {
  margin: 0.5rem 0 0;
  color: #64748b;
  font-size: 0.95rem;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 99px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #1a6ab4, #d17c24);
  transition: width 0.3s ease;
}

.progress-number {
  font-weight: 800;
  color: #1a6ab4;
  font-size: 1.1rem;
}

@keyframes pulse-soft {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.webgl-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d0d0d6;
  z-index: 5;
  padding: 1.5rem;
}

.fallback-card {
  background: white;
  padding: 2.5rem;
  border-radius: 28px;
  text-align: center;
  max-width: 440px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
}

.fallback-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.fallback-card h3 {
  margin: 0 0 1rem;
  color: #1a6ab4;
  font-size: 1.6rem;
}

.fallback-card p {
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 1rem;
}

.suggestion {
  font-weight: 700;
  color: #d17c24 !important;
}

.hotspot-tooltip {
  position: fixed;
  pointer-events: none;
  z-index: 200;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(26, 106, 180, 0.2);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  transform: translate(-5%, -5%);
}

.tooltip-icon {
  width: 20px;
  height: 20px;
  background: #1a6ab4;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

.hotspot-tooltip span {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a6ab4;
  white-space: nowrap;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translate(-5%, -5%);
}
</style>
