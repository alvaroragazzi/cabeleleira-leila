<template>
    <g-select
        ref="select"
        options-url="/usuarios"
        option-label="nm_usuario"
        option-value="id"
    >
        <template #option-label="scope">
            <div class="row items-center">
                <q-avatar size="30px" class="q-mr-sm">
                    <img :src="scope.opt.imagem" />
                </q-avatar>

                <div>{{ scope.opt.nm_usuario }}</div>
            </div>
        </template>
    </g-select>
</template>

<script setup>

</script>