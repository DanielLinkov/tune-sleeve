<template>
    <div class="card bg-warning-subtle max-w-80">
        <div class="card-header"><i class="bi bi-person-lines-fill"></i> Artists</div>
        <div class="overflow-y-auto">
            <div class="list-group user-select-none">
                <div class="list-group-item list-group-item-action truncate" :title="artist.name" v-for="artist in list" :key="artist.id" @click="fnSelectArtist(artist)">
                    {{ artist.name }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

defineProps<{
    list: Array<{ id: number, name: string }>,
}>();

const emit = defineEmits(['select:artist']);
const fnSelectArtist = (artist: { id: number, name: string } | null) => {
    emit('select:artist', artist);
};
</script>

<style scoped>
.list-group-item {
    cursor: pointer;
}
</style>
