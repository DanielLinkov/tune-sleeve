<template>
    <div class="flex flex-column justify-content-between h-100">
        <ul class="list-group list-group-flush">
            <li class="list-group-item list-group-item-action" @click="onSection('genres' as Section)"><i class="bi bi-music-note-beamed"></i> Genres</li>
            <li class="list-group-item list-group-item-action" @click="onSection('albums' as Section)"><i class="bi bi-disc"></i> Albums</li>
            <li class="list-group-item list-group-item-action" @click="onSection('artists' as Section)"><i class="bi bi-person-bounding-box"></i> Artists</li>
        </ul>
        <div class="p-3">
            <small class="text-muted">TuneSleeve v0.1.0</small>
        </div>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
    (e: 'section', section: Section): void;
}>();

import { Section } from '../defs';
const onSection = (section: Section) => {
    emit('section', section);
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
