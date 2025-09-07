<template>
    <ul class="list-group list-group-flush user-select-none mx-auto">
        <li
            v-for="track in tracks"
            :key="track.id"
            class="list-group-item list-group-item-action d-flex align-items-center gap-3"
            @click="$emit('activateTrack', track.id)"
        >
            <div :style="{'visibility': playerStore.nowPlaying?.id === track.id ? 'visible' : 'hidden'}">
                <i v-if="playerStore.isPlaying" class="bi bi-play-fill"></i>
                <i v-else class="bi bi-pause"></i>
            </div>
            <div class="text-muted">{{ track.track_no }}</div>
            <div class="">{{ track.title }}</div>
            <div class="text-muted ms-auto">{{ new Date((track.duration || 0) * 1000).toISOString().substr(14, 5) }}</div>
        </li>
    </ul>
</template>

<script setup lang="ts">
import { Track } from "../types";
import { usePlayerStore } from "../stores/player";
const playerStore = usePlayerStore();
const props = defineProps<{
    tracks: Track[];
}>();
</script>

<style scoped>
.list-group {
    max-width: 400px;
}
.list-group-item {
    cursor: pointer;
}
</style>
