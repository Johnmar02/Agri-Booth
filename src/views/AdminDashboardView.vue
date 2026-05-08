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
  adminList: {
    type: Array,
    default: () => [],
  },
  feedbacksList: {
    type: Array,
    default: () => [],
  },
  detailedAnalytics: {
    type: Object,
    default: () => ({}),
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
  "create-admin",
  "delete-admin",
  "fetch-admins",
  "fetch-detailed-analytics",
]);

const selectedModuleId = ref("");
const activeSection = ref("overview");
const hiddenContentModuleIds = new Set([
  "virtual-tour",
  "newsletters",
  "chat-with-us",
  "digital-calculators",
  "corporate-materials",
  "corp-materials",
]);

const navItems = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "analytics", label: "Detailed Insights", icon: "insights" },
  { id: "materials", label: "Content Manager", icon: "inventory_2" },
  { id: "feedbacks", label: "User Feedbacks", icon: "forum" },
  { id: "activity", label: "Visitor Logbook", icon: "history" },
  { id: "admins", label: "Admin Users", icon: "people" },
];

const managedModules = computed(() =>
  props.modules.filter((module) => !hiddenContentModuleIds.has(module.id))
);

const isAddingAdmin = ref(false);
const adminDraft = ref({
  username: "",
  password: "",
  email: "",
  role: "Admin",
});
const adminError = ref("");

const selectedModule = computed(
  () => managedModules.value.find((m) => m.id === selectedModuleId.value) || managedModules.value[0]
);

// We treat "resources" as the unified list for admin management
const allResources = computed(() => {
  if (!selectedModule.value) return [];
  if (selectedModule.value.id === "bebu-game") {
    return selectedModule.value.questions || [];
  }
  if (selectedModule.value.id === "iec-materials") {
    return selectedModule.value.materials || [];
  }
  if (selectedModule.value.id === "training-programs") {
    return selectedModule.value.programs || [];
  }
  // Some modules use 'materials', others use 'resources', etc.
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

const trainingRegistrations = ref([]);
const isViewingRegistrations = ref(false);
const activeProgram = ref(null);

const viewProgramRegistrations = async (program) => {
  activeProgram.value = program;
  try {
    const res = await import("@/services/apiClient").then(m => m.apiClient.getTrainingRegistrations(program.id));
    if (res.ok) {
      trainingRegistrations.value = res.data;
      isViewingRegistrations.value = true;
    }
  } catch (error) {
    console.error("Error fetching registrations:", error);
  }
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

const startAddAdmin = () => {
  adminDraft.value = { username: "", password: "", email: "", role: "Admin" };
  adminError.value = "";
  isAddingAdmin.value = true;
};

const commitAdmin = async () => {
  adminError.value = "";
  const result = await emit("create-admin", adminDraft.value);
  if (result === true) {
    isAddingAdmin.value = false;
  } else {
    adminError.value = result?.data?.message || result?.message || "Failed to create admin.";
  }
};

watch(activeSection, (newSection) => {
  if (newSection === "admins") {
    emit("fetch-admins");
  } else if (newSection === "analytics") {
    emit("fetch-detailed-analytics");
  } else if (newSection === "feedbacks") {
    emit("fetch-feedbacks");
  }
});
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

        <!-- DETAILED ANALYTICS SECTION -->
        <section v-if="activeSection === 'analytics'" class="section-container analytics-section">
          <div class="analytics-header">
            <div class="title-area">
              <h3>In-Depth Analytics</h3>
              <p>Comprehensive data visualization for ITCPH Agri-Booth performance.</p>
            </div>
          </div>

          <div class="stats-grid main-analytics">
             <div class="stat-card">
              <span class="stat-label">Last 7 Days</span>
              <div class="stat-main">
                <strong class="stat-value">{{ analytics.recentVisitors || detailedAnalytics.recentVisitors_last7Days || 0 }}</strong>
              </div>
              <div class="stat-trend">Recent Traffic</div>
            </div>
            <div class="stat-card">
              <span class="stat-label">Last 30 Days</span>
              <div class="stat-main">
                <strong class="stat-value">{{ analytics.monthlyVisitors || detailedAnalytics.monthlyVisitors_last30Days || 0 }}</strong>
              </div>
              <div class="stat-trend">Monthly Reach</div>
            </div>
            <div class="stat-card">
              <span class="stat-label">Avg. Satisfaction</span>
              <div class="stat-main">
                <strong class="stat-value">{{ analytics.averageRating || detailedAnalytics.feedbackRatings?.averageRating || 0 }}</strong>
                <span class="stat-unit">/ 5</span>
              </div>
              <div class="stat-trend">User Feedback</div>
            </div>
          </div>

          <div class="analytics-layout-grid">
            <!-- Visitor Demographics -->
            <div class="analytics-box">
              <div class="box-header">
                <h4>Visitor Demographics</h4>
              </div>
              <div class="box-content demographics">
                <div class="demo-group">
                  <label>Gender Distribution</label>
                  <div class="chart-list">
                    <div v-for="item in detailedAnalytics.byGender" :key="item.gender" class="chart-bar-row">
                      <span class="bar-label">{{ item.gender }}</span>
                      <div class="bar-outer">
                        <div class="bar-inner" :style="{ width: (item.count / props.analytics.totalVisitors * 100) + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ item.count }}</span>
                    </div>
                  </div>
                </div>
                <div class="demo-group">
                  <label>Client Type Breakdown</label>
                   <div class="chart-list">
                    <div v-for="item in detailedAnalytics.byClientType" :key="item.clientType" class="chart-bar-row">
                      <span class="bar-label">{{ item.clientType }}</span>
                      <div class="bar-outer">
                        <div class="bar-inner secondary" :style="{ width: (item.count / props.analytics.totalVisitors * 100) + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ item.count }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Top Downloads -->
            <div class="analytics-box">
              <div class="box-header">
                <h4>Most Downloaded Resources</h4>
              </div>
              <div class="box-content">
                <table class="analytics-table">
                  <thead>
                    <tr>
                      <th>Resource Title</th>
                      <th>Category</th>
                      <th>Downloads</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in detailedAnalytics.topDownloads" :key="item.id">
                      <td><strong>{{ item.title }}</strong></td>
                      <td><span class="category-pill">{{ item.category }}</span></td>
                      <td>{{ item.downloadCount }}</td>
                    </tr>
                    <tr v-if="detailedAnalytics.topDownloads?.length === 0">
                      <td colspan="3" class="empty-table">No download data available.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Training Summary -->
            <div class="analytics-box full-width">
              <div class="box-header">
                <h4>Training Program Summary</h4>
              </div>
              <div class="box-content">
                <div class="training-summary-grid">
                  <div v-for="item in detailedAnalytics.trainingSummary" :key="item.id" class="training-summary-card">
                    <div class="card-title">{{ item.title }}</div>
                    <div class="card-progress">
                      <div class="progress-labels">
                        <span>{{ item.registered }} / {{ item.slots }} Slots filled</span>
                        <span>{{ Math.round((item.registered / item.slots) * 100) }}%</span>
                      </div>
                      <div class="progress-bar-wrap">
                        <div class="progress-fill" :style="{ width: (item.registered / item.slots * 100) + '%' }"></div>
                      </div>
                    </div>
                    <div class="card-meta">
                      <span>Available: {{ item.availableSlots }}</span>
                      <span>Starts: {{ formatTimestamp(item.startDate) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Geographical Breakdown (Address) -->
            <div class="analytics-box">
              <div class="box-header">
                <h4>Top Visitor Locations</h4>
              </div>
              <div class="box-content">
                 <div class="chart-list">
                    <div v-for="item in detailedAnalytics.byAddress" :key="item.address" class="chart-bar-row">
                      <span class="bar-label">{{ item.address }}</span>
                      <div class="bar-outer">
                        <div class="bar-inner tertiary" :style="{ width: (item.count / props.analytics.totalVisitors * 100) * 2 + '%' }"></div>
                      </div>
                      <span class="bar-value">{{ item.count }}</span>
                    </div>
                  </div>
              </div>
            </div>

             <!-- Feedback Distribution -->
            <div class="analytics-box">
              <div class="box-header">
                <h4>Feedback Distribution</h4>
              </div>
              <div class="box-content">
                 <div class="rating-dist">
                    <div v-for="r in [5,4,3,2,1]" :key="r" class="rating-row">
                      <span class="stars">{{ '★'.repeat(r) }}</span>
                      <div class="rating-bar-wrap">
                        <div 
                          class="rating-bar-fill" 
                          :style="{ width: ((detailedAnalytics.feedbackRatings?.distribution?.find(d => d.rating === r)?.count || 0) / (props.analytics.totalFeedbacks || 1) * 100) + '%' }"
                        ></div>
                      </div>
                      <span class="rating-count">{{ detailedAnalytics.feedbackRatings?.distribution?.find(d => d.rating === r)?.count || 0 }}</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <!-- USER FEEDBACKS SECTION -->
        <section v-if="activeSection === 'feedbacks'" class="section-container feedbacks-section">
          <div class="logbook-outer-container">
            <div class="logbook-header">
              <div class="title-area">
                <h3>User Experience Feedback</h3>
                <p>Direct messages and ratings from booth visitors.</p>
              </div>
              <div class="log-actions">
                <span class="count-badge">{{ feedbacksList.length }} Submissions</span>
              </div>
            </div>

            <div class="logbook-panel">
               <div v-if="feedbacksList.length === 0" class="empty-state">
                <p>No feedback received yet.</p>
                <span>New submissions will appear here in real-time.</span>
              </div>
              
              <div class="log-table-container">
                <table class="log-table">
                  <thead>
                    <tr>
                      <th>Rating</th>
                      <th>Message</th>
                      <th>Visitor</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="f in feedbacksList" :key="f.id">
                      <td>
                        <span class="stars-val">{{ '★'.repeat(f.rating) }}</span>
                      </td>
                      <td class="msg-cell">{{ f.message }}</td>
                      <td><strong>{{ f.visitor }}</strong></td>
                      <td>{{ formatTimestamp(f.submittedAt) }}</td>
                    </tr>
                  </tbody>
                </table>
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

                  <div v-else-if="selectedModule?.id === 'training-programs'" class="form-grid">
                    <div class="field full">
                      <label>Program Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Fundamental Swine Husbandry Course"
                        :value="resourceDraft.title" 
                        @input="$input => $emit('update-draft', { title: $input.target.value })" 
                        required 
                      />
                    </div>
                    
                    <div class="field full">
                      <label>Description</label>
                      <textarea 
                        rows="3" 
                        placeholder="Brief summary of the training program..."
                        :value="resourceDraft.description" 
                        @input="$input => $emit('update-draft', { description: $input.target.value })" 
                        required
                      ></textarea>
                    </div>

                    <div class="field">
                      <label>Start Date</label>
                      <input 
                        type="datetime-local" 
                        :value="resourceDraft.startDate" 
                        @input="$input => $emit('update-draft', { startDate: $input.target.value })" 
                        required 
                      />
                    </div>

                    <div class="field">
                      <label>End Date</label>
                      <input 
                        type="datetime-local" 
                        :value="resourceDraft.endDate" 
                        @input="$input => $emit('update-draft', { endDate: $input.target.value })" 
                        required 
                      />
                    </div>

                    <div class="field">
                      <label>Venue</label>
                      <input 
                        type="text" 
                        placeholder="e.g. ITCPH Main Hall"
                        :value="resourceDraft.venue" 
                        @input="$input => $emit('update-draft', { venue: $input.target.value })" 
                        required 
                      />
                    </div>

                    <div class="field">
                      <label>Total Slots</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 30"
                        :value="resourceDraft.slots" 
                        @input="$input => $emit('update-draft', { slots: $input.target.value })" 
                        required 
                      />
                    </div>
                  </div>

                  <div v-else-if="selectedModule?.id === 'e-learning'" class="form-grid">
                    <div class="field full">
                      <label>Course Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Advanced Swine Nutrition"
                        :value="resourceDraft.title" 
                        @input="$input => $emit('update-draft', { title: $input.target.value })" 
                        required 
                      />
                    </div>
                    
                    <div class="field full">
                      <label>Description</label>
                      <textarea 
                        rows="3" 
                        placeholder="Brief summary of the learning objectives..."
                        :value="resourceDraft.description" 
                        @input="$input => $emit('update-draft', { description: $input.target.value })" 
                        required
                      ></textarea>
                    </div>

                    <div class="field">
                      <label>Difficulty Level</label>
                      <select :value="resourceDraft.level" @change="$input => $emit('update-draft', { level: $input.target.value })">
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>

                    <div class="field">
                      <label>Estimated Duration (Minutes)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 120"
                        :value="resourceDraft.durationMinutes" 
                        @input="$input => $emit('update-draft', { durationMinutes: $input.target.value })" 
                        required 
                      />
                    </div>

                    <div class="field full">
                      <label>Thumbnail Path / URL</label>
                      <input 
                        type="text" 
                        placeholder="/images/courses/nutrition.jpg"
                        :value="resourceDraft.thumbnailPath" 
                        @input="$input => $emit('update-draft', { thumbnailPath: $input.target.value })" 
                      />
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

                <div v-if="isViewingRegistrations" class="registrations-overlay">
                  <div class="panel-header">
                    <div class="panel-info">
                      <h3>Registrations: {{ activeProgram?.title }}</h3>
                      <p>List of visitors who registered for this session.</p>
                    </div>
                    <button class="btn-text" @click="isViewingRegistrations = false">Close</button>
                  </div>
                  <div class="registration-table-container">
                    <table class="log-table mini">
                      <thead>
                        <tr>
                          <th>Visitor</th>
                          <th>Email</th>
                          <th>Affiliation</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="reg in trainingRegistrations" :key="reg.id">
                          <td><strong>{{ reg.visitor.fullName }}</strong></td>
                          <td>{{ reg.visitor.email }}</td>
                          <td>{{ reg.visitor.affiliation }}</td>
                          <td><span class="status-pill">{{ reg.status }}</span></td>
                          <td>{{ formatTimestamp(reg.registeredAt) }}</td>
                        </tr>
                        <tr v-if="trainingRegistrations.length === 0">
                          <td colspan="5" class="empty-regs">No registrations yet.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div v-else-if="selectedModule?.id === 'bebu-game'" class="trivia-management-list">
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

                <div v-else-if="selectedModule?.id === 'training-programs'" class="training-management-grid">
                   <div v-if="allResources.length === 0" class="empty-state">
                    <p>No training programs found.</p>
                    <span>Create your first program above.</span>
                  </div>
                  <div v-for="res in allResources" :key="res.id" class="training-admin-card">
                    <div class="training-admin-header">
                      <div class="training-admin-info">
                        <h4>{{ res.title }}</h4>
                        <span class="venue-badge">📍 {{ res.venue }}</span>
                      </div>
                      <div class="training-admin-actions">
                        <button class="btn-text view-regs-btn" @click="viewProgramRegistrations(res)">View Registrations</button>
                        <button class="record-delete-btn" @click="$emit('delete-resource', { moduleId: selectedModule.id, resourceId: res.id })">&times;</button>
                      </div>
                    </div>
                    <div class="training-admin-body">
                      <p>{{ res.description }}</p>
                      <div class="training-admin-stats">
                        <div class="admin-mini-stat">
                          <span class="mini-label">Dates</span>
                          <span class="mini-val">{{ formatTimestamp(res.startDate) }} - {{ formatTimestamp(res.endDate) }}</span>
                        </div>
                        <div class="admin-mini-stat">
                          <span class="mini-label">Slots</span>
                          <span class="mini-val">{{ res.slots }} Total</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="selectedModule?.id === 'e-learning'" class="training-management-grid">
                   <div v-if="selectedModule.courses?.length === 0" class="empty-state">
                    <p>No e-learning courses found.</p>
                    <span>Create your first structured course above.</span>
                  </div>
                  <div v-for="course in selectedModule.courses" :key="course.id" class="training-admin-card">
                    <div class="training-admin-header">
                      <div class="training-admin-info">
                        <h4>{{ course.title }}</h4>
                        <span class="venue-badge">📊 Level: {{ course.level }}</span>
                      </div>
                      <div class="training-admin-actions">
                         <span class="status-pill">{{ course.isActive ? 'Active' : 'Inactive' }}</span>
                        <button class="record-delete-btn" @click="$emit('delete-resource', { moduleId: selectedModule.id, resourceId: course.id })">&times;</button>
                      </div>
                    </div>
                    <div class="training-admin-body">
                      <p>{{ course.description }}</p>
                      <div class="training-admin-stats">
                        <div class="admin-mini-stat">
                          <span class="mini-label">Structure</span>
                          <span class="mini-val">{{ course.totalModules }} Modules</span>
                        </div>
                        <div class="admin-mini-stat">
                          <span class="mini-label">Engagement</span>
                          <span class="mini-val">{{ course.totalEnrollments }} Enrolled</span>
                        </div>
                         <div class="admin-mini-stat">
                          <span class="mini-label">Duration</span>
                          <span class="mini-val">{{ course.durationMinutes }} Min</span>
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

        <!-- ADMIN MANAGEMENT SECTION -->
        <section v-if="activeSection === 'admins'" class="section-container">
          <div class="panel-header">
            <div class="panel-info">
              <h3>Administrator Management</h3>
              <p>Create and manage system administrators with role-based access.</p>
            </div>
            <button v-if="!isAddingAdmin" class="btn-primary" @click="startAddAdmin">
              Add New Admin
            </button>
            <button v-else class="btn-text" @click="isAddingAdmin = false">
              Cancel
            </button>
          </div>

          <div class="admin-management-content">
            <!-- Add Admin Form -->
            <div v-if="isAddingAdmin" class="inline-form-container admins">
              <form class="upload-form" @submit.prevent="commitAdmin">
                <div class="form-grid">
                  <div class="field">
                    <label>Username</label>
                    <input v-model="adminDraft.username" type="text" placeholder="e.g. jdoe_admin" required />
                  </div>
                  <div class="field">
                    <label>Email Address</label>
                    <input v-model="adminDraft.email" type="email" placeholder="admin@itcph.gov.ph" required />
                  </div>
                  <div class="field">
                    <label>Initial Password</label>
                    <input v-model="adminDraft.password" type="password" placeholder="••••••••" required />
                  </div>
                  <div class="field">
                    <label>System Role</label>
                    <select v-model="adminDraft.role">
                      <option value="Admin">Standard Admin</option>
                      <option value="SuperAdmin">Super Administrator</option>
                    </select>
                  </div>
                </div>

                <div v-if="adminError" class="error-banner">{{ adminError }}</div>

                <div class="form-footer">
                  <button type="submit" class="btn-primary">Create Administrator</button>
                </div>
              </form>
            </div>

            <!-- Admin List Table -->
            <div class="logbook-panel admins-list">
              <div class="log-table-container">
                <table class="log-table">
                  <thead>
                    <tr>
                      <th>Administrator</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="admin in adminList" :key="admin.id">
                      <td>
                        <div class="admin-cell">
                          <img src="/ITCPH_icon.png" class="mini-avatar" />
                          <strong>{{ admin.username }}</strong>
                        </div>
                      </td>
                      <td>{{ admin.email }}</td>
                      <td>
                        <span class="role-pill" :class="admin.role.toLowerCase()">{{ admin.role }}</span>
                      </td>
                      <td>{{ formatTimestamp(admin.createdAt) }}</td>
                      <td>
                        <button 
                          class="btn-text danger" 
                          title="Delete Admin"
                          @click="$emit('delete-admin', admin.id)"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                    <tr v-if="adminList.length === 0">
                      <td colspan="5" class="empty-regs">No other administrators found.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-family);
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

/* TRAINING MANAGEMENT */
.training-management-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.training-admin-card {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: white;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.training-admin-header {
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.training-admin-info h4 { font-size: 1.1rem; margin-bottom: 0.25rem; color: var(--primary); }
.venue-badge { font-size: 0.75rem; color: var(--text-soft); font-weight: 600; }

.training-admin-actions { display: flex; gap: 1rem; align-items: center; }
.view-regs-btn { color: var(--primary); font-size: 0.85rem; text-decoration: underline; }

.training-admin-body { padding: 1.25rem 1.5rem; }
.training-admin-body p { font-size: 0.9rem; color: var(--text-soft); line-height: 1.5; margin-bottom: 1.25rem; }

.training-admin-stats { display: flex; gap: 2.5rem; }
.admin-mini-stat { display: flex; flex-direction: column; gap: 0.25rem; }
.admin-mini-stat .mini-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; font-weight: 800; }
.admin-mini-stat .mini-val { font-size: 0.85rem; font-weight: 700; color: var(--text); }

/* REGISTRATIONS OVERLAY */
.registrations-overlay {
  position: absolute;
  inset: 0;
  background: white;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.registration-table-container { padding: 1.5rem; overflow-y: auto; flex: 1; }
.log-table.mini th { padding: 1rem; font-size: 0.75rem; }
.log-table.mini td { padding: 1rem; font-size: 0.85rem; }
.status-pill { background: #eef2ff; color: #4338ca; padding: 2px 8px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; }
.empty-regs { text-align: center; padding: 3rem; color: var(--text-soft); font-style: italic; }

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

/* ADMIN MANAGEMENT */
.admin-management-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.inline-form-container.admins {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.error-banner {
  background: #fef2f2;
  color: #ef4444;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.admin-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mini-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border);
}

.role-pill {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-pill.superadmin { background: #fff7ed; color: #c2410c; }
.role-pill.admin { background: #f0f9ff; color: #0369a1; }

.btn-text.danger { color: #ef4444; }
.btn-text.danger:hover { text-decoration: underline; }

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

/* DETAILED ANALYTICS */
.analytics-layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.analytics-box {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.analytics-box.full-width {
  grid-column: span 2;
}

.box-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: #f8fafc;
}

.box-header h4 {
  font-size: 1rem;
  color: var(--primary);
  font-weight: 700;
}

.box-content {
  padding: 1.5rem;
  flex: 1;
}

.box-content.demographics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.demo-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.chart-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-bar-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bar-label {
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 80px;
}

.bar-outer {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.bar-inner {
  height: 100%;
  background: var(--primary);
  border-radius: 4px;
}

.bar-inner.secondary { background: var(--secondary); }
.bar-inner.tertiary { background: var(--success); }

.bar-value {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-soft);
  min-width: 30px;
  text-align: right;
}

.analytics-table {
  width: 100%;
  border-collapse: collapse;
}

.analytics-table th {
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #94a3b8;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.analytics-table td {
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
}

.category-pill {
  font-size: 0.7rem;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 99px;
  font-weight: 700;
}

.training-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.training-summary-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  background: #fcfdfe;
}

.card-title {
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--primary);
}

.card-progress {
  margin-bottom: 1rem;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-soft);
}

.progress-bar-wrap {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
}

.rating-dist {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stars {
  color: #f59e0b;
  font-size: 0.85rem;
  min-width: 60px;
}

.rating-bar-wrap {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.rating-bar-fill {
  height: 100%;
  background: #f59e0b;
}

.rating-count {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-soft);
  min-width: 20px;
}

@media (max-width: 1100px) {
  .admin-layout { grid-template-columns: 80px 1fr; }
  .brand-info, .nav-label, .admin-profile .info, .logout-button { display: none; }
  .nav-item { justify-content: center; padding: 1rem; }
  .manager-layout { grid-template-columns: 1fr; }
}
</style>
