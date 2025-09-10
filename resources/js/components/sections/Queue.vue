<template>
    <div v-if="playerStore.queue.length" class="overflow-y-auto w-100 h-100">
        <TrackList
            :tracks="playerStore.queue"
            :withArtist="true"
            @activateTrack="onActivateTrack"
        ></TrackList>
    </div>
    <div
        v-else
        class="d-flex align-items-center justify-content-center h-100 text-muted w-100"
    >
        <i class="bi bi-music-note-beamed" style="font-size: 4rem"></i>
        <span class="ms-3">No items to show</span>
    </div>
</template>

<script setup lang="ts">
import TrackList from "../TrackList.vue";
import { usePlayerStore } from "../../stores/player";

const playerStore = usePlayerStore();

const onActivateTrack = (trackId: number) => {
    playerStore.playTrackId(trackId);
};
</script>
