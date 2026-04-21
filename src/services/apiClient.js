/**
 * SERVICE: apiClient.js
 * 
 * ==============================================================================
 * ⚠️ BACKEND INTEGRATION READY
 * ==============================================================================
 * This service layer intercepts all data mutations and authentication attempts.
 * Currently, it uses frontend mocks and cryptography. 
 * 
 * TO CONNECT A REAL BACKEND:
 * Replace the mock logic inside these functions with standard `fetch()` or `axios` 
 * HTTP calls to your actual API endpoints. 
 * ==============================================================================
 */

const API_BASE_URL = 'https://api.your-backend.com/v1'; // Replace with real API url

/**
 * MOCK SECURE ADMIN HASH
 * We use an SHA-256 hash so the password is never stored in plaintext in the frontend bundle.
 * The hash corresponds to the key: 'ATI-ITCPH-2026'
 */
const EXPECTED_ADMIN_HASH = '365471a4f330fb32085510444abe4af77c2c7ca4b5518de500e05ad2018d7711';

/**
 * Computes a SHA-256 hash of a string using the native Web Crypto API.
 */
async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const apiClient = {
  /**
   * authenticates an admin login attempt.
   * 
   * @param {string} password - The raw password input
   * @returns {Promise<{ ok: boolean, message?: string, token?: string }>}
   */
  async loginAdmin(password) {
    // ===================================
    // 🔗 API CONNECTION POINT:
    // Replace with:
    // const res = await fetch(`${API_BASE_URL}/admin/login`, {
    //   method: 'POST', body: JSON.stringify({ password })
    // });
    // return await res.json();
    // ===================================

    // Mock Implementation: Secure Crypto Verification
    try {
      const inputHash = await digestMessage(password);
      if (inputHash === EXPECTED_ADMIN_HASH) {
        // Return a mock JWT token representing an active session
        const mockToken = btoa(JSON.stringify({ role: 'admin', exp: Date.now() + 1800000 }));
        return { ok: true, token: mockToken };
      }
      return { ok: false, message: 'Invalid administrative key. Access denied.' };
    } catch (e) {
      console.error('Crypto validation failed', e);
      return { ok: false, message: 'Security validation error.' };
    }
  },

  /**
   * Submits visitor logbook data.
   * 
   * @param {Object} payload 
   * @returns {Promise<{ ok: boolean }>}
   */
  async submitLogbook(payload) {
    // ===================================
    // 🔗 API CONNECTION POINT:
    // Replace with:
    // await fetch(`${API_BASE_URL}/visitors/register`, {
    //   method: 'POST', body: JSON.stringify(payload)
    // });
    // ===================================

    // Mock Implementation: simulate network latency
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    return { ok: true, id: `v-${Date.now()}` };
  },

  /**
   * Admin: adds a new training resource to the booth module
   * 
   * @param {string} moduleId 
   * @param {Object} resource 
   */
  async addResource(moduleId, resource) {
    // ===================================
    // 🔗 API CONNECTION POINT:
    // Replace with POST /modules/{moduleId}/resources
    // ===================================
    
    // Mock Implementation: simulate network latency
    const mockLatency = Math.floor(Math.random() * 1000) + 1500;
    await new Promise((resolve) => window.setTimeout(resolve, mockLatency));
    return { ok: true, id: `r-${Date.now()}` };
  },

  /**
   * Admin: deletes a resource from a booth module
   */
  async deleteResource(moduleId, resourceId) {
    // ===================================
    // 🔗 API CONNECTION POINT:
    // Replace with DELETE /modules/{moduleId}/resources/{resourceId}
    // ===================================

    await new Promise((resolve) => window.setTimeout(resolve, 300));
    return { ok: true };
  }
};
