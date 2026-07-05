<script setup lang="ts">
import { useLibraryStore } from "../../stores/library";
import { ref, nextTick, useTemplateRef } from "vue";
import { useToast } from "vue-toastification";

const toast = useToast();
const libraryStore = useLibraryStore();
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
</script>

<template>
    <div class="w-full">
        <div class="playlists w-120 mx-auto mt-4">
            <h2>Playlists</h2>
            <div class="my-3 list-group">
                <div
                    v-for="playlist in libraryStore.getPlaylists"
                    :key="playlist.id"
                    class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                >
                    {{ playlist.name }}
                    <em class="text-muted"
                        >({{
                            playlist.tracks.length
                                ? `${playlist.tracks.length} tracks`
                                : "empty"
                        }})</em
                    >
                </div>
            </div>
            <button
                v-if="!inAddingMode"
                class="btn btn-primary btn-sm mt-4"
                ref="addPlaylistBtn"
                @click="
                    inAddingMode = true;
                    nextTick(() => {
                        playlistInput?.focus();
                    });
                "
            >
                <i class="bi bi-plus"></i> Add Playlist
            </button>
            <div v-else>
                <div class="input-group mt-4">
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
                        class="btn btn-primary"
                        :disabled="!newPlaylistName.trim().length || inProgress"
                        @click="addPlaylist()"
                    >
                        <div v-if="inProgress" class="spinner-border spinner-border-sm" role="status"></div>
                        Add
                    </button>
                    <button
                        class="btn btn-danger"
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
