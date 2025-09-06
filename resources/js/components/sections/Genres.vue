<template>
    <div class="card bg-warning-subtle">
        <div class="card-header">Genres</div>
        <div class="card-body overflow-y-auto">
            <div class="list-group">
                <a href="#" class="list-group-item list-group-item-action" aria-current="true">
                    All
                </a>
                <a href="#" class="list-group-item list-group-item-action" v-for="genre in genres" :key="genre">
                    {{ genre }}
                </a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const genres = inject('genres');

</script>
