/**
 * SERVICE: apiClient.js
 * 
 * This service handles all network communication with the .NET backend.
 * It uses the 'credentials: include' flag to support cookie-based authentication.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function buildUrl(endpoint) {
  return `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
}

let onUnauthorizedCallback = null;

/**
 * UTILS: Generic fetch wrapper to handle JSON and errors.
 */
async function request(endpoint, options = {}) {
  const url = buildUrl(endpoint);
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (response.status === 401 && onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }

    const contentType = response.headers.get('content-type');
    let data = null;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text || `Error ${response.status}`;
    }

    return { data, status: response.status, ok: response.ok };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return { ok: false, data: null, message: 'Connection error. Please try again later.' };
  }
}

export const apiClient = {
  /**
   * Register a callback for when the server returns a 401 Unauthorized.
   */
  onUnauthorized(callback) {
    onUnauthorizedCallback = callback;
  },
  /**
   * AuthController: Checks if the current admin session is still valid.
   */
  async isAdminAuthenticated() {
    return await request('/Auth/me');
  },

  /**
   * AuthController: Authenticates an admin login attempt using Cookies.
   */
  async loginAdmin(username, password) {
    return await request('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ Username: username, Password: password }),
    });
  },

  /**
   * AuthController: Logs out the admin and clears the server-side cookie.
   */
  async logoutAdmin() {
    return await request('/Auth/logout', {
      method: 'POST',
    });
  },

  /**
   * VisitorsController: Authenticates a visitor login attempt.
   */
  async loginVisitor(email, password) {
    return await request('/Visitors/login', {
      method: 'POST',
      body: JSON.stringify({ Email: email, Password: password }),
    });
  },

  /**
   * VisitorsController: Logs out a visitor.
   */
  async logoutVisitor() {
    return await request('/Visitors/logout', {
      method: 'POST',
    });
  },

  /**
   * VisitorsController: Submits visitor registration (logbook) data.
   */
  async submitLogbook(payload) {
    // Mapping frontend model to .NET CreateVisitorDto
    const mappedPayload = {
      FullName: payload.name,
      Email: payload.email,
      Password: payload.password || '', 
      Address: payload.address,
      Affiliation: payload.affiliations,
      Gender: payload.gender,
      ClientType: payload.clientType,
    };

    return await request('/Visitors/register', {
      method: 'POST',
      body: JSON.stringify(mappedPayload),
    });
  },

  /**
   * VisitorsController: Updates visitor profile data.
   */
  async updateVisitor(visitorId, payload) {
    const mappedPayload = {
      FullName: payload.name,
      Email: payload.email,
      Password: payload.password || '',
      Address: payload.address,
      Affiliation: payload.affiliations,
      Gender: payload.gender,
      ClientType: payload.clientType,
    };

    return await request(`/Visitors/${visitorId}`, {
      method: 'PUT',
      body: JSON.stringify(mappedPayload),
    });
  },

  /**
   * VisitorsController: Fetches all visitors (Admin only).
   */
  async getVisitors() {
    return await request('/Visitors');
  },

  /**
   * IECMaterialsController: Fetches all IEC materials.
   */
  async getIECMaterials() {
    return await request('/IECMaterials');
  },

  /**
   * TrainingProgramsController: Fetches training programs.
   */
  async getTrainingPrograms() {
    return await request('/TrainingPrograms');
  },

  /**
   * CoursesController: Fetches LMS courses.
   */
  async getCourses() {
    return await request('/Courses');
  },

  /**
   * FeedbacksController: Submits user feedback.
   */
  async submitFeedback(payload) {
    return await request('/Feedbacks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * AnalyticsController: Fetches booth statistics.
   */
  async getStats() {
    return await request('/Analytics/Summary');
  },

  /**
   * BebuGameController: Admin creates a trivia question.
   */
  async createBebuQuestion(payload) {
    return await request('/BebuGame/questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * BebuGameController: Admin fetches all trivia questions.
   */
  async getBebuQuestions() {
    return await request('/BebuGame/questions/all');
  },

  /**
   * BebuGameController: Admin deactivates a trivia question.
   */
  async deleteBebuQuestion(questionId) {
    return await request(`/BebuGame/questions/${questionId}`, {
      method: 'DELETE',
    });
  },

  /**
   * BebuGameController: Visitor starts a game session.
   */
  async startGameSession(visitorId, questionCount = 10) {
    return await request(`/BebuGame/start?visitorId=${visitorId}&questionCount=${questionCount}`, {
      method: 'POST',
    });
  },

  /**
   * BebuGameController: Visitor submits an answer.
   */
  async submitAnswer(payload) {
    return await request('/BebuGame/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * BebuGameController: Visitor finishes the game.
   */
  async finishGame(sessionId) {
    return await request(`/BebuGame/finish/${sessionId}`, {
      method: 'POST',
    });
  },

  /**
   * BebuGameController: Fetches the leaderboard.
   */
  async getLeaderboard() {
    return await request('/BebuGame/leaderboard');
  },

  /**
   * BebuGameController: Fetches a visitor's game history.
   */
  async getGameHistory(visitorId) {
    return await request(`/BebuGame/history/${visitorId}`);
  }
};
