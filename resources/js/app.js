import './bootstrap';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Tooltip } from 'bootstrap';
import Toast from 'vue-toastification'
import FloatingVue from 'floating-vue'
import App from './components/App.vue';

const app = createApp(App);
app.use(createPinia());
app.use(Toast, {
    maxToasts: 2,
    position: 'top-right',
    timeout: 3000,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: true,
    closeButton: 'button',
    icon: true,
    rtl: false,
    toastClassName: 'py-2 align-items-center'
});
app.use(FloatingVue, {
    themes: {
        tooltip: {
            delay: 100,
            triggers: ['hover', 'focus'],
            placement: 'top',
            hideOnTargetClick: true,
            autoHide: true,
            offset: 5,
        },
        'bs-dropdown': {
            $extend: 'dropdown',
            $resetCss: true,
            placement: 'bottom-start',
            distance: 4,
            skidding: 0,
            triggers: ['click'],
            autoHide: true,
        },
        'bs-menu': {
            $extend: 'menu',
            $resetCss: true,
            placement: 'left-start',
            distance: 0,
            skidding: -4,
            triggers: ['click'],
            autoHide: true,
        },
    },
});
app.mount('#app');

const tooltip = new Tooltip(document.body, {
    selector: '[data-bs-toggle="tooltip"]',
    container: 'body',
    trigger: 'hover',
    placement: 'top',
    html: true,
});
