import { defineStore } from 'pinia';
import { apiClient } from '@/services/apiClient';

/**
 * STORE: lmsStore
 * Manages the E-Learning (LMS) module state, including courses, enrollments,
 * lesson progress, and quizzes. Synchronized with the .NET CoursesController.
 */
export const useLmsStore = defineStore('lms', {
  state: () => ({
    courses: [],
    myCourses: [],
    activeCourse: null,
    activeEnrollment: null,
    activeLesson: null,
    activeQuiz: null,
    loading: false,
    error: null,
    initialized: false
  }),

  getters: {
    isEnrolled: (state) => (courseId) => {
      return state.myCourses.some(e => e.courseId === courseId || e.CourseId === courseId);
    },
    getEnrollmentByCourseId: (state) => (courseId) => {
      return state.myCourses.find(e => e.courseId === courseId || e.CourseId === courseId);
    }
  },

  actions: {
    /**
     * Fetches all available courses and the visitor's enrollments.
     */
    async initialize(visitorId = null) {
      this.loading = true;
      try {
        const results = await Promise.allSettled([
          apiClient.getCourses(),
          visitorId ? apiClient.getMyCourses(visitorId) : Promise.resolve({ ok: true, data: [] })
        ]);

        const [coursesRes, myCoursesRes] = results;

        if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
          this.courses = coursesRes.value.data || [];
        }

        if (myCoursesRes.status === 'fulfilled' && myCoursesRes.value.ok) {
          this.myCourses = myCoursesRes.value.data || [];
        }

        this.initialized = true;
      } catch (error) {
        console.error('LMS initialization error:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Refreshes the visitor's enrollments.
     */
    async fetchMyCourses(visitorId) {
      if (!visitorId) return;
      const res = await apiClient.getMyCourses(visitorId);
      if (res.ok) {
        this.myCourses = res.data || [];
      }
    },

    /**
     * Loads full course details.
     */
    async loadCourse(courseId) {
      this.loading = true;
      this.activeCourse = null;
      try {
        const res = await apiClient.getCourseById(courseId);
        if (res.ok) {
          this.activeCourse = res.data;
          return res.data;
        } else {
          throw new Error(res.data?.message || 'Failed to load course details');
        }
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Enrolls the visitor in a course.
     */
    async enroll(visitorId, courseId) {
      this.loading = true;
      try {
        const res = await apiClient.enrollInCourse(visitorId, courseId);
        if (res.ok) {
          await this.fetchMyCourses(visitorId);
          return res.data;
        } else {
          throw new Error(res.data?.message || 'Enrollment failed');
        }
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Loads lesson details and its progress.
     */
    async loadLesson(lessonId) {
      this.loading = true;
      try {
        const res = await apiClient.getLesson(lessonId);
        if (res.ok) {
          this.activeLesson = res.data;
          return res.data;
        } else {
          throw new Error(res.data?.message || 'Failed to load lesson');
        }
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Marks a lesson as completed.
     */
    async completeLesson(enrollmentId, lessonId, visitorId) {
      try {
        const res = await apiClient.completeLesson(enrollmentId, lessonId);
        if (res.ok) {
          if (visitorId) await this.fetchMyCourses(visitorId);
          return res.data;
        }
      } catch (err) {
        console.error('Failed to complete lesson:', err);
      }
    },

    /**
     * Loads quiz questions for a module.
     */
    async loadQuiz(moduleId) {
      this.loading = true;
      try {
        const res = await apiClient.getQuiz(moduleId);
        if (res.ok) {
          this.activeQuiz = res.data;
          return res.data;
        } else {
          throw new Error(res.data?.message || 'No quiz found for this module');
        }
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Submits quiz answers.
     */
    async submitQuiz(payload, visitorId) {
      this.loading = true;
      try {
        const res = await apiClient.submitQuiz(payload);
        if (res.ok) {
          if (visitorId) await this.fetchMyCourses(visitorId);
          return res.data;
        } else {
          throw new Error(res.data?.message || 'Quiz submission failed');
        }
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetches detailed progress for an enrollment.
     */
    async loadProgress(enrollmentId) {
      try {
        const res = await apiClient.getProgress(enrollmentId);
        if (res.ok) {
          this.activeEnrollment = res.data;
          return res.data;
        }
      } catch (err) {
        console.error('Failed to load progress:', err);
      }
    },

    /**
     * Fetches certificate for an enrollment.
     */
    async fetchCertificate(enrollmentId) {
      try {
        return await apiClient.getCertificate(enrollmentId);
      } catch (err) {
        console.error('Failed to fetch certificate:', err);
        return { ok: false };
      }
    }
  }
});
