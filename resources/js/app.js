import './bootstrap';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Tooltip } from 'bootstrap';

import App from './components/App.vue';

const app = createApp(App);
app.use(createPinia());
app.mount('#app');

const tooltip = new Tooltip(document.body, {
    selector: '[data-bs-toggle="tooltip"]',
    container: 'body',
    trigger: 'hover',
    placement: 'top',
    html: true,
});
