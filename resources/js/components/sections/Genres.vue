<template>
    <div class="card bg-info-subtle w-sm">
        <div class="card-header">
            <i class="bi bi-music-note-list"></i> Genres
        </div>
        <div class="list-group overflow-y-auto scrollbar-thin user-select-none">
            <div
                class="list-group-item list-group-item-action cursor-pointer"
                :class="{ active: genre === uiStore.selectedGenre }"
                v-for="genre in genres"
                :key="genre"
                @click="
                    uiStore.selectGenre(genre);
                    uiStore.selectAlbum(null);
                    uiStore.selectArtist(null);
                    uiStore.setPage('genre');
                "
            >
                {{ genre }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLibraryStore } from "../../stores/library";
import { useUiStore } from "../../stores/ui";

const libraryStore = useLibraryStore();
const uiStore = useUiStore();

const genres = computed(() => libraryStore.allGenres);
</script>
