<template>
    <div class="w-full flex flex-column h-100">
        <header class="d-flex align-items-center p-3 bg-info-subtle text-white">
            <img
                v-if="album?.cover_path"
                :src="libraryStore.coverUrl(album)"
                class="cover"
                :alt="album.title"
                draggable="false"
            />
            <div
                v-else
                class="cover bg-primary d-flex align-items-center justify-content-center text-white"
            >
                <i class="bi bi-music-note-beamed" style="font-size: 4rem"></i>
            </div>
            <div class="card-header">
                <h5 class="card-title mb-0">
                    {{ album?.title || "Album" }}
                </h5>
                <div class="card-body">
                    <p class="card-text">
                        {{ album?.is_various ? 'Various Artists' : (artist?.name || "No artist available.") }}
                    </p>
                </div>
            </div>
        </header>
        <div class="overflow-y-auto">
            <TrackList :tracks="tracks" :withArtist="libraryStore.albumHasVariousArtists(album)" @activateTrack="activateTrack" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Album } from "../../types";
import { useLibraryStore } from "../../stores/library";
import { usePlayerStore } from "../../stores/player";
import { computed } from "vue";
import TrackList from "../TrackList.vue";

const libraryStore = useLibraryStore();
const playerStore = usePlayerStore();
const tracks = computed(() => libraryStore.tracksOfAlbum(props.album?.id));
const props = defineProps<{
    album: Album | null;
}>();
const artist = computed(() =>
    libraryStore.getArtist(props.album?.artist_id || null)
);

const activateTrack = (trackId: number) => {
    playerStore.clear();
    playerStore.enqueue(tracks.value);
    const trackIndex = tracks.value.findIndex((t) => t.id === trackId);
    if (trackIndex >= 0) playerStore.playTrackId(trackId);
};
</script>

<style scoped>
.cover {
    width: 120px;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: 0.25rem;
    margin-right: 1rem;
}
</style>
