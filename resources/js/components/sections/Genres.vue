<script setup lang="ts">
import { computed, ref } from "vue";
import { useLibraryStore } from "../../stores/library";
import { useUiStore } from "../../stores/ui";

const libraryStore = useLibraryStore();
const uiStore = useUiStore();
const genreSearchQuery = ref("");
const listFiltered = computed(() => {
    if (genreSearchQuery.value.trim() === "") {
        return libraryStore.allGenres;
    }
    return libraryStore.allGenres.filter((genre) =>
        genre.toLowerCase().includes(genreSearchQuery.value.toLowerCase()),
    );
});

const genres = computed(() =>
    listFiltered.value.sort((a, b) => a.localeCompare(b)),
);
</script>

<template>
    <div class="card bg-info-subtle w-sm">
        <div class="card-header flex items-center gap-2">
            <i class="bi bi-music-note-list"></i>
            <input
                type="text"
                class="form-control form-control-sm ms-2"
                placeholder="Search genres... [Enter to select, Esc to clear]"
                autofocus
                v-on:keydown.escape="genreSearchQuery = ''"
                v-on:keydown.enter="
                    if (listFiltered.length === 1) {
                        uiStore.selectGenre(listFiltered[0]);
                        uiStore.setPage('genre');
                    }
                "
                v-model="genreSearchQuery"
            />
        </div>
        <div class="list-group overflow-y-auto scrollbar-thin user-select-none">
            <div
                class="list-group-item list-group-item-action cursor-pointer"
                :class="{ active: genre === uiStore.selectedGenre }"
                v-for="genre in genres"
                :key="genre"
                @click="
                    if (uiStore.page === 'genres') {
                        uiStore.selectGenre(genre);
                        uiStore.selectAlbum(null);
                        uiStore.selectArtist(null);
                        uiStore.setPage('genre');
                    } else {
                        uiStore.setPage('genres');
                    }
                "
            >
                {{ genre }}
            </div>
        </div>
    </div>
</template>
