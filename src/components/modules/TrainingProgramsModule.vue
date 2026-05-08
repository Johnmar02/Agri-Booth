<script setup>
/**
 * COMPONENT: TrainingProgramsModule
 * Extracted from ModuleDrawerView to isolate the Training Programs (training-programs) UI.
 */
const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["training-register"]);

const getProgramRegistrationUrl = (program) =>
  program.registrationUrl || props.module?.registrations?.[0]?.url || props.module?.scheduleLink || '#';

const handleRegisterTraining = (programId) => {
  emit("training-register", programId);
};
</script>

<template>
  <section class="body-section training-programs-portal">
    <div class="training-programs-hero">
      <div class="training-programs-copy">
        <span class="section-label">Course Catalog</span>
        <h2 class="training-programs-title">{{ module.headline }}</h2>
        <p class="training-programs-text">{{ module.description }}</p>
        <p class="training-programs-contact">
          Contact numbers: {{ module.contactNumbers }}
        </p>
      </div>

      <div class="training-programs-actions">
        <a
          v-if="module.scheduleLink"
          :href="module.scheduleLink"
          target="_blank"
          rel="noreferrer"
          class="training-programs-primary-link"
        >
          View training calendar
        </a>
        <a
          v-for="registration in module.registrations"
          :key="registration.label"
          :href="registration.url"
          target="_blank"
          rel="noreferrer"
          class="training-programs-secondary-link"
        >
          {{ registration.label }}
        </a>
      </div>
    </div>

    <div class="training-card-grid">
      <article
        v-for="program in module.programs"
        :key="program.id"
        class="training-card"
      >
        <div class="training-card-topline">
          <span class="training-track">{{ program.category }}</span>
          <span class="training-duration">{{ program.duration }}</span>
        </div>
        <h3 class="training-card-title">{{ program.title }}</h3>
        <p class="training-card-desc">{{ program.description }}</p>

        <dl class="training-meta">
          <div class="training-meta-item">
            <dt>Target audience</dt>
            <dd>{{ program.audience }}</dd>
          </div>
          <div class="training-meta-item">
            <dt>Registration</dt>
            <dd>{{ program.registrationNote }}</dd>
          </div>
        </dl>

        <div class="training-card-actions">
          <button
            v-if="typeof program.id === 'number'"
            class="training-card-link"
            @click="handleRegisterTraining(program.id)"
          >
            Register Now
          </button>
          <a
            v-else
            :href="getProgramRegistrationUrl(program)"
            target="_blank"
            rel="noreferrer"
            class="training-card-link"
          >
            {{ program.actionLabel || 'Register or inquire' }}
          </a>
          <a
            v-if="module.scheduleLink"
            :href="module.scheduleLink"
            target="_blank"
            rel="noreferrer"
            class="training-card-link training-card-link--ghost"
          >
            View schedule
          </a>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.body-section { margin-bottom: 3rem; }
.section-label { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #1a6ab4; border-left: 4px solid #d17c24; padding-left: 12px; margin-bottom: 1.5rem; display: block; }

/* Training Programs Portal */
.training-programs-hero {
  background: #f8fafc;
  padding: 3rem;
  border-radius: 32px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 3rem;
  align-items: center;
  margin-bottom: 3rem;
  border: 1px solid #e2e8f0;
}
.training-programs-title { font-size: 2.2rem; font-weight: 900; color: #1a6ab4; margin: 0.5rem 0 1rem; }
.training-programs-text { font-size: 1.1rem; color: #64748b; margin-bottom: 1rem; }
.training-programs-contact { font-size: 0.9rem; color: #94a3b8; font-weight: 600; }
.training-programs-actions { display: flex; flex-direction: column; gap: 1rem; }
.training-programs-primary-link { background: #1a6ab4; color: white; text-decoration: none; padding: 1rem 2rem; border-radius: 12px; font-weight: 700; text-align: center; }
.training-programs-secondary-link { color: #1a6ab4; text-decoration: none; font-weight: 700; text-align: center; padding: 0.5rem; border: 1px solid #1a6ab4; border-radius: 12px; }

.training-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem; }
.training-card { background: white; border: 1px solid #e2e8f0; padding: 2rem; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
.training-card-topline { display: flex; justify-content: space-between; margin-bottom: 1rem; }
.training-track { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #d17c24; }
.training-duration { font-size: 0.7rem; font-weight: 800; color: #94a3b8; }
.training-card-title { font-size: 1.4rem; font-weight: 800; color: #1a6ab4; margin-bottom: 1rem; }
.training-card-desc { font-size: 0.95rem; color: #64748b; line-height: 1.6; margin-bottom: 1.5rem; }
.training-meta { display: grid; gap: 1rem; margin: 1.5rem 0; }
.training-meta dt { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; }
.training-meta dd { font-size: 0.95rem; font-weight: 600; color: #334155; }
.training-card-actions { display: flex; gap: 1rem; margin-top: 2rem; }
.training-card-link { flex: 1; padding: 0.75rem; border-radius: 10px; border: 1px solid #1a6ab4; background: white; color: #1a6ab4; font-weight: 700; text-decoration: none; text-align: center; cursor: pointer; font-family: inherit; font-size: 0.9rem; }
.training-card-link:hover { background: #f8fafc; }
.training-card-link--ghost { border-color: transparent; color: #94a3b8; font-weight: 600; }
</style>
