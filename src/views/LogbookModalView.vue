<script setup>
/**
 * VIEW: LogbookModalView
 * Renders the controlled visitor data collection form before gated modules can be opened.
 *
 * WHY THIS FILE EXISTS:
 * The logbook is both an access control surface and a data collection tool. Keeping it as
 * a pure view ensures privacy-sensitive validation stays in the controller while the UI
 * remains accessible and consistent across device sizes.
 */
defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  pendingModuleTitle: {
    type: String,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    required: true,
  },
  fieldOptions: {
    type: Object,
    required: true,
  },
  itemsCollected: {
    type: Array,
    required: true,
  },
  isSubmitting: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['close', 'field-change', 'submit']);
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal" role="presentation" @click.self="$emit('close')">
      <section class="modal__card" role="dialog" aria-modal="true" aria-labelledby="logbook-title">
        <header class="modal__header">
          <div>
            <p class="modal__eyebrow">Virtual logbook</p>
            <h2 id="logbook-title">Unlock {{ pendingModuleTitle }}</h2>
            <p class="modal__copy">
              The booth records a verified visitor profile before opening controlled publications and advisory modules.
            </p>
          </div>

          <button class="modal__close" type="button" aria-label="Close virtual logbook" @click="$emit('close')">
            ×
          </button>
        </header>

        <form class="modal__form" @submit.prevent="$emit('submit')">
          <div class="field-grid">
            <label class="field">
              <span>Name</span>
              <input
                autocomplete="name"
                maxlength="120"
                :value="form.name"
                @input="$emit('field-change', { field: 'name', value: $event.target.value })"
              />
              <small v-if="errors.name" class="field__error">{{ errors.name }}</small>
            </label>

            <label class="field">
              <span>Email address</span>
              <input
                autocomplete="email"
                inputmode="email"
                maxlength="120"
                :value="form.email"
                @input="$emit('field-change', { field: 'email', value: $event.target.value })"
              />
              <small v-if="errors.email" class="field__error">{{ errors.email }}</small>
            </label>

            <label class="field field--full">
              <span>Address</span>
              <input
                autocomplete="street-address"
                maxlength="120"
                :value="form.address"
                @input="$emit('field-change', { field: 'address', value: $event.target.value })"
              />
              <small v-if="errors.address" class="field__error">{{ errors.address }}</small>
            </label>

            <label class="field field--full">
              <span>Affiliations</span>
              <input
                autocomplete="organization"
                maxlength="120"
                :value="form.affiliations"
                placeholder="Agency, school, farm, cooperative, or community group"
                @input="$emit('field-change', { field: 'affiliations', value: $event.target.value })"
              />
              <small v-if="errors.affiliations" class="field__error">{{ errors.affiliations }}</small>
            </label>

            <label class="field">
              <span>Gender</span>
              <select :value="form.gender" @change="$emit('field-change', { field: 'gender', value: $event.target.value })">
                <option value="">Select option</option>
                <option v-for="gender in fieldOptions.genders" :key="gender" :value="gender">
                  {{ gender }}
                </option>
              </select>
              <small v-if="errors.gender" class="field__error">{{ errors.gender }}</small>
            </label>

            <label class="field">
              <span>Type of client</span>
              <select
                :value="form.clientType"
                @change="$emit('field-change', { field: 'clientType', value: $event.target.value })"
              >
                <option value="">Select option</option>
                <option v-for="clientType in fieldOptions.clientTypes" :key="clientType" :value="clientType">
                  {{ clientType }}
                </option>
              </select>
              <small v-if="errors.clientType" class="field__error">{{ errors.clientType }}</small>
            </label>

            <label class="field field--full">
              <span>Feedback</span>
              <textarea
                rows="4"
                maxlength="400"
                :value="form.feedback"
                placeholder="Share what would make the Digital Agri-Booth more useful for your work."
                @input="$emit('field-change', { field: 'feedback', value: $event.target.value })"
              ></textarea>
              <small v-if="errors.feedback" class="field__error">{{ errors.feedback }}</small>
            </label>
          </div>

          <section class="collection-box" aria-labelledby="collection-title">
            <p id="collection-title" class="collection-box__title">Items collected tracking state</p>
            <div v-if="itemsCollected.length" class="collection-box__chips">
              <span v-for="item in itemsCollected" :key="item" class="collection-box__chip">{{ item }}</span>
            </div>
            <p v-else class="collection-box__empty">
              No assets have been tracked yet. Once a visitor opens mock downloads or portal tiles, they will appear here automatically.
            </p>
          </section>

          <p v-if="errors.form" class="form-error">{{ errors.form }}</p>
          <p class="privacy-note">
            Security note: the app keeps personal details in memory only. Browser session storage is limited to access status and tracked resource labels.
          </p>

          <button class="submit-button" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Recording entry...' : 'Submit and unlock module' }}
          </button>
        </form>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(9, 20, 15, 0.52);
  backdrop-filter: blur(10px);
}

.modal__card {
  width: min(46rem, 100%);
  max-height: min(90vh, 60rem);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  border-radius: 30px;
  background: rgba(253, 252, 247, 0.98);
  border: 1px solid rgba(20, 55, 34, 0.1);
  box-shadow: 0 30px 80px rgba(9, 20, 15, 0.28);
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.35rem 1.35rem 1rem;
  background: linear-gradient(180deg, rgba(238, 245, 236, 0.98), rgba(253, 252, 247, 0.95));
  border-bottom: 1px solid rgba(20, 55, 34, 0.08);
}

.modal__eyebrow {
  margin: 0 0 0.3rem;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-brand);
}

.modal__header h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  color: var(--color-ink);
}

.modal__copy,
.privacy-note,
.collection-box__empty {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.6;
}

.modal__close {
  width: 2.6rem;
  height: 2.6rem;
  border: 0;
  border-radius: 999px;
  background: rgba(20, 55, 34, 0.08);
  color: var(--color-ink);
  font-size: 1.45rem;
  font-weight: 500;
}

.modal__form {
  overflow-y: auto;
  padding: 1.35rem;
  display: grid;
  gap: 1rem;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.95rem;
}

.field {
  display: grid;
  gap: 0.45rem;
}

.field span,
.collection-box__title {
  font-weight: 800;
  color: var(--color-ink);
}

.field--full {
  grid-column: 1 / -1;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  border-radius: 18px;
  border: 1px solid rgba(20, 55, 34, 0.12);
  background: rgba(255, 255, 255, 0.92);
  padding: 0.85rem 0.95rem;
  color: var(--color-ink);
}

.field textarea {
  resize: vertical;
}

.field__error,
.form-error {
  color: var(--color-danger);
  line-height: 1.5;
}

.collection-box {
  display: grid;
  gap: 0.7rem;
  padding: 1rem;
  border-radius: 22px;
  background: rgba(238, 245, 236, 0.7);
  border: 1px solid rgba(20, 55, 34, 0.08);
}

.collection-box__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.collection-box__chip {
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(20, 55, 34, 0.08);
  color: var(--color-ink-soft);
  font-weight: 700;
  font-size: 0.82rem;
}

.submit-button {
  min-height: 3rem;
  border: 0;
  border-radius: 18px;
  background: linear-gradient(180deg, var(--color-brand), var(--color-brand-strong));
  color: #fff;
  font-weight: 800;
}

.submit-button:disabled {
  opacity: 0.6;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 180ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .field-grid {
    grid-template-columns: 1fr;
  }

  .field--full {
    grid-column: auto;
  }
}
</style>
