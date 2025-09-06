<template>
    <div class="card bg-info-subtle">
        <div class="card-header">{{ title ?? 'Albums' }}</div>
        <div class="card-body">
            <div class="d-grid gap-3" :style="{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }">
                <div class="card bg-light" v-for="album in list" :key="album.id">
                    <img :src="album.cover ? '/covers/' + album.cover : '/img/placeholder.png'" class="card-img-top" :alt="album.title">
                    <div class="card-body p-2">
                        <h6 class="card-title text-truncate" :title="album.title">{{ album.title }}</h6>
                        <p class="card-text text-truncate" :title="album.artist_name">{{ album.artist_name }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Album } from '../../types';

defineProps<{
    title: string,
    list: Array<Album>,
}>();
</script>
