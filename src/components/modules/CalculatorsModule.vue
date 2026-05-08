<script setup>
/**
 * COMPONENT: CalculatorsModule
 * Extracted from ModuleDrawerView to isolate the Calculator Directory (digital-calculators) UI.
 */
const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <section class="body-section calculator-hub-portal">
    <div class="calculator-hub-intro">
      <h2 class="section-label">Calculator Directory</h2>
      <p class="calculator-hub-text">{{ module.description }}</p>
    </div>

    <article
      v-for="calculator in module.calculators || []"
      :key="calculator.id"
      class="calculator-link-card"
    >
      <div class="calculator-link-topline">
        <div>
          <h3 class="calculator-link-title">{{ calculator.heading }}</h3>
          <p class="calculator-link-subtitle">{{ calculator.buttonLabel }}</p>
        </div>
        <a :href="calculator.url" class="calculator-link-button" target="_blank">
          {{ calculator.buttonLabel }}
        </a>
      </div>

      <div class="calculator-link-body">
        <section class="calculator-copy-block">
          <h4 class="calculator-copy-heading">{{ calculator.infoTitle }}</h4>
          <p class="calculator-copy-text">{{ calculator.info }}</p>
        </section>

        <section v-if="calculator.faqs?.length" class="calculator-copy-block">
          <h4 class="calculator-copy-heading">{{ calculator.faqTitle }}</h4>
          <dl class="calculator-faq-list">
            <div
              v-for="faq in calculator.faqs"
              :key="faq.question"
              class="calculator-faq-item"
            >
              <dt>{{ faq.question }}</dt>
              <dd>{{ faq.answer }}</dd>
            </div>
          </dl>
        </section>

        <section class="calculator-copy-block">
          <h4 class="calculator-copy-heading">{{ calculator.instructionsTitle }}</h4>
          <ol class="calculator-steps">
            <li
              v-for="instruction in calculator.instructions"
              :key="instruction"
            >
              {{ instruction }}
            </li>
          </ol>
        </section>
      </div>
    </article>
  </section>
</template>

<style scoped>
.body-section { margin-bottom: 3rem; }
.section-label { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #1a6ab4; border-left: 4px solid #d17c24; padding-left: 12px; margin-bottom: 1.5rem; display: block; }

/* Calculator Hub Portal */
.calculator-hub-intro { margin-bottom: 2rem; }
.calculator-hub-text { font-size: 1.1rem; color: #64748b; }
.calculator-link-card { background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
.calculator-link-topline { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; }
.calculator-link-title { font-size: 1.5rem; font-weight: 800; color: #1a6ab4; }
.calculator-link-subtitle { font-size: 0.9rem; color: #94a3b8; font-weight: 600; margin-top: 0.25rem; }
.calculator-link-button { background: #1a6ab4; color: white; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; }
.calculator-copy-block { margin-bottom: 1.5rem; }
.calculator-copy-heading { font-size: 0.9rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.75rem; }
.calculator-copy-text { font-size: 1rem; color: #334155; line-height: 1.6; }
.calculator-faq-list { display: grid; gap: 1rem; }
.calculator-faq-item dt { font-weight: 700; color: #334155; font-size: 0.95rem; }
.calculator-faq-item dd { color: #64748b; margin-top: 0.25rem; font-size: 0.95rem; }
.calculator-steps { padding-left: 1.25rem; color: #64748b; font-size: 0.95rem; }
.calculator-steps li { margin-bottom: 0.5rem; }
</style>
