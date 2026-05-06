<script setup>
/**
 * VIEW: AdminDashboardView
 * Optimized light-mode admin dashboard for ITCPH Digital Agri-Booth.
 * Integrated design language from the booth (Blue/Orange).
 */
import { computed, nextTick, ref, watch } from "vue";

const props = defineProps({
  analytics: {
    type: Object,
    required: true,
  },
  modules: {
    type: Array,
    required: true,
  },
  visitorLogs: {
    type: Array,
    required: true,
  },
  isAddingResource: {
    type: Boolean,
    required: true,
  },
  resourceDraft: {
    type: Object,
    required: true,
  },
  uploadProgress: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  "logout",
  "close-dashboard",
  "start-add",
  "cancel-add",
  "commit-resource",
  "delete-resource",
  "update-draft",
]);

const selectedModuleId = ref("");
const activeSection = ref("overview");
const hiddenContentModuleIds = new Set([
  "virtual-tour",
  "newsletters",
  "chat-with-us",
  "digital-calculators",
]);

const navItems = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "materials", label: "Content Manager", icon: "inventory_2" },
  { id: "activity", label: "Visitor Logbook", icon: "history" },
];

const managedModules = computed(() =>
  props.modules.filter((module) => !hiddenContentModuleIds.has(module.id))
);

const selectedModule = computed(
  () => managedModules.value.find((m) => m.id === selectedModuleId.value) || managedModules.value[0]
);

// We treat "resources" as the unified list for admin management
const allResources = computed(() => {
  if (!selectedModule.value) return [];
  if (selectedModule.value.id === "bebu-game") {
    return selectedModule.value.questions || [];
  }
  // Some modules use 'materials', others use 'resources', etc.
  // For the purpose of the Admin Dashboard, we'll focus on the 'resources' array which is the dynamic one.
  return selectedModule.value.resources || [];
});

watch(
  () => props.modules,
  (newModules) => {
    const firstManagedModule = newModules.find((module) => !hiddenContentModuleIds.has(module.id));
    const selectedStillVisible = managedModules.value.some((module) => module.id === selectedModuleId.value);

    if (firstManagedModule && (!selectedModuleId.value || !selectedStillVisible)) {
      selectedModuleId.value = firstManagedModule.id;
    }
  },
  { immediate: true }
);

const jumpToSection = (sectionId) => {
  activeSection.value = sectionId;
};

const formatTimestamp = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const handleFileChange = (e, type) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (type === 'file') {
    emit('update-draft', { file: file });
  } else if (type === 'image') {
    // In a real app we'd upload. Here we just store the name for the mock UI.
    emit('update-draft', { imageFile: file });
  }
};
</script>

<template>
  <main class="admin-dashboard">
    <div class="admin-layout">
      <!-- SIDEBAR -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <div class="brand">
            <img src="/ITCPH_icon.png" alt="ITCPH Logo" class="brand-icon-img" />
            <div class="brand-info">
              <h1>ITCPH</h1>
              <span>Agri-Booth Admin</span>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <button
            v-for="item in navItems"
            :key="item.id"
            class="nav-item"
            :class="{ active: activeSection === item.id }"
            @click="jumpToSection(item.id)"
          >
            <span class="nav-label">{{ item.label }}</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="admin-profile">
            <img src="/ITCPH_icon.png" alt="Admin" class="avatar-img" />
            <div class="info">
              <strong>Admin User</strong>
              <span>Super Admin</span>
            </div>
          </div>
          <button class="logout-button" @click="$emit('logout')">Logout</button>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <div class="admin-content">
        <header class="content-header">
          <div class="header-title">
            <h2>{{ navItems.find(i => i.id === activeSection)?.label }}</h2>
          </div>
          <div class="header-actions">
            <button class="btn-secondary" @click="$emit('close-dashboard')">
              Return to Booth
            </button>
          </div>
        </header>

        <!-- OVERVIEW SECTION -->
        <section v-if="activeSection === 'overview'" class="section-container overview-section">
          <div class="overview-header">
            <div class="title-area">
              <h3>Management Overview</h3>
              <p>Key performance metrics and visitor engagement summary.</p>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Total Registrations</span>
              <div class="stat-main">
                <strong class="stat-value">{{ analytics.totalVisitors || visitorLogs.length }}</strong>
                <span class="stat-unit">Entries</span>
              </div>
              <div class="stat-trend positive">Total visitor engagement</div>
            </div>
            
            <div class="stat-card">
              <span class="stat-label">Resources Distributed</span>
              <div class="stat-main">
                <strong class="stat-value">{{ analytics.totalDownloads }}</strong>
                <span class="stat-unit">Downloads</span>
              </div>
              <div class="stat-trend">Knowledge outreach</div>
            </div>

            <div class="stat-card">
              <span class="stat-label">Popular Module</span>
              <div class="stat-main">
                <strong class="stat-value mini">{{ analytics.popularModule }}</strong>
              </div>
              <div class="stat-trend">Top interaction point</div>
            </div>
          </div>

          <div class="welcome-banner booth-banner">
            <div class="banner-content">
              <div class="banner-text">
                <h3>Digital Agri-Booth Systems</h3>
                <p>Welcome to the administrative portal. All interactive modules, including the Bebu Trivia Game and IEC Materials catalog, are currently live and synchronized with the 3D environment.</p>
              </div>
              <div class="banner-decoration">
                <img src="/ITCPH_icon.png" alt="Booth Icon" class="decoration-img" />
              </div>
            </div>
          </div>
        </section>

        <!-- CONTENT MANAGER SECTION -->
        <section v-if="activeSection === 'materials'" class="section-container">
          <div class="manager-layout">
            <div class="module-selector">
              <h3>Select Module</h3>
              <div class="module-list">
                <button
                  v-for="module in managedModules"
                  :key="module.id"
                  class="module-item"
                  :class="{ active: selectedModuleId === module.id }"
                  @click="selectedModuleId = module.id"
                >
                  <span class="module-badge">{{ module.access }}</span>
                  <span class="module-name">{{ module.title }}</span>
                </button>
              </div>
            </div>

            <div class="content-panel">
              <!-- Inline Add Material Form -->
              <div v-if="isAddingResource" class="inline-form-container">
                <div class="panel-header">
                  <div class="panel-info">
                    <h3>{{ selectedModule?.id === 'bebu-game' ? 'Create New Trivia Question' : `New Material for ${selectedModule?.title}` }}</h3>
                    <p>{{ selectedModule?.id === 'bebu-game' ? 'Add a specialized pig husbandry quiz item to the live booth.' : 'Enter the details for the new asset below.' }}</p>
                  </div>
                  <button class="btn-text" @click="$emit('cancel-add')">Cancel</button>
                </div>

                <form class="upload-form" @submit.prevent="$emit('commit-resource', selectedModuleId)">
                  <div v-if="selectedModule?.id === 'bebu-game'" class="form-grid">
                    <div class="field full">
                      <label>Trivia Question</label>
                      <textarea
                        rows="3"
                        placeholder="e.g. What is the ideal temperature for a newborn piglet?"
                        :value="resourceDraft.question"
                        @input="$input => $emit('update-draft', { question: $input.target.value })"
                        required
                      ></textarea>
                    </div>

                    <div class="field">
                      <label>Option A</label>
                      <input
                        type="text"
                        placeholder="Choice A"
                        :value="resourceDraft.optionA"
                        @input="$input => $emit('update-draft', { optionA: $input.target.value })"
                        required
                      />
                    </div>

                    <div class="field">
                      <label>Option B</label>
                      <input
                        type="text"
                        placeholder="Choice B"
                        :value="resourceDraft.optionB"
                        @input="$input => $emit('update-draft', { optionB: $input.target.value })"
                        required
                      />
                    </div>

                    <div class="field">
                      <label>Option C</label>
                      <input
                        type="text"
                        placeholder="Choice C"
                        :value="resourceDraft.optionC"
                        @input="$input => $emit('update-draft', { optionC: $input.target.value })"
                        required
                      />
                    </div>

                    <div class="field">
                      <label>Option D</label>
                      <input
                        type="text"
                        placeholder="Choice D"
                        :value="resourceDraft.optionD"
                        @input="$input => $emit('update-draft', { optionD: $input.target.value })"
                        required
                      />
                    </div>

                    <div class="field">
                      <label>Correct Answer</label>
                      <select
                        :value="resourceDraft.correctOptionId"
                        @change="$input => $emit('update-draft', { correctOptionId: $input.target.value })"
                        required
                      >
                        <option value="a">Option A</option>
                        <option value="b">Option B</option>
                        <option value="c">Option C</option>
                        <option value="d">Option D</option>
                      </select>
                    </div>

                    <div class="field">
                      <label>Difficulty</label>
                      <select :value="resourceDraft.difficulty" @change="$input => $emit('update-draft', { difficulty: $input.target.value })">
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>
                  </div>

                  <div v-else class="form-grid">
                    <div class="field full">
                      <label>Material Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Swine Management Guide v2"
                        :value="resourceDraft.title" 
                        @input="$input => $emit('update-draft', { title: $input.target.value })" 
                        required 
                      />
                    </div>
                    
                    <div class="field full">
                      <label>Description</label>
                      <textarea 
                        rows="3" 
                        placeholder="Brief summary of the content..."
                        :value="resourceDraft.description" 
                        @input="$input => $emit('update-draft', { description: $input.target.value })" 
                        required
                      ></textarea>
                    </div>

                    <div class="field">
                      <label>Content Type</label>
                      <select :value="resourceDraft.format" @change="$input => $emit('update-draft', { format: $input.target.value })">
                        <option>PDF Document</option>
                        <option>Article / News</option>
                        <option>IEC Image</option>
                        <option>Training Video</option>
                      </select>
                    </div>

                    <div class="field">
                      <label>Access Level</label>
                      <input type="text" :value="selectedModule?.access" disabled class="disabled-input" />
                    </div>

                    <div class="field full">
                      <label>Main File (PDF, Video, etc.)</label>
                      <div class="file-upload-zone">
                        <input type="file" id="main-file" class="hidden-input" @change="handleFileChange($event, 'file')" />
                        <label for="main-file" class="file-label">
                          {{ resourceDraft.file ? resourceDraft.file.name : 'Choose content file...' }}
                        </label>
                      </div>
                    </div>

                    <div class="field full">
                      <label>Thumbnail / Cover Image (Optional)</label>
                      <div class="file-upload-zone image">
                        <input type="file" id="image-file" class="hidden-input" accept="image/*" @change="handleFileChange($event, 'image')" />
                        <label for="image-file" class="file-label">
                          {{ resourceDraft.imageFile ? resourceDraft.imageFile.name : 'Choose thumbnail image...' }}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div v-if="uploadProgress > 0" class="upload-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                    </div>
                    <span>Uploading: {{ uploadProgress }}%</span>
                  </div>

                  <div class="form-footer">
                    <button type="submit" class="btn-primary" :disabled="uploadProgress > 0">
                      {{ selectedModule?.id === 'bebu-game' ? 'Save Question' : 'Save to Catalog' }}
                    </button>
                  </div>
                </form>
              </div>

              <!-- Resource List View -->
              <template v-else>
                <div class="panel-header">
                  <div class="panel-info">
                    <h3>{{ selectedModule?.title }}</h3>
                    <p>{{ selectedModule?.summary }}</p>
                  </div>
                  <button class="btn-primary" @click="$emit('start-add')">
                    {{ selectedModule?.id === 'bebu-game' ? 'Add Question' : 'Add Material' }}
                  </button>
                </div>

                <div v-if="selectedModule?.id === 'bebu-game'" class="trivia-management-list">
                   <div v-if="allResources.length === 0" class="empty-state">
                    <p>No questions found.</p>
                    <span>Create your first trivia item above.</span>
                  </div>
                  <div v-for="res in allResources" :key="res.id" class="trivia-record-card">
                    <div class="trivia-record-header">
                      <div class="trivia-meta-info">
                        <span class="difficulty-badge" :class="res.difficulty?.toLowerCase()">{{ res.difficulty }}</span>
                        <span class="category-tag">{{ res.category }}</span>
                      </div>
                      <button class="record-delete-btn" title="Delete Question" @click="$emit('delete-resource', { moduleId: selectedModule.id, resourceId: res.id })">&times;</button>
                    </div>
                    <div class="trivia-record-body">
                      <h4>{{ res.prompt }}</h4>
                      <div class="options-preview-grid">
                        <div v-for="opt in res.options" :key="opt.id" class="option-preview-item" :class="{ 'is-correct-preview': opt.id === res.correctOptionId }">
                          <span class="opt-id">{{ opt.id.toUpperCase() }}</span>
                          <span class="opt-val">{{ opt.label }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="resource-grid">
                  <div v-if="allResources.length === 0" class="empty-state">
                    <p>No managed materials found.</p>
                    <span>Click "Add Material" to create your first item.</span>
                  </div>
                  
                  <div
                    v-for="res in allResources"
                    :key="res.id"
                    class="resource-card"
                  >
                    <div class="res-type">{{ res.format }}</div>
                    <div class="res-body">
                      <h4>{{ res.title }}</h4>
                      <p>{{ res.description }}</p>
                    </div>
                    <div class="res-footer">
                      <button class="btn-danger" @click="$emit('delete-resource', { moduleId: selectedModule.id, resourceId: res.id })">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </section>

        <!-- ACTIVITY LOG SECTION -->
        <section v-if="activeSection === 'activity'" class="section-container logbook-section">
          <div class="logbook-outer-container">
            <div class="logbook-header">
              <div class="title-area">
                <h3>Visitor Engagement Logbook</h3>
                <p>Real-time record of all booth registrations and resource interactions.</p>
              </div>
              <div class="log-actions">
                <span class="count-badge">{{ visitorLogs.length }} Entries</span>
              </div>
            </div>

            <div class="logbook-panel">
              <div v-if="visitorLogs.length === 0" class="empty-state">
                <p>The logbook is empty.</p>
                <span>Visitor registrations will appear here.</span>
              </div>
              
              <div class="log-table-container">
                <table class="log-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Visitor Name</th>
                      <th>Email</th>
                      <th>Date</th>
                      <th>Affiliation</th>
                      <th>Client Type</th>
                      <th>Gender</th>
                      <th>Address</th>
                      <th>Items Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="log in visitorLogs" :key="log.id || log.submittedAt">
                      <td><span class="id-badge">#{{ log.id }}</span></td>
                      <td><strong>{{ log.name }}</strong></td>
                      <td>{{ log.email }}</td>
                      <td>{{ formatTimestamp(log.submittedAt) }}</td>
                      <td>{{ log.affiliations }}</td>
                      <td>{{ log.clientType }}</td>
                      <td>{{ log.gender }}</td>
                      <td>{{ log.address }}</td>
                      <td>
                        <div class="collection-tags">
                          <span v-for="item in log.itemsCollected" :key="item" class="tag">{{ item }}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.admin-dashboard {
  --primary: #1a6ab4;
  --secondary: #d17c24;
  --bg: #f4f7fa;
  --sidebar-bg: #ffffff;
  --text: #333333;
  --text-soft: #64748b;
  --border: #e2e8f0;
  --white: #ffffff;
  --success: #10b981;
  --danger: #ef4444;

  position: fixed;
  inset: 0;
  z-index: 2000;
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}

.admin-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: 100vh;
}

/* SIDEBAR */
.admin-sidebar {
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.sidebar-header {
  margin-bottom: 2.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.brand-info h1 {
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1;
  color: var(--primary);
}

.brand-info span {
  font-size: 0.75rem;
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.85rem 1rem;
  border: none;
  background: none;
  border-radius: 10px;
  color: var(--text-soft);
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f1f5f9;
  color: var(--primary);
}

.nav-item.active {
  background: rgba(26, 106, 180, 0.1);
  color: var(--primary);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.avatar-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border);
}

.info strong {
  display: block;
  font-size: 0.875rem;
}

.info span {
  font-size: 0.75rem;
  color: var(--text-soft);
}

.logout-button {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--border);
  background: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* CONTENT */
.admin-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content-header {
  background: var(--white);
  padding: 1.5rem 2.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

.section-container {
  padding: 2.5rem;
  overflow-y: auto;
  flex: 1;
}

/* STATS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--white);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.stat-label {
  display: block;
  color: var(--text-soft);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--primary);
}

.stat-value.mini {
  font-size: 1.25rem;
  color: var(--secondary);
}

.stat-main {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.stat-unit {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-soft);
  text-transform: uppercase;
}

.stat-trend {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-soft);
}

.welcome-banner {
  background: linear-gradient(135deg, var(--primary), #0d4a82);
  color: white;
  padding: 2rem;
  border-radius: 16px;
}

.booth-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.banner-text h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
.banner-text p { opacity: 0.9; max-width: 600px; line-height: 1.6; }

.decoration-img {
  width: 120px;
  height: 120px;
  opacity: 0.2;
  filter: brightness(0) invert(1);
}

/* MANAGER LAYOUT */
.manager-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 2rem;
  align-items: start;
}

.module-selector {
  background: var(--white);
  padding: 1.25rem;
  border-radius: 16px;
  border: 1px solid var(--border);
}

.module-selector h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.module-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.module-item {
  padding: 0.75rem;
  border: 1px solid transparent;
  background: #f8fafc;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: 0.2s;
}

.module-item:hover { background: #f1f5f9; }
.module-item.active {
  background: var(--white);
  border-color: var(--primary);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.module-badge {
  display: block;
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 800;
  color: var(--secondary);
  margin-bottom: 0.25rem;
}

.module-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.content-panel {
  background: var(--white);
  border-radius: 16px;
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-info h3 { font-size: 1.25rem; }
.panel-info p { font-size: 0.875rem; color: var(--text-soft); }

.resource-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.resource-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.res-type {
  font-size: 0.7rem;
  font-weight: 800;
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  width: fit-content;
}

.res-body h4 { font-size: 1rem; margin-bottom: 0.5rem; }
.res-body p { font-size: 0.85rem; color: var(--text-soft); line-height: 1.4; }

.res-footer { margin-top: auto; padding-top: 1rem; border-top: 1px dashed var(--border); }

/* INLINE FORM */
.upload-form { padding: 1.5rem; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.field.full { grid-column: span 2; }
.field label { display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem; text-transform: uppercase; color: var(--text-soft); }
.field input, .field textarea, .field select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
}

.disabled-input { background: #f8fafc; color: var(--text-soft); cursor: not-allowed; }

.file-upload-zone {
  border: 2px dashed var(--border);
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
}

.file-upload-zone:hover { border-color: var(--primary); background: #f8fafc; }
.file-label { cursor: pointer; font-weight: 600; color: var(--primary); display: block; }
.hidden-input { display: none; }

.upload-progress { margin-top: 1.5rem; }
.progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem; }
.progress-fill { height: 100%; background: var(--success); transition: width 0.3s; }

.form-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

/* TRIVIA MANAGEMENT */
.trivia-management-list {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.trivia-record-card {
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1.5rem;
  background: #fcfdfe;
  transition: transform 0.2s, box-shadow 0.2s;
}

.trivia-record-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.04);
}

.trivia-record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.trivia-meta-info {
  display: flex;
  gap: 0.75rem;
}

.difficulty-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.difficulty-badge.easy { background: #ecfdf5; color: #10b981; }
.difficulty-badge.medium { background: #fffbeb; color: #d97706; }
.difficulty-badge.hard { background: #fef2f2; color: #ef4444; }

.category-tag {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 4px 10px;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 99px;
  text-transform: uppercase;
}

.record-delete-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #cbd5e1;
  cursor: pointer;
  line-height: 1;
}

.record-delete-btn:hover { color: #ef4444; }

.trivia-record-body h4 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.25rem;
  line-height: 1.4;
}

.options-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.option-preview-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 0.9rem;
}

.option-preview-item.is-correct-preview {
  border-color: #10b981;
  background: #f0fdf4;
}

.opt-id {
  font-weight: 900;
  color: var(--primary);
  opacity: 0.5;
}

.is-correct-preview .opt-id { opacity: 1; color: #10b981; }

.opt-val { font-weight: 600; color: #475569; }

/* LOG TABLE */
.logbook-section {
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logbook-outer-container {
  width: 100%;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.logbook-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 1rem;
}

.title-area h3 {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 0.25rem;
}

.title-area p {
  color: var(--text-soft);
  font-size: 1rem;
}

.count-badge {
  background: var(--secondary);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(209, 124, 36, 0.2);
}

.logbook-panel {
  background: var(--white);
  border-radius: 24px;
  border: 1px solid rgba(26, 106, 180, 0.1);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  padding: 1rem;
}

.log-table-container { 
  overflow-x: auto; 
  border-radius: 16px;
}

.log-table { 
  width: 100%; 
  border-collapse: separate; 
  border-spacing: 0;
  text-align: left; 
}

.log-table th { 
  padding: 1.25rem 1.5rem; 
  background: #f1f5f9; 
  font-size: 0.8rem; 
  text-transform: uppercase; 
  color: var(--primary); 
  font-weight: 800;
  letter-spacing: 0.05em; 
  border-bottom: 2px solid var(--border);
}

.log-table td { 
  padding: 1.5rem; 
  border-bottom: 1px solid var(--border); 
  font-size: 0.95rem;
  color: var(--text);
  vertical-align: middle;
}

.log-table tr:hover td {
  background: #f8fafc;
}

.log-table tr:last-child td {
  border-bottom: none;
}

/* Specific Column Widths */
.log-table th:nth-child(4),
.log-table td:nth-child(4) {
  min-width: 220px;
}

.log-table th:nth-child(2),
.log-table td:nth-child(2) {
  min-width: 200px;
}

.collection-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.tag { background: rgba(26, 106, 180, 0.1); color: var(--primary); padding: 0.3rem 0.7rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }

.id-badge {
  background: #f1f5f9;
  color: var(--text-soft);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 700;
  font-size: 0.9rem;
}

/* BUTTONS */
.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.btn-secondary {
  background: white;
  color: var(--text);
  border: 1px solid var(--border);
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.btn-danger {
  background: #fef2f2;
  color: var(--danger);
  border: 1px solid #fee2e2;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-text { background: none; border: none; font-weight: 600; color: var(--text-soft); cursor: pointer; }

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  grid-column: 1 / -1;
}

.empty-state p { font-weight: 700; margin-bottom: 0.25rem; }
.empty-state span { font-size: 0.875rem; color: var(--text-soft); }

@media (max-width: 1100px) {
  .admin-layout { grid-template-columns: 80px 1fr; }
  .brand-info, .nav-label, .admin-profile .info, .logout-button { display: none; }
  .nav-item { justify-content: center; padding: 1rem; }
  .manager-layout { grid-template-columns: 1fr; }
}
</style>
