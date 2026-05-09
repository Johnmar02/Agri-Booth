<script setup>
import { ref, onMounted, computed } from 'vue';
import { apiClient } from '@/services/apiClient';
import { useUiStore } from '@/stores/uiStore';

const props = defineProps({
  courses: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['refresh']);
const uiStore = useUiStore();

const selectedCourse = ref(null);
const selectedModule = ref(null);
const loading = ref(false);

const courseForm = ref({ id: null, title: '', description: '', thumbnailPath: '', level: 'Beginner', durationMinutes: 0, isActive: true });
const moduleForm = ref({ id: null, title: '', description: '', order: 1 });
const lessonForm = ref({ id: null, title: '', contentType: 'Redirection', contentUrl: '', body: '', order: 1, durationMinutes: 5 });

const viewMode = ref('courses'); // 'courses', 'course-details', 'module-details'

const resetForms = () => {
  courseForm.value = { id: null, title: '', description: '', thumbnailPath: '', level: 'Beginner', durationMinutes: 0, isActive: true };
  moduleForm.value = { id: null, title: '', description: '', order: 1 };
  lessonForm.value = { id: null, title: '', contentType: 'Redirection', contentUrl: '', body: '', order: 1, durationMinutes: 5 };
};

const fetchCourseDetails = async (id) => {
  loading.value = true;
  try {
    const res = await apiClient.getCourseById(id);
    if (res.ok) {
      selectedCourse.value = res.data;
      viewMode.value = 'course-details';
    }
  } catch (err) {
    uiStore.showAlert('Error', 'Failed to load course details');
  } finally {
    loading.value = false;
  }
};

const handleCreateCourse = async () => {
  const res = await apiClient.createCourse(courseForm.value);
  if (res.ok) {
    uiStore.showToast('Course group created successfully!');
    emit('refresh');
    resetForms();
  } else {
    uiStore.showAlert('Error', res.data?.message || 'Failed to create course');
  }
};

const handleUpdateCourse = async () => {
  const res = await apiClient.updateCourse(courseForm.value.id, courseForm.value);
  if (res.ok) {
    uiStore.showToast('Course group updated successfully!');
    emit('refresh');
    if (selectedCourse.value?.id === courseForm.value.id) {
        await fetchCourseDetails(courseForm.value.id);
    }
    resetForms();
  }
};

const handleDeleteCourse = async (id) => {
  uiStore.showConfirm(
    'Deactivate Course',
    'Are you sure you want to deactivate this course group? It will be hidden from the catalog. This action can be reversed by an administrator later.',
    async () => {
      const res = await apiClient.deleteCourse(id);
      if (res.ok) {
        uiStore.showToast('Course deactivated.');
        emit('refresh');
      }
    },
    null,
    "Yes, Deactivate",
    "No, Cancel"
  );
};

const handleCreateModule = async () => {
  const payload = { ...moduleForm.value, courseId: selectedCourse.value.id };
  const res = await apiClient.createCourseModule(payload);
  if (res.ok) {
    uiStore.showToast('Sub-module added successfully!');
    await fetchCourseDetails(selectedCourse.value.id);
    resetForms();
  } else {
    uiStore.showAlert('Error', res.data?.message || 'Failed to add module');
  }
};

const handleCreateLesson = async () => {
  const payload = { ...lessonForm.value, moduleId: selectedModule.value.id };
  const res = await apiClient.createLesson(payload);
  if (res.ok) {
    uiStore.showToast('Redirect link added!');
    await fetchCourseDetails(selectedCourse.value.id);
    // Refresh selected module data
    selectedModule.value = selectedCourse.value.modules.find(m => m.id === selectedModule.value.id);
    resetForms();
  } else {
    uiStore.showAlert('Error', res.data?.message || 'Failed to add redirect');
  }
};

const openModule = (mod) => {
  selectedModule.value = mod;
  viewMode.value = 'module-details';
};

const goBack = () => {
  if (viewMode.value === 'module-details') {
    viewMode.value = 'course-details';
    selectedModule.value = null;
  } else {
    viewMode.value = 'courses';
    selectedCourse.value = null;
  }
};

</script>

<template>
  <div class="admin-lms-manager">
    <!-- Header with Breadcrumbs -->
    <header class="lms-header">
      <div class="breadcrumbs">
        <span @click="viewMode = 'courses'; selectedCourse = null; selectedModule = null">Training Catalog</span>
        <span v-if="selectedCourse" @click="viewMode = 'course-details'; selectedModule = null"> / {{ selectedCourse.title }}</span>
        <span v-if="selectedModule"> / {{ selectedModule.title }}</span>
      </div>
      <button v-if="viewMode !== 'courses'" class="btn-back" @click="goBack">Back</button>
    </header>

    <!-- Course List -->
    <div v-if="viewMode === 'courses'" class="lms-section">
    <div class="section-top">
      <h3>E-Learning & Training Catalog</h3>
      <button class="btn-add" @click="resetForms(); courseForm.id = 'new'">+ Create Course Group</button>
    </div>

    <div v-if="courseForm.id === 'new'" class="edit-box">
      <h4>Create New Course Group</h4>        <div class="form-grid">
          <input v-model="courseForm.title" placeholder="Title (e.g. Specialized Pig Husbandry)" />
          <select v-model="courseForm.level">
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <input v-model.number="courseForm.durationMinutes" type="number" placeholder="Duration (Minutes)" />
          <input v-model="courseForm.thumbnailPath" placeholder="Cover Image URL" />
          <textarea v-model="courseForm.description" placeholder="Short description of this course group..." class="full-width"></textarea>
        </div>
        <div class="form-actions">
          <button @click="courseForm.id = null">Cancel</button>
          <button class="btn-save" @click="handleCreateCourse">Save</button>
        </div>
      </div>

      <div class="course-grid">
        <div v-for="course in courses" :key="course.id" class="course-admin-card">
          <div class="card-info">
            <strong>{{ course.title }}</strong>
            <p>{{ course.description?.substring(0, 80) }}...</p>
            <div class="meta">
              <span>{{ course.totalModules }} Sub-Modules</span>
              <span>{{ course.totalEnrollments }} Accesses</span>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-manage" @click="fetchCourseDetails(course.id)">Manage External Links</button>
            <button class="btn-del" @click="handleDeleteCourse(course.id)">Deactivate</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Course Details (Modules) -->
    <div v-if="viewMode === 'course-details' && selectedCourse" class="lms-section">
      <div class="section-top">
        <h3>Modules in {{ selectedCourse.title }}</h3>
        <button class="btn-add" @click="resetForms(); moduleForm.id = 'new'">+ Add Sub-Module</button>
      </div>

      <div v-if="moduleForm.id === 'new'" class="edit-box">
        <h4>New Sub-Module</h4>
        <div class="form-grid">
          <input v-model="moduleForm.title" placeholder="Module Title (e.g. Training Application)" />
          <input v-model.number="moduleForm.order" type="number" placeholder="Display Order" />
          <textarea v-model="moduleForm.description" placeholder="What is this module for?" class="full-width"></textarea>
        </div>
        <div class="form-actions">
          <button @click="moduleForm.id = null">Cancel</button>
          <button class="btn-save" @click="handleCreateModule">Save</button>
        </div>
      </div>

      <div class="module-list-admin">
        <div v-for="mod in selectedCourse.modules" :key="mod.id" class="module-admin-row">
          <div class="mod-info">
            <span class="mod-order">#{{ mod.order }}</span>
            <strong>{{ mod.title }}</strong>
            <span class="mod-stats">{{ mod.lessons?.length || 0 }} Redirection Links</span>
          </div>
          <div class="mod-actions">
            <button @click="openModule(mod)">Manage Redirects</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Module Details (Lessons/Links) -->
    <div v-if="viewMode === 'module-details' && selectedModule" class="lms-section">
      <div class="sub-section">
        <div class="section-top">
          <h4>External Redirection Links</h4>
          <button class="btn-add mini" @click="resetForms(); lessonForm.id = 'new'">+ Add Redirect Link</button>
        </div>

        <div v-if="lessonForm.id === 'new'" class="edit-box">
          <h5>New Redirection Point</h5>
          <div class="form-grid">
            <input v-model="lessonForm.title" placeholder="Link Label (e.g. Apply Now!)" />
            <input v-model="lessonForm.contentUrl" placeholder="External URL (https://...)" class="full-width" />
            <input v-model.number="lessonForm.order" type="number" placeholder="Order" />
            <textarea v-model="lessonForm.body" placeholder="Brief instruction or context for the user before they redirect..." class="full-width"></textarea>
          </div>
          <div class="form-actions">
            <button @click="lessonForm.id = null">Cancel</button>
            <button class="btn-save" @click="handleCreateLesson">Save</button>
          </div>
        </div>

        <div class="nested-list">
          <div v-for="lesson in selectedModule.lessons" :key="lesson.id" class="nested-item">
            <span class="order">#{{ lesson.order }}</span>
            <div class="title-block">
                <span class="title">{{ lesson.title }}</span>
                <span class="url">{{ lesson.contentUrl }}</span>
            </div>
            <span class="type">REDIRECTION</span>
          </div>
        </div>

        <div v-if="!selectedModule.lessons?.length" class="empty-hint">
            No redirect links added yet. Users will see an empty module.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-lms-manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.lms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.breadcrumbs {
  font-size: 0.9rem;
  font-weight: 700;
  color: #64748b;
}

.breadcrumbs span {
  cursor: pointer;
}

.breadcrumbs span:hover {
  color: #1a6ab4;
}

.btn-back {
  background: none;
  border: none;
  color: #1a6ab4;
  font-weight: 700;
  cursor: pointer;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-add {
  background: #1a6ab4;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.btn-add.mini {
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
}

.edit-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.full-width {
  grid-column: span 2;
}

.form-grid input, .form-grid select, .form-grid textarea {
  padding: 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-save {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.course-admin-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-info strong {
  display: block;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.card-info p {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
}

.card-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 0.5rem;
}

.btn-manage {
  flex: 1;
  background: #f1f5f9;
  color: #1a6ab4;
  border: 1px solid #1a6ab4;
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}

.btn-del {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}

.module-list-admin {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.module-admin-row {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mod-order {
  font-weight: 800;
  color: #cbd5e1;
  margin-right: 1rem;
}

.mod-stats {
  margin-left: 1.5rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.mod-actions button {
  background: #1a6ab4;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.sub-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.nested-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nested-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 0.9rem;
}

.nested-item .order { font-weight: 800; color: #cbd5e1; }
.nested-item .title-block { flex: 1; display: flex; flex-direction: column; }
.nested-item .title { font-weight: 600; }
.nested-item .url { font-size: 0.75rem; color: #1a6ab4; }
.nested-item .type { font-size: 0.75rem; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #64748b; }

.empty-hint {
    padding: 2rem;
    text-align: center;
    color: #94a3b8;
    font-style: italic;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    border-radius: 12px;
}
</style>