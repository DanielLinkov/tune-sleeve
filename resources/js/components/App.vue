<template>
    <div class="d-flex flex-column vh-100">
        <Header></Header>
        <Content></Content>
        <Splash v-if="isSplashVisible"></Splash>
        <OffCanvas :theme="theme"
            :themeVariant="themeVariant"
            @settings-theme="changeTheme"
            @settings-theme_variant="changeThemeVariant"
        ></OffCanvas>
    </div>
</template>

<script setup lang="ts">
import Header from './Header.vue';
import Content from './Content.vue';
import Splash from './Splash.vue';
import OffCanvas from './OffCanvas.vue';
import { onMounted, ref } from 'vue';
import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { useUiStore } from '../stores/ui';

const isSplashVisible = ref(true);

const lib = useLibraryStore();
const player = usePlayerStore();
const ui = useUiStore();

const changeTheme = (newTheme: string) => {
    localStorage.setItem('tunesleeve:theme', newTheme);
    const link = document.querySelector('link[data-id="theme"]') as HTMLLinkElement;
    if (link) {
        link.href = `/themes/${newTheme}.min.css`;
    }
};
const theme = localStorage.getItem('tunesleeve:theme') || 'default';
changeTheme(theme);
const changeThemeVariant = (newVariant: string) => {
    localStorage.setItem('tunesleeve:theme-variant', newVariant);
    document.body.setAttribute('data-bs-theme', newVariant);
};
const themeVariant = localStorage.getItem('tunesleeve:theme-variant') || 'light';
changeThemeVariant(themeVariant);

onMounted(async () => {
    player.init();
    await lib.load();
    setTimeout(() => {
        isSplashVisible.value = false;
    }, 1000); // Keep splash for at least 2 seconds
});
window.addEventListener('beforeunload', () => {
    player.destroy();
});
</script>
