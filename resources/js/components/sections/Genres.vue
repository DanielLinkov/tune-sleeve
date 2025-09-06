<template>
    <div class="card bg-warning-subtle w-xs">
        <div class="card-header">Genres <i class="bi bi-music-note-list"></i></div>
        <div class="list-group overflow-y-auto scrollbar-thin">
            <button class="list-group-item list-group-item-action" v-for="genre in genres" :key="genre" @click="fnSelectGenre(genre)">
                {{ genre }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLibraryStore } from '../../stores/library';

const genres = computed(() => useLibraryStore().allGenres);

const emit = defineEmits(['select:genre']);

const fnSelectGenre = (genre: string | null) => {
    emit('select:genre', genre);
};
</script>
