<script setup>
/**
 * COMPONENT: AdminLogbook
 * Detailed record of visitor registrations and interactions.
 */
const props = defineProps({
  visitorLogs: {
    type: Array,
    required: true,
  }
});

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
  <section class="section-container logbook-section">
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
</template>

<style scoped>
.section-container { padding: 2.5rem; }
.logbook-outer-container { width: 100%; display: flex; flex-direction: column; gap: 1.5rem; }
.logbook-header { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 1rem; }
.title-area h3 { font-size: 1.75rem; font-weight: 800; color: var(--primary); margin-bottom: 0.25rem; }
.title-area p { color: var(--text-soft); font-size: 1rem; }
.count-badge { background: var(--secondary); color: white; padding: 0.5rem 1.25rem; border-radius: 99px; font-weight: 700; font-size: 0.9rem; }

.logbook-panel {
  background: var(--white);
  border-radius: 24px;
  border: 1px solid rgba(26, 106, 180, 0.1);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  padding: 1rem;
}

.log-table-container { overflow-x: auto; border-radius: 16px; }
.log-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
.log-table th { padding: 1.25rem 1.5rem; background: #f1f5f9; font-size: 0.8rem; text-transform: uppercase; color: var(--primary); font-weight: 800; letter-spacing: 0.05em; border-bottom: 2px solid var(--border); }
.log-table td { padding: 1.5rem; border-bottom: 1px solid var(--border); font-size: 0.95rem; color: var(--text); vertical-align: middle; }
.log-table tr:hover td { background: #f8fafc; }
.id-badge { background: #f1f5f9; color: var(--text-soft); padding: 0.3rem 0.6rem; border-radius: 6px; font-family: monospace; font-weight: 700; font-size: 0.9rem; }
.collection-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.tag { background: rgba(26, 106, 180, 0.1); color: var(--primary); padding: 0.3rem 0.7rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.empty-state { text-align: center; padding: 4rem 2rem; }
.empty-state p { font-weight: 700; margin-bottom: 0.25rem; }
.empty-state span { font-size: 0.875rem; color: var(--text-soft); }
</style>
