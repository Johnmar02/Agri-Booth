import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '@/services/apiClient';
import { useVisitorStore } from './visitor';

export const useBebuGameStore = defineStore('bebuGame', () => {
  const visitorStore = useVisitorStore();
  
  const currentSessionId = ref(null);
  const questions = ref([]);
  const currentQuestionIndex = ref(0);
  const score = ref(0);
  const isGameOver = ref(false);
  const leaderboard = ref([]);
  const history = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
  const progress = computed(() => {
    if (questions.value.length === 0) return 0;
    return ((currentQuestionIndex.value + 1) / questions.value.length) * 100;
  });

  const hasAnswered = ref(false);
  const selectedOptionId = ref('');
  const lastResult = ref(null);

  async function startGame(questionCount = 10) {
    if (!visitorStore.visitorId) {
      error.value = "Visitor not registered.";
      return;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const response = await apiClient.startGameSession(visitorStore.visitorId, questionCount);
      if (response.ok) {
        currentSessionId.value = response.gameSessionId;
        questions.value = response.questions.map(q => ({
          id: q.id,
          prompt: q.question,
          options: [
            { id: 'a', label: q.optionA },
            { id: 'b', label: q.optionB },
            { id: 'c', label: q.optionC },
            { id: 'd', label: q.optionD }
          ],
          category: q.category,
          difficulty: q.difficulty
        }));
        currentQuestionIndex.value = 0;
        score.value = 0;
        isGameOver.value = false;
        hasAnswered.value = false;
        selectedOptionId.value = '';
      } else {
        error.value = response.message || "Failed to start game.";
      }
    } catch (e) {
      error.value = "Connection error.";
    } finally {
      isLoading.value = false;
    }
  }

  async function submitAnswer(answerGiven) {
    if (isGameOver.value || !currentQuestion.value || hasAnswered.value) return;

    isLoading.value = true;
    selectedOptionId.value = answerGiven;
    try {
      const response = await apiClient.submitAnswer({
        gameSessionId: currentSessionId.value,
        questionId: currentQuestion.value.id,
        answerGiven: answerGiven
      });

      if (response.ok) {
        hasAnswered.value = true;
        lastResult.value = response;
        if (response.isCorrect) {
          score.value = response.currentScore;
        }
        return response;
      } else {
        error.value = response.message;
      }
    } catch (e) {
      error.value = "Failed to submit answer.";
    } finally {
      isLoading.value = false;
    }
  }

  async function nextQuestion() {
    if (!hasAnswered.value) return;

    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++;
      hasAnswered.value = false;
      selectedOptionId.value = '';
      lastResult.value = null;
    } else {
      await finishGame();
    }
  }

  async function finishGame() {
    if (!currentSessionId.value) return;

    isLoading.value = true;
    try {
      const response = await apiClient.finishGame(currentSessionId.value);
      if (response.ok) {
        isGameOver.value = true;
        fetchLeaderboard();
        fetchHistory();
      }
    } catch (e) {
      error.value = "Failed to finish game.";
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchLeaderboard() {
    try {
      const response = await apiClient.getLeaderboard();
      if (response.ok) {
        leaderboard.value = response;
      }
    } catch (e) {
      console.error("Failed to fetch leaderboard");
    }
  }

  async function fetchHistory() {
    if (!visitorStore.visitorId) return;
    try {
      const response = await apiClient.getGameHistory(visitorStore.visitorId);
      if (response.ok) {
        history.value = response;
      }
    } catch (e) {
      console.error("Failed to fetch history");
    }
  }

  return {
    currentSessionId,
    questions,
    currentQuestionIndex,
    score,
    isGameOver,
    leaderboard,
    history,
    isLoading,
    error,
    hasAnswered,
    selectedOptionId,
    lastResult,
    currentQuestion,
    progress,
    startGame,
    submitAnswer,
    nextQuestion,
    finishGame,
    fetchLeaderboard,
    fetchHistory
  };
});
