import { reactive, ref } from 'vue';
import {
  LOGBOOK_FIELD_OPTIONS,
  createEmptyLogbookErrors,
  createEmptyLogbookForm,
} from '@/models/logbookModel';
import { apiClient } from '@/services/apiClient';

/**
 * CONTROLLER: useLogbookController
 * Owns the controlled virtual logbook state, normalization, validation, and mock
 * submission flow.
 *
 * WHY THIS FILE EXISTS:
 * The logbook is the point where the Digital Agri-Booth handles visitor-provided data.
 * Keeping that logic inside a controller makes it easier to review every normalization
 * and validation rule without mixing privacy-sensitive behavior into view templates.
 *
 * @param {{ getTrackedItems?: () => string[] }} options
 */
export function useLogbookController(options = {}) {
  const form = reactive(createEmptyLogbookForm());
  const errors = reactive(createEmptyLogbookErrors());
  const isSubmitting = ref(false);

  /**
   * Clears all field and form-level errors in a single place.
   *
   * WHY THIS EXISTS:
   * Error state needs to reset consistently whenever the user edits or re-submits the
   * form. Centralizing this prevents stale messages from lingering across interactions.
   */
  const resetErrors = () => {
    Object.assign(errors, createEmptyLogbookErrors());
  };

  /**
   * Normalizes single-line user input to reduce the chance of broken layouts, accidental
   * control characters, or injection-shaped content reaching the rendered UI.
   *
   * WHY THIS EXISTS:
   * The app is frontend-only, so the safest pattern is to sanitize aggressively before
   * data ever leaves the controller boundary.
   *
   * @param {string} rawValue
   * @param {number} maxLength
   * @returns {string}
   */
  const normalizeSingleLine = (rawValue, maxLength) =>
    String(rawValue ?? '')
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/[<>]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength);

  /**
   * Normalizes multi-line input while preserving intentional paragraph breaks.
   *
   * WHY THIS EXISTS:
   * Feedback should remain expressive, but the controller still strips angle brackets
   * and control characters so the UI never needs to trust raw text.
   *
   * @param {string} rawValue
   * @param {number} maxLength
   * @returns {string}
   */
  const normalizeMultiline = (rawValue, maxLength) =>
    String(rawValue ?? '')
      .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, ' ')
      .replace(/[<>]/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, maxLength);

  /**
   * Applies stricter normalization to email input because it is both required and often
   * used in later integrations.
   *
   * WHY THIS EXISTS:
   * Email fields benefit from early canonicalization so matching, deduplication, and
   * future API handoffs remain consistent.
   *
   * @param {string} rawValue
   * @returns {string}
   */
  const normalizeEmail = (rawValue) =>
    String(rawValue ?? '')
      .replace(/\s+/g, '')
      .replace(/[<>]/g, '')
      .trim()
      .toLowerCase()
      .slice(0, 120);

  /**
   * Applies field-aware normalization for every controlled input.
   *
   * WHY THIS EXISTS:
   * A single update gateway ensures all UI surfaces follow the same sanitation rules and
   * makes future field additions safer.
   *
   * @param {string} field
   * @param {string} rawValue
   */
  const updateField = (field, rawValue) => {
    if (!(field in form)) {
      return;
    }

    switch (field) {
      case 'name':
      case 'address':
      case 'affiliations':
        form[field] = normalizeSingleLine(rawValue, 120);
        break;
      case 'gender':
      case 'clientType':
        form[field] = normalizeSingleLine(rawValue, 60);
        break;
      case 'email':
        form[field] = normalizeEmail(rawValue);
        break;
      case 'password':
        // Passwords should not be normalized/trimmed in a way that breaks them,
        // but we still strip angle brackets for basic safety.
        form[field] = String(rawValue ?? '').replace(/[<>]/g, '').slice(0, 60);
        break;
      default:
        form[field] = normalizeSingleLine(rawValue, 120);
    }

    errors[field] = '';
    errors.form = '';
  };

  /**
   * Produces a deduplicated, sanitized snapshot of collected booth items to attach to the
   * virtual logbook entry.
   *
   * WHY THIS EXISTS:
   * "Items Collected" is a tracking state, not a free-text field. The controller derives
   * it from visitor interactions so reporting remains consistent.
   *
   * @returns {string[]}
   */
  const getTrackedItemsSnapshot = () => {
    const trackedItems = typeof options.getTrackedItems === 'function' ? options.getTrackedItems() : [];

    return Array.from(
      new Set(
        (Array.isArray(trackedItems) ? trackedItems : [])
          .map((item) => normalizeSingleLine(item, 80))
          .filter(Boolean),
      ),
    ).slice(0, 20);
  };

  /**
   * Validates the current form state against the booth's minimum data requirements.
   *
   * WHY THIS EXISTS:
   * Gated modules represent measurable engagement and should not unlock unless the
   * frontend has captured a meaningful visitor profile.
   *
   * @param {boolean} isLogin - Whether to validate for login or registration.
   * @returns {boolean}
   */
  const validateForm = (isLogin = false) => {
    resetErrors();

    let isValid = true;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.email)) {
      errors.email = 'Provide a valid email address for future follow-up and access validation.';
      isValid = false;
    }

    if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
      isValid = false;
    }

    if (isLogin) {
      if (!isValid) {
        errors.form = 'Check your credentials before signing in.';
      }
      return isValid;
    }

    if (form.name.length < 2) {
      errors.name = 'Enter a complete name so the booth can record who accessed the controlled modules.';
      isValid = false;
    }

    if (form.address.length < 6) {
      errors.address = 'Provide a usable city, municipality, or institutional address.';
      isValid = false;
    }

    if (form.affiliations && form.affiliations.length > 0 && form.affiliations.length < 2) {
      errors.affiliations = 'State the school, agency, farm, or group connected to this visit.';
      isValid = false;
    }

    if (!isValid) {
      errors.form = 'Review the highlighted fields before unlocking restricted booth modules.';
    }

    return isValid;
  };

  /**
   * Builds the sanitized payload returned to the coordinating booth controller.
   *
   * WHY THIS EXISTS:
   * The booth controller only needs a clean summary, not the mechanics of form state.
   * Returning a shaped payload keeps controller boundaries clear.
   */
  const buildSubmissionPayload = () => ({
    ...createEmptyLogbookForm(),
    ...form,
    itemsCollected: getTrackedItemsSnapshot(),
    submittedAt: new Date().toISOString(),
  });

  /**
   * Authenticates a returning visitor.
   */
  const login = async () => {
    if (isSubmitting.value) {
      return { ok: false };
    }

    if (!validateForm(true)) {
      return { ok: false };
    }

    isSubmitting.value = true;

    try {
      const result = await apiClient.loginVisitor(form.email, form.password);

      if (result.ok) {
        return {
          ok: true,
          payload: {
            name: result.fullName,
            email: result.email,
          },
        };
      }
      
      errors.form = result.message || 'Login failed. Please check your credentials.';
      return { ok: false };
    } catch (err) {
      errors.form = 'Connection error. Please try again.';
      return { ok: false };
    } finally {
      isSubmitting.value = false;
    }
  };

  /**
   * Simulates a frontend-only submission flow and returns a clean payload when valid.
   *
   * WHY THIS EXISTS:
   * The project scope excludes backend routes. A deterministic async mock still gives the
   * UI realistic loading behavior without inventing non-existent infrastructure.
   *
   * @returns {Promise<{ ok: boolean, payload?: ReturnType<typeof buildSubmissionPayload> }>}
   */
  const submit = async () => {
    if (isSubmitting.value) {
      return { ok: false };
    }

    if (!validateForm(false)) {
      return { ok: false };
    }

    isSubmitting.value = true;

    try {
      const payload = buildSubmissionPayload();
      
      // Route submission through the newly integrated API client
      const result = await apiClient.submitLogbook(payload);

      if (result.ok) {
        return {
          ok: true,
          payload,
        };
      }
      
      errors.form = result.message || 'Registration failed. Please try again.';
      return { ok: false };
    } catch (err) {
      errors.form = 'Connection error. Please try again.';
      return { ok: false };
    } finally {
      isSubmitting.value = false;
    }
  };

  /**
   * Resets the form after a successful mock submission or when the session is cleared.
   *
   * WHY THIS EXISTS:
   * Resetting the controlled state helps avoid leaving personal data visible in the UI
   * once access has already been granted.
   */
  const resetForm = () => {
    Object.assign(form, createEmptyLogbookForm());
    resetErrors();
  };

  /**
   * Fills the form with existing data for profile editing.
   */
  const fillForm = (data) => {
    Object.assign(form, {
      ...createEmptyLogbookForm(),
      name: data.name || '',
      email: data.email || '',
      address: data.address || '',
      affiliations: data.affiliations || '',
      gender: data.gender || '',
      clientType: data.clientType || '',
      password: '' // Keep password empty initially
    });
    resetErrors();
  };

  /**
   * Updates an existing visitor profile.
   */
  const updateProfile = async (visitorId) => {
    if (isSubmitting.value) {
      return { ok: false };
    }

    if (!validateForm(false)) {
      return { ok: false };
    }

    isSubmitting.value = true;

    try {
      const payload = buildSubmissionPayload();
      const result = await apiClient.updateVisitor(visitorId, payload);

      if (result.ok) {
        return {
          ok: true,
          payload,
        };
      }
      
      errors.form = result.message || 'Update failed. Please try again.';
      return { ok: false };
    } catch (err) {
      errors.form = 'Connection error. Please try again.';
      return { ok: false };
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    form,
    errors,
    fieldOptions: LOGBOOK_FIELD_OPTIONS,
    isSubmitting,
    updateField,
    login,
    submit,
    updateProfile,
    fillForm,
    resetForm,
  };
}
