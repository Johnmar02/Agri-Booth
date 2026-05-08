<script setup>
/**
 * COMPONENT: TriviaModule
 * Extracted from ModuleDrawerView to isolate the Bebu Game (Trivia) logic and UI.
 */
const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
  triviaState: {
    type: Object,
    required: true,
  },
});

defineEmits(["trivia-answer", "trivia-next", "trivia-reset"]);
</script>

<template>
  <section class="body-section bebu-immersive-hud">
    <div class="bebu-header-meta">
      <div class="bebu-mission">
        <span class="section-label">Engagement Module</span>
        <h2>{{ module.title }}</h2>
        <p>{{ module.summary }}</p>
      </div>
      <div class="bebu-quick-stats">
        <div v-for="stat in module.quickStats" :key="stat.label" class="mini-stat">
          <span class="ms-lab">{{ stat.label }}</span>
          <span class="ms-val">{{ stat.value }}</span>
        </div>
      </div>
    </div>

    <div class="premium-trivia-v2 large-hud">
      <template v-if="triviaState.isComplete">
        <div class="trivia-end-screen-v2">
          <div class="trophy-v2">🏆</div>
          <h3>Session Complete</h3>
          <p class="score-v2">Performance: {{ Math.round((triviaState.score / triviaState.totalQuestions) * 100) }}%</p>
          
          <div v-if="triviaState.leaderboard && triviaState.leaderboard.length" class="leaderboard-v2">
            <h4>Top 10 Leaderboard</h4>
            <table class="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Visitor</th>
                  <th>Score</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in triviaState.leaderboard" :key="entry.rank">
                  <td>{{ entry.rank }}</td>
                  <td>{{ entry.visitor }}</td>
                  <td>{{ entry.score }}/{{ entry.total }} ({{ entry.percentage }}%)</td>
                  <td>{{ entry.timeTaken }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button class="prime-action-btn reset-btn" @click="$emit('trivia-reset')">Begin New Session</button>
        </div>
      </template>

      <template v-else-if="triviaState.question">
        <div class="trivia-hud-v2">
          <div class="hud-item-v2">
            <span class="hud-label-v2">Progress</span>
            <div class="hud-progress-v2">
              <div class="hud-fill-v2" :style="{ width: (triviaState.currentIndex / triviaState.totalQuestions) * 100 + '%' }"></div>
            </div>
            <span class="hud-sub-label">{{ triviaState.currentIndex }} of {{ triviaState.totalQuestions }}</span>
          </div>
          <div class="hud-item-v2 score-hud">
            <span class="hud-label-v2">Current Score</span>
            <span class="hud-val-v2">{{ triviaState.score * 100 }} <small>XP</small></span>
          </div>
        </div>

        <div class="trivia-main-stage">
          <div class="question-container">
            <span class="q-difficulty" :class="triviaState.question.difficulty?.toLowerCase()">{{ triviaState.question.difficulty }} Level</span>
            <p class="question-v2">{{ triviaState.question.prompt }}</p>
          </div>

          <div class="options-v2 grid-2x2">
            <button
              v-for="option in triviaState.question.options"
              :key="option.id"
              class="option-btn-v2"
              :class="{
                'is-correct': triviaState.hasAnswered && option.id === triviaState.question.correctOptionId,
                'is-incorrect': triviaState.hasAnswered && triviaState.selectedOptionId === option.id && option.id !== triviaState.question.correctOptionId
              }"
              :disabled="triviaState.hasAnswered"
              @click="$emit('trivia-answer', option.id)"
            >
              <span class="opt-prefix-v2">{{ option.id.toUpperCase() }}</span>
              <span class="opt-text-v2">{{ option.label }}</span>
            </button>
          </div>

          <Transition name="fade-up">
            <div v-if="triviaState.hasAnswered" class="explanation-v2 hud-style">
              <div class="exp-content">
                <strong>{{ triviaState.question.correctOptionId.toUpperCase() === triviaState.selectedOptionId.toUpperCase() ? '✓ Correct Answer!' : '× Knowledge Check' }}</strong>
                <p>{{ triviaState.question.explanation }}</p>
              </div>
              <button class="prime-action-btn next-v2" @click="$emit('trivia-next')">Next Question ➔</button>
            </div>
          </Transition>
        </div>
      </template>

      <div v-else-if="triviaState.isLoading" class="bebu-loading">
        <div class="spinner"></div>
        <p>Initializing your knowledge session...</p>
      </div>
    </div>

    <div class="bebu-footer-benefits">
      <h3 class="mini-label">Core Learning Benefits</h3>
      <div class="benefits-grid">
        <div v-for="point in module.highlights" :key="point" class="benefit-tag">
          <span class="check">✓</span> {{ point }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.body-section { margin-bottom: 3rem; }
.section-label { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #1a6ab4; border-left: 4px solid #d17c24; padding-left: 12px; margin-bottom: 1.5rem; display: block; }
.prime-action-btn { background: #1a6ab4; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
.prime-action-btn:hover { background: #124d85; }

/* Bebu Game Immersive HUD */
.bebu-header-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1.5rem;
}
.bebu-quick-stats {
  display: flex;
  gap: 2rem;
}
.mini-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.ms-lab { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; }
.ms-val { font-size: 1.2rem; font-weight: 800; color: #1a6ab4; }

.premium-trivia-v2 {
  background: #0a1912;
  border-radius: 32px;
  padding: 3rem;
  color: white;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}
.trivia-hud-v2 {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
}
.hud-item-v2 {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.hud-label-v2 { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #4ade80; }
.hud-progress-v2 { width: 200px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 99px; }
.hud-fill-v2 { height: 100%; background: #4ade80; border-radius: 99px; transition: width 0.3s ease; }
.hud-val-v2 { font-size: 1.8rem; font-weight: 900; }

.question-v2 {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 3rem;
}
.grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.option-btn-v2 {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 1.5rem;
  border-radius: 20px;
  color: white;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.option-btn-v2:hover { background: rgba(255,255,255,0.1); }
.option-btn-v2.is-correct { background: #059669; border-color: #34d399; }
.option-btn-v2.is-incorrect { background: #dc2626; border-color: #f87171; }
.opt-prefix-v2 { font-weight: 900; opacity: 0.5; font-size: 1.2rem; }
.opt-text-v2 { font-weight: 700; font-size: 1.1rem; }

.explanation-v2 {
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(255,255,255,0.05);
  border-radius: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}
.exp-content { flex: 1; }
.exp-content strong { color: #4ade80; font-size: 1.2rem; display: block; margin-bottom: 0.5rem; }

.bebu-footer-benefits { margin-top: 2rem; }
.mini-label { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 1rem; }
.benefits-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
.benefit-tag { font-size: 0.9rem; color: #475569; display: flex; align-items: center; gap: 0.5rem; }
.check { color: #10b981; font-weight: bold; }

.bebu-loading { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: #94a3b8; }
.spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #4ade80; border-radius: 50%; animation: spin 1s infinite linear; }
@keyframes spin { to { transform: rotate(360deg); } }

.leaderboard-v2 { margin: 2rem 0; background: rgba(255,255,255,0.05); border-radius: 16px; padding: 1.5rem; }
.leaderboard-table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.9rem; }
.leaderboard-table th { text-align: left; padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8; }
.leaderboard-table td { padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); }

.fade-up-enter-active, .fade-up-leave-active { transition: all 0.3s ease; }
.fade-up-enter-from, .fade-up-leave-to { opacity: 0; transform: translateY(10px); }
</style>
