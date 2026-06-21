<template>
    <component
        :is="IconComponent"
        :size="size"
        :stroke-width="strokeWidth"
        :color="color"
    />
</template>

<script setup>
import { computed } from "vue";
import * as LucideIcons from "@lucide/vue";

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        default: 22
    },
    strokeWidth: {
        type: Number,
        default: 2
    },
    color: {
        type: String,
        default: "currentColor"
    },
})

const IconComponent = computed(() => LucideIcons[props.name] || LucideIcons.CircleHelp);
</script>