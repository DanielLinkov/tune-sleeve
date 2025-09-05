<template>
    <div class="flex-grow-1 overflow-auto flex">
        <Sections @section="onSection"></Sections>
        <component :is="sectionComponent(currentSection)"></component>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Sections from './Sections.vue';
import Genres from './sections/Genres.vue';
import Albums from './sections/Albums.vue';
import Artists from './sections/Artists.vue';
import { Section } from '../defs';

const currentSection = ref(Section.Genres);
const onSection = (section: Section) => {
    currentSection.value = section;
}

const sectionComponent = (section: Section) => {
    switch (section) {
        case Section.Genres:
            return Genres;
        case Section.Albums:
            return Albums;
        case Section.Artists:
            return Artists;
    }
}
</script>
