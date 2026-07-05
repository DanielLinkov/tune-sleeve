<script setup lang="ts">
import { useUiStore } from "../../stores/ui";
import { useLibraryStore } from "../../stores/library";
import { usePlayerStore } from "../../stores/player";
import { computed } from "vue";
import { Track } from "../../types";

const uiStore = useUiStore();
const playerStore = usePlayerStore();
const libraryStore = useLibraryStore();

uiStore.setSearch("");

const foundTracks = computed(() => {
    const search = uiStore.search.toLowerCase();
    if (!search || search.length < 3) return [];
    return libraryStore.tracks.filter((track) => {
        return track.title.toLowerCase().includes(search);
    }).sort((a, b) => a.title.localeCompare(b.title)).slice(0, 10);
});

const foundArtists = computed(() => {
    const search = uiStore.search.toLowerCase();
    if (!search || search.length < 3) return [];
    return libraryStore.artists.filter((artist) => {
        return artist.name.toLowerCase().includes(search);
    }).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 10);
});

const foundAlbums = computed(() => {
    const search = uiStore.search.toLowerCase();
    if (!search || search.length < 3) return [];
    return libraryStore.albums.filter((album) => {
        return album.title.toLowerCase().includes(search);
    }).sort((a, b) => a.title.localeCompare(b.title)).slice(0, 10);
});

const playTrack = (track: Track) => {
    playerStore.clearQueue();
    playerStore.enqueue(track);
    playerStore.playTrackId(track.id);
};

</script>

<template>
    <div class="w-full">
        <div class="card w-140 mx-auto mt-10">
            <div class="card-body">
                <i class="bi bi-search"></i> Search
                <input
                    type="text"
                    class="form-control mt-2"
                    @keydown.space.stop
                    placeholder="Search for artists, albums, or songs..."
                    v-model="uiStore.search"
                />
            </div>
            <div class="card-body">
                <div v-if="uiStore.search.trim().length < 3">
                    <p class="text-muted">Type something to search...</p>
                </div>
                <div v-else>
                    <p class="text-muted">Found {{ foundTracks.length }} tracks</p>
                    <ul class="list-group">
                        <li
                            v-for="track in foundTracks"
                            :key="track.id"
                            class="list-group-item list-group-item-action"
                        >
                            <div class="">
                                <div class="d-flex justify-content-between">
                                    <button class="btn px-0 text-white"
                                    @click="playTrack(track)"
                                    >{{ track.title }}</button>
                                    <div class="text-muted ms-2">by <button class="btn p-0" @click="uiStore.selectArtist(track.artist_id);uiStore.setPage('artist')">{{ libraryStore.getArtist(track.artist_id)?.name || "Unknown Artist" }}</button></div>
                                </div>
                                <div class=""><button class="btn btn-sm" @click="uiStore.selectAlbum(track.album_id);uiStore.setPage('album')">{{ libraryStore.getAlbum(track.album_id)?.title?.substring(0, 60) || "Unknown Album" }}</button></div>
                            </div>
                        </li>
                    </ul>
                    <p class="text-muted mt-3">Found {{ foundArtists.length }} artists</p>
                    <ul class="list-group">
                        <li
                            v-for="artist in foundArtists"
                            :key="artist.id"
                            class="list-group-item list-group-item-action"
                        >
                            <button class="btn p-0" @click="uiStore.selectArtist(artist.id);uiStore.setPage('artist')">{{ artist.name }}</button>
                        </li>
                    </ul>
                    <p class="text-muted mt-3">Found {{ foundAlbums.length }} albums</p>
                    <ul class="list-group">
                        <li
                            v-for="album in foundAlbums"
                            :key="album.id"
                            class="list-group-item list-group-item-action"
                        >
                            <div class="">
                                <div><button class="btn p-0" @click="uiStore.selectAlbum(album.id);uiStore.setPage('album')">{{ album.title?.substring(0, 60) || "Unknown Album" }}</button></div>
                                <div class="text-muted">by <button class="btn btn-sm p-0" @click="uiStore.selectArtist(album.artist_id);uiStore.setPage('artist')">{{ libraryStore.getArtist(album.artist_id)?.name || "Unknown Artist" }}</button></div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
