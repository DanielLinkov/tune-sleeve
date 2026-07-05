<template>
    <div class="card bg-info-subtle w-80">
        <div class="card-header flex items-center gap-2" v-if="!inGenreMode">
            <i class="bi bi-person-lines-fill"></i>
            <input
                type="text"
                class="form-control form-control-sm ms-2"
                placeholder="Search artists..."
                title="<strong>Esc</strong> to clear<br/><strong>Enter</strong> to select if only one result"
                data-bs-toggle="tooltip"
                @keydown.escape="artistSearchQuery = ''"
                @keydown.enter="if(listFiltered.length === 1) {uiStore.selectArtist(listFiltered[0].id); !inGenreMode && uiStore.setPage('artist') || inGenreMode && uiStore.setPage('genre-artist')}"
                v-model="artistSearchQuery"
            />
        </div>
        <div class="overflow-y-auto">
            <div class="list-group user-select-none">
                <div
                    class="list-group-item list-group-item-action cursor-pointer truncate"
                    :class="{ active: artist.id === uiStore.selectedArtistId }"
                    :data-id="artist.id"
                    :title="artist.name"
                    data-bs-toggle="tooltip"
                    data-bs-placement="right"
                    v-for="artist in listFiltered"
                    :key="artist.id"
                    @click="uiStore.selectArtist(artist.id); !inGenreMode && uiStore.setPage('artist') || inGenreMode && uiStore.setPage('genre-artist')"
                >
                    {{ artist.name }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, computed } from "vue";
import { useUiStore } from "../../stores/ui";

const uiStore = useUiStore();
const inGenreMode = uiStore.page === 'genre' || uiStore.page === 'genre-artist';
const artistSearchQuery = ref('');

const props = defineProps<{
    list: Array<{ id: number; name: string }>;
}>();

const listFiltered = computed(() => {
    if (artistSearchQuery.value.trim() === '') {
        return props.list;
    }
    return props.list.filter(artist =>
        artist.name.toLowerCase().includes(artistSearchQuery.value.toLowerCase())
    );
});
const scrollSelectedIntoView = () => {
    if(uiStore.selectedArtistId !== null) {
        const el = document.querySelector(`[data-id='${uiStore.selectedArtistId}']`);
        if(el) {
            el.scrollIntoView({ block: "center", behavior: "smooth" });
        }
    }
};
onMounted(() => {
    scrollSelectedIntoView();
});
watch(() => uiStore.selectedArtistId, () => {
    scrollSelectedIntoView();
});
</script>
