import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '@/services/apiClient';
import { useVisitorStore } from './visitor';

/**
 * UTILS: Maps raw database question objects to the frontend format.
 * Matches the logic used in the Admin Dashboard's contentStore.
 */
function mapDatabaseQuestion(q) {
  const id = q.id ?? q.Id;
  const correctAnswer = String(q.correctAnswer ?? q.CorrectAnswer ?? 'A').toUpperCase();

  return {
    id,
    prompt: q.question ?? q.Question ?? '',
    category: q.category ?? q.Category ?? 'General',
    difficulty: q.difficulty ?? q.Difficulty ?? 'Easy',
    options: [
      { id: 'a', label: q.optionA ?? q.OptionA ?? '' },
      { id: 'b', label: q.optionB ?? q.OptionB ?? '' },
      { id: 'c', label: q.optionC ?? q.OptionC ?? '' },
      { id: 'd', label: q.optionD ?? q.OptionD ?? '' }
    ],
    correctOptionId: correctAnswer.toLowerCase(),
    explanation: `The correct answer is ${correctAnswer}.`
  };
}

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

  /**
   * ADMIN METHOD: Fetches all active questions directly from the database
   * bypasses the session-start endpoint to ensure guests can play instantly.
   */
  async function startGame(questionCount = 10) {
    isLoading.value = true;
    error.value = null;
    currentSessionId.value = null; 

    try {
      // Step 1: Use the Admin's API call to get all live questions
      const response = await apiClient.getBebuQuestions();
      
      if (response.ok && response.data) {
        let allQuestions = response.data;

        // Step 2: Filter active and Shuffle them locally for variety
        allQuestions = allQuestions
          .filter(q => q.isActive ?? q.IsActive ?? true)
          .sort(() => Math.random() - 0.5)
          .slice(0, questionCount);

        // Step 3: Map to frontend format
        questions.value = allQuestions.map(mapDatabaseQuestion);
        
        // Step 4: Reset game state
        currentQuestionIndex.value = 0;
        score.value = 0;
        isGameOver.value = false;
        hasAnswered.value = false;
        selectedOptionId.value = '';
        lastResult.value = null;

        // Step 5: (Optional) Try to create a session in the background for registered users
        if (visitorStore.visitorId) {
          apiClient.startGameSession(visitorStore.visitorId, questionCount)
            .then(res => {
              if (res.ok) currentSessionId.value = res.data.gameSessionId;
            });
        }
      } else {
        error.value = "Unable to load questions from database.";
      }
    } catch (e) {
      console.error("Bebu Game Load Error:", e);
      error.value = "Connection error. Ensure your backend is running.";
    } finally {
      setTimeout(() => {
        isLoading.value = false;
      }, 300);
    }
  }

  async function submitAnswer(answerGiven) {
    if (isGameOver.value || !currentQuestion.value || hasAnswered.value) return;

    isLoading.value = true;
    selectedOptionId.value = answerGiven;
    
    // Logic: If we have a session (logged in), sync to DB. Otherwise, handle locally.
    if (currentSessionId.value) {
      try {
        const response = await apiClient.submitAnswer({
          gameSessionId: currentSessionId.value,
          questionId: currentQuestion.value.id,
          answerGiven: answerGiven.toUpperCase()
        });

        if (response.ok && response.data) {
          const d = response.data;
          hasAnswered.value = true;
          lastResult.value = d;
          score.value = d.currentScore;
          return d;
        }
      } catch (e) {
        console.warn("Failed to sync answer to server, falling back to local scoring.");
      }
    }

    // Local Scoring Fallback (for guests or connection hiccups)
    hasAnswered.value = true;
    const isCorrect = answerGiven.toLowerCase() === currentQuestion.value.correctOptionId.toLowerCase();
    if (isCorrect) score.value++;
    
    lastResult.value = {
      isCorrect,
      correctAnswer: currentQuestion.value.correctOptionId.toUpperCase(),
      currentScore: score.value
    };
    
    isLoading.value = false;
    return lastResult.value;
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
    isGameOver.value = true;
    if (currentSessionId.value) {
      isLoading.value = true;
      try {
        await apiClient.finishGame(currentSessionId.value);
        fetchLeaderboard();
        fetchHistory();
      } catch (e) {
        console.error("Failed to sync finish state.");
      } finally {
        isLoading.value = false;
      }
    }
  }

  async function fetchLeaderboard() {
    try {
      const response = await apiClient.getLeaderboard();
      if (response.ok && response.data) {
        leaderboard.value = response.data;
      }
    } catch (e) {
      console.error("Failed to fetch leaderboard");
    }
  }

  async function fetchHistory() {
    if (!visitorStore.visitorId) return;
    try {
      const response = await apiClient.getGameHistory(visitorStore.visitorId);
      if (response.ok && response.data) {
        history.value = response.data;
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
