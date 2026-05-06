<script setup>
import { ref, watch } from 'vue';
/**
 * VIEW: ModuleDrawerView
 * Renders the right-hand detail drawer for the currently selected hotspot module.
 *
 * WHY THIS FILE EXISTS:
 * Every interactive hotspot eventually expands into richer educational content. Keeping
 * those layouts in a dedicated view allows the controller to stay focused on access,
 * validation, and state transitions rather than markup.
 */
const props = defineProps({
  module: {
    type: Object,
    default: null,
  },
  trackedResourceIds: {
    type: Array,
    required: true,
  },
  chatState: {
    type: Object,
    required: true,
  },
  triviaState: {
    type: Object,
    required: true,
  },
  calculatorState: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits([
  "close",
  "resource-track",
  "chat-draft-change",
  "chat-submit",
  "trivia-answer",
  "trivia-next",
  "trivia-reset",
  "calculator-change",
]);

const downloadResource = (resource) => {
  emit("resource-track", resource.id);

  const content = `ITCPH Digital Agri-Booth Asset\n\nTitle: ${resource.title}\nFormat: ${resource.format}\nDescription: ${resource.description}\n\nNOTE: This generated file demonstrates the browser download workflow.`;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${resource.title.replace(/[\\s\\W]+/g, "_")}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const handleLaunchTour = () => {
  window.open('https://s3.ap-southeast-1.amazonaws.com/tours.exsight360.com/itcph/v5/tour.html', '_blank');
};

// Newsletter Slider
const newsletterSlideIndex = ref(0);

const nextNewsletterSlide = () => {
  if (!props.module?.images?.length) return;
  newsletterSlideIndex.value = (newsletterSlideIndex.value + 1) % props.module.images.length;
};

const prevNewsletterSlide = () => {
  if (!props.module?.images?.length) return;
  newsletterSlideIndex.value =
    (newsletterSlideIndex.value - 1 + props.module.images.length) % props.module.images.length;
};

watch(
  () => props.module?.id,
  () => { newsletterSlideIndex.value = 0; }
);

const publicationCoverStyle = (publication) => ({
  '--publication-accent': publication.accent || '#1a6ab4',
});

const getProgramRegistrationUrl = (program) =>
  program.registrationUrl || props.module?.registrations?.[0]?.url || props.module?.scheduleLink || '#';
</script>

<template>
  <Transition name="premium-modal">
    <div v-if="module" class="experience-overlay">
      <div class="experience-card">
        <!-- Hero Header -->
        <header class="experience-hero">
          <div class="hero-content">
            <span class="hero-badge">{{ module.badge }}</span>
            <h1 class="hero-title">{{ module.title }}</h1>
            <p class="hero-subtitle">{{ module.summary }}</p>
          </div>
          <button
            class="experience-close"
            type="button"
            aria-label="Close"
            @click="$emit('close')"
          >
            <span class="close-icon">&times;</span>
          </button>
        </header>

        <div class="experience-body">
          <!-- Specialized 360 Virtual Tour Layout (Direct Launchpad) -->
          <template v-if="module.id === 'virtual-tour'">
            <section class="body-section tour-integration">
              <div class="tour-launch-hero">
                <div class="launch-card">
                  <div class="launch-icon">🌐</div>
                  <h2 class="launch-title">ITCPH High-Resolution 360 Tour</h2>
                  <p class="launch-desc">
                    Ready to step inside our world-class facilities? Launch the interactive 360 walkthrough in a dedicated explorer window for the most immersive experience.
                  </p>
                  <button 
                    class="prime-action-btn launch-btn-v2"
                    @click="handleLaunchTour"
                  >
                    Enter Virtual Tour ➔
                  </button>
                  <p class="launch-note">Note: This will open the tour in a new browser tab for full performance.</p>
                </div>
              </div>
            </section>
          </template>

          <!-- Specialized Advisory Chat Layout -->
          <template v-else-if="module.id === 'chat-with-us'">
            <section class="body-section chat-immersive-layout">
              <h2 class="section-label">Interactive Advisory Expert</h2>
              <div class="premium-chat-v2">
                <div class="chat-viewport-v2">
                  <div
                    v-for="message in chatState.messages"
                    :key="message.id"
                    class="msg-row-v2"
                    :class="message.role"
                  >
                    <div class="msg-bubble-v2">
                      <span class="msg-sender-v2">{{ message.role === "user" ? "Visitor" : "ITCPH Expert" }}</span>
                      <p>{{ message.text }}</p>
                    </div>
                  </div>
                </div>
                <div class="chat-input-zone-v2">
                  <div class="chat-input-inner-v2">
                    <div class="chat-chips">
                      <button 
                        v-for="p in chatState.prompts" 
                        :key="p" 
                        class="prompt-chip"
                        @click="$emit('chat-draft-change', p); $emit('chat-submit')"
                      >
                        {{ p }}
                      </button>
                    </div>
                    <div class="composer-v2">
                      <textarea
                        :value="chatState.draft"
                        placeholder="Ask about swine biosecurity, extension training..."
                        @input="$emit('chat-draft-change', $event.target.value)"
                        @keyup.enter="$emit('chat-submit')"
                      ></textarea>
                      <button
                        class="chat-submit-btn-v2"
                        :disabled="chatState.isBusy"
                        @click="$emit('chat-submit')"
                      >
                        {{ chatState.isBusy ? '...' : 'Send Query' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </template>
          <!-- Specialized Success Stories Article Layout (Official Portal) -->
          <template v-else-if="module.id === 'corporate-materials'">
            <section class="body-section success-article-portal">
              <div class="article-stack-v3">
                <article v-for="story in module.stories" :key="story.title" class="official-article-v3">
                  <header class="article-header-v3">
                    <h2 class="article-title-v3">{{ story.title }}</h2>
                    <div class="article-date-v3">📅 Published: {{ story.date }}</div>
                  </header>

                  <div class="article-visual-v3">
                    <img :src="story.image" :alt="story.title" class="article-img-v3" />
                  </div>

                  <div class="article-content-v3">
                    <div v-if="story.quote" class="article-pullquote-v3">
                      “{{ story.quote }}”
                    </div>
                    <p class="article-body-p-v3">{{ story.text }}</p>
                  </div>
                  
                  <div class="article-divider-v3"></div>
                </article>

                <!-- Footer Call to Action -->
                <div class="article-footer-v3">
                  <a 
                    href="https://www.atiitcph.com/articles" 
                    target="_blank" 
                    class="prime-action-btn footer-redirect-btn-v3"
                  >
                    View More Official Stories ➔
                  </a>
                </div>
              </div>
            </section>
          </template>

          <!-- IEC Materials Booklet Layout -->
          <template v-else-if="module.id === 'iec-materials'">
            <section class="iec-materials-portal">
              <div
                v-for="mat in module.materials"
                :key="mat.id"
                class="iec-card"
              >
                <div class="iec-cover-wrap">
                  <img
                    :src="mat.image"
                    :alt="mat.title"
                    class="iec-cover-img"
                    @error="$event.target.style.display='none'"
                  />
                </div>
                <div class="iec-info">
                  <h2 class="iec-title">{{ mat.title }}</h2>
                  <p class="iec-subtitle">{{ mat.subtitle }}</p>
                  <p class="iec-desc">{{ mat.description }}</p>
                  <a
                    :href="mat.pdfUrl"
                    target="_blank"
                    download
                    class="iec-download-btn"
                  >
                    📥 Download booklet
                  </a>
                </div>
              </div>
            </section>
          </template>

          <template v-else-if="module.id === 'corp-materials'">
            <section class="body-section corp-materials-portal">
              <div class="corp-materials-header">
                <div class="corp-materials-copy">
                  <h2 class="section-label">Publication Shelf</h2>
                  <p class="corp-materials-text">{{ module.description }}</p>
                </div>
                <a
                  v-if="module.externalLink"
                  :href="module.externalLink"
                  target="_blank"
                  rel="noreferrer"
                  class="corp-materials-hub-link"
                >
                  Open materials hub
                </a>
              </div>

              <div
                v-for="publication in module.publications"
                :key="publication.id"
                class="publication-card"
              >
                <div class="publication-cover" :style="publicationCoverStyle(publication)">
                  <img
                    v-if="publication.image"
                    :src="publication.image"
                    :alt="publication.title"
                    class="publication-cover-img"
                    @error="$event.target.style.display='none'"
                  />
                  <div v-else class="publication-cover-fallback">
                    <span class="publication-cover-kicker">{{ publication.subtitle }}</span>
                    <strong class="publication-cover-label">
                      {{ publication.coverLabel || publication.title }}
                    </strong>
                  </div>
                </div>

                <div class="publication-info">
                  <p class="publication-type">{{ publication.subtitle }}</p>
                  <h2 class="publication-title">{{ publication.title }}</h2>
                  <p class="publication-desc">{{ publication.description }}</p>
                  <a
                    :href="publication.href || module.externalLink"
                    target="_blank"
                    rel="noreferrer"
                    class="publication-action"
                  >
                    {{ publication.actionLabel || 'View publication' }}
                  </a>
                </div>
              </div>
            </section>
          </template>

          <template v-else-if="module.id === 'training-programs'">
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
                    <a
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

          <template v-else-if="module.id === 'digital-calculators'">
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
                  <a :href="calculator.url" class="calculator-link-button">
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

          <template v-else-if="module.id === 'newsletters'">
            <section class="body-section newsletter-slider-container">
              <div class="slider-viewport-v5">
                <button class="slider-nav-btn prev" @click="prevNewsletterSlide" aria-label="Previous">
                  <span>❮</span>
                </button>

                <div class="active-slide-v5">
                  <Transition name="fade-fast" mode="out-in">
                    <img
                      :key="newsletterSlideIndex"
                      :src="module.images[newsletterSlideIndex]"
                      class="newsletter-page-img"
                      alt="Newsletter edition"
                    />
                  </Transition>
                  <div class="slide-counter-v5">
                    Edition {{ newsletterSlideIndex + 1 }} of {{ module.images.length }}
                  </div>
                </div>

                <button class="slider-nav-btn next" @click="nextNewsletterSlide" aria-label="Next">
                  <span>❯</span>
                </button>
              </div>

              <div class="article-footer-v3">
                <a
                  href="https://www.atiitcph.com/newsletters"
                  target="_blank"
                  class="prime-action-btn footer-redirect-btn-v3"
                >
                  View More Official Newsletters ➔
                </a>
              </div>
            </section>
          </template>

          <!-- Specialized Bebu Game HUD Layout (Immersive Trivia) -->
          <template v-else-if="module.id === 'bebu-game'">
            <section class="body-section bebu-immersive-hud">
              <div class="bebu-header-meta">
                <div class="bebu-mission">
                  <span class="section-label">Engagement Module</span>
                  <h2>{{ module.title }}</h2>
                  <p>{{ module.summary }}</p>
                </div>
                <div class="bebu-quick-stats">
                  <div v-for="stat in module.quickStats" :key="stat.label" class="mini-stat">
                    <span class="ms-lab">{{ stat.label }}</span>
                    <span class="ms-val">{{ stat.value }}</span>
                  </div>
                </div>
              </div>

              <div class="premium-trivia-v2 large-hud">
                <template v-if="triviaState.isComplete">
                  <div class="trivia-end-screen-v2">
                    <div class="trophy-v2">🏆</div>
                    <h3>Session Complete</h3>
                    <p class="score-v2">Performance: {{ Math.round((triviaState.score / triviaState.totalQuestions) * 100) }}%</p>
                    
                    <div v-if="triviaState.leaderboard && triviaState.leaderboard.length" class="leaderboard-v2">
                      <h4>Top 10 Leaderboard</h4>
                      <table class="leaderboard-table">
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Visitor</th>
                            <th>Score</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="entry in triviaState.leaderboard" :key="entry.rank">
                            <td>{{ entry.rank }}</td>
                            <td>{{ entry.visitor }}</td>
                            <td>{{ entry.score }}/{{ entry.total }} ({{ entry.percentage }}%)</td>
                            <td>{{ entry.timeTaken }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <button class="prime-action-btn reset-btn" @click="$emit('trivia-reset')">Begin New Session</button>
                  </div>
                </template>

                <template v-else-if="triviaState.question">
                  <div class="trivia-hud-v2">
                    <div class="hud-item-v2">
                      <span class="hud-label-v2">Progress</span>
                      <div class="hud-progress-v2">
                        <div class="hud-fill-v2" :style="{ width: (triviaState.currentIndex / triviaState.totalQuestions) * 100 + '%' }"></div>
                      </div>
                      <span class="hud-sub-label">{{ triviaState.currentIndex }} of {{ triviaState.totalQuestions }}</span>
                    </div>
                    <div class="hud-item-v2 score-hud">
                      <span class="hud-label-v2">Current Score</span>
                      <span class="hud-val-v2">{{ triviaState.score * 100 }} <small>XP</small></span>
                    </div>
                  </div>

                  <div class="trivia-main-stage">
                    <div class="question-container">
                      <span class="q-difficulty" :class="triviaState.question.difficulty?.toLowerCase()">{{ triviaState.question.difficulty }} Level</span>
                      <p class="question-v2">{{ triviaState.question.prompt }}</p>
                    </div>

                    <div class="options-v2 grid-2x2">
                      <button
                        v-for="option in triviaState.question.options"
                        :key="option.id"
                        class="option-btn-v2"
                        :class="{
                          'is-correct': triviaState.hasAnswered && option.id === triviaState.question.correctOptionId,
                          'is-incorrect': triviaState.hasAnswered && triviaState.selectedOptionId === option.id && option.id !== triviaState.question.correctOptionId
                        }"
                        :disabled="triviaState.hasAnswered"
                        @click="$emit('trivia-answer', option.id)"
                      >
                        <span class="opt-prefix-v2">{{ option.id.toUpperCase() }}</span>
                        <span class="opt-text-v2">{{ option.label }}</span>
                      </button>
                    </div>

                    <Transition name="fade-up">
                      <div v-if="triviaState.hasAnswered" class="explanation-v2 hud-style">
                        <div class="exp-content">
                          <strong>{{ triviaState.question.correctOptionId.toUpperCase() === triviaState.selectedOptionId.toUpperCase() ? '✓ Correct Answer!' : '× Knowledge Check' }}</strong>
                          <p>{{ triviaState.question.explanation }}</p>
                        </div>
                        <button class="prime-action-btn next-v2" @click="$emit('trivia-next')">Next Question ➔</button>
                      </div>
                    </Transition>
                  </div>
                </template>

                <div v-else-if="triviaState.isLoading" class="bebu-loading">
                  <div class="spinner"></div>
                  <p>Initializing your knowledge session...</p>
                </div>

                <div v-else-if="triviaState.error" class="bebu-start-screen">
                  <div class="bebu-error">
                    <p>⚠️ {{ triviaState.error }}</p>
                  </div>
                  <button class="prime-action-btn" @click="$emit('trivia-reset')">
                    Retry Connection
                  </button>
                </div>
              </div>

              <!-- Benefits section at the bottom -->
              <div class="bebu-footer-benefits">
                <h3 class="mini-label">Core Learning Benefits</h3>
                <div class="benefits-grid">
                  <div v-for="point in module.highlights" :key="point" class="benefit-tag">
                    <span class="check">✓</span> {{ point }}
                  </div>
                </div>
              </div>
            </section>
          </template>

          <!-- Standard Main Content Section -->
          <div v-else class="main-layout">
            <!-- Left Side: Narrative & Strategy -->
            <div class="narrative-stack">
              <section class="body-section">
                <h2 class="section-label">Overview</h2>
                <p class="body-text">{{ module.description }}</p>
              </section>

              <!-- Resource Library / Publication Shelf -->
              <section v-if="module.resources?.length" class="body-section">
                <span class="section-label">Digital Library & Materials</span>
                <div class="library-grid">
                  <div 
                    v-for="res in module.resources" 
                    :key="res.id" 
                    class="resource-card"
                    :class="{ 'is-collected': trackedResourceIds.includes(res.id) }"
                  >
                    <div class="res-icon">
                      <span v-if="res.format.includes('PDF')">📄</span>
                      <span v-else-if="res.format.includes('Video')">🎥</span>
                      <span v-else>📦</span>
                    </div>
                    <div class="res-content">
                      <h4 class="res-title">{{ res.title }}</h4>
                      <p class="res-desc">{{ res.description }}</p>
                      <button 
                        class="prime-action-btn res-btn"
                        @click="downloadResource(res)"
                        :disabled="trackedResourceIds.includes(res.id)"
                      >
                        {{ trackedResourceIds.includes(res.id) ? 'Collected' : 'Download Now' }}
                      </button>
                    </div>
                    <div class="res-badge" v-if="trackedResourceIds.includes(res.id)">
                      ✓
                    </div>
                  </div>
                </div>
              </section>

              <section v-if="module.quickStats.length" class="body-section">
                <h2 class="section-label">Strategic Metrics</h2>
                <div class="premium-stats">
                  <div
                    v-for="metric in module.quickStats"
                    :key="metric.label"
                    class="premium-stat-card"
                  >
                    <div class="stat-icon">📊</div>
                    <div class="stat-data">
                      <span class="stat-val">{{ metric.value }}</span>
                      <span class="stat-lab">{{ metric.label }}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section v-if="module.highlights.length" class="body-section">
                <h2 class="section-label">Core Benefits</h2>
                <div class="benefits-grid">
                  <div v-for="point in module.highlights" :key="point" class="benefit-tag">
                    <span class="check">✓</span> {{ point }}
                  </div>
                </div>
              </section>
            </div>

            <!-- Right Side: Action & Tools -->
            <div class="action-stack">
              <section v-if="module.resources.length" class="body-section">
                <h2 class="section-label">Knowledge Assets</h2>
                <div class="asset-rack">
                  <div
                    v-for="resource in module.resources"
                    :key="resource.id"
                    class="asset-card"
                  >
                    <div class="asset-header">
                      <span class="asset-type">{{ resource.format }}</span>
                      <span class="asset-status">{{ resource.status }}</span>
                    </div>
                    <h3 class="asset-title">{{ resource.title }}</h3>
                    <p class="asset-desc">{{ resource.description }}</p>
                    <button
                      class="asset-action-btn"
                      :disabled="trackedResourceIds.includes(resource.id)"
                      @click="downloadResource(resource)"
                    >
                      <span v-if="trackedResourceIds.includes(resource.id)">✓ Collected</span>
                      <span v-else>Download Resource</span>
                    </button>
                  </div>
                </div>
              </section>

              <!-- Standard Interactive Modules Logic -->
              <section v-if="module.id === 'bebu-game'" class="body-section interactive-module">
                <h2 class="section-label">Skill Verification HUD</h2>
                <div class="premium-trivia-v2">
                  <template v-if="triviaState.isComplete">
                    <div class="trivia-end-screen-v2">
                      <div class="trophy-v2">🏆</div>
                      <h3>Session Complete</h3>
                      <p class="score-v2">Performance: {{ Math.round((triviaState.score / triviaState.totalQuestions) * 100) }}%</p>
                      
                      <div v-if="triviaState.leaderboard && triviaState.leaderboard.length" class="leaderboard-v2">
                        <h4>Top 10 Leaderboard</h4>
                        <table class="leaderboard-table">
                          <thead>
                            <tr>
                              <th>Rank</th>
                              <th>Visitor</th>
                              <th>Score</th>
                              <th>Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="entry in triviaState.leaderboard" :key="entry.rank">
                              <td>{{ entry.rank }}</td>
                              <td>{{ entry.visitor }}</td>
                              <td>{{ entry.score }}/{{ entry.total }} ({{ entry.percentage }}%)</td>
                              <td>{{ entry.timeTaken }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <button class="prime-action-btn" @click="$emit('trivia-reset')">Begin New Session</button>
                    </div>
                  </template>
                  <template v-else-if="triviaState.question">
                    <div class="trivia-hud-v2">
                      <div class="hud-item-v2">
                        <span class="hud-label-v2">Progress</span>
                        <div class="hud-progress-v2">
                          <div class="hud-fill-v2" :style="{ width: (triviaState.currentIndex / triviaState.totalQuestions) * 100 + '%' }"></div>
                        </div>
                      </div>
                      <div class="hud-item-v2">
                        <span class="hud-label-v2">Score</span>
                        <span class="hud-val-v2">{{ triviaState.score * 100 }} XP</span>
                      </div>
                    </div>
                    <div class="trivia-box-v2">
                      <p class="question-v2">{{ triviaState.question.prompt }}</p>
                      <div class="options-v2">
                        <button
                          v-for="option in triviaState.question.options"
                          :key="option.id"
                          class="option-btn-v2"
                          :class="{
                            'is-correct': triviaState.hasAnswered && option.id === triviaState.question.correctOptionId,
                            'is-incorrect': triviaState.hasAnswered && triviaState.selectedOptionId === option.id && option.id !== triviaState.question.correctOptionId
                          }"
                          :disabled="triviaState.hasAnswered"
                          @click="$emit('trivia-answer', option.id)"
                        >
                          <span class="opt-prefix-v2">{{ option.id.toUpperCase() }}</span>
                          <span class="opt-text-v2">{{ option.label }}</span>
                        </button>
                      </div>
                      <div v-if="triviaState.hasAnswered" class="explanation-v2">
                        <p>{{ triviaState.question.explanation }}</p>
                        <button class="prime-action-btn next-v2" @click="$emit('trivia-next')">Continue ➔</button>
                      </div>
                    </div>
                  </template>
                </div>
              </section>

              <!-- E-Learning Dashboard Module -->
              <section v-if="module.id === 'e-learning'" class="body-section interactive-module">
                <h2 class="section-label">Training Dashboard</h2>
                <div class="learning-grid-v2">
                  <div v-for="res in module.resources" :key="res.id" class="course-card-v2">
                    <div class="course-header-v2">
                      <span class="course-tag-v2">{{ res.format }}</span>
                      <div class="course-play-v2">▶</div>
                    </div>
                    <div class="course-body-v2">
                      <h4 class="course-title-v2">{{ res.title }}</h4>
                      <p class="course-desc-v2">{{ res.description }}</p>
                      <div class="course-progress-v2">
                        <div class="prog-bar-v2">
                          <div class="prog-fill-v2" :style="{ width: trackedResourceIds.includes(res.id) ? '100%' : '0%' }"></div>
                        </div>
                        <span class="prog-stat-v2">{{ trackedResourceIds.includes(res.id) ? 'Completed' : 'Ready to Start' }}</span>
                      </div>
                      <button 
                        class="course-action-v2" 
                        :disabled="trackedResourceIds.includes(res.id)"
                        @click="downloadResource(res)"
                      >
                        {{ trackedResourceIds.includes(res.id) ? 'Resume Course' : 'Enroll Now' }}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Calculator Module (v2 Projection Engine) -->
              <section v-if="module.id === 'digital-calculators'" class="body-section interactive-module">
                <h2 class="section-label">Production Projection Engine</h2>
                <div class="premium-calculator-v2">
                  <div class="calc-main-v2">
                    <div class="calc-inputs-v2">
                      <div v-for="field in calculatorState.fields" :key="field.id" class="calc-field-v2">
                        <label>{{ field.label }}</label>
                        <div class="inp-box-v2">
                          <input
                            :value="calculatorState.inputs[field.id]"
                            type="number"
                            @input="$emit('calculator-change', { field: field.id, value: $event.target.value })"
                          />
                          <span class="unit-v2">{{ field.suffix }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="calc-viz-v2">
                      <div class="viz-meter-v2">
                        <svg viewBox="0 0 100 60" class="gauge-svg">
                          <path d="M10,50 A40,40 0 1,1 90,50" fill="none" stroke="#e2e8f0" stroke-width="8" stroke-linecap="round"/>
                          <path 
                            d="M10,50 A40,40 0 1,1 90,50" 
                            fill="none" 
                            stroke="#d17c24" 
                            stroke-width="8" 
                            stroke-linecap="round"
                            stroke-dasharray="125.6"
                            :stroke-dashoffset="125.6 - (125.6 * (Math.min(calculatorState.results[0]?.value.replace(/[^0-9]/g, '') || 50, 1000) / 1000))"
                          />
                        </svg>
                        <div class="viz-val-v2">{{ calculatorState.results[0]?.value }}</div>
                        <div class="viz-lab-v2">Est. Annual Return</div>
                      </div>
                    </div>
                  </div>

                  <div class="calc-summary-v2">
                    <div v-for="res in calculatorState.results" :key="res.label" class="summary-item-v2">
                      <span class="sum-lab-v2">{{ res.label }}</span>
                      <span class="sum-val-v2">{{ res.value }}</span>
                    </div>
                    <button class="prime-action-btn save-calc-btn">
                      💾 Save Projection
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.experience-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 25, 18, 0.6);
  backdrop-filter: blur(12px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 2rem;
}

.experience-card {
  background: #ffffff;
  width: 95%;
  max-width: 95%;
  height: 95vh;
  max-height: 95vh;
  border-radius: 32px;
  box-shadow: 0 50px 150px -30px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
}

/* Premium Hero Header */
.experience-hero {
  position: relative;
  padding: 0.8rem 2.5rem;
  background: linear-gradient(135deg, #1a6ab4 0%, #124d85 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.2rem;
}

.hero-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.hero-subtitle {
  margin: 0.1rem 0 0;
  font-size: 0.85rem;
  opacity: 0.9;
  max-width: 800px;
  line-height: 1.4;
}

.experience-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.experience-close:hover {
  background: #d17c24;
  transform: rotate(90deg) scale(1.1);
}

/* Body Layout */
.experience-body {
  padding: 2.5rem 3.5rem;
  overflow-y: auto;
}

.main-layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 5rem;
}

.body-section {
  margin-bottom: 4rem;
}

.section-label {
  font-size: 0.9rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #1a6ab4;
  letter-spacing: 0.12em;
  margin-bottom: 2rem;
  display: block;
  border-left: 5px solid #d17c24;
  padding-left: 16px;
}

.body-text {
  font-size: 1.15rem;
  line-height: 1.9;
  color: #334155;
}

/* --- V2 FEATURE STYLES --- */

/* 1. Library & Resources */
.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.resource-card {
  background: #f8fafc;
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 1.25rem;
  position: relative;
  transition: all 0.3s ease;
}

.resource-card:hover {
  background: white;
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.08);
  border-color: #1a6ab4;
}

.res-icon { font-size: 2rem; }
.res-title { margin: 0 0 0.5rem; font-size: 1rem; color: #1e293b; }
.res-desc { font-size: 0.85rem; color: #64748b; line-height: 1.5; margin-bottom: 1.25rem; }
.res-btn { font-size: 0.8rem; padding: 0.6rem 1rem; width: 100%; }

.res-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #10b981;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 2. Chat v2 */
.premium-chat-v2 {
  background: white;
  border-radius: 28px;
  height: 650px;
  width: 100%;
  max-width: 1000px;
  margin: 1rem auto;
  display: grid;
  grid-template-rows: 1fr auto;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 15px 45px rgba(0,0,0,0.05);
}

.chat-viewport-v2 {
  padding: 1.5rem 2.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: #f8fafc;
}

.msg-row-v2 { display: flex; width: 100%; transition: transform 0.3s ease; }
.msg-row-v2.assistant { justify-content: flex-start; padding-right: 2rem; }
.msg-row-v2.user { justify-content: flex-end; padding-left: 2rem; }

.msg-bubble-v2 {
  max-width: 70%;
  padding: 0.85rem 1.1rem;
  border-radius: 18px;
  position: relative;
  font-size: 0.95rem;
  line-height: 1.45;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  word-break: break-word;
  overflow-wrap: break-word;
}

.assistant .msg-bubble-v2 { 
  background: white; 
  color: #1e293b; 
  border-bottom-left-radius: 4px; 
  border: 1px solid #e2e8f0; 
}
.user .msg-bubble-v2 { 
  background: #1a6ab4; 
  color: white; 
  border-bottom-right-radius: 4px; 
  box-shadow: 0 8px 20px rgba(26, 106, 180, 0.2);
}

.msg-sender-v2 { display: block; font-size: 0.6rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; opacity: 0.7; letter-spacing: 0.05em; }

.chat-input-zone-v2 {
  background: white;
  padding: 1.5rem 2.5rem 2rem;
  border-top: 1px solid #e2e8f0;
}

.chat-input-inner-v2 {
  max-width: 850px;
  margin: 0 auto;
}

.chat-chips { display: flex; gap: 0.5rem; margin-bottom: 1rem; overflow-x: auto; padding-bottom: 0.5rem; }
.prompt-chip {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}
.prompt-chip:hover { border-color: #1a6ab4; color: #1a6ab4; background: #f0f7ff; }

.composer-v2 { display: flex; gap: 1rem; }
.composer-v2 textarea { flex: 1; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; font-family: inherit; font-size: 0.95rem; resize: none; height: 50px; }
.chat-submit-btn-v2 { background: #1a6ab4; color: white; border: none; padding: 0 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; }

/* 3. Trivia v2 */
.premium-trivia-v2 {
  background: #f8fafc;
  border-radius: 24px;
  padding: 2.5rem;
  border: 1px solid #e2e8f0;
}

.trivia-hud-v2 {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  background: #1e293b;
  padding: 1.25rem 2rem;
  border-radius: 16px;
  color: white;
}

.hud-item-v2 { flex: 1; }
.hud-label-v2 { display: block; font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; }
.hud-progress-v2 { height: 8px; background: rgba(255,255,255,0.1); border-radius: 99px; overflow: hidden; }
.hud-fill-v2 { height: 100%; background: #d17c24; transition: width 0.3s ease; }
.hud-val-v2 { font-size: 1.2rem; font-weight: 900; }

.question-v2 { font-size: 1.5rem; font-weight: 800; color: #1e293b; line-height: 1.4; margin-bottom: 2rem; }

.options-v2 { display: grid; gap: 1rem; }
.option-btn-v2 {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.option-btn-v2:hover:not(:disabled) { border-color: #1a6ab4; background: #f0f7ff; transform: scale(1.02); }
.opt-prefix-v2 { background: #f1f5f9; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: 900; font-size: 0.8rem; color: #64748b; }
.opt-text-v2 { font-weight: 700; font-size: 1.1rem; color: #334155; }

.option-btn-v2.is-correct { background: #ecfdf5; border-color: #10b981; }
.option-btn-v2.is-correct .opt-prefix-v2 { background: #10b981; color: white; }
.option-btn-v2.is-incorrect { background: #fef2f2; border-color: #ef4444; }
.option-btn-v2.is-incorrect .opt-prefix-v2 { background: #ef4444; color: white; }

.explanation-v2 { margin-top: 2rem; padding: 1.5rem; background: #f1f5f9; border-radius: 16px; border-left: 4px solid #1a6ab4; }
.next-v2 { margin-top: 1.5rem; }

.trivia-end-screen-v2 { text-align: center; padding: 2rem; }
.trophy-v2 { font-size: 5rem; margin-bottom: 1rem; }
.score-v2 { font-size: 2rem; font-weight: 900; color: #1a6ab4; }
.rank-badge-v2 { display: inline-block; padding: 8px 20px; border-radius: 99px; font-weight: 800; font-size: 0.9rem; text-transform: uppercase; margin: 1rem 0 2rem; }
.rank-badge-v2.elite { background: #fff4e6; color: #d17c24; border: 1px solid #fbd38d; }
.rank-badge-v2.certified { background: #f1f5f9; color: #64748b; }

.leaderboard-v2 {
  margin: 2rem 0;
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  text-align: left;
}

.leaderboard-v2 h4 {
  margin-bottom: 1rem;
  color: #1a6ab4;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.leaderboard-table th {
  text-align: left;
  padding: 0.5rem;
  border-bottom: 2px solid #f1f5f9;
  color: #64748b;
  font-weight: 700;
}

.leaderboard-table td {
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.leaderboard-table tr:last-child td {
  border-bottom: none;
}

/* 4. E-Learning v2 */
.learning-grid-v2 {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.course-card-v2 {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.course-card-v2:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }

.course-header-v2 {
  height: 160px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.course-tag-v2 { position: absolute; top: 1rem; left: 1rem; background: rgba(255,255,255,0.15); color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
.course-play-v2 { width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(4px); }

.course-body-v2 { padding: 1.75rem; }
.course-title-v2 { margin: 0 0 0.5rem; font-size: 1.2rem; color: #1e293b; }
.course-desc-v2 { font-size: 0.9rem; color: #64748b; line-height: 1.6; margin-bottom: 1.5rem; min-height: 3.2rem; }

.course-progress-v2 { margin-bottom: 1.5rem; }
.prog-bar-v2 { height: 6px; background: #f1f5f9; border-radius: 99px; overflow: hidden; margin-bottom: 8px; }
.prog-fill-v2 { height: 100%; background: #10b981; transition: width 0.5s ease; }
.prog-stat-v2 { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }

.course-action-v2 { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.8rem; border-radius: 12px; font-weight: 700; color: #1a6ab4; cursor: pointer; transition: all 0.2s ease; }
.course-action-v2:hover:not(:disabled) { background: #1a6ab4; color: white; border-color: #1a6ab4; }
.course-action-v2:disabled { color: #10b981; background: #ecfdf5; border-color: #d1fae5; cursor: default; }

/* 360 Tour Integration Styles (Launchpad) */
.tour-launch-hero {
  display: grid;
  place-items: center;
  padding: 4rem 2rem;
  background: radial-gradient(circle at center, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 32px;
  border: 1px solid #e2e8f0;
}

.launch-card {
  max-width: 500px;
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 28px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.06);
}

.launch-icon { font-size: 4rem; margin-bottom: 1.5rem; }
.launch-title { font-size: 1.8rem; font-weight: 900; color: #1a6ab4; margin-bottom: 1rem; }
.launch-desc { color: #64748b; font-size: 1.1rem; line-height: 1.6; margin-bottom: 2.5rem; }
.launch-btn-v2 { font-size: 1.1rem; padding: 1.25rem 2rem; }
.launch-note { margin-top: 1.5rem; font-size: 0.8rem; color: #94a3b8; font-style: italic; }

/* Metric Cards */
.premium-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.premium-stat-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 1.5rem;
  background: white;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.stat-val {
  display: block;
  font-size: 1.6rem;
  font-weight: 800;
  color: #1a6ab4;
}

.stat-lab {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

/* Benefits */
.benefits-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.benefit-tag {
  background: #f1f5f9;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 700;
  color: #1e293b;
  font-size: 0.95rem;
}

.benefit-tag .check {
  color: #10b981;
  margin-right: 6px;
}

/* Asset Cards */
.asset-rack {
  display: grid;
  gap: 1.25rem;
}

.asset-card {
  background: #ffffff;
  border: 2px solid #f1f5f9;
  border-radius: 24px;
  padding: 1.75rem;
  transition: all 0.3s ease;
}

.asset-card:hover {
  border-color: #1a6ab4;
  box-shadow: 0 20px 40px rgba(26, 106, 180, 0.08);
  transform: translateY(-4px);
}

.asset-header {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
}

.asset-type, .asset-status {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.asset-type { background: rgba(26, 106, 180, 0.1); color: #1a6ab4; }
.asset-status { background: #fef3c7; color: #92400e; }

.asset-title { margin: 0 0 0.5rem; font-size: 1.2rem; color: #0f172a; }
.asset-desc { color: #64748b; font-size: 0.95rem; margin-bottom: 1.5rem; }

.asset-action-btn, .prime-action-btn {
  width: 100%;
  padding: 1rem;
  border-radius: 14px;
  border: none;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.asset-action-btn {
  background: #f1f5f9;
  color: #1e293b;
}

.asset-action-btn:hover:not(:disabled) {
  background: #1a6ab4;
  color: white;
}

.prime-action-btn {
  background: #1a6ab4;
  color: white;
  box-shadow: 0 10px 20px rgba(26, 106, 180, 0.3);
}

.prime-action-btn:hover {
  background: #124d85;
  transform: translateY(-2px);
}

/* Chat UX */
.premium-chat {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  overflow: hidden;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.chat-viewport {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.msg-bubble {
  max-width: 85%;
  padding: 1.25rem;
  border-radius: 20px;
  position: relative;
}

.msg-row.user { align-self: flex-end; }
.msg-row.user .msg-bubble { background: #1a6ab4; color: white; border-bottom-right-radius: 4px; }
.msg-row.assistant .msg-bubble { background: white; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }

.msg-sender { display: block; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; margin-bottom: 6px; opacity: 0.8; }

.chat-input-zone {
  padding: 1.5rem;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
}

.chat-input-zone textarea {
  flex: 1;
  border: none;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 12px;
  resize: none;
  height: 50px;
  font-family: inherit;
}

.chat-submit-btn {
  background: #1a6ab4;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0 20px;
  font-weight: 800;
  cursor: pointer;
}

/* Trivia UX */
.premium-trivia {
  background: #ffffff;
  border: 2px solid #f1f5f9;
  border-radius: 24px;
  padding: 2rem;
}

.trivia-hud {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 2rem;
}

.question-prompt { font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-bottom: 2rem; line-height: 1.4; }

.option-set {
  display: grid;
  gap: 12px;
}

.option-btn {
  text-align: left;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  border: 2px solid #f1f5f9;
  background: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn:hover:not(:disabled) {
  border-color: #1a6ab4;
  background: #f0f7ff;
  transform: translateX(10px);
}

.option-btn.is-correct { background: #ecfdf5; border-color: #10b981; color: #065f46; }
.option-btn.is-incorrect { background: #fef2f2; border-color: #ef4444; color: #991b1b; }

.next-q { margin-top: 2rem; }

/* 5. Calculator v2 */
.premium-calculator-v2 {
  background: #f8fafc;
  border-radius: 26px;
  padding: 3.5rem;
  border: 1px solid #e2e8f0;
}

.calc-main-v2 {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.calc-inputs-v2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.calc-field-v2 label { display: block; font-size: 0.8rem; font-weight: 800; color: #475569; margin-bottom: 6px; }
.inp-box-v2 { display: flex; align-items: center; background: white; border-radius: 12px; border: 1.5px solid #e2e8f0; overflow: hidden; transition: border-color 0.2s ease; }
.inp-box-v2:focus-within { border-color: #1a6ab4; }
.inp-box-v2 input { flex: 1; border: none; padding: 12px; font-weight: 700; font-size: 1rem; width: 60px; }
.unit-v2 { background: #f1f5f9; padding: 12px; font-size: 0.7rem; font-weight: 800; color: #64748b; border-left: 1px solid #e2e8f0; }

.calc-viz-v2 {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(26, 106, 180, 0.05);
  border: 1px solid #f1f5f9;
}

.gauge-svg { width: 180px; filter: drop-shadow(0 5px 15px rgba(209,124,36,0.1)); }
.viz-val-v2 { font-size: 1.75rem; font-weight: 900; color: #d17c24; margin-top: -15px; }
.viz-lab-v2 { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-top: 4px; }

.calc-summary-v2 {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1.5rem;
  align-items: center;
  background: #1e293b;
  padding: 1.25rem 2rem;
  border-radius: 20px;
  color: white;
}

.summary-item-v2 { display: flex; flex-direction: column; gap: 4px; }
.sum-lab-v2 { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; opacity: 0.8; }
.sum-val-v2 { font-size: 1.4rem; font-weight: 800; color: #d17c24; }
.save-calc-btn { width: auto; max-width: fit-content; padding-left: 2rem; padding-right: 2rem; }

/* Calculator Directory */
.calculator-hub-portal {
  padding: 2rem !important;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.calculator-hub-intro {
  padding: 0.25rem 0.25rem 0;
}

.calculator-hub-text {
  margin: 0.7rem 0 0;
  color: #475569;
  line-height: 1.7;
  max-width: 48rem;
}

.calculator-link-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: 24px;
  background: white;
  border: 1px solid #dbe5f0;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.05);
}

.calculator-link-topline {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.calculator-link-title {
  margin: 0;
  color: #0f172a;
  font-size: 1.3rem;
  line-height: 1.3;
}

.calculator-link-subtitle {
  margin: 0.35rem 0 0;
  color: #1a6ab4;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.calculator-link-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.95rem 1.25rem;
  border-radius: 14px;
  background: #1a6ab4;
  color: white;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.calculator-link-body {
  display: grid;
  gap: 1rem;
}

.calculator-copy-block {
  display: grid;
  gap: 0.6rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.calculator-copy-heading {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 800;
}

.calculator-copy-text {
  margin: 0;
  color: #475569;
  line-height: 1.75;
}

.calculator-faq-list {
  display: grid;
  gap: 0.85rem;
  margin: 0;
}

.calculator-faq-item {
  display: grid;
  gap: 0.25rem;
}

.calculator-faq-item dt {
  color: #1e293b;
  font-weight: 800;
}

.calculator-faq-item dd {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.calculator-steps {
  margin: 0;
  padding-left: 1.2rem;
  color: #475569;
  line-height: 1.8;
}

.calculator-steps li + li {
  margin-top: 0.45rem;
}

/* Transitions */
.premium-modal-enter-active, .premium-modal-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.premium-modal-enter-from, .premium-modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}



/* 8. Success Stories Article Portal Styles */
.success-article-portal {
  padding: 3rem 2rem !important;
  background: white;
  min-height: 100%;
}

.article-stack-v3 {
  max-width: 850px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.official-article-v3 {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.article-header-v3 {
  border-left: 4px solid #1a6ab4;
  padding-left: 1.5rem;
}

.article-title-v3 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.article-date-v3 {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.article-visual-v3 {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  background: #f1f5f9;
}

.article-img-v3 {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.article-content-v3 {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.article-pullquote-v3 {
  font-size: 1.25rem;
  font-weight: 700;
  font-style: italic;
  color: #1a6ab4;
  padding: 1.5rem;
  background: #f0f7ff;
  border-radius: 12px;
  line-height: 1.4;
}

.article-body-p-v3 {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #334155;
  white-space: pre-wrap;
}

.article-divider-v3 {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  margin-top: 2rem;
}

.article-footer-v3 {
  padding: 4rem 0;
  display: flex;
  justify-content: center;
}

.footer-redirect-btn-v3 {
  padding: 1.25rem 3rem;
  font-size: 1.1rem;
  text-decoration: none;
}

@media (max-width: 1000px) {
  .article-title-v3 { font-size: 1.75rem; }
  .success-article-portal { padding: 1.5rem !important; }
}

@media (max-width: 1100px) {
  .premium-chat-v2 { height: 500px; max-width: 95%; }
  .chat-viewport-v2 { padding: 1rem 1.5rem; }
  .msg-bubble-v2 { max-width: 90%; }
}

@media (max-width: 1000px) {
  .main-layout { grid-template-columns: 1fr; gap: 2rem; }
  .experience-hero { padding: 2.5rem; }
  .experience-body { padding: 1.5rem; }
  .hero-title { font-size: 2.2rem; }
}

/* Newsletter Slider Styles */
.newsletter-slider-container {
  padding: 2rem 1.5rem !important;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 100%;
}

.slider-viewport-v5 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  width: 100%;
}

.active-slide-v5 {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  padding: 1rem;
  text-align: center;
  overflow: hidden;
}

.newsletter-page-img {
  width: 100%;
  height: auto;
  max-height: 72vh;
  object-fit: contain;
  display: block;
  border-radius: 6px;
}

.slide-counter-v5 {
  margin-top: 1rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.slider-nav-btn {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: white;
  color: #1a6ab4;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: background 0.2s, color 0.2s, transform 0.15s;
}

.slider-nav-btn:hover {
  background: #1a6ab4;
  color: white;
  transform: scale(1.1);
}

.slider-nav-btn:active {
  transform: scale(0.95);
}

/* Slide transition */
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.2s ease;
}
.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}

/* Slide transition */
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.2s ease;
}
.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}

/* 9. Bebu Immersive HUD Styles */
.bebu-immersive-hud {
  padding: 1rem 1rem !important;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 100%;
}

.bebu-header-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.04);
}

.bebu-mission h2 { font-size: 1.8rem; font-weight: 900; color: #1a6ab4; margin-top: 0.25rem; }
.bebu-mission p { color: #64748b; font-size: 0.95rem; margin-top: 0.25rem; }

.bebu-quick-stats { display: flex; gap: 1rem; }
.mini-stat {
  background: #f8fafc;
  padding: 0.75rem 1.25rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  min-width: 140px;
}
.ms-lab { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
.ms-val { font-size: 1rem; font-weight: 800; color: #1a6ab4; }

.large-hud {
  background: white !important;
  border-radius: 32px !important;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.1) !important;
  min-height: 550px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.trivia-main-stage {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.question-container { text-align: center; margin-bottom: 3rem; }
.q-difficulty { 
  display: inline-block; 
  padding: 4px 12px; 
  border-radius: 99px; 
  font-size: 0.7rem; 
  font-weight: 800; 
  text-transform: uppercase; 
  margin-bottom: 1rem; 
}
.q-difficulty.easy { background: #ecfdf5; color: #10b981; }
.q-difficulty.medium { background: #fffbeb; color: #d97706; }
.q-difficulty.hard { background: #fef2f2; color: #ef4444; }

.grid-2x2 {
  display: grid !important;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem !important;
}

.score-hud { text-align: right; }
.hud-sub-label { font-size: 0.75rem; color: #94a3b8; font-weight: 700; margin-top: 4px; display: block; }

.explanation-v2.hud-style {
  background: #1e293b;
  color: white;
  margin-top: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-radius: 20px;
  border-left: 6px solid #d17c24;
}

.exp-content strong { font-size: 1.1rem; color: #d17c24; display: block; margin-bottom: 0.25rem; }
.exp-content p { opacity: 0.9; font-size: 1rem; }
.next-v2 { width: auto !important; padding: 1rem 2.5rem !important; }

.bebu-footer-benefits {
  margin-top: auto;
  padding: 1.5rem 2rem;
}
.mini-label { font-size: 0.8rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 1rem; }

.bebu-loading { text-align: center; }
.spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top: 4px solid #1a6ab4; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }

.reset-btn { width: auto !important; padding-left: 3rem !important; padding-right: 3rem !important; }

@media (max-width: 768px) {
  .grid-2x2 { grid-template-columns: 1fr; }
  .bebu-header-meta { flex-direction: column; gap: 1rem; }
}

@media (max-width: 768px) {
  .slider-viewport-v5 { position: relative; }
  .slider-nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 38px;
    height: 38px;
    font-size: 1rem;
  }
  .slider-nav-btn.prev { left: 4px; }
  .slider-nav-btn.next { right: 4px; }
}

/* Corporate Materials Drawer */
.corp-materials-portal {
  padding: 2rem !important;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.corp-materials-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
  padding: 0 0.25rem;
}

.corp-materials-copy {
  max-width: 42rem;
}

.corp-materials-text {
  margin: 0.65rem 0 0;
  color: #475569;
  line-height: 1.7;
}

.corp-materials-hub-link {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.25rem;
  border-radius: 14px;
  background: #1a6ab4;
  color: white;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 14px 28px rgba(26, 106, 180, 0.2);
}

.publication-card {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 24px;
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.publication-cover {
  flex-shrink: 0;
  width: 140px;
  min-height: 188px;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(165deg, var(--publication-accent), #0f172a);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.publication-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.publication-cover-fallback {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.55rem;
  padding: 1rem;
  color: white;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.22), transparent 44%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0.22));
}

.publication-cover-kicker {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.84;
}

.publication-cover-label {
  font-size: 1.15rem;
  line-height: 1.2;
}

.publication-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.publication-type {
  margin: 0;
  color: #1a6ab4;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.publication-title {
  margin: 0.35rem 0 0;
  color: #0f172a;
  font-size: 1.35rem;
  line-height: 1.3;
}

.publication-desc {
  margin: 0.85rem 0 1.25rem;
  color: #475569;
  line-height: 1.7;
}

.publication-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  background: #0f172a;
  color: white;
  font-weight: 800;
  text-decoration: none;
}

/* Training Programs Drawer */
.training-programs-portal {
  padding: 2rem !important;
  background:
    radial-gradient(circle at top right, rgba(26, 106, 180, 0.08), transparent 30%),
    #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.training-programs-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(250px, 0.9fr);
  gap: 1.5rem;
  padding: 1.75rem;
  border-radius: 28px;
  background: white;
  border: 1px solid #dbe5f0;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);
}

.training-programs-title {
  margin: 0.55rem 0 0;
  color: #0f172a;
  font-size: clamp(1.7rem, 2vw, 2.2rem);
  line-height: 1.2;
}

.training-programs-text {
  margin: 0.85rem 0 0;
  color: #475569;
  line-height: 1.75;
}

.training-programs-contact {
  margin: 1rem 0 0;
  color: #1e293b;
  font-weight: 700;
}

.training-programs-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.training-programs-primary-link,
.training-programs-secondary-link,
.training-card-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.1rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 800;
}

.training-programs-primary-link,
.training-card-link {
  background: #1a6ab4;
  color: white;
}

.training-programs-secondary-link {
  background: #eef4fb;
  color: #1a6ab4;
  border: 1px solid #cfe0f3;
}

.training-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.training-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 24px;
  background: white;
  border: 1px solid #dbe5f0;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.05);
}

.training-card-topline {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.training-track,
.training-duration {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.training-track {
  background: #edf7f1;
  color: #1f6a45;
}

.training-duration {
  background: #f4efe2;
  color: #8b5e1f;
}

.training-card-title {
  margin: 0;
  color: #0f172a;
  font-size: 1.2rem;
  line-height: 1.35;
}

.training-card-desc {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.training-meta {
  display: grid;
  gap: 0.85rem;
  margin: 0;
}

.training-meta-item {
  display: grid;
  gap: 0.25rem;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.training-meta-item dt {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.training-meta-item dd {
  margin: 0;
  color: #1e293b;
  line-height: 1.55;
}

.training-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: auto;
}

.training-card-link--ghost {
  background: white;
  color: #1a6ab4;
  border: 1px solid #cfe0f3;
}

@media (max-width: 900px) {
  .corp-materials-header,
  .training-programs-hero {
    grid-template-columns: 1fr;
    display: grid;
  }

  .calculator-link-topline {
    flex-direction: column;
  }
}

@media (max-width: 700px) {
  .publication-card {
    flex-direction: column;
  }

  .publication-cover {
    width: 100%;
    min-height: 160px;
  }
}

/* IEC Materials Booklet Card Layout */
.iec-materials-portal {
  padding: 2rem 2rem;
  background: #fdf8ef;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.iec-card {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  padding: 2rem 1.5rem;
  border-bottom: 1px solid #e2d9c8;
  background: #fdf8ef;
  transition: background 0.2s;
}

.iec-card:last-child {
  border-bottom: none;
}

.iec-card:hover {
  background: #f5ede0;
}

.iec-cover-wrap {
  flex-shrink: 0;
  width: 110px;
  height: 150px;
  background: #e8e0d4;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.iec-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.iec-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.iec-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #2a7a3b;
  line-height: 1.3;
  margin: 0;
}

.iec-subtitle {
  font-size: 1rem;
  font-weight: 700;
  color: #2a7a3b;
  margin: 0;
  opacity: 0.85;
}

.iec-desc {
  font-size: 0.88rem;
  color: #4a3f32;
  line-height: 1.65;
  margin: 0.5rem 0 1rem;
}

.iec-download-btn {
  display: inline-block;
  padding: 0.55rem 1.4rem;
  background: #1d3a1f;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 6px;
  text-decoration: none;
  letter-spacing: 0.02em;
  transition: background 0.2s, transform 0.15s;
  align-self: flex-start;
}

.iec-download-btn:hover {
  background: #2a7a3b;
  transform: translateY(-1px);
}

.iec-download-btn:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .iec-card { flex-direction: column; gap: 1rem; }
  .iec-cover-wrap { width: 90px; height: 120px; }
}
</style>
