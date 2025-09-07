<template>
    <TrackList :tracks="playerStore.queue" @activateTrack="onActivateTrack"></TrackList>
</template>

<script setup lang="ts">
import TrackList from '../TrackList.vue';
import { usePlayerStore } from '../../stores/player';

const playerStore = usePlayerStore();

const onActivateTrack = (trackId: number) => {
    playerStore.playTrackId(trackId);
};
</script>
