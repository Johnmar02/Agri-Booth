import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

/**
 * BOOTSTRAP: ITCPH Digital Agri-Booth
 * Initializes the Vue 3 application, attaches the Pinia store (Model layer),
 * applies router middleware, and mounts the main View.
 */

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount('#app');
