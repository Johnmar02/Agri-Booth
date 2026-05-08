<script setup>
/**
 * COMPONENT: VirtualTourModule
 * Extracted from ModuleDrawerView to isolate the 360 Virtual Tour UI and logic.
 */
const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
});

const handleLaunchTour = () => {
  // Tour URL is hardcoded as per original logic, but could be dynamic if module.tourUrl exists
  const tourUrl = props.module.tourUrl || 'https://s3.ap-southeast-1.amazonaws.com/tours.exsight360.com/itcph/v5/tour.html';
  window.open(tourUrl, '_blank');
};
</script>

<template>
  <section class="body-section tour-integration">
    <div class="tour-launch-hero">
      <div class="launch-card">
        <div class="launch-icon">🌐</div>
        <h2 class="launch-title">ITCPH High-Resolution 360 Tour</h2>
        <p class="launch-desc">
          Ready to step inside our world-class facilities? Launch the interactive 360 walkthrough in a dedicated explorer window for the most immersive experience.
        </p>
        <button 
          class="prime-action-btn launch-btn-v2"
          @click="handleLaunchTour"
        >
          Enter Virtual Tour ➔
        </button>
        <p class="launch-note">Note: This will open the tour in a new browser tab for full performance.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.body-section { margin-bottom: 3rem; }
.prime-action-btn { background: #1a6ab4; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; }
.prime-action-btn:hover { background: #124d85; }

/* Virtual Tour specialized styles */
.tour-integration {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
.tour-launch-hero {
  max-width: 600px;
  width: 100%;
}
.launch-card {
  background: #f8fafc;
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 50px rgba(0,0,0,0.05);
}
.launch-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}
.launch-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a6ab4;
  margin-bottom: 1rem;
}
.launch-desc {
  font-size: 1.1rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 2rem;
}
.launch-btn-v2 {
  font-size: 1.1rem;
  padding: 1rem 2.5rem;
}
.launch-note {
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: #94a3b8;
}
</style>
