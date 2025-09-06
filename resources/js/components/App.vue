<template>
    <div class="d-flex flex-column vh-100">
        <Header></Header>
        <Content></Content>
        <Splash v-if="isSplashVisible"></Splash>
    </div>
</template>

<script setup lang="ts">
import Header from './Header.vue';
import Content from './Content.vue';
import Splash from './Splash.vue';
import { onMounted, provide, ref } from 'vue';
import axios from 'axios';

const isSplashVisible = ref(true);
const albums = ref([]);
const artists = ref([]);
const tracks = ref([]);
const genres = ref<string[]>([]);

provide('albums', albums);
provide('artists', artists);
provide('tracks', tracks);
provide('genres', genres);

const fnLoadTracks = () => {
    axios.get('/api/tracks')
        .then(response => {
            albums.value = response.data.albums;
            artists.value = response.data.artists;
            tracks.value = response.data.tracks;
            genres.value = Array.from(new Set(tracks.value.map((track: { genre: string; }) => track.genre)));
            setTimeout(() => {
                isSplashVisible.value = false;
            }, 2000); // Keep splash for at least 2 seconds
        })
        .catch(error => {
            console.error('Error loading tracks:', error);
        });
};
onMounted(() => {
    // Load the track list
    fnLoadTracks();
});
</script>
