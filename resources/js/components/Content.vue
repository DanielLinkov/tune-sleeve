<template>
    <div class="flex-grow-1 overflow-auto flex">
        <Pages></Pages>
        <Genres
            v-if="uiStore.page === 'genres' || uiStore.selectedGenre"
        ></Genres>
        <Albums
            v-if="uiStore.page === 'albums'"
            :list="libraryStore.albumsSortedByArtist"
        ></Albums>
        <Artists
            v-if="
                uiStore.page === 'artists' ||
                uiStore.page === 'artist' ||
                (uiStore.page === 'album' && uiStore.selectedArtistId)
            "
            :list="
                uiStore.selectedGenre
                    ? libraryStore.artistsOfGenre(uiStore.selectedGenre)
                    : libraryStore.artists
            "
        ></Artists>
        <Album
            v-if="uiStore.page === 'album' && uiStore.selectedAlbumId"
            :album="libraryStore.getAlbum(uiStore.selectedAlbumId)"
        ></Album>
        <Albums
            v-if="uiStore.page === 'artist'"
            :title="'Albums by ' + (libraryStore.getArtist(uiStore.selectedArtistId)?.name || 'Unknown Artist')"
            :list="libraryStore.albumsOfArtist(uiStore.selectedArtistId)"
            :listAppearsIn="libraryStore.albumsWithArtist(uiStore.selectedArtistId)"
        ></Albums>
        <Albums
            v-if="uiStore.page === 'genre'"
            :list="libraryStore.albumsOfGenre(uiStore.selectedGenre)"
        ></Albums>
        <Queue v-if="uiStore.page === 'queue'"></Queue>
        <Albums
            v-if="uiStore.page === 'collections'"
            :list="libraryStore.collections"
        ></Albums>
        <Search v-if="uiStore.page === 'search'"></Search>
    </div>
</template>

<script setup lang="ts">
import Pages from "./Pages.vue";
import Genres from "./sections/Genres.vue";
import Albums from "./sections/Albums.vue";
import Artists from "./sections/Artists.vue";
import Album from "./sections/Album.vue";
import Queue from "./sections/Queue.vue";
import Search from "./sections/Search.vue";
import { useLibraryStore } from "../stores/library";
import { useUiStore } from "../stores/ui";

const libraryStore = useLibraryStore();
const uiStore = useUiStore();
</script>
