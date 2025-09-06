import './bootstrap';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import * as bootstrap from 'bootstrap';

import App from './components/App.vue';

const app = createApp(App);
app.use(createPinia());
app.mount('#app');

const tooltip = new bootstrap.Tooltip(document.body, {
    selector: '[data-bs-toggle="tooltip"]',
    trigger: 'hover',
    placement: 'top',
    html: true,
});
