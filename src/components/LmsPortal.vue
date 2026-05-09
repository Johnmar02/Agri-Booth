<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useLmsStore } from '@/stores/lms';
import { useVisitorStore } from '@/stores/visitor';
import { useUiStore } from '@/stores/uiStore';

const props = defineProps({
  courseId: {
    type: [Number, String],
    required: true
  }
});

const lmsStore = useLmsStore();
const visitorStore = useVisitorStore();
const uiStore = useUiStore();

const activeLessonId = ref(null);
const loading = ref(false);

const enrollment = computed(() => lmsStore.getEnrollmentByCourseId(props.courseId));
const course = computed(() => lmsStore.activeCourse);

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

const isLessonCompleted = (lessonId) => {
  if (!lmsStore.activeEnrollment?.modules) return false;
  return lmsStore.activeEnrollment.modules.some(m => 
    m.lessons.some(l => l.lessonId === lessonId && l.isCompleted)
  );
};

const selectLesson = async (lessonId) => {
  activeLessonId.value = lessonId;
  await lmsStore.loadLesson(lessonId);
};

const openLink = async (url) => {
  if (!enrollment.value || !activeLessonId.value) return;
  
  // Mark as completed in backend
  await lmsStore.completeLesson(enrollment.value.id, activeLessonId.value, visitorStore.visitorId);
  
  // Refresh local state
  await lmsStore.loadProgress(enrollment.value.id);
  
  // Open in new tab
  window.open(url, '_blank');
  uiStore.showToast('Redirecting to external resource...');
};

onMounted(async () => {
  loading.value = true;
  try {
    await lmsStore.loadCourse(props.courseId);
    if (enrollment.value) {
      await lmsStore.loadProgress(enrollment.value.id);
    }
  } catch (err) {
    uiStore.showAlert('Error', 'Failed to load course details.');
  } finally {
    loading.value = false;
  }
});

watch(() => props.courseId, async (newId) => {
  loading.value = true;
  activeLessonId.value = null;
  try {
    await lmsStore.loadCourse(newId);
    if (enrollment.value) {
      await lmsStore.loadProgress(enrollment.value.id);
    }
  } catch (err) {
    uiStore.showAlert('Error', 'Failed to load course content.');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="lms-portal" :class="{ 'sidebar-hidden': !course }">
    <div v-if="loading" class="portal-loading">
      <div class="loader-spinner"></div>
      <p>Loading course content...</p>
    </div>

    <template v-else>
      <aside class="lms-sidebar">
        <div class="sidebar-header">
          <h3>Course Content</h3>
        </div>
        
        <div class="sidebar-scroll">
          <div v-for="mod in course?.modules" :key="mod.id" class="lms-module-group">
            <h4 class="module-title">{{ mod.title }}</h4>
            <nav class="lesson-nav">
              <button 
                v-for="lesson in mod.lessons" 
                :key="lesson.id"
                class="nav-item lesson"
                :class="{ active: activeLessonId === lesson.id, completed: isLessonCompleted(lesson.id) }"
                @click="selectLesson(lesson.id)"
              >
                <div class="status-indicator">
                  <span v-if="isLessonCompleted(lesson.id)" class="icon-check">✓</span>
                  <span v-else class="icon-dot">○</span>
                </div>
                <span class="title-text">{{ lesson.title }}</span>
              </button>
            </nav>
          </div>
        </div>
      </aside>

      <main class="lms-viewer">
        <div class="viewer-scroll-area">
          <div class="viewer-content-container">
            <!-- Welcome Screen -->
            <div v-if="!activeLessonId" class="welcome-stage">
              <div class="hero-banner" :style="{ backgroundColor: getCourseColor(course?.id) }">
                <div class="hero-content">
                  <h1>{{ course?.title }}</h1>
                  <p>{{ course?.description }}</p>
                </div>
              </div>
              
              <div class="intro-card">
                <h3>Training & Application Portal</h3>
                <p>Explore the specialized courses and materials offered by ITCPH. Select a module from the menu to access application forms and official documentation.</p>
                
                <div class="progress-tracker" v-if="enrollment">
                  <div class="tracker-header">
                    <span>Your Progress</span>
                    <strong>{{ enrollment.progressPercent }}%</strong>
                  </div>
                  <div class="progress-bar-large">
                    <div class="progress-fill" :style="{ width: enrollment.progressPercent + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Redirect Action Viewer -->
            <div v-if="activeLessonId && lmsStore.activeLesson" class="lesson-stage">
              <div class="lesson-breadcrumb">
                {{ course?.title }} / {{ course?.modules?.find(m => m.id === lmsStore.activeLesson.moduleId)?.title }}
              </div>
              
              <header class="lesson-header">
                <h2>{{ lmsStore.activeLesson.title }}</h2>
                <div class="lesson-meta">
                  <span v-if="isLessonCompleted(activeLessonId)" class="meta-tag done">✓ Access Tracked</span>
                  <span class="meta-tag duration">Direct Redirection</span>
                </div>
              </header>

              <div class="action-card">
                <div class="action-header">
                  <div class="action-icon">🔗</div>
                  <div class="action-info">
                    <h4>External Resource</h4>
                    <p>Clicking the button below will redirect you to the official ITCPH external site for this material.</p>
                  </div>
                </div>

                <div class="action-body">
                   <div class="material-description" v-html="lmsStore.activeLesson.body"></div>
                </div>

                <div class="action-footer">
                  <button 
                    class="btn-redirect-now"
                    @click="openLink(lmsStore.activeLesson.contentUrl)"
                  >
                    Apply Now
                  </button>
                </div>
              </div>

              <div class="redirect-hint">
                <p><strong>Note:</strong> We redirect you to avoid technical lag and ensure you are viewing the most up-to-date version of the material on our main website.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>

<style scoped>
.lms-portal {
  display: grid;
  grid-template-columns: 320px 1fr;
  height: 100%;
  width: 100%;
  background: #f8fafc;
  overflow: hidden;
}

.portal-loading {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  color: #64748b;
  height: 100%;
}

/* Sidebar */
.lms-sidebar {
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.sidebar-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.lms-module-group {
  margin-bottom: 2.5rem;
}

.module-title {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  margin-bottom: 1rem;
  padding-left: 0.5rem;
  font-weight: 700;
}

.lesson-nav {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
  font-weight: 600;
  width: 100%;
}

.nav-item:hover {
  background: #f1f5f9;
  color: #1a6ab4;
}

.nav-item.active {
  background: #f0f7ff;
  color: #1a6ab4;
  font-weight: 800;
}

.status-indicator {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.icon-check { color: #10b981; }
.icon-dot { color: #cbd5e1; }

.title-text {
  font-size: 1rem;
  line-height: 1.4;
}

/* Viewer */
.lms-viewer {
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.viewer-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 3rem;
}

.viewer-content-container {
  max-width: 900px;
  margin: 0 auto;
}

/* Welcome Stage */
.hero-banner {
  height: 280px;
  background: #1a6ab4;
  border-radius: 28px;
  position: relative;
  overflow: hidden;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: flex-end;
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 3rem;
  color: white;
}

.hero-content h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 900;
  line-height: 1.1;
}

.hero-content p {
  margin: 1rem 0 0;
  opacity: 0.95;
  font-size: 1.1rem;
  max-width: 600px;
  line-height: 1.6;
}

.intro-card {
  background: white;
  padding: 2.5rem;
  border-radius: 28px;
  border: 1px solid #e2e8f0;
}

.intro-card h3 {
  margin: 0 0 1.25rem;
  color: #1e293b;
  font-size: 1.5rem;
}

.intro-card p {
  color: #64748b;
  line-height: 1.8;
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
}

.progress-tracker {
  background: #f1f5f9;
  padding: 1.75rem;
  border-radius: 20px;
}

.tracker-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #1e293b;
  font-weight: 700;
}

.progress-bar-large {
  height: 16px;
  background: #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Lesson Stage */
.lesson-stage {
  animation: fade-in 0.4s ease;
}

.lesson-breadcrumb {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
  margin-bottom: 1.5rem;
  font-weight: 700;
}

.lesson-header {
  margin-bottom: 3rem;
}

.lesson-header h2 {
  margin: 0 0 1rem;
  font-size: 2.5rem;
  color: #1e293b;
  font-weight: 900;
}

.lesson-meta {
  display: flex;
  gap: 1rem;
}

.meta-tag {
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
}

.meta-tag.done { background: #d1fae5; color: #065f46; }
.meta-tag.duration { background: #f1f5f9; color: #64748b; }

.action-card {
  background: white;
  border-radius: 28px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.action-header {
  padding: 2rem 2.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 2rem;
  align-items: center;
}

.action-icon {
  font-size: 2.5rem;
  width: 72px;
  height: 72px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
}

.action-info h4 { margin: 0; color: #1e293b; font-size: 1.25rem; }
.action-info p { margin: 0.5rem 0 0; font-size: 1rem; color: #64748b; }

.action-body {
  padding: 3rem;
}

.material-description {
  color: #475569;
  line-height: 1.8;
  font-size: 1.15rem;
}

.action-footer {
  padding: 2rem 2.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: center;
}

.btn-redirect-now {
  padding: 1.25rem 4rem;
  background: #1a6ab4;
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 800;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 15px 30px rgba(26, 106, 180, 0.25);
}

.btn-redirect-now:hover {
  background: #124d85;
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(26, 106, 180, 0.35);
}

.redirect-hint {
  margin-top: 3rem;
  padding: 1.5rem;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 20px;
  color: #92400e;
  font-size: 1rem;
  text-align: center;
  line-height: 1.6;
}

.loader-spinner { width: 48px; height: 48px; border: 4px solid #f1f5f9; border-top: 4px solid #1a6ab4; border-radius: 50%; animation: spin 1s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 800px) {
  .lms-sidebar { position: fixed; left: 0; top: 0; z-index: 150; height: 100%; width: 300px; transform: translateX(0); transition: transform 0.3s ease; }
  .lms-portal.sidebar-hidden .lms-sidebar { transform: translateX(-100%); }
}
</style>
