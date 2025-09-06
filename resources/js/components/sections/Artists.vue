<template>
    <div class="card bg-info-subtle max-w-80">
        <div class="card-header">Artists</div>
        <div class="card-body overflow-y-auto">
            <div class="list-group">
                <a href="#" class="list-group-item list-group-item-action" aria-current="true">
                    All
                </a>
                <a href="#" class="list-group-item list-group-item-action" v-for="artist in artists" :key="artist.id">
                    {{ artist.name }}
                </a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const artists = inject('artists');

</script>
