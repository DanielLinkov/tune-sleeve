<template>
    <div class="slidable-container">
        <div
            class="slidable"
            @mousedown="startDrag"
            @touchstart="startDrag"
            @mouseup="stopDrag"
            @touchend="stopDrag"
            @mouseleave="stopDrag"
            @mousemove="onDrag"
            @touchmove="onDrag"
            ref="slidable"
            :style="{ transform: `translateX(${delta}px)` }"
        >
            <slot></slot>
        </div>
        <div
            class="slidable-underlay"
            :style="{ opacity: Math.min(Math.pow(Math.abs(delta) / props.maxOffset,3), 1) }"
        >
            <slot name="action"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";

const isDragging = ref(false);
let startX = 0;
let delta = ref(0);
const elSlidable = useTemplateRef<HTMLElement>("slidable");

const props = withDefaults(
    defineProps<{
        maxOffset?: number;
    }>(),
    {
        maxOffset: 60,
    },
);

const startDrag = (event: MouseEvent | TouchEvent) => {
    isDragging.value = true;
    elSlidable.value?.classList.add("dragging");
    startX =
        event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
};

const stopDrag = () => {
    isDragging.value = false;
    setTimeout(() => {
        elSlidable.value?.classList.remove("dragging");
    }, 200); // Match the transition duration in CSS
    if (delta.value < -props.maxOffset * 0.8) {
        delta.value = -props.maxOffset; // Snap to max offset if dragged enough
    } else {
        delta.value = 0; // Reset the delta if not dragged enough
    }
};

const onDrag = (event: MouseEvent | TouchEvent) => {
    if (!isDragging.value) return;
    const currentX =
        event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    delta.value = Math.max(Math.min(0, currentX - startX), -props.maxOffset);
    // Handle the drag logic here, e.g., updating the position of the element
};
</script>

<style scoped>
.slidable-container {
    position: relative;
    overflow: hidden;
}
.slidable {
    user-select: none;
    cursor: grab;
    position: relative;
    z-index: 10;
    transition: transform 0.1s ease-out;
}
.slidable.dragging {
    cursor: grabbing;
}
.slidable-underlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-right: 10px; /* Adjust as needed */
}
</style>
