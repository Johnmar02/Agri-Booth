<script setup>
import { onMounted, ref } from 'vue';
import { useLmsStore } from '@/stores/lms';
import { useVisitorStore } from '@/stores/visitor';
import { useUiStore } from '@/stores/uiStore';
import LmsPortal from '@/components/LmsPortal.vue';

/**
 * COMPONENT: LmsModule
 * Displays the catalog for Courses & E-Learning Materials.
 * Simplified for 1-click enrollment and tracking.
 */
const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
});

const lmsStore = useLmsStore();
const visitorStore = useVisitorStore();
const uiStore = useUiStore();

const activeCourseId = ref(null);
const isInitializing = ref(true);

const getCourseColor = (id) => {
  const colors = [
    '#1a6ab4', // ITCPH Blue
    '#d17c24', // ITCPH Orange
    '#059669', // Emerald
    '#0369a1', // Sky
    '#7c3aed', // Violet
    '#b91c1c', // Red
    '#4d7c0f', // Lime
  ];
  const numId = typeof id === 'number' ? id : (id?.length || 0);
  return colors[numId % colors.length];
};

const handleEnroll = async (courseId) => {
  if (!visitorStore.visitorId) {
    uiStore.showAlert('Registration Required', 'Please register or sign in to enroll in courses.');
    return;
  }
  try {
    await lmsStore.enroll(visitorStore.visitorId, courseId);
    activeCourseId.value = courseId;
    uiStore.showToast('Successfully enrolled in the course!');
  } catch (err) {
    uiStore.showAlert('Enrollment Failed', err.message);
  }
};

const openCourse = (courseId) => {
  activeCourseId.value = courseId;
};

onMounted(async () => {
  isInitializing.value = true;
  try {
    // Add a small timeout safety to prevent infinite spinner if initialization hangs
    const initPromise = lmsStore.initialize(visitorStore.visitorId);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Sync timeout')), 10000)
    );
    
    await Promise.race([initPromise, timeoutPromise]);
  } catch (err) {
    console.error('LMS Sync failed:', err);
  } finally {
    isInitializing.value = false;
  }
});
</script>

<template>
  <div class="lms-module-v2">
    <div v-if="isInitializing" class="lms-loading">
      <div class="loader-spinner"></div>
      <p>Syncing your learning path...</p>
    </div>

    <div v-else-if="activeCourseId" class="lms-portal-wrapper">
      <div class="portal-nav">
        <button class="back-btn" @click="activeCourseId = null">Back</button>
      </div>
      <LmsPortal :course-id="activeCourseId" />
    </div>

    <div v-else class="lms-catalog-v2">
      <header class="catalog-header-v2">
        <div class="header-text">
          <h2>{{ module.title }}</h2>
          <p>{{ module.summary }}</p>
        </div>
        <div class="catalog-stats">
          <div class="stat-item">
            <strong>{{ lmsStore.courses.length }}</strong>
            <span>Available Courses</span>
          </div>
        </div>
      </header>

      <div v-if="!lmsStore.courses.length" class="empty-catalog">
        <p>No courses available at the moment. Please check back later.</p>
      </div>

      <div v-else class="learning-grid-v2 centered">
        <div v-for="course in lmsStore.courses" :key="course.id" class="course-card-v2">
          <div class="course-header-v2" :style="{ backgroundColor: getCourseColor(course.id) }">
            <div class="course-placeholder">📚</div>
            <div class="course-badge">{{ course.level || 'Beginner' }}</div>
          </div>
          <div class="course-body-v2">
            <div class="course-info">
              <h3>{{ course.title }}</h3>
              <p>{{ course.description }}</p>
            </div>
            
            <div class="course-meta">
              <span class="meta-item">⏱ {{ course.durationMinutes }} Minutes</span>
              <span class="meta-item">📚 {{ course.totalModules }} Modules</span>
            </div>

            <div class="course-footer">
              <button 
                v-if="lmsStore.isEnrolled(course.id)" 
                class="course-action-v2 resume"
                @click="openCourse(course.id)"
              >
                Resume Learning
              </button>
              <button 
                v-else 
                class="course-action-v2"
                @click="handleEnroll(course.id)"
              >
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lms-module-v2 {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.lms-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  color: #64748b;
  font-size: 1.2rem;
}

.lms-catalog-v2 {
  animation: fade-in 0.4s ease;
  padding: 3rem;
  flex: 1;
  overflow-y: auto;
  width: 100%;
}

.catalog-header-v2 {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-text h2 {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 800;
  color: #1a6ab4;
}

.header-text p {
  margin: 0.75rem 0 0;
  color: #64748b;
  font-size: 1.2rem;
  max-width: 800px;
}

.catalog-stats {
  display: flex;
  gap: 3rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-item strong {
  font-size: 2.2rem;
  color: #1a6ab4;
}

.stat-item span {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
  font-weight: 700;
}

.learning-grid-v2 {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 2.5rem;
  width: 100%;
}

.learning-grid-v2.centered {
    justify-content: center;
}

.course-card-v2 {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.course-card-v2:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px rgba(26, 106, 180, 0.15);
  border-color: #1a6ab4;
}

.course-header-v2 {
  height: 200px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #1a6ab4;
  position: relative;
  overflow: hidden;
}

.course-placeholder { 
  font-size: 4.5rem; 
  opacity: 0.4;
  color: white;
}

.course-badge {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #1a6ab4;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.course-body-v2 {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-info h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #1e293b;
  line-height: 1.3;
  font-weight: 800;
}

.course-info p {
  margin: 1rem 0;
  font-size: 1rem;
  color: #64748b;
  line-height: 1.6;
}

.course-meta {
  display: flex;
  gap: 1.5rem;
  margin-top: auto;
  padding: 1.25rem 0;
  border-top: 1px dashed #e2e8f0;
}

.meta-item {
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 700;
}

.course-footer {
  padding-top: 1rem;
}

.course-action-v2 {
  width: 100%;
  padding: 1rem;
  border-radius: 16px;
  border: none;
  background: #1a6ab4;
  color: white;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.course-action-v2:hover {
  background: #124d85;
  transform: translateY(-2px);
}

.course-action-v2.resume {
  background: white;
  color: #1a6ab4;
  border: 2px solid #1a6ab4;
}

.course-action-v2.resume:hover {
    background: #f0f7ff;
}

.lms-portal-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.portal-nav {
  padding: 1.5rem 3rem;
  background: white;
  border-bottom: 1px solid #f1f5f9;
}

.back-btn {
  background: none;
  border: none;
  color: #1a6ab4;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
}

.back-btn:hover {
    text-decoration: underline;
}

@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

.loader-spinner {
  width: 56px;
  height: 56px;
  border: 5px solid #f1f5f9;
  border-top: 5px solid #1a6ab4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
