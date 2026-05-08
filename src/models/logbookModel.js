/**
 * MODEL: logbookModel.js
 * Defines the controlled structure for the visitor data collection portal.
 *
 * WHY THIS FILE EXISTS:
 * The virtual logbook collects personally identifiable data before unlocking certain
 * modules. By defining field shapes and option catalogs in the model layer, validation
 * and UI rendering can stay consistent and auditable as the booth grows.
 */

/**
 * Returns a fresh copy of the logbook form state.
 *
 * WHY THIS EXISTS:
 * Controllers need a predictable, resettable form object. Using a factory avoids shared
 * object references between form instances and prevents stale user input from leaking
 * across sessions.
 *
 * @returns {{
 *   name: string,
 *   address: string,
 *   affiliations: string,
 *   gender: string,
 *   clientType: string,
 *   email: string,
 *   password: string,
 *   currentPassword: string
 * }}
 */
export function createEmptyLogbookForm() {
  return {
    name: '',
    address: '',
    affiliations: '',
    gender: '',
    clientType: '',
    email: '',
    password: '',
    currentPassword: '',
  };
}

/**
 * Returns a fresh error bag aligned with the controlled form fields.
 *
 * WHY THIS EXISTS:
 * The view renders field-level guidance. Initializing the full error structure upfront
 * keeps the UI stable and avoids ad hoc undefined checks in template code.
 *
 * @returns {{
 *   name: string,
 *   address: string,
 *   affiliations: string,
 *   gender: string,
 *   clientType: string,
 *   email: string,
 *   password: string,
 *   currentPassword: string,
 *   form: string
 * }}
 */
export function createEmptyLogbookErrors() {
  return {
    name: '',
    address: '',
    affiliations: '',
    gender: '',
    clientType: '',
    email: '',
    password: '',
    currentPassword: '',
    form: '',
  };
}

/**
 * MODEL: Dropdown options remain immutable because they represent controlled vocabularies
 * that future analytics and reporting can depend on.
 */
export const LOGBOOK_FIELD_OPTIONS = Object.freeze({
  genders: ['Female', 'Male', 'Prefer not to say'],
  clientTypes: [
    'Farmer / Livestock Raiser',
    'Student / Trainee',
    'Researcher / Academic',
    'Extension Worker',
    'Government Employee',
    'Private Sector',
    'NGO / Cooperative',
    'Other',
  ],
});
