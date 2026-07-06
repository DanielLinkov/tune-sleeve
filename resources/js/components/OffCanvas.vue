<template>
    <div
        class="offcanvas offcanvas-end"
        tabindex="-1"
        id="offcanvasRight"
        aria-labelledby="offcanvasRightLabel"
    >
        <div class="offcanvas-header">
            <h5 id="offcanvasRightLabel">TuneSleeve</h5>
            <button
                type="button"
                class="btn-close text-reset"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
            ></button>
        </div>
        <div class="offcanvas-body">
            <label>Theme Selection</label>
            <select
                class="form-select"
                v-model="theme"
                @change="
                    $emit(
                        'settings-theme',
                        ($event.target as HTMLSelectElement).value,
                    )
                "
            >
                <option value="brite">Brite</option>
                <option value="cerulean">Cerulean</option>
                <option value="cyborg">Cyborg</option>
                <option value="default">Default</option>
                <option value="flatly">Flatly</option>
                <option value="materia">Materia</option>
                <option value="morph">Morph</option>
                <option value="pulse">Pulse</option>
                <option value="quartz">Quartz</option>
                <option value="united">United</option>
                <option value="vapor">Vapor</option>
            </select>
            <label>Theme Variant</label>
            <select
                class="form-select"
                v-model="themeVariant"
                @change="
                    $emit(
                        'settings-theme_variant',
                        ($event.target as HTMLSelectElement).value,
                    )
                "
            >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineEmits(["settings-theme", "settings-theme_variant"]);

const props = defineProps({
    theme: {
        type: String,
        default: "vapor",
    },
    themeVariant: {
        type: String,
        default: "light",
    },
});
const theme = ref(props.theme);
const themeVariant = ref(props.themeVariant);
</script>
