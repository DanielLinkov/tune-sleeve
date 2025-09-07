<template>
    <div class="flex flex-column justify-content-between h-100">
        <ul class="list-group list-group-flush">
            <li class="list-group-item list-group-item-action" @click="onSelectPage('genres')"><i class="bi bi-music-note-beamed"></i> Genres</li>
            <li class="list-group-item list-group-item-action" @click="onSelectPage('albums')"><i class="bi bi-disc"></i> Albums</li>
            <li class="list-group-item list-group-item-action" @click="onSelectPage('artists')"><i class="bi bi-person-bounding-box"></i> Artists</li>
            <li class="list-group-item list-group-item-action" @click="onSelectPage('playlists')"><i class="bi bi-music-note-list"></i> Playlists</li>
        </ul>
        <div class="p-3">
            <small class="text-muted">TuneSleeve v0.4.0</small>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Page } from '../stores/ui';
const emit = defineEmits<{
    (e: 'page', page: Page): void;
}>();

const onSelectPage = (page: Page) => {
    emit('page', page);
}
</script>

<style scoped>
.list-group-item {
    --bs-list-group-item-padding-y: 0.75rem;
    --bs-list-group-item-padding-x: 1.25rem;
    font-size: 1rem;
    cursor: pointer;
}
</style>
