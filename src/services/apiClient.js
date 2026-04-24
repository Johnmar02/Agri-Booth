/**
 * SERVICE: apiClient.js
 * 
 * This service handles all "network" communication.
 * It is purely client-side and uses local storage to simulate a backend.
 */

/**
 * MOCK UTILS
 */
const EXPECTED_ADMIN_HASH = '365471a4f330fb32085510444abe4af77c2c7ca4b5518de500e05ad2018d7711';

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const apiClient = {
  /**
   * Authenticates an admin login attempt.
   */
  async loginAdmin(password) {
    // Mock Logic
    const inputHash = await digestMessage(password);
    if (inputHash === EXPECTED_ADMIN_HASH) {
      const mockToken = btoa(JSON.stringify({ role: 'admin', exp: Date.now() + 1800000 }));
      return { ok: true, token: mockToken };
    }
    return { ok: false, message: 'Invalid administrative key.' };
  },

  /**
   * Submits visitor logbook data.
   */
  async submitLogbook(payload) {
    // Artificial delay to simulate network latency
    await new Promise(r => setTimeout(r, 800));
    return { ok: true, id: `v-${Date.now()}` };
  },

  /**
   * Admin: adds a new training resource
   */
  async addResource(moduleId, resource) {
    // Artificial delay to simulate file upload
    await new Promise(r => setTimeout(r, 1500));
    return { ok: true, id: `r-${Date.now()}` };
  },

  /**
   * Admin: deletes a resource
   */
  async deleteResource(moduleId, resourceId) {
    await new Promise(r => setTimeout(r, 300));
    return { ok: true };
  }
};
