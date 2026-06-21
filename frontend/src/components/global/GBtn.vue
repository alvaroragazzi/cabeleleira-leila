<template>
    <q-btn style="border-radius: 10px;">
        <template #default>
            <div class="row items-center q-gutter-x-xs">
                <g-icon
                    v-if="props.icon"
                    :name="props.icon"
                />

                <div v-if="props.label">
                    <slot>{{ props.label }}</slot>
                </div>
            </div>
        </template>
    </q-btn>
</template>

<script setup>
const props = defineProps({
    icon: String,
    label: String,
})
</script>