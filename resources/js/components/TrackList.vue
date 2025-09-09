<template>
    <ul class="list-group list-group-flush user-select-none mx-auto">
        <template v-for="(track, index) in tracks" :key="track.id">
            <li v-if="diskNoChanged(index)" class="list-group-item disabled">
                Disc {{ track.disk_no }}
            </li>
            <li
                class="list-group-item list-group-item-action d-flex align-items-start gap-2"
                @click="$emit('activateTrack', track.id)"
                :data-track-id="track.id"
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
                <div class="max-w-3xs">
                    <div class="truncate w-100">{{ track.title }}</div>
                    <div class="text-sm truncate" v-if="withArtist" :class="[ uiStore.selectedArtistId === track.artist_id ? 'fw-bold text-white' : 'text-muted' ]">
                        {{
                            libraryStore.getArtist(track.artist_id)?.name ||
                            "Unknown Artist"
                        }}
                    </div>
                </div>
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
import { useLibraryStore } from "../stores/library";
import { useUiStore } from "../stores/ui";
import { onMounted } from "vue";

const playerStore = usePlayerStore();
const libraryStore = useLibraryStore();
const uiStore = useUiStore();
const props = defineProps<{
    tracks: Track[];
    withArtist?: boolean;
}>();

const diskNoChanged = (index: number) => {
    if (index === 0) return props.tracks[0].disk_no !== null;
    return props.tracks[index].disk_no !== props.tracks[index - 1].disk_no;
};

onMounted(() => {
    if (playerStore.nowPlaying) {
        const el = document.querySelector(
            `[data-track-id='${playerStore.nowPlaying.id}']`
        );
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }
});
</script>

<style scoped>
.list-group {
    max-width: 400px;
}
.list-group-item {
    cursor: pointer;
}
</style>
