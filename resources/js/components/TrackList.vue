<template>
    <ul class="list-group list-group-flush user-select-none mx-auto">
        <template
            v-for="(track,index) in tracks"
            :key="track.id"
        >
            <li v-if="diskNoChanged(index)" class="list-group-item disabled">
                Disc {{ track.disk_no }}
            </li>
            <li
                class="list-group-item list-group-item-action d-flex align-items-center gap-2"
                @click="$emit('activateTrack', track.id)"
            >
                <div
                    :style="{
                        visibility:
                            playerStore.nowPlaying?.id === track.id
                                ? 'visible'
                                : 'hidden',
                    }"
                >
                    <i v-if="playerStore.isPlaying" class="bi bi-play-fill"></i>
                    <i v-else class="bi bi-pause"></i>
                </div>
                <div class="text-muted w-6">{{ track.track_no }}</div>
                <div class="">{{ track.title }}</div>
                <div class="text-muted ms-auto">
                    {{
                        new Date((track.duration || 0) * 1000)
                            .toISOString()
                            .slice(14, 19)
                    }}
                </div>
            </li>
        </template>
    </ul>
</template>

<script setup lang="ts">
import { Track } from "../types";
import { usePlayerStore } from "../stores/player";
const playerStore = usePlayerStore();
const props = defineProps<{
    tracks: Track[];
}>();

const diskNoChanged = (index: number) => {
    if (index === 0) return props.tracks[0].disk_no !== null;
    return props.tracks[index].disk_no !== props.tracks[index - 1].disk_no;
};
</script>

<style scoped>
.list-group {
    max-width: 400px;
}
.list-group-item {
    cursor: pointer;
}
</style>
