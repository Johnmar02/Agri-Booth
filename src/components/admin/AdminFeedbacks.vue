<script setup>
/**
 * COMPONENT: AdminFeedbacks
 * Displays a list of visitor feedback submissions.
 */
const props = defineProps({
  feedbacksList: {
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
  <section class="section-container feedbacks-section">
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
.stars-val { color: #f59e0b; font-size: 1.1rem; }
.msg-cell { max-width: 400px; line-height: 1.5; }
.empty-state { text-align: center; padding: 4rem 2rem; }
.empty-state p { font-weight: 700; margin-bottom: 0.25rem; }
.empty-state span { font-size: 0.875rem; color: var(--text-soft); }
</style>
