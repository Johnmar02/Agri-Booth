<script setup>
import { ref } from 'vue';
import { useLmsStore } from '@/stores/lms';
import { useVisitorStore } from '@/stores/visitor';
import LmsPortal from '@/components/LmsPortal.vue';

/**
 * COMPONENT: LmsModule
 * Extracted from ModuleDrawerView to isolate the E-Learning (LMS) logic and UI.
 */
const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
});

const lmsStore = useLmsStore();
const visitorStore = useVisitorStore();

const selectedCourseId = ref(null);

const handleEnroll = async (courseId) => {
  if (!visitorStore.visitorId) return;
  try {
    await lmsStore.enroll(visitorStore.visitorId, courseId);
  } catch (err) {
    alert(err.message);
  }
};

const openCourse = async (courseId) => {
  selectedCourseId.value = courseId;
  await lmsStore.loadCourse(courseId);
};
</script>

<template>
  <section class="body-section interactive-module">
    <div v-if="!selectedCourseId">
      <h2 class="section-label">LMS Course Catalog</h2>
      <div class="learning-grid-v2">
        <div v-for="course in lmsStore.courses" :key="course.id" class="course-card-v2">
          <div class="course-header-v2">▶</div>
          <div class="course-body-v2">
            <h4 class="course-title-v2">{{ course.title }}</h4>
            <p class="course-desc-v2">{{ course.description }}</p>
            <button 
              v-if="!lmsStore.isEnrolled(course.id)" 
              class="course-action-v2" 
              @click="handleEnroll(course.id)"
            >
              Enroll Now
            </button>
            <button 
              v-else 
              class="course-action-v2 resume" 
              @click="openCourse(course.id)"
            >
              Resume ➔
            </button>
          </div>
        </div>
      </div>
    </div>
    <LmsPortal v-else :courseId="selectedCourseId" />
  </section>
</template>

<style scoped>
.body-section { margin-bottom: 3rem; }
.section-label { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #1a6ab4; border-left: 4px solid #d17c24; padding-left: 12px; margin-bottom: 1.5rem; display: block; }

/* LMS / Learning specialized styles */
.learning-grid-v2 {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.course-card-v2 {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}
.course-card-v2:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}
.course-header-v2 {
  height: 120px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #1a6ab4;
}
.course-body-v2 {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.course-title-v2 {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1a6ab4;
  margin-bottom: 0.75rem;
}
.course-desc-v2 {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  flex: 1;
}
.course-action-v2 {
  background: #1a6ab4;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.course-action-v2:hover {
  background: #124d85;
}
.course-action-v2.resume {
  background: white;
  color: #1a6ab4;
  border: 1px solid #1a6ab4;
}
.course-action-v2.resume:hover {
  background: #f8fafc;
}
</style>
