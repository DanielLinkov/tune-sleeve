<template>
    <div class="card bg-info-subtle flex-grow-1">
        <div class="card-header">
            <i class="bi bi-disc"></i>
            {{ title ?? "Albums" }} ({{ list.length }})
        </div>
        <div class="card-body overflow-y-auto scrollbar-thin">
            <div class="album-grid">
                <div class="album cursor-pointer user-select-none" @click="uiStore.selectAlbum(album.id)" v-for="album in list" :key="album.id">
                    <img v-if="album.cover_path" :src="libraryStore.coverUrl(album.id)" class="cover" :alt="album.title" draggable="false" />
                    <div v-else class="cover bg-primary d-flex align-items-center justify-content-center text-white">
                        <i class="bi bi-music-note-beamed" style="font-size: 4rem;"></i>
                    </div>
                    <div class="card-body p-1 text-center" data-bs-toggle="tooltip" :title="`<div class='text-base fw-bold'>${album.title}</div><div class='text-sm text-muted'>${libraryStore.artistOfAlbum(album.id)?.name || 'Unknown Artist'}</div>`">
                        <h6 class="text-title truncate">
                            {{ album.title }}
                        </h6>
                        <p class="card-text truncate">
                            {{ libraryStore.artistOfAlbum(album.id)?.name }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Album } from "../../types";
import { useLibraryStore } from "../../stores/library";
import { useUiStore } from "../../stores/ui";

const libraryStore = useLibraryStore();
const uiStore = useUiStore();

defineProps<{
    title: string;
    list: Array<Album>;
}>();
</script>

<style scoped>
.album-grid {
    --col: 200px;
    --gap: 32px; /* minimum gap */
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, var(--col)));
    gap: var(--gap);
    justify-content: space-between; /* spreads extra space between columns */
}
.album-grid .cover {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: 0.25rem;
    transition: filter 0.5s, box-shadow 0.5s;
}
.album-grid .album {
    width: var(--col);
}
.album-grid .album:hover .cover {
    filter: brightness(0.8);
    box-shadow: 0 0 10px 3px var(--bs-info);
}
</style>
