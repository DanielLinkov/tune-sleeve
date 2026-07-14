<template>
    <div class="w-100 d-flex flex-column h-100">
        <header class="d-flex align-items-center p-2 px-3 bg-info-subtle">
            <img
                v-if="album.cover_path"
                :src="libraryStore.coverUrl(album)"
                class="cover"
                :alt="album.title"
                draggable="false"
            />
            <div
                v-else
                class="cover bg-primary d-flex align-items-center justify-content-center"
            >
                <i class="bi bi-music-note-beamed" style="font-size: 4rem"></i>
            </div>
            <div class="card-header">
                <h5 class="card-title mb-0">
                    {{ album.title || "Album" }}
                </h5>
                <div class="">
                    <button class="btn btn-transparent btn-sm"
                        @click="!album.is_various && (uiStore.selectArtist(!album.is_various && artist?.id || null), uiStore.setPage('artist'));"
                    >
                        {{
                            album.is_various
                                ? "Various Artists"
                                : artist?.name || "No artist available."
                        }}
                    </button>
                </div>
                <div class="mt-3">
                    <button class="btn btn-transparent" title="Love this" data-bs-toggle="tooltip" @click="toggleAlbumFavorite(album.id);">
                        <i v-if="album.is_favorite" class="bi bi-heart-fill"></i>
                        <i v-else class="bi bi-heart"></i>
                    </button>
                </div>
            </div>
            <div class="ms-auto">
                <div class="btn-group me-3">
                    <button
                        class="btn btn-dark btn-sm"
                        :disabled="!tracks.length"
                        @click="activateTrack(tracks[0].id)"
                        title="Play Album"
                        data-bs-toggle="tooltip"
                    >
                        <i class="bi bi-play-fill"></i>
                    </button>
                    <button
                        class="btn btn-dark btn-sm"
                        :disabled="!tracks.length"
                        @click="playerStore.enqueue(tracks)"
                        title="Add Album to Queue"
                        data-bs-toggle="tooltip"
                    >
                        <i class="bi bi-plus"></i>
                    </button>
                </div>
            </div>
        </header>
        <div class="overflow-y-auto">
            <TrackList
                :tracks="tracks"
                :withArtist="libraryStore.albumHasVariousArtists(album)"
                @activateTrack="activateTrack"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Album } from "../../types";
import { useLibraryStore } from "../../stores/library";
import { usePlayerStore } from "../../stores/player";
import { useUiStore } from "../../stores/ui";
import { computed } from "vue";
import TrackList from "../TrackList.vue";
import { useToast } from "vue-toastification";

const libraryStore = useLibraryStore();
const playerStore = usePlayerStore();
const uiStore = useUiStore();
const tracks = computed(() => libraryStore.tracksOfAlbum(props.album?.id));
const props = defineProps<{
    album: Album;
}>();
const toast = useToast();
const artist = computed(() =>
    libraryStore.getArtist(props.album?.artist_id || null)
);

const activateTrack = (trackId: number) => {
    playerStore.clearQueue();
    playerStore.enqueue(tracks.value);
    const trackIndex = tracks.value.findIndex((t) => t.id === trackId);
    if (trackIndex >= 0) playerStore.playTrackId(trackId);
};

const toggleAlbumFavorite = async (albumId: number) => {
    try {
        const message = await libraryStore.toggleAlbumFavorite(albumId);
    } catch (error) {
        console.error("Error toggling album favorite status:", error);
    }
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
