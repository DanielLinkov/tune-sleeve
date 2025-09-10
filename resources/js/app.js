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
    container: 'body',
    trigger: 'hover',
    placement: 'top',
    html: true,
});
document.body.addEventListener('click', (e) => {
    document.body.querySelectorAll('.tooltip.show').forEach((el) => {
        // Hide tooltip if the clicked element is not the tooltip itself
        if (!el.contains(e.target)) {
            const tooltipInstance = bootstrap.Tooltip.getInstance(el);
            if (tooltipInstance) {
                tooltipInstance.hide();
            }
        }
    });
});
