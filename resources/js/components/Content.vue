<template>
    <div class="flex-grow-1 overflow-auto flex">
        <Sections @section="onSection"></Sections>
        <Genres v-if="currentSection === Section.Genres" @select:genre="onSelectGenre"></Genres>
        <Albums v-if="currentSection === Section.Albums" title="Albums" :list="libraryStore.albums"></Albums>
        <Artists v-if="currentSection === Section.Artists" title="Artists" :list="libraryStore.artists"></Artists>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Sections from './Sections.vue';
import Genres from './sections/Genres.vue';
import Albums from './sections/Albums.vue';
import Artists from './sections/Artists.vue';
import { Section } from '../types';
import { useLibraryStore } from '../stores/library';

const currentSection = ref(Section.Genres);
const libraryStore = useLibraryStore();
const onSection = (section: Section) => {
    currentSection.value = section;
}

const emit = defineEmits(['select:genre']);

const onSelectGenre = (genre: string | null) => {
    emit('select:genre', genre);
};

</script>
