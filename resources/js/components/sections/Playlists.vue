<script setup lang="ts">
import { useLibraryStore } from "../../stores/library";
import { usePlayerStore } from "../../stores/player";
import { useUiStore } from "../../stores/ui";
import { ref, nextTick, useTemplateRef, onBeforeUnmount } from "vue";
import { useToast } from "vue-toastification";
import { formatDuration } from "../../utils";
import { Tooltip } from "bootstrap";
import Slidable from "../Slidable.vue";

const toast = useToast();
const libraryStore = useLibraryStore();
const playerStore = usePlayerStore();
const uiStore = useUiStore();
const inAddingMode = ref(false);
const inProgress = ref(false);
let newPlaylistName = ref("");
const playlistInput = useTemplateRef<HTMLInputElement>("playlistInput");
const addPlaylistBtn = useTemplateRef<HTMLButtonElement>("addPlaylistBtn");

async function addPlaylist() {
    const trimmedName = newPlaylistName.value.trim();
    if (trimmedName) {
        try {
            inProgress.value = true;
            playlistInput.value && (playlistInput.value.disabled = true);
            await libraryStore.addPlaylist(trimmedName);
            newPlaylistName.value = "";
            inAddingMode.value = false;
        } catch (error: any) {
            toast.error(error.message || "Failed to add playlist");
        } finally {
            inProgress.value = false;
            playlistInput.value && (playlistInput.value.disabled = false);
        }
        nextTick(() => {
            if (inAddingMode.value) {
                playlistInput.value?.focus();
            } else {
                addPlaylistBtn.value?.focus();
            }
        });
    }
}

const playPlaylist = (playlistId: number) => {
    playerStore.clearQueue();
    playerStore.enqueue(libraryStore.getPlaylistTracks(playlistId));
    playerStore.play();
};

const playFromTrackOfPlaylist = (playlistId: number, trackId: number) => {
    const tracks = libraryStore.getPlaylistTracks(playlistId);
    const startIndex = tracks.findIndex((track) => track.id === trackId);
    if (startIndex !== -1) {
        playerStore.clearQueue();
        playerStore.enqueue(tracks);
        playerStore.play(startIndex);
    }
};
onBeforeUnmount(() => {
    document.body
        .querySelectorAll('[data-bs-toggle="tooltip"]')
        .forEach((el) => {
            const tooltipInstance = Tooltip.getInstance(el);
            if (tooltipInstance) {
                tooltipInstance.dispose();
            }
        });
});
</script>

<template>
    <div class="w-full">
        <div class="playlists w-120 mx-auto mt-4">
            <h2>Playlists</h2>
            <div class="my-3 list-group">
                <div
                    v-for="playlist in libraryStore.getPlaylists"
                    :key="playlist.id"
                    class="list-group-item"
                >
                    <div
                        class="d-flex justify-content-between align-items-center gap-3"
                    >
                        <button
                            class="btn btn-default btn-sm flex-grow-1 text-start"
                            title="Play this playlist"
                            data-bs-toggle="tooltip"
                            data-bs-placement="left"
                            :disabled="!playlist.tracks.length"
                            @click="playPlaylist(playlist.id)"
                        >
                            {{ playlist.name }}
                        </button>
                        <button
                            :data-bs-toggle="[
                                playlist.tracks.length && 'collapse',
                            ]"
                            :data-bs-target="'#playlist-' + playlist.id"
                            class="badge text-bg-primary rounded-pill"
                            :class="[
                                playlist.tracks.length && 'dropdown-toggle',
                            ]"
                        >
                            {{
                                playlist.tracks.length
                                    ? `${playlist.tracks.length} tracks`
                                    : "empty"
                            }}
                        </button>
                    </div>
                    <div
                        class="collapse visible mt-2 bg-body rounded p-2"
                        :id="'playlist-' + playlist.id"
                    >
                        <div class="flex justify-content-between align-items-center mb-2">
                            <p class="text-muted p-2">* Slide a track to the left to remove</p>
                            <button
                                class="btn btn-outline-danger btn-sm"
                                @click="
                                    libraryStore.deletePlaylist(playlist.id);
                                "
                            >
                                <i class="bi bi-trash"></i>
                                Delete Playlist
                            </button>
                        </div>
                        <ul class="list-group">
                            <template
                                v-for="track in libraryStore.getPlaylistTracks(
                                    playlist.id,
                                )"
                                :key="track.id"
                            >
                                <Slidable>
                                    <template #action>
                                        <button
                                            class="btn btn-danger btn-sm"
                                            title="Remove from playlist"
                                            data-bs-toggle="tooltip"
                                            data-bs-placement="left"
                                            @click="
                                                libraryStore.removeTrackFromPlaylist(
                                                    playlist.id,
                                                    track.id,
                                                );
                                            "
                                        >
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </template>
                                    <li
                                        class="list-group-item list-group-item-action list-group-item-info d-flex justify-content-between align-items-center"
                                    >
                                        <div class="flex-grow-1">
                                            <button
                                                class="btn btn-default btn-sm text-start"
                                                title="Play from this track"
                                                data-bs-toggle="tooltip"
                                                data-bs-placement="left"
                                                :disabled="!track.duration"
                                                @click="
                                                    playFromTrackOfPlaylist(
                                                        playlist.id,
                                                        track.id,
                                                    )
                                                "
                                            >
                                                {{ track.title }}
                                            </button>
                                            <div class="text-muted small">
                                                <button
                                                    class="btn btn-default btn-sm text-start text-muted"
                                                    title="View artist"
                                                    data-bs-toggle="tooltip"
                                                    data-bs-placement="left"
                                                    @click="
                                                        uiStore.selectArtist(
                                                            libraryStore.getArtist(
                                                                track.artist_id,
                                                            )?.id ?? null,
                                                        );
                                                        uiStore.setPage(
                                                            'artist',
                                                        );
                                                        uiStore.selectGenre('');
                                                    "
                                                >
                                                    {{
                                                        libraryStore.getArtist(
                                                            track.artist_id,
                                                        )?.name ??
                                                        "Unknown Artist"
                                                    }}
                                                </button>
                                            </div>
                                        </div>
                                        <div class="text-muted small">
                                            {{ formatDuration(track.duration) }}
                                        </div>
                                    </li>
                                </Slidable>
                            </template>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="flex justify-content-end mt-2">
                <button
                    v-if="!inAddingMode"
                    class="btn btn-outline-primary"
                    ref="addPlaylistBtn"
                    @click="
                        inAddingMode = true;
                        nextTick(() => {
                            playlistInput?.focus();
                        });
                    "
                >
                    <i class="bi bi-plus"></i> New Playlist
                </button>
            </div>
            <div v-if="inAddingMode">
                <div class="input-group">
                    <input
                        v-model="newPlaylistName"
                        ref="playlistInput"
                        type="text"
                        class="form-control"
                        placeholder="Enter playlist name..."
                        v-on:keyup.esc="
                            inAddingMode = false;
                            newPlaylistName = '';
                            $nextTick(() => {
                                addPlaylistBtn?.focus();
                            });
                        "
                        v-on:keyup.enter="addPlaylist()"
                        autofocus
                        autocomplete="off"
                    />
                    <button
                        class="btn btn-light"
                        :disabled="!newPlaylistName.trim().length || inProgress"
                        @click="addPlaylist()"
                    >
                        <div
                            v-if="inProgress"
                            class="spinner-border spinner-border-sm"
                            role="status"
                        ></div>
                        Create
                    </button>
                    <button
                        class="btn btn-outline-primary"
                        :disabled="inProgress"
                        @click="
                            inAddingMode = false;
                            newPlaylistName = '';
                            nextTick(() => {
                                addPlaylistBtn?.focus();
                            });
                        "
                    >
                        Cancel
                    </button>
                </div>
                <p class="text-muted mt-2 small">
                    Press <kbd>Enter</kbd> to add or <kbd>Esc</kbd> to cancel.
                </p>
            </div>
        </div>
    </div>
</template>
