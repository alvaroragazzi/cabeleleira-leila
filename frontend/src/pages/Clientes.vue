<template>
    <div class="row items-start justify-between q-col-gutter-lg q-mb-lg">
        <div class="col-12 col-md">
            <div class="text-overline text-primary text-weight-medium">Painel gerencial</div>
            <div class="text-h4 text-weight-bold q-mt-xs">Clientes</div>
            <div class="text-body2 text-grey-7 q-mt-sm indicadores-page__subtitle">
                Cadastre e gerencie os clientes do salão.
            </div>
        </div>
    </div>

    <g-btn
        icon="Plus"
        label="Novo cliente"
        color="primary"
        class="q-mb-sm"
        @click="abrirModalServico()"
    />

    <g-table
        :columns="columns"
        :loading="isLoading"
        :rows="clientes"
    >
        <template #body-cell-Acoes="props">
            <div class="items-center row q-gutter-x-sm">
                <g-btn dense color="primary" icon="Edit" label="Editar" @click="abrirModalServico(props.row.id)"/>
            </div>
        </template>
    </g-table>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

import ModalServico from "components/Servicos/ModalServico.vue";

const $q = useQuasar();

const isLoading = ref(true);

const clientes = ref([]);

const columns = [
    { name: "Nome", label: "Nome", field: "nm_cliente" },
    { name: "Telefone", label: "Telefone", field: "ds_telefone" },
    { name: "E-mail", label: "E-mail", field: "ds_email" },
    { name: "Acoes", label: "Ações" },
];

const abrirModalServico = (id) => {
    $q.dialog({
        component: ModalServico,
        componentProps: { 
            id,
        },
    }).onOk(() => getClientes());
};

const getClientes = () => {
    isLoading.value = true;

    api.get("/clientes")
        .then(res => {
            clientes.value = res.data;
        })
        .finally(() => isLoading.value = false);
}

onMounted(() => getClientes());
</script>