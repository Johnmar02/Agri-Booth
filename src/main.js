import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

/**
 * BOOTSTRAP: ITCPH Digital Agri-Booth
 * Initializes the Vue 3 application, attaches the Pinia store (Model layer),
 * and mounts the main View (App.vue).
 */

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount('#app');
