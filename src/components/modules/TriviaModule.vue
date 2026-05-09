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
            <div class="leaderboard-scroll">
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
                    <td><span class="rank-badge">{{ entry.rank }}</span></td>
                    <td><strong>{{ entry.visitor }}</strong></td>
                    <td>{{ entry.score }}/{{ entry.total }}</td>
                    <td>{{ entry.timeTaken }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
                <strong :class="triviaState.question.correctOptionId.toUpperCase() === triviaState.selectedOptionId.toUpperCase() ? 'text-success' : 'text-warning'">
                  {{ triviaState.question.correctOptionId.toUpperCase() === triviaState.selectedOptionId.toUpperCase() ? '✓ Correct Answer!' : '× Knowledge Check' }}
                </strong>
                <p>{{ triviaState.question.explanation }}</p>
              </div>
              <button class="prime-action-btn next-v2" @click="$emit('trivia-next')">Next Question</button>
            </div>
          </Transition>
        </div>
      </template>

      <div v-else-if="triviaState.isLoading" class="bebu-loading">
        <div class="spinner"></div>
        <p>Initializing your knowledge session...</p>
      </div>

      <div v-else-if="triviaState.error" class="bebu-loading bebu-error">
        <span class="error-icon">⚠️</span>
        <p>{{ triviaState.error }}</p>
        <button class="prime-action-btn reset-btn" @click="$emit('trivia-reset')">Try Again</button>
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
  background: #ffffff;
  border-radius: 32px;
  padding: 3rem;
  color: #1e293b;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(26, 106, 180, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
}
.trivia-hud-v2 {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  padding-bottom: 1.5rem;
  border-bottom: 1.5px solid #f1f5f9;
}
.hud-item-v2 {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.hud-label-v2 { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
.hud-progress-v2 { width: 200px; height: 10px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
.hud-fill-v2 { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 99px; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.hud-sub-label { font-size: 0.8rem; font-weight: 700; color: #1a6ab4; }
.hud-val-v2 { font-size: 1.8rem; font-weight: 900; color: #1a6ab4; }

.question-container { margin-bottom: 2.5rem; }
.q-difficulty { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; margin-bottom: 1rem; display: inline-block; }
.q-difficulty.easy { background: #dcfce7; color: #166534; }
.q-difficulty.medium { background: #fef9c3; color: #854d0e; }
.q-difficulty.hard { background: #fee2e2; color: #991b1b; }

.question-v2 {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.4;
  color: #0f172a;
}
.grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}
.option-btn-v2 {
  background: #f8fafc;
  border: 2px solid #f1f5f9;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  color: #334155;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.option-btn-v2:hover:not(:disabled) { 
  background: #ffffff;
  border-color: #1a6ab4;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(26, 106, 180, 0.1);
}
.option-btn-v2.is-correct { background: #ecfdf5; border-color: #10b981; color: #065f46; box-shadow: none; }
.option-btn-v2.is-incorrect { background: #fef2f2; border-color: #ef4444; color: #991b1b; box-shadow: none; }
.opt-prefix-v2 { font-weight: 900; color: #94a3b8; font-size: 1rem; }
.option-btn-v2.is-correct .opt-prefix-v2 { color: #10b981; }
.option-btn-v2.is-incorrect .opt-prefix-v2 { color: #ef4444; }
.opt-text-v2 { font-weight: 700; font-size: 1.05rem; }

.explanation-v2 {
  margin-top: 2.5rem;
  padding: 1.5rem 2rem;
  background: #f1f5f9;
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  border: 1px solid #e2e8f0;
}
.exp-content { flex: 1; }
.exp-content strong { font-size: 1.1rem; display: block; margin-bottom: 0.4rem; }
.text-success { color: #059669; }
.text-warning { color: #d97706; }
.exp-content p { font-size: 0.95rem; color: #475569; line-height: 1.5; margin: 0; }
.next-v2 { padding: 0.8rem 1.5rem; background: #1a6ab4; box-shadow: 0 4px 12px rgba(26, 106, 180, 0.3); }

/* End Screen Centering */
.trivia-end-screen-v2 {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}
.trophy-v2 { font-size: 5rem; margin-bottom: 1.5rem; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1)); }
.trivia-end-screen-v2 h3 { font-size: 2rem; font-weight: 900; color: #1e293b; margin-bottom: 1rem; }
.score-v2 { font-size: 1.25rem; font-weight: 700; color: #1a6ab4; margin-bottom: 2rem; background: #eef2ff; padding: 0.6rem 1.5rem; border-radius: 99px; }

.leaderboard-v2 { width: 100%; max-width: 500px; margin: 2rem 0; background: #f8fafc; border-radius: 20px; padding: 2rem; border: 1px solid #e2e8f0; }
.leaderboard-scroll { max-height: 300px; overflow-y: auto; margin-top: 1rem; padding-right: 0.5rem; }
.leaderboard-v2 h4 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #1e293b; }
.leaderboard-table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.95rem; }
.leaderboard-table th { text-align: left; padding: 0.8rem; border-bottom: 2px solid #e2e8f0; color: #64748b; font-weight: 800; text-transform: uppercase; font-size: 0.75rem; }
.leaderboard-table td { padding: 1rem 0.8rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
.rank-badge { background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 6px; font-weight: 800; font-size: 0.8rem; }
tr:nth-child(1) .rank-badge { background: #fef3c7; color: #92400e; }
tr:nth-child(2) .rank-badge { background: #f1f5f9; color: #475569; }
tr:nth-child(3) .rank-badge { background: #fff7ed; color: #9a3412; }

.reset-btn { margin-top: 2rem; padding: 1rem 2.5rem; font-size: 1.1rem; border-radius: 14px; background: #d17c24; box-shadow: 0 10px 20px rgba(209, 124, 36, 0.2); }
.reset-btn:hover { background: #b56a1d; transform: translateY(-2px); }

.bebu-loading { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; color: #64748b; }
.spinner { width: 50px; height: 50px; border: 5px solid #f1f5f9; border-top-color: #1a6ab4; border-radius: 50%; animation: spin 1s infinite linear; }
.bebu-error .error-icon { font-size: 4rem; margin-bottom: 1rem; }
.bebu-error p { color: #ef4444; font-weight: 700; margin-bottom: 2rem; }

@keyframes spin { to { transform: rotate(360deg); } }

.bebu-footer-benefits { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e2e8f0; }
.mini-label { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 1rem; }
.benefits-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
.benefit-tag { font-size: 0.95rem; color: #475569; display: flex; align-items: center; gap: 0.6rem; background: #f8fafc; padding: 0.75rem 1rem; border-radius: 12px; }
.check { color: #10b981; font-weight: bold; }

.fade-up-enter-active, .fade-up-leave-active { transition: all 0.3s ease; }
.fade-up-enter-from, .fade-up-leave-to { opacity: 0; transform: translateY(10px); }

@media (max-width: 800px) {
  .grid-2x2 { grid-template-columns: 1fr; }
  .premium-trivia-v2 { padding: 2rem; }
  .question-v2 { font-size: 1.5rem; }
  .explanation-v2 { flex-direction: column; text-align: center; }
}
</style>
