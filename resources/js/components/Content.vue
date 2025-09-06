<template>
    <div class="flex-grow-1 overflow-auto flex">
        <Pages @page="onPage"></Pages>
        <Genres v-if="uiStore.page === 'genres'" @select:genre="onSelectGenre"></Genres>
        <Albums v-if="uiStore.page === 'albums'" title="Albums" :list="libraryStore.albumsSortedByArtist"></Albums>
        <Artists v-if="uiStore.page === 'artists'" title="Artists" :list="libraryStore.artists"></Artists>
        <Album v-if="uiStore.page === 'album'" :album="libraryStore.getAlbum(uiStore.selectedAlbumId)"></Album>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Pages from './Pages.vue';
import Genres from './sections/Genres.vue';
import Albums from './sections/Albums.vue';
import Artists from './sections/Artists.vue';
import Album from './sections/Album.vue';
import { useLibraryStore } from '../stores/library';
import { useUiStore, Page } from '../stores/ui';

const libraryStore = useLibraryStore();
const uiStore = useUiStore();

const onPage = (page: Page) => {
    uiStore.setPage(page);
}

const emit = defineEmits(['select:genre']);

const onSelectGenre = (genre: string | null) => {
    emit('select:genre', genre);
};

</script>
