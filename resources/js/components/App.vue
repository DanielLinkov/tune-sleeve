<template>
    <div class="d-flex flex-column vh-100">
        <Header></Header>
        <Content></Content>
        <Splash v-if="isSplashVisible"></Splash>
    </div>
</template>

<script setup lang="ts">
import Header from './Header.vue';
import Content from './Content.vue';
import Splash from './Splash.vue';
import { onMounted, onUnmounted, provide, ref } from 'vue';
import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { useUiStore } from '../stores/ui';

const isSplashVisible = ref(true);

const lib = useLibraryStore();
const player = usePlayerStore();
const ui = useUiStore();

onMounted(async () => {
    player.init();
    await lib.load();
    setTimeout(() => {
        isSplashVisible.value = false;
    }, 1000); // Keep splash for at least 2 seconds
});
window.addEventListener('beforeunload', () => {
    player.destroy();
    console.debug('Player destroyed');
});
</script>
