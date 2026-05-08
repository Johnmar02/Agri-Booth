<script setup>
/**
 * COMPONENT: IecMaterialsModule
 * Extracted from ModuleDrawerView to isolate the IEC Materials (iec-materials) UI.
 */
const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
  apiBaseUrl: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <section class="iec-materials-portal">
    <div
      v-for="mat in module.materials"
      :key="mat.id"
      class="iec-card"
    >
      <div class="iec-cover-wrap">
        <img
          :src="mat.thumbnailUrl || mat.image"
          :alt="mat.title"
          class="iec-cover-img"
          @error="$event.target.style.display='none'"
        />
      </div>
      <div class="iec-info">
        <h2 class="iec-title">{{ mat.title }}</h2>
        <p v-if="mat.subtitle" class="iec-subtitle">{{ mat.subtitle }}</p>
        <p class="iec-desc">{{ mat.description }}</p>
        <a
          :href="mat.id ? `${apiBaseUrl}/IECMaterials/${mat.id}/download` : mat.pdfUrl"
          target="_blank"
          download
          class="iec-download-btn"
        >
          📥 Download booklet
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* IEC Materials Portal */
.iec-materials-portal {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}
.iec-card {
  background: #f8fafc;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}
.iec-cover-wrap {
  height: 240px;
  background: #e2e8f0;
}
.iec-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.iec-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.iec-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1a6ab4;
  margin-bottom: 0.5rem;
}
.iec-subtitle {
  font-size: 0.9rem;
  font-weight: 700;
  color: #d17c24;
  margin-bottom: 1rem;
}
.iec-desc {
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  flex: 1;
}
.iec-download-btn {
  background: #1a6ab4;
  color: white;
  text-decoration: none;
  padding: 0.75rem;
  border-radius: 12px;
  text-align: center;
  font-weight: 700;
}
</style>
