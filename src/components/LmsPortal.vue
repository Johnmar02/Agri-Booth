<script setup>
import { ref, computed, onMounted } from 'vue';
import { useLmsStore } from '@/stores/lms';
import { useVisitorStore } from '@/stores/visitor';

const props = defineProps({
  courseId: {
    type: [Number, String],
    required: true
  }
});

const lmsStore = useLmsStore();
const visitorStore = useVisitorStore();

const activeLessonId = ref(null);
const showQuiz = ref(false);
const quizResult = ref(null);
const selectedAnswers = ref({});

const enrollment = computed(() => lmsStore.getEnrollmentByCourseId(props.courseId));
const course = computed(() => lmsStore.activeCourse);

const activeLesson = computed(() => {
  if (!course.value) return null;
  for (const mod of course.value.modules) {
    const lesson = mod.lessons.find(l => l.id === activeLessonId.value);
    if (lesson) return lesson;
  }
  return null;
});

const isLessonCompleted = (lessonId) => {
  if (!lmsStore.activeEnrollment) return false;
  const mod = lmsStore.activeEnrollment.modules.find(m => 
    m.lessons.some(l => l.lessonId === lessonId && l.isCompleted)
  );
  return !!mod;
};

const selectLesson = async (lessonId) => {
  activeLessonId.value = lessonId;
  showQuiz.value = false;
  quizResult.value = null;
  await lmsStore.loadLesson(lessonId);
};

const openQuiz = async (moduleId) => {
  showQuiz.value = true;
  activeLessonId.value = null;
  quizResult.value = null;
  selectedAnswers.value = {};
  await lmsStore.loadQuiz(moduleId);
};

const handleCompleteLesson = async () => {
  if (!enrollment.value || !activeLessonId.value) return;
  await lmsStore.completeLesson(enrollment.value.id, activeLessonId.value, visitorStore.visitorId);
  await lmsStore.loadProgress(enrollment.value.id);
};

const submitQuiz = async () => {
  if (!lmsStore.activeQuiz || !enrollment.value) return;
  
  const answers = Object.entries(selectedAnswers.value).map(([qId, val]) => ({
    questionId: parseInt(qId),
    answerGiven: val
  }));

  const payload = {
    enrollmentId: enrollment.value.id,
    moduleId: lmsStore.activeQuiz[0].moduleId,
    answers
  };

  try {
    const result = await lmsStore.submitQuiz(payload, visitorStore.visitorId);
    quizResult.value = result;
    await lmsStore.loadProgress(enrollment.value.id);
  } catch (err) {
    alert(err.message);
  }
};

const downloadCertificate = async () => {
  if (!enrollment.value) return;
  const res = await lmsStore.fetchCertificate(enrollment.value.id);
  if (res.ok) {
    alert(`Certificate ITCPH-${res.data.certificateNumber} issued!`);
    // In a real app, this would open a PDF
  } else {
    alert('Certificate not found.');
  }
};

onMounted(async () => {
  if (enrollment.value) {
    await lmsStore.loadProgress(enrollment.value.id);
  }
});
</script>

<template>
  <div class="lms-portal">
    <aside class="lms-sidebar">
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
            <span class="status-icon">{{ isLessonCompleted(lesson.id) ? '✓' : '○' }}</span>
            <span class="title-text">{{ lesson.title }}</span>
            <span class="type-badge">{{ lesson.contentType }}</span>
          </button>
          
          <button 
            v-if="mod.hasQuiz"
            class="nav-item quiz"
            :class="{ active: showQuiz && lmsStore.activeQuiz?.[0]?.moduleId === mod.id }"
            @click="openQuiz(mod.id)"
          >
            <span class="status-icon">📝</span>
            <span class="title-text">Module Quiz</span>
          </button>
        </nav>
      </div>
      
      <div v-if="lmsStore.activeEnrollment?.isCompleted" class="certificate-unlock">
        <div class="cert-icon">🎓</div>
        <p>Course Completed!</p>
        <button class="cert-btn" @click="downloadCertificate">Download Certificate</button>
      </div>
    </aside>

    <main class="lms-viewer">
      <!-- Welcome Screen -->
      <div v-if="!activeLessonId && !showQuiz" class="welcome-stage">
        <div class="course-hero-mini">
          <img :src="course?.thumbnailPath" alt="" class="hero-thumb" @error="$event.target.style.display='none'" />
          <div class="hero-overlay">
            <h1>{{ course?.title }}</h1>
            <p>{{ course?.description }}</p>
          </div>
        </div>
        
        <div class="start-prompt">
          <h3>Ready to start your journey?</h3>
          <p>Select the first lesson from the sidebar to begin. Your progress is automatically saved.</p>
          <div class="progress-recap" v-if="enrollment">
            <div class="recap-bar"><div class="fill" :style="{ width: enrollment.progressPercent + '%' }"></div></div>
            <span>Current Progress: {{ enrollment.progressPercent }}%</span>
          </div>
        </div>
      </div>

      <!-- Lesson Viewer -->
      <div v-if="activeLessonId && lmsStore.activeLesson" class="lesson-stage">
        <header class="lesson-header">
          <h2>{{ lmsStore.activeLesson.title }}</h2>
          <span class="duration">Est. {{ lmsStore.activeLesson.durationMinutes }} minutes</span>
        </header>

        <div class="lesson-content">
          <div v-if="lmsStore.activeLesson.contentType === 'Video'" class="video-container">
            <!-- Mock Video Player -->
            <div class="mock-player">
              <div class="play-overlay">▶</div>
              <p>Educational Content: {{ lmsStore.activeLesson.contentUrl }}</p>
            </div>
          </div>

          <div class="lesson-body" v-html="lmsStore.activeLesson.body"></div>
        </div>

        <footer class="lesson-footer">
          <button 
            class="complete-btn" 
            :disabled="isLessonCompleted(activeLessonId)"
            @click="handleCompleteLesson"
          >
            {{ isLessonCompleted(activeLessonId) ? 'Lesson Completed ✓' : 'Mark as Complete' }}
          </button>
        </footer>
      </div>

      <!-- Quiz Stage -->
      <div v-if="showQuiz && lmsStore.activeQuiz" class="quiz-stage">
        <div v-if="!quizResult">
          <header class="quiz-header">
            <h2>Module Knowledge Check</h2>
            <p>Score at least 70% to pass this module.</p>
          </header>

          <div class="quiz-questions">
            <div v-for="(q, idx) in lmsStore.activeQuiz" :key="q.id" class="quiz-q-card">
              <p class="q-prompt"><strong>Q{{ idx + 1 }}:</strong> {{ q.question }}</p>
              <div class="q-options">
                <label v-for="opt in ['A', 'B', 'C', 'D']" :key="opt" class="opt-label">
                  <input type="radio" :name="'q-'+q.id" :value="opt" v-model="selectedAnswers[q.id]" />
                  <span>{{ q['option'+opt] }}</span>
                </label>
              </div>
            </div>
          </div>

          <button class="submit-quiz-btn" @click="submitQuiz" :disabled="lmsStore.loading">
            Submit Quiz Results
          </button>
        </div>

        <div v-else class="quiz-result-screen">
          <div class="result-icon" :class="{ pass: quizResult.isPassed }">
            {{ quizResult.isPassed ? '🏆' : '⚠️' }}
          </div>
          <h3>{{ quizResult.message }}</h3>
          <div class="score-display">
            <span class="val">{{ quizResult.score }} / {{ quizResult.totalPoints }}</span>
            <span class="lab">Points Earned</span>
          </div>
          
          <button v-if="!quizResult.isPassed" class="retry-btn" @click="quizResult = null; selectedAnswers = {}">
            Try Again
          </button>
          <button v-else class="continue-btn" @click="showQuiz = false">
            Return to Lessons
          </button>
        </div>
      </div>
      
      <div v-if="lmsStore.loading" class="viewer-loader">
        <div class="spinner"></div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.lms-portal {
  display: grid;
  grid-template-columns: 320px 1fr;
  height: 70vh;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.lms-sidebar {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.module-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin-bottom: 1rem;
  font-weight: 800;
}

.lesson-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover { border-color: #1a6ab4; background: #f0f7ff; }
.nav-item.active { border-color: #1a6ab4; background: #1a6ab4; color: white; }
.nav-item.completed .status-icon { color: #10b981; font-weight: 900; }
.nav-item.active .status-icon { color: white; }

.status-icon { font-size: 0.9rem; color: #cbd5e1; }
.title-text { font-size: 0.9rem; font-weight: 600; flex: 1; }
.type-badge { font-size: 0.65rem; padding: 2px 6px; background: #f1f5f9; border-radius: 4px; color: #64748b; }
.nav-item.active .type-badge { background: rgba(255,255,255,0.2); color: white; }

.lms-viewer {
  padding: 3rem;
  overflow-y: auto;
  position: relative;
}

.welcome-stage { text-align: center; }
.course-hero-mini {
  height: 200px;
  background: #1e293b;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  margin-bottom: 3rem;
}
.hero-thumb { width: 100%; height: 100%; object-fit: cover; opacity: 0.4; }
.hero-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 2rem; color: white; }
.hero-overlay h1 { font-size: 2rem; margin-bottom: 0.5rem; }

.progress-recap { margin-top: 2rem; max-width: 400px; margin-left: auto; margin-right: auto; }
.recap-bar { height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; margin-bottom: 0.5rem; }
.recap-bar .fill { height: 100%; background: #10b981; }

.lesson-header { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; }
.lesson-header h2 { font-size: 1.8rem; color: #1e293b; }
.duration { font-size: 0.9rem; color: #94a3b8; font-weight: 600; }

.video-container { width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 16px; margin-bottom: 2rem; overflow: hidden; }
.mock-player { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; gap: 1rem; }
.play-overlay { font-size: 3rem; opacity: 0.8; cursor: pointer; }

.lesson-body { font-size: 1.1rem; line-height: 1.8; color: #334155; }

.lesson-footer { margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; }
.complete-btn { padding: 1rem 2rem; background: #10b981; color: white; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; }
.complete-btn:disabled { opacity: 0.7; cursor: default; background: #f1f5f9; color: #10b981; }

.quiz-q-card { background: #f8fafc; padding: 1.5rem; border-radius: 16px; margin-bottom: 1.5rem; border: 1px solid #e2e8f0; }
.q-prompt { font-size: 1.1rem; margin-bottom: 1rem; }
.q-options { display: grid; gap: 0.75rem; }
.opt-label { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; }
.opt-label:hover { border-color: #1a6ab4; }

.submit-quiz-btn { width: 100%; padding: 1.25rem; background: #1a6ab4; color: white; border: none; border-radius: 14px; font-weight: 800; margin-top: 2rem; cursor: pointer; }

.quiz-result-screen { text-align: center; padding: 3rem; }
.result-icon { font-size: 4rem; margin-bottom: 1.5rem; }
.score-display { margin: 2rem 0; }
.score-display .val { display: block; font-size: 3rem; font-weight: 900; color: #1a6ab4; }
.score-display .lab { font-size: 0.9rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }

.certificate-unlock { margin-top: auto; padding: 1.5rem; background: #fff4e6; border-radius: 16px; text-align: center; border: 1px solid #fbd38d; }
.cert-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
.cert-btn { width: 100%; padding: 0.75rem; background: #d17c24; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 1rem; }

.viewer-loader { position: absolute; inset: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 10; }
.spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top: 4px solid #1a6ab4; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1000px) {
  .lms-portal { grid-template-columns: 1fr; height: auto; min-height: 80vh; }
  .lms-sidebar { height: 300px; }
}
</style>
