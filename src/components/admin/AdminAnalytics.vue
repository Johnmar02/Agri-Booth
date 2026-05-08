<script setup>
/**
 * COMPONENT: AdminAnalytics
 * Visualizations and charts for detailed booth performance.
 */
const props = defineProps({
  analytics: {
    type: Object,
    required: true,
  },
  detailedAnalytics: {
    type: Object,
    required: true,
  },
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
  <section class="section-container analytics-section">
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
</template>

<style scoped>
.section-container { padding: 2.5rem; }
.analytics-header { margin-bottom: 2rem; }
.title-area h3 { font-size: 1.75rem; font-weight: 800; color: var(--primary); margin-bottom: 0.25rem; }
.title-area p { color: var(--text-soft); font-size: 1rem; }

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

.analytics-box.full-width { grid-column: span 2; }
.box-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); background: #f8fafc; }
.box-header h4 { font-size: 1rem; color: var(--primary); font-weight: 700; }
.box-content { padding: 1.5rem; flex: 1; }
.box-content.demographics { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.demo-group label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 1rem; }
.chart-list { display: flex; flex-direction: column; gap: 1rem; }
.chart-bar-row { display: flex; align-items: center; gap: 1rem; }
.bar-label { font-size: 0.85rem; font-weight: 600; min-width: 80px; }
.bar-outer { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
.bar-inner { height: 100%; background: var(--primary); border-radius: 4px; }
.bar-inner.secondary { background: var(--secondary); }
.bar-inner.tertiary { background: var(--success); }
.bar-value { font-size: 0.85rem; font-weight: 800; color: var(--text-soft); min-width: 30px; text-align: right; }
.analytics-table { width: 100%; border-collapse: collapse; }
.analytics-table th { text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
.analytics-table td { padding: 1rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
.category-pill { font-size: 0.7rem; background: #f1f5f9; padding: 2px 8px; border-radius: 99px; font-weight: 700; }
.training-summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
.training-summary-card { border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; background: #fcfdfe; }
.card-title { font-weight: 700; margin-bottom: 1rem; color: var(--primary); }
.card-progress { margin-bottom: 1rem; }
.progress-labels { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-soft); }
.progress-bar-wrap { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
.card-meta { display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: #94a3b8; }
.rating-dist { display: flex; flex-direction: column; gap: 0.75rem; }
.rating-row { display: flex; align-items: center; gap: 1rem; }
.stars { color: #f59e0b; font-size: 0.85rem; min-width: 60px; }
.rating-bar-wrap { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
.rating-bar-fill { height: 100%; background: #f59e0b; }
.rating-count { font-size: 0.85rem; font-weight: 700; color: var(--text-soft); min-width: 20px; }
.empty-table { text-align: center; padding: 2rem; color: var(--text-soft); font-style: italic; }
</style>
