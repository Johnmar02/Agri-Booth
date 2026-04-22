/**
 * SERVICE: apiClient.js
 * 
 * This service handles all network communication.
 * To switch to a real backend, simply change the IS_MOCK flag to false
 * and provide your API_BASE_URL.
 */

const IS_MOCK = false; // SET TO FALSE WHEN BACKEND IS READY
const API_BASE_URL = 'https://192.168.1.158:7137/api';

/**
 * HELPER: Generic request wrapper with error handling
 */
async function request(endpoint, options = {}) {
  if (IS_MOCK) return null;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('itcph_admin_token') || ''}`
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return { ok: false, message: error.message };
  }
}

/**
 * MOCK UTILS (Keep for development/offline testing)
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
    if (!IS_MOCK) {
      return await request('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password })
      });
    }

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
    if (!IS_MOCK) {
      return await request('/visitors/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    await new Promise(r => setTimeout(r, 500));
    return { ok: true, id: `v-${Date.now()}` };
  },

  /**
   * Admin: adds a new training resource (Supports File Upload Simulation)
   */
  async addResource(moduleId, resource) {
    if (!IS_MOCK) {
      // For real file uploads, you would use FormData
      const formData = new FormData();
      formData.append('title', resource.title);
      formData.append('description', resource.description);
      formData.append('format', resource.format);
      if (resource.file) formData.append('file', resource.file);
      if (resource.imageFile) formData.append('image', resource.imageFile);

      return await request(`/modules/${moduleId}/resources`, {
        method: 'POST',
        body: formData, // fetch handles multipart headers for FormData
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('itcph_admin_token')}`
          // Don't set Content-Type for FormData
        }
      });
    }

    await new Promise(r => setTimeout(r, 2000));
    return { ok: true, id: `r-${Date.now()}` };
  },

  /**
   * Admin: deletes a resource
   */
  async deleteResource(moduleId, resourceId) {
    if (!IS_MOCK) {
      return await request(`/modules/${moduleId}/resources/${resourceId}`, {
        method: 'DELETE'
      });
    }

    await new Promise(r => setTimeout(r, 300));
    return { ok: true };
  }
};
