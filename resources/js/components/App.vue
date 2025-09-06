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
import { onMounted, provide, ref } from 'vue';
import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { useUiStore } from '../stores/ui';
import { useHistoryStore } from '../stores/history';

const isSplashVisible = ref(true);

const lib = useLibraryStore();
const player = usePlayerStore();
const ui = useUiStore();
const history = useHistoryStore();

onMounted(async () => {
    lib.registerHistory();
    ui.registerHistory();
    player.init();
    await lib.load();
    setTimeout(() => {
        isSplashVisible.value = false;
    }, 2000); // Keep splash for at least 2 seconds
});
</script>
