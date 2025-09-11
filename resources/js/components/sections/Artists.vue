<template>
    <div class="card bg-info-subtle w-80">
        <div class="card-header">
            <i class="bi bi-person-lines-fill"></i> Artists
        </div>
        <div class="overflow-y-auto">
            <div class="list-group user-select-none">
                <div
                    class="list-group-item list-group-item-action cursor-pointer truncate"
                    :class="{ active: artist.id === uiStore.selectedArtistId }"
                    :data-id="artist.id"
                    :title="artist.name"
                    v-for="artist in list"
                    :key="artist.id"
                    @click="uiStore.selectArtist(artist.id); uiStore.setPage('artist')"
                >
                    {{ artist.name }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useUiStore } from "../../stores/ui";

const uiStore = useUiStore();

defineProps<{
    list: Array<{ id: number; name: string }>;
}>();

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
