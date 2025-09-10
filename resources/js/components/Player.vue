<template>
    <div class="flex items-center">
        <div class="btn-group">
            <button class="btn btn-primary" :disabled="playerStore.queue.length === 0" @click="back()">
                <i v-if="playerStore.canPrev && playerStore.currentTime < 5" class="bi bi-skip-backward-fill"></i>
                <i v-else class="bi bi-rewind-fill"></i>
            </button>
            <button v-if="!playerStore.isPlaying" :disabled="!playerStore.nowPlaying" class="btn btn-primary" @click="playerStore.play()">
                <i class="bi bi-play-fill"></i>
            </button>
            <button v-else class="btn btn-primary" @click="playerStore.pause()">
                <i class="bi bi-pause"></i>
            </button>
            <button class="btn btn-primary" :disabled="!playerStore.canNext" @click="playerStore.next()">
                <i class="bi bi-skip-forward-fill"></i>
            </button>
        </div>
        <img v-if="album && album.cover_path" :src="libraryStore.coverUrl(album)" @click="uiStore.selectAlbum(album.id); uiStore.setPage('album')" class="w-12 h-12 rounded ms-4 cursor-pointer cover" />
        <div v-else class="w-12 h-12 rounded dark:bg-gray-600 ms-4 flex items-center justify-center cursor-pointer" @click="uiStore.selectAlbum(album?.id)"><i class="bi bi-music-note-beamed fs-5"></i></div>
        <div class="flex flex-col ms-3 title cursor-default" :data-bs-original-title="track ? `<b>${track.title}</b>${artist ? ' - ' + artist.name : ''}<hr class='my-2'/>${album ? album.title : ''}` : ''" data-bs-toggle="tooltip" data-bs-placement="bottom">
            <span class="font-bold truncate" v-if="track">{{ track.title }}</span>
            <span class="text-sm truncate cursor-pointer" @click="uiStore.selectArtist(artist.id); uiStore.setPage('artist'); uiStore.selectGenre('')" v-if="artist">{{ artist.name }}</span>
        </div>
        <div class="seek-bar flex-grow ms-4">
            <input type="range" class="form-range w-full" min="0" :max="playerStore.duration" step="1" :value="playerStore.currentTime" @input="playerStore.seek($event.target?.value)" />
            <div class="d-flex justify-content-between text-xs mt-1">
                <span>{{ new Date(playerStore.currentTime * 1000).toISOString().substring(14, 19) }}</span>
                <span>{{ new Date(playerStore.duration * 1000).toISOString().substring(14, 19) }}</span>
            </div>
        </div>
        <div class="btn-group ms-4">
            <button class="btn btn-sm" :class="[playerStore.repeatMode === 'none' ? 'text-muted' : 'text-white']" @click="playerStore.toggleRepeat">
                <i v-if="playerStore.repeatMode === 'one'" class="bi bi-repeat-1"></i>
                <i v-else class="bi bi-repeat"></i>
            </button>
            <button class="btn btn-sm" :class="[playerStore.isShuffling ? 'text-white' : 'text-muted']" @click="playerStore.toggleShuffle">
                <i class="bi bi-shuffle"></i>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { useUiStore } from '../stores/ui';

const playerStore = usePlayerStore();
const libraryStore = useLibraryStore();
const uiStore = useUiStore();

function back() {
    if(playerStore.currentTime > 3 || !playerStore.canPrev) {
        playerStore.seek(0);
        return;
    }
    playerStore.prev();
}
const track = computed(() => playerStore.nowPlaying);
const album = computed(() => playerStore.nowPlaying?.album_id ? libraryStore.getAlbum(playerStore.nowPlaying?.album_id) : null);
const artist = computed(() => playerStore.nowPlaying?.artist_id ? libraryStore.getArtist(playerStore.nowPlaying?.artist_id) : null);
</script>

<style scoped>
.cover{
    object-fit: cover;
}
.title {
    width: 260px;
}
.seek-bar{
    width: 180px;
}
@media screen and (max-width: 768px) {
    .title {
        width: 150px;
    }
    .seek-bar{
        width: 100px;
    }
}
@media screen and (max-width: 576px) {
    .seek-bar{
        display:none;
    }
}
</style>
