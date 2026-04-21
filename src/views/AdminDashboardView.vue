<script setup>
/**
 * VIEW: AdminDashboardView
 * The management portal for the ITCPH Digital Agri-Booth.
 */
import { ref } from "vue";

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

const selectedModuleId = ref(props.modules[1]?.id || ""); // Default to IEC Materials
</script>

<template>
  <main class="admin-dashboard">
    <div class="admin-dashboard__inner">
      <header class="admin-dashboard__header">
        <div class="brand">
          <span class="staff-badge">Staff Mode</span>
          <h1>Ecosystem Management</h1>
        </div>
        <div class="header-actions">
          <button class="btn btn--secondary" @click="$emit('close-dashboard')">
            Return to Booth
          </button>
          <button class="btn btn--logout" @click="$emit('logout')">
            Logout
          </button>
        </div>
      </header>

      <!-- Analytics Section -->
      <section class="admin-dashboard__analytics">
        <article class="hero-stat">
          <p class="hero-stat__label">Total Registrations</p>
          <p class="hero-stat__value">{{ analytics.totalVisitors }}</p>
          <small>Verified Virtual Logbook entries</small>
        </article>
        <article class="hero-stat">
          <p class="hero-stat__label">Resource Engagement</p>
          <p class="hero-stat__value">{{ analytics.totalDownloads }}</p>
          <small>Collected IEC & Newsletter materials</small>
        </article>
        <article class="hero-stat">
          <p class="hero-stat__label">Hottest Hotspot</p>
          <p class="hero-stat__value hero-stat__value--text">
            {{ analytics.popularModule }}
          </p>
          <small>Most interacted booth zone</small>
        </article>
      </section>

      <div class="admin-dashboard__grid">
        <!-- Content Management -->
        <section class="manage-card">
          <header class="manage-card__header">
            <h3>Downloadable Resource Catalog</h3>
            <button class="btn btn--primary" @click="$emit('start-add')">
              + Add New Material
            </button>
          </header>

          <div class="module-tabs">
            <button
              v-for="module in modules.filter((m) => m.resources)"
              :key="module.id"
              class="tab-btn"
              :class="{ 'tab-btn--active': selectedModuleId === module.id }"
              @click="selectedModuleId = module.id"
            >
              {{ module.title }}
            </button>
          </div>

          <div class="resource-table-wrapper">
            <table class="resource-table">
              <thead>
                <tr>
                  <th>Resource Title</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="resource in modules.find(
                    (m) => m.id === selectedModuleId,
                  )?.resources"
                  :key="resource.id"
                >
                  <td>
                    <div class="title-cell">
                      <strong>{{ resource.title }}</strong>
                      <p>{{ resource.description }}</p>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge--format">{{
                      resource.format
                    }}</span>
                  </td>
                  <td>
                    <span class="badge badge--status">{{
                      resource.status
                    }}</span>
                  </td>
                  <td>
                    <button
                      class="btn--icon"
                      @click="
                        $emit('delete-resource', {
                          moduleId: selectedModuleId,
                          resourceId: resource.id,
                        })
                      "
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Visitor Log Feed -->
        <aside class="manage-card">
          <header class="manage-card__header">
            <h3>Recent Logbook Activity</h3>
          </header>
          <div class="log-feed">
            <article
              v-for="log in visitorLogs.slice().reverse()"
              :key="log.submittedAt"
              class="log-entry"
            >
              <div class="log-entry__meta">
                <strong>{{ log.name }}</strong>
                <span>{{
                  new Date(log.submittedAt).toLocaleTimeString()
                }}</span>
              </div>
              <p>{{ log.affiliations }} • {{ log.clientType }}</p>
              <div class="log-entry__items">
                <span
                  v-for="item in log.itemsCollected"
                  :key="item"
                  class="item-chip"
                  >{{ item }}</span
                >
              </div>
            </article>
            <div v-if="!visitorLogs.length" class="empty-state">
              No registration data has been captured in this session yet.
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Upload Modal -->
    <Transition name="fade">
      <div
        v-if="isAddingResource"
        class="modal-overlay"
        @click.self="$emit('cancel-add')"
      >
        <div class="upload-modal">
          <h2>Upload Material</h2>
          <p>
            The new resource will be instantly available in the
            <strong>{{
              modules.find((m) => m.id === selectedModuleId)?.title
            }}</strong>
            section for all visitors.
          </p>

          <form
            class="upload-form"
            @submit.prevent="$emit('commit-resource', selectedModuleId)"
          >
            <div class="field">
              <label>Material Title</label>
              <input
                type="text"
                placeholder="e.g., Swine Biosecurity Guide"
                :value="resourceDraft.title"
                @input="$emit('update-draft', { title: $event.target.value })"
                required
              />
            </div>
            <div class="field">
              <label>Description / Summary</label>
              <textarea
                rows="3"
                placeholder="Provide a brief explanation of what this material contains."
                :value="resourceDraft.description"
                @input="
                  $emit('update-draft', { description: $event.target.value })
                "
                required
              ></textarea>
            </div>
            <div class="field">
              <label>Select Digital File</label>
              <div class="file-drop-zone">
                <input
                  type="file"
                  id="admin-file-input"
                  class="hidden-file-input"
                  @change="$emit('update-draft', { file: $event.target.files[0] })"
                />
                <label for="admin-file-input" class="file-picker-btn">
                  {{ resourceDraft.file ? resourceDraft.file.name : 'Choose PDF, Video, or Image...' }}
                </label>
                <progress v-if="uploadProgress > 0" :value="uploadProgress" max="100" class="upload-progress-bar"></progress>
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label>Format</label>
                <select
                  :value="resourceDraft.format"
                  @change="
                    $emit('update-draft', { format: $event.target.value })
                  "
                >
                  <option>PDF</option>
                  <option>Video</option>
                  <option>Infographic</option>
                  <option>Interactive</option>
                </select>
              </div>
              <div class="field">
                <label>Initial Status</label>
                <select
                  :value="resourceDraft.status"
                  @change="
                    $emit('update-draft', { status: $event.target.value })
                  "
                >
                  <option>Ready</option>
                  <option>Draft</option>
                  <option>Review</option>
                </select>
              </div>
            </div>
            <div class="modal-actions">
              <button
                type="button"
                class="btn btn--secondary"
                @click="$emit('cancel-add')"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn--primary">
                Add to Catalog
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.admin-dashboard {
  position: absolute;
  inset: 0;
  z-index: 50;
  background-color: #f8f9fa;
  background-image:
    radial-gradient(at 0% 0%, rgba(26, 106, 180, 0.05) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(209, 124, 36, 0.05) 0px, transparent 50%);
  padding: 2rem;
  overflow-y: auto;
  color: #333;
}

.admin-dashboard__inner {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  gap: 2rem;
}

.admin-dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.staff-badge {
  background: #1a6ab4;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.admin-dashboard__header h1 {
  margin: 0.5rem 0 0;
  font-family: var(--font-display);
  font-size: 2.2rem;
  color: #1a6ab4;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

/* Analytics */
.admin-dashboard__analytics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.hero-stat {
  background: white;
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.hero-stat__label {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 0.05em;
}

.hero-stat__value {
  margin: 0.5rem 0;
  font-size: 3rem;
  font-weight: 900;
  color: #1a6ab4;
  line-height: 1;
}

.hero-stat__value--text {
  font-size: 1.5rem;
  letter-spacing: -0.01em;
  padding: 0.5rem 0;
}

.hero-stat small {
  color: #999;
}

/* Grid Layout */
.admin-dashboard__grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
}

.manage-card {
  background: white;
  border-radius: 28px;
  padding: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.manage-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.manage-card__header h3 {
  margin: 0;
  font-size: 1.4rem;
  color: #1a6ab4;
}

/* Tabs */
.module-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.tab-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  border: 0;
  background: transparent;
  color: #666;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover:not(.tab-btn--active) {
  background: rgba(26, 106, 180, 0.05);
}

.tab-btn--active {
  background: rgba(26, 106, 180, 0.1);
  color: #1a6ab4;
}

/* Table */
.resource-table-wrapper {
  overflow-x: auto;
}

.resource-table {
  width: 100%;
  border-collapse: collapse;
}

.resource-table th {
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid #f8f9fa;
  color: #999;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.resource-table td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f8f9fa;
}

.title-cell strong {
  display: block;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.title-cell p {
  margin: 0;
  font-size: 0.85rem;
  color: #777;
  max-width: 400px;
}

.badge {
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
}

.badge--format {
  background: #eef5fc;
  color: #1a6ab4;
}
.badge--status {
  background: #fff4e6;
  color: #d17c24;
}

/* Log Feed */
.log-feed {
  display: grid;
  gap: 1rem;
  overflow-y: auto;
  max-height: 600px;
}

.log-entry {
  padding: 1.25rem;
  border-radius: 18px;
  background: #fcfcfc;
  border: 1px solid #f0f0f0;
}

.log-entry__meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.log-entry__meta span {
  font-size: 0.75rem;
  color: #aaa;
}

.log-entry p {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}

.log-entry__items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.item-chip {
  background: white;
  border: 1px solid #eee;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  color: #888;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
  font-style: italic;
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 110;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 1.5rem;
}

.upload-modal {
  width: 100%;
  max-width: 500px;
  background: white;
  padding: 2.5rem;
  border-radius: 32px;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.2);
}

.upload-modal h2 {
  margin: 0;
  font-family: var(--font-display);
  color: #1a6ab4;
}

.upload-modal p {
  margin: 0.75rem 0 2rem;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
}

.upload-form {
  display: grid;
  gap: 1.25rem;
}

.field {
  display: grid;
  gap: 0.5rem;
}

.field label {
  font-weight: 800;
  font-size: 0.8rem;
  color: #1a6ab4;
}

.field input,
.field textarea,
.field select {
  padding: 0.85rem;
  border-radius: 12px;
  border: 1px solid #ddd;
  font-family: inherit;
}

.file-drop-zone {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hidden-file-input {
  display: none;
}

.file-picker-btn {
  display: block;
  padding: 2.5rem 1.5rem;
  border: 2px dashed #1a6ab4;
  border-radius: 16px;
  background: #f0f7ff;
  color: #1a6ab4;
  text-align: center;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-picker-btn:hover {
  background: #e1effe;
  border-color: #124d85;
}

.upload-progress-bar {
  width: 100%;
  height: 10px;
  border-radius: 99px;
  overflow: hidden;
  accent-color: #1a6ab4;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

/* Common Buttons */
.btn {
  padding: 0.8rem 1.4rem;
  border-radius: 14px;
  font-weight: 800;
  cursor: pointer;
  border: 0;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}
.btn:active {
  transform: scale(0.96);
}

.btn--primary {
  background: linear-gradient(135deg, #1a6ab4, #124d85);
  color: white;
}

.btn--primary:hover {
  box-shadow: 0 8px 20px rgba(26, 106, 180, 0.3);
}

.btn--secondary {
  background: rgba(0, 0, 0, 0.05);
  color: #666;
}

.btn--secondary:hover {
  background: rgba(0, 0, 0, 0.1);
}

.btn--logout {
  background: #fff0f0;
  color: #c53030;
}

.btn--logout:hover {
  background: #ffe6e6;
}

.btn--icon {
  background: transparent;
  border: 0;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn--icon:hover {
  background: #fff5f5;
  transform: scale(1.1);
}

.btn--icon:active {
  transform: scale(0.95);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .admin-dashboard {
    padding: 1.5rem;
  }

  .admin-dashboard__inner {
    gap: 1.5rem;
  }

  .admin-dashboard__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    flex: 1;
  }
}

@media (max-width: 1100px) {
  .admin-dashboard__grid {
    grid-template-columns: 1fr;
  }

  .admin-dashboard__analytics {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }

  .admin-dashboard__inner {
    gap: 1rem;
  }

  .admin-dashboard__header h1 {
    font-size: 1.5rem;
  }

  .admin-dashboard__analytics {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .hero-stat {
    padding: 1rem;
  }

  .hero-stat__value {
    font-size: 2rem;
  }

  .manage-card {
    padding: 1rem;
  }

  .manage-card__header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .manage-card__header h3 {
    font-size: 1.1rem;
  }

  .module-tabs {
    gap: 0.3rem;
    flex-wrap: wrap;
  }

  .tab-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .resource-table {
    font-size: 0.85rem;
  }

  .resource-table th,
  .resource-table td {
    padding: 0.75rem 0.5rem;
  }

  .title-cell strong {
    font-size: 0.9rem;
  }

  .title-cell p {
    display: none;
  }

  .log-feed {
    max-height: 400px;
  }

  .log-entry {
    padding: 0.75rem;
  }

  .upload-modal {
    padding: 1.5rem;
  }

  .upload-modal h2 {
    font-size: 1.2rem;
  }

  .field-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .header-actions .btn {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .admin-dashboard {
    padding: 0.75rem;
  }

  .admin-dashboard__header {
    flex-direction: column;
  }

  .admin-dashboard__header h1 {
    font-size: 1.3rem;
  }

  .staff-badge {
    padding: 0.2rem 0.5rem;
    font-size: 0.65rem;
  }

  .manage-card {
    padding: 0.75rem;
  }

  .manage-card__header {
    flex-direction: column;
  }

  .btn {
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }

  .btn--primary {
    width: 100%;
  }

  .resource-table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .resource-table {
    min-width: 100%;
    font-size: 0.8rem;
  }

  .badge {
    font-size: 0.65rem;
    padding: 0.25rem 0.5rem;
  }

  .upload-modal {
    max-width: 100%;
    padding: 1rem;
  }

  .upload-form {
    gap: 1rem;
  }

  .field label {
    font-size: 0.75rem;
  }
}
</style>
