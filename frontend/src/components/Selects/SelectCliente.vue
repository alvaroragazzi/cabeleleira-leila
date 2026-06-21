<template>
    <g-select
        ref="select"
        options-url="/clientes"
        option-label="nm_cliente"
        option-value="id"
    >
        <template #option-label="scope">
            <q-item-section>
                <q-item-label>{{ scope.opt.nm_cliente }}</q-item-label>
                <q-item-label v-if="scope.opt.ds_telefone" caption>
                    <g-icon name="Phone" size=".7rem"/>
                    {{ scope.opt.ds_telefone }}
                </q-item-label>
            </q-item-section>
        </template>
    </g-select>
</template>

<script setup>

</script>