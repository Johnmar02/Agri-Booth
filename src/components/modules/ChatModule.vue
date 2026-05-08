<script setup>
/**
 * COMPONENT: ChatModule
 * Extracted from ModuleDrawerView to isolate the Advisory Chat UI.
 */
const props = defineProps({
  chatState: {
    type: Object,
    required: true,
  },
});

defineEmits(["chat-draft-change", "chat-submit"]);
</script>

<template>
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

<style scoped>
.body-section { margin-bottom: 3rem; }
.section-label { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #1a6ab4; border-left: 4px solid #d17c24; padding-left: 12px; margin-bottom: 1.5rem; display: block; }

/* Chat specialized styles */
.chat-immersive-layout {
  max-width: 1000px;
  margin: 0 auto;
}
.premium-chat-v2 {
  background: #f8fafc;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 65vh;
  overflow: hidden;
}
.chat-viewport-v2 {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.msg-row-v2 {
  display: flex;
  flex-direction: column;
}
.msg-row-v2.assistant {
  align-items: flex-start;
}
.msg-row-v2.user {
  align-items: flex-end;
}
.msg-bubble-v2 {
  max-width: 80%;
  padding: 1rem 1.5rem;
  border-radius: 18px;
  font-size: 1rem;
  line-height: 1.5;
}
.assistant .msg-bubble-v2 {
  background: white;
  border: 1px solid #e2e8f0;
  color: #334155;
}
.user .msg-bubble-v2 {
  background: #1a6ab4;
  color: white;
}
.msg-sender-v2 {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 0.4rem;
  display: block;
}
.chat-input-zone-v2 {
  padding: 1.5rem;
  background: white;
  border-top: 1px solid #e2e8f0;
}
.chat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.prompt-chip {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.8rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #1a6ab4;
  cursor: pointer;
  transition: all 0.2s ease;
}
.prompt-chip:hover {
  background: #f1f5f9;
  border-color: #1a6ab4;
}
.composer-v2 {
  display: flex;
  gap: 1rem;
}
.composer-v2 textarea {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  height: 60px;
  resize: none;
  font-family: inherit;
}
.chat-submit-btn-v2 {
  background: #1a6ab4;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0 1.5rem;
  font-weight: 700;
  cursor: pointer;
}
.chat-submit-btn-v2:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
