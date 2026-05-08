<script setup>
import { ref } from 'vue';
/**
 * COMPONENT: AdminUsersManagement
 * Interface for adding and removing administrators.
 */
const props = defineProps({
  adminList: {
    type: Array,
    required: true,
  }
});

const emit = defineEmits(['create-admin', 'delete-admin']);

const isAddingAdmin = ref(false);
const adminDraft = ref({
  username: "",
  password: "",
  email: "",
  role: "Admin",
});
const adminError = ref("");

const startAddAdmin = () => {
  adminDraft.value = { username: "", password: "", email: "", role: "Admin" };
  adminError.value = "";
  isAddingAdmin.value = true;
};

const commitAdmin = async () => {
  adminError.value = "";
  // In the real implementation, the parent handles the API call and returns a boolean/result
  const result = await emit("create-admin", adminDraft.value);
  // Note: This logic assumes the parent emit is handled as a promise if needed.
  // For simplicity in refactoring, we'll keep the draft management here.
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
</script>

<template>
  <section class="section-container">
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
</template>

<style scoped>
.section-container { padding: 2.5rem; }
.panel-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.panel-info h3 { font-size: 1.25rem; }
.panel-info p { font-size: 0.875rem; color: var(--text-soft); }

.admin-management-content { display: flex; flex-direction: column; gap: 2rem; }
.inline-form-container.admins { background: white; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.upload-form { padding: 1.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.field label { display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem; text-transform: uppercase; color: var(--text-soft); }
.field input, .field select { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; font-family: inherit; }
.form-footer { margin-top: 1.5rem; display: flex; justify-content: flex-end; }
.error-banner { background: #fef2f2; color: #ef4444; padding: 0.75rem 1rem; border-radius: 8px; margin-top: 1rem; font-size: 0.85rem; font-weight: 600; }

.logbook-panel { background: var(--white); border-radius: 24px; border: 1px solid rgba(26, 106, 180, 0.1); box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08); overflow: hidden; padding: 1rem; }
.log-table-container { overflow-x: auto; border-radius: 16px; }
.log-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
.log-table th { padding: 1.25rem 1.5rem; background: #f1f5f9; font-size: 0.8rem; text-transform: uppercase; color: var(--primary); font-weight: 800; letter-spacing: 0.05em; border-bottom: 2px solid var(--border); }
.log-table td { padding: 1.5rem; border-bottom: 1px solid var(--border); font-size: 0.95rem; color: var(--text); vertical-align: middle; }

.admin-cell { display: flex; align-items: center; gap: 0.75rem; }
.mini-avatar { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border); }
.role-pill { font-size: 0.7rem; font-weight: 800; padding: 3px 10px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.05em; }
.role-pill.superadmin { background: #fff7ed; color: #c2410c; }
.role-pill.admin { background: #f0f9ff; color: #0369a1; }
.btn-text.danger { color: #ef4444; cursor: pointer; background: none; border: none; font-weight: 600; }
.btn-text.danger:hover { text-decoration: underline; }
.btn-primary { background: var(--primary); color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-text { background: none; border: none; font-weight: 600; color: var(--text-soft); cursor: pointer; }
.empty-regs { text-align: center; padding: 3rem; color: var(--text-soft); font-style: italic; }
</style>
