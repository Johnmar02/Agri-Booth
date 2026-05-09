/**
 * SERVICE: apiClient.js
 * 
 * This service handles all network communication with the .NET backend.
 * It uses the 'credentials: include' flag to support cookie-based authentication.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function buildUrl(endpoint) {
  return `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
}

let onUnauthorizedCallback = null;

/**
 * UTILS: Generic fetch wrapper to handle JSON and errors.
 */
async function request(endpoint, options = {}) {
  const url = buildUrl(endpoint);
  const isFormData = options.body instanceof FormData;

  const headers = { ...options.headers };
  // If it's FormData, let the browser set the Content-Type with boundary
  if (isFormData) {
    delete headers['Content-Type'];
  } else if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
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
   * AuthController: Fetches all admin users (Admin only).
   */
  async getAdmins() {
    return await request('/Auth');
  },

  /**
   * AuthController: Registers a new admin user (SuperAdmin only).
   */
  async registerAdmin(payload) {
    const mappedPayload = {
      Username: payload.username,
      Password: payload.password,
      Email: payload.email,
      Role: payload.role
    };
    return await request('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(mappedPayload),
    });
  },

  /**
   * AuthController: Deletes an admin user (SuperAdmin only).
   */
  async deleteAdmin(id) {
    return await request(`/Auth/delete/${id}`, {
      method: 'DELETE',
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
   * VisitorsController: Visitor updates own profile.
   */
  async updateProfile(payload) {
    const mappedPayload = {
      fullName: payload.name,
      address: payload.address,
      affiliation: payload.affiliations,
      gender: payload.gender,
      clientType: payload.clientType,
      currentPassword: payload.currentPassword || '',
      newPassword: payload.password || '', 
    };

    return await request('/Visitors/update', {
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
   * TrainingProgramsController: Fetches all active training programs.
   */
  async getTrainingPrograms() {
    return await request('/TrainingPrograms');
  },

  /**
   * TrainingProgramsController: Admin creates a new training program.
   */
  async createTrainingProgram(payload) {
    return await request('/TrainingPrograms', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * TrainingProgramsController: Visitor registers for a program.
   */
  async registerForTraining(payload) {
    return await request('/TrainingPrograms/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * TrainingProgramsController: Admin fetches registrations for a program.
   */
  async getTrainingRegistrations(programId) {
    return await request(`/TrainingPrograms/${programId}/registrations`);
  },

  /**
   * TrainingProgramsController: Admin deletes a program.
   */
  async deleteTrainingProgram(id) {
    return await request(`/TrainingPrograms/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * IECMaterialsController: Fetches all IEC materials.
   */
  async getIECMaterials() {
    return await request('/IECMaterials');
  },

  /**
   * IECMaterialsController: Admin uploads a new material.
   */
  async uploadIECMaterial(formData) {
    return await request('/IECMaterials', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * IECMaterialsController: Admin deletes a material.
   */
  async deleteIECMaterial(id) {
    return await request(`/IECMaterials/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * CoursesController: Fetches LMS courses.
   */
  async getCourses() {
    return await request('/Courses');
  },

  /**
   * CoursesController: Fetches a single course by ID.
   */
  async getCourseById(id) {
    return await request(`/Courses/${id}`);
  },

  /**
   * CoursesController: Admin creates a new course.
   */
  async createCourse(payload) {
    return await request('/Courses/lessons', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * CoursesController: Admin adds a module to a course.
   */
  async createCourseModule(payload) {
    return await request('/Courses/modules', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * CoursesController: Admin adds a lesson to a module.
   */
  async createLesson(payload) {
    return await request('/Courses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * CoursesController: Admin adds quiz questions to a module.
   */
  async createQuizQuestions(payload) {
    return await request('/Courses/quiz-questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * CoursesController: Admin updates a course.
   */
  async updateCourse(id, payload) {
    return await request(`/Courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * CoursesController: Admin updates a module.
   */
  async updateCourseModule(id, payload) {
    return await request(`/Courses/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * CoursesController: Admin updates a lesson.
   */
  async updateLesson(id, payload) {
    return await request(`/Courses/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * CoursesController: Admin deactivates a course.
   */
  async deleteCourse(id) {
    return await request(`/Courses/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * CoursesController: Visitor enrolls in a course.
   */
  async enrollInCourse(visitorId, courseId) {
    return await request('/Courses/enroll', {
      method: 'POST',
      body: JSON.stringify({ VisitorId: visitorId, CourseId: courseId, EnrolledAt: new Date().toISOString() }),
    });
  },

  /**
   * CoursesController: Fetches a visitor's enrolled courses.
   */
  async getMyCourses(visitorId) {
    return await request(`/Courses/my-courses/${visitorId}`);
  },

  /**
   * CoursesController: Marks a lesson as completed.
   */
  async completeLesson(enrollmentId, lessonId) {
    return await request('/Courses/complete-lesson', {
      method: 'POST',
      body: JSON.stringify({ EnrollmentId: enrollmentId, LessonId: lessonId }),
    });
  },

  /**
   * CoursesController: Fetches full lesson details.
   */
  async getLesson(id) {
    return await request(`/Courses/lessons/${id}`);
  },

  /**
   * CoursesController: Fetches quiz questions for a module.
   */
  async getQuiz(moduleId) {
    return await request(`/Courses/modules/${moduleId}/quiz`);
  },

  /**
   * CoursesController: Submits quiz answers.
   */
  async submitQuiz(payload) {
    return await request('/Courses/submit-quiz', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * CoursesController: Fetches enrollment progress.
   */
  async getProgress(enrollmentId) {
    return await request(`/Courses/progress/${enrollmentId}`);
  },

  /**
   * CoursesController: Fetches enrollment certificate.
   */
  async getCertificate(enrollmentId) {
    return await request(`/Courses/certificate/${enrollmentId}`);
  },

  /**
   * FeedbacksController: Submits user feedback.
   */
  async submitFeedback(payload) {
    const mappedPayload = {
      VisitorId: payload.VisitorId || payload.visitorId,
      Message: payload.Message || payload.message,
      Rating: payload.Rating || payload.rating
    };
    return await request('/Feedbacks', {
      method: 'POST',
      body: JSON.stringify(mappedPayload),
    });
  },

  /**
   * FeedbacksController: Admin fetches all feedbacks.
   */
  async getFeedbacks() {
    return await request('/Feedbacks');
  },

  /**
   * AnalyticsController: Fetches booth statistics.
   */
  async getStats() {
    return await request('/Analytics/Summary');
  },

  async getDailyVisitors() {
    return await request('/Analytics/visitors/daily');
  },

  async getVisitorsByGender() {
    return await request('/Analytics/visitors/by-gender');
  },

  async getVisitorsByClientType() {
    return await request('/Analytics/visitors/by-client-type');
  },

  async getVisitorsByAddress() {
    return await request('/Analytics/visitors/by-address');
  },

  async getTopDownloads() {
    return await request('/Analytics/materials/top-downloads');
  },

  async getDownloadsByCategory() {
    return await request('/Analytics/materials/downloads-by-category');
  },

  async getTrainingSummary() {
    return await request('/Analytics/trainings/registration-summary');
  },

  async getFeedbackRatings() {
    return await request('/Analytics/feedback/ratings');
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
