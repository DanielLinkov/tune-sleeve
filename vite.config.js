import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vuePlugin from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        tailwindcss(),
        vuePlugin(),
        svgLoader({
            svgoConfig: {
                plugins: [
                    // All default plugins, but override removeViewBox
                    {
                        name: 'preset-default',
                        params: {
                            overrides: {
                                removeViewBox: false,
                            },
                        },
                    },
                ],
            },
        }),
    ],
});
