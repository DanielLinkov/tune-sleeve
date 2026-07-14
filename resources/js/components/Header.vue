<template>
    <div class="d-flex align-items-center text-bg-body border-bottom border-1 border-black">
        <img src="../../../public/images/logo.png" alt="Logo" class="h-9 m-2 bg-primary rounded p-1">
        <Player class="flex-shrink-0 ms-3"/>
        <div title="Menu" class="ms-auto me-2" data-bs-placement="left" data-bs-toggle="tooltip">
            <button class="btn btn-default" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
                <i class="bi bi-list"></i>
            </button>
        </div>
    </div>
</template>

<script lang="js" setup>
import Player from './Player.vue';
</script>
