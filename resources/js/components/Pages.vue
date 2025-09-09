<template>
    <div class="flex flex-column justify-content-between w-min h-100">
        <ul class="list-group list-group-flush">
            <li class="list-group-item list-group-item-action" :class="{'active': uiStore.page === 'genres'}" @click="onSelectPage('genres')"><i class="bi bi-music-note-beamed"></i> <div class="">Genres</div></li>
            <li class="list-group-item list-group-item-action" :class="{'active': uiStore.page === 'albums'}" @click="onSelectPage('albums')"><i class="bi bi-disc"></i> <div class="">Albums</div></li>
            <li class="list-group-item list-group-item-action" :class="{'active': uiStore.page === 'artists' || uiStore.page === 'artist'}" @click="onSelectPage('artists')"><i class="bi bi-person-bounding-box"></i> <div class="">Artists</div></li>
            <li class="list-group-item list-group-item-action" :class="{'active': uiStore.page === 'playlists'}" @click="onSelectPage('playlists')"><i class="bi bi-music-note-list"></i> <div class="">Playlists</div></li>
            <li class="list-group-item list-group-item-action" :class="{'active': uiStore.page === 'queue'}" @click="onSelectPage('queue')"><i class="bi bi-list-columns"></i> <div class="">Now Playing</div></li>
            <li class="list-group-item list-group-item-action" :class="{'active': uiStore.page === 'collections'}" @click="onSelectPage('collections')"><i class="bi bi-music-player-fill"></i> <div class="">Collections</div></li>
            <li class="list-group-item list-group-item-action" :class="{'active': uiStore.page === 'search'}" @click="onSelectPage('search')"><i class="bi bi-search"></i> <div class="">Search</div></li>
        </ul>
        <footer class="p-3">
            <small class="text-muted">TuneSleeve v0.4.0</small>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { Page } from '../stores/ui';
import { useUiStore } from '../stores/ui';

const uiStore = useUiStore();

const onSelectPage = (page: Page) => {
    uiStore.setPage(page);
    if(page !== 'genre') {
        uiStore.selectGenre('');
    }
    if(page !== 'artist') {
        uiStore.selectArtist(null);
    }
}
</script>

<style scoped>
.list-group{
    width: 160px;
    transition: width 0.3s;
}
.list-group-item {
    --bs-list-group-item-padding-y: 0.75rem;
    --bs-list-group-item-padding-x: 1.25rem;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
}
.list-group-item > div {
    display: inline-block;
    margin-left: 0.5rem;
    overflow: hidden;
    white-space: nowrap;
}
@media screen and (max-width: 768px) {
    .list-group {
        width: 56px;
    }
    footer{ display: none;}
}
</style>
