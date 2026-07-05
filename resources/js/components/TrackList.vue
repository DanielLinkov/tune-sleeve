<template>
    <ul
        class="list-group list-group-flush user-select-none mx-auto"
        :class="{ 'thin-view': withArtist }"
    >
        <template v-for="(track, index) in tracks" :key="track.id">
            <li
                v-if="!noDiskLabels && hasMultipleDisks && diskNoChanged(index)"
                class="list-group-item disabled"
            >
                Disc {{ track.disk_no }}
            </li>
            <li
                class="list-group-item list-group-item-action d-flex align-items-start gap-2"
                @click="
                    !$event.defaultPrevented && $emit('activateTrack', track.id)
                "
                :data-track-id="track.id"
            >
                <div
                    @click.stop.prevent="
                        (playerStore.isPlaying && playerStore.pause()) ||
                        (!playerStore.isPlaying && playerStore.play())
                    "
                    class="hover:outline rounded px-1"
                    :style="{
                        visibility:
                            playerStore.nowPlaying?.id === track.id
                                ? 'visible'
                                : 'hidden',
                    }"
                >
                    <i
                        v-if="!playerStore.isPlaying"
                        class="bi bi-play-fill"
                    ></i>
                    <i v-else class="bi bi-pause"></i>
                </div>
                <div class="text-muted w-6">{{ track.track_no }}</div>
                <div class="max-w-3xs">
                    <div class="truncate w-100">{{ track.title }}</div>
                    <div
                        class="text-sm truncate"
                        v-if="withArtist"
                        :class="[
                            uiStore.selectedArtistId === track.artist_id
                                ? 'fw-bold text-white'
                                : 'text-muted',
                        ]"
                    >
                        {{
                            libraryStore.getArtist(track.artist_id)?.name ||
                            "Unknown Artist"
                        }}
                    </div>
                </div>
                <div class="text-muted ms-auto text-sm mt-1">
                    {{ formatDuration(track.duration || 0) }}
                </div>
                <VDropdown theme="bs-dropdown" @click.prevent>
                    <button
                        class="btn btn-sm btn-transparent text-muted hover:outline rounded"
                        type="button"
                        aria-expanded="false"
                    >
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <template #popper>
                        <div class="dropdown-menu show static!">
                            <button
                                class="dropdown-item"
                                @click="
                                    uiStore.selectAlbum(track.album_id);
                                    uiStore.setPage('album');
                                "
                                v-show="
                                    uiStore.selectedAlbumId != track.album_id ||
                                    uiStore.page != 'album'
                                "
                            >
                                Go to Album
                            </button>
                            <button
                                class="dropdown-item"
                                @click="
                                    uiStore.selectArtist(track.artist_id);
                                    uiStore.setPage('artist');
                                "
                            >
                                Go to Artist
                            </button>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-header">Playlist Options</div>
                            <VDropdown theme="bs-menu">
                                <button
                                    class="dropdown-item d-flex justify-content-between relative"
                                >
                                    <i
                                        class="bi bi-chevron-compact-left absolute right-full -mr-4"
                                    ></i>
                                    Add to Existing
                                </button>
                                <template #popper>
                                    <div class="dropdown-menu show static!">
                                        <div
                                            v-if="
                                                libraryStore.getPlaylists
                                                    .length === 0
                                            "
                                            class="dropdown-item disabled"
                                        >
                                            No playlists available
                                        </div>
                                        <button
                                            v-for="playlist in libraryStore.getPlaylists"
                                            :key="playlist.id"
                                            v-show="
                                                playlist.tracks.includes(
                                                    track.id,
                                                ) === false
                                            "
                                            class="dropdown-item"
                                            @click="
                                                addToPlaylist(
                                                    track.id,
                                                    playlist.id,
                                                )
                                            "
                                        >
                                            {{ playlist.name }}
                                        </button>
                                    </div>
                                </template>
                            </VDropdown>
                            <VDropdown theme="bs-menu">
                                <button
                                    class="dropdown-item d-flex justify-content-between"
                                >
                                    <i
                                        class="bi bi-chevron-compact-left absolute right-full -mr-4"
                                    ></i>
                                    Add to New
                                </button>

                                <template #popper="{ hide }">
                                    <div class="dropdown-menu show static!">
                                        <div class="dropdown-header">
                                            Enter Playlist Name
                                        </div>
                                        <div class="px-3">
                                            <input
                                                v-model="newPlaylistName"
                                                type="text"
                                                placeholder="New Playlist"
                                                @click.stop
                                                @keydown.escape="hide()"
                                                @keyup.enter="
                                                    addToPlaylist(track.id);
                                                    hide();
                                                "
                                                class="form-control form-control-sm"
                                            />
                                            <button
                                                class="dropdown-item"
                                                :disabled="!newPlaylistName.trim()"
                                                @click="addToPlaylist(track.id); hide()"
                                            >
                                                Create and Add to
                                            </button>
                                        </div>
                                    </div>
                                </template>
                            </VDropdown>
                            <VDropdown theme="bs-menu">
                                <button
                                    class="dropdown-item d-flex justify-content-between relative"
                                >
                                    <i
                                        class="bi bi-chevron-compact-left absolute right-full -mr-4"
                                    ></i>
                                    Remove from
                                </button>
                                <template #popper>
                                    <div class="dropdown-menu show static!">
                                        <div
                                            v-if="
                                                libraryStore.getPlaylists
                                                    .length === 0
                                            "
                                            class="dropdown-item disabled"
                                        >
                                            No playlists available
                                        </div>
                                        <button
                                            v-for="playlist in libraryStore.getPlaylists"
                                            :key="playlist.id"
                                            v-show="
                                                playlist.tracks.includes(
                                                    track.id,
                                                ) === true
                                            "
                                            class="dropdown-item"
                                            @click="
                                                removeFromPlaylist(
                                                    track.id,
                                                    playlist.id,
                                                )
                                            "
                                        >
                                            {{ playlist.name }}
                                        </button>
                                    </div>
                                </template>
                            </VDropdown>
                        </div>
                    </template>
                </VDropdown>
            </li>
        </template>
    </ul>
</template>

<script setup lang="ts">
import { Track } from "../types";
import { usePlayerStore } from "../stores/player";
import { useLibraryStore } from "../stores/library";
import { useUiStore } from "../stores/ui";
import { onMounted, computed, ref } from "vue";
import { useToast } from "vue-toastification";
import { formatDuration } from "../utils";

const toast = useToast();
const newPlaylistName = ref("");

const removeFromPlaylist = async (trackId: number, playlistId: number) => {
    try {
        const message = await libraryStore.removeTrackFromPlaylist(
            trackId,
            playlistId,
        );
        toast.success(message || "Track removed from playlist");
    } catch (error) {
        toast.error(error.message || "Failed to remove track from playlist");
    }
};
const addToPlaylist = async (trackId: number, playlistId?: number) => {
    try {
        let message;
        if (!playlistId) {
            if (newPlaylistName.value.trim()) {
                message = await libraryStore.addTrackToPlaylist(
                    trackId,
                    undefined,
                    newPlaylistName.value,
                );
            }else {
                toast.info("Please enter a playlist name");
                return;
            }
        } else {
            message = await libraryStore.addTrackToPlaylist(
                trackId,
                playlistId,
            );
        }
        toast.success(message || "Track added to playlist");
    } catch (error: any) {
        toast.error(error.message || "Failed to add track to playlist");
    } finally {
        newPlaylistName.value = "";
    }
};
const playerStore = usePlayerStore();
const libraryStore = useLibraryStore();
const uiStore = useUiStore();
const props = defineProps<{
    tracks: Track[];
    withArtist?: boolean;
    noDiskLabels?: boolean;
}>();

const hasMultipleDisks = computed(() => {
    return new Set(props.tracks.map((t) => t.disk_no)).size > 1;
});
const diskNoChanged = (index: number) => {
    if (index === 0) return props.tracks[0].disk_no !== null;
    return props.tracks[index].disk_no !== props.tracks[index - 1].disk_no;
};

onMounted(() => {
    if (playerStore.nowPlaying) {
        const el = document.querySelector(
            `[data-track-id='${playerStore.nowPlaying.id}']`,
        );
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }
});
</script>

<style scoped>
.list-group {
    max-width: 450px;
}
.list-group.thin-view {
    --bs-list-group-item-padding-y: 0.15rem;
}
.list-group-item {
    cursor: pointer;
}
</style>
