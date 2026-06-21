<template>
    <q-card flat bordered style="border-radius: 20px; border-left: 4px solid var(--primary);" class="q-mb-md">
        <q-card-section>
            <div class="text-h6">Serviços</div>
            <div class="text-subtitle2">Gerencie os serviços oferecidos pelo salão</div>
        </q-card-section>
    </q-card>

    <g-btn
        icon="Plus"
        label="Novo serviço"
        color="primary"
        class="q-mb-sm"
        @click="abrirModalServico()"
    />

    <g-table
        :columns="columns"
        :loading="isLoading"
        :rows="servicos"
    >
        <template #body-cell-Acoes="props">
            <div class="items-center row q-gutter-x-sm">
                <g-btn dense color="primary" icon="Edit" label="Editar" @click="abrirModalServico(props.row.id)"/>
            </div>
        </template>

        <template #body-cell-Nome="props">
            <div class="row items-center q-gutter-x-sm">
                <q-img class="rounded-borders" width="100px" :src="props.row.imagem"/>
                <div>{{ props.row.nm_servico }}</div>
            </div>
        </template>

        <template #body-cell-Duracao="props">
           {{ props.row.vl_duracao }} min
        </template>

        <template #body-cell-Preco="props">
           {{ new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(props.row.vl_preco) }}
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

const servicos = ref([]);

const columns = [
    { name: "Nome", label: "Nome", field: "nm_servico" },
    { name: "Preco", label: "Preço", field: "preco" },
    { name: "Duracao", label: "Duração", field: "duracao" },
    { name: "Acoes", label: "Ações" },
];

const abrirModalServico = (id) => {
    $q.dialog({
        component: ModalServico,
        componentProps: { 
            id,
        },
    }).onOk(() => getServicos());
};

const getServicos = () => {
    isLoading.value = true;

    api.get("/servicos")
        .then(res => {
            servicos.value = res.data;
        })
        .finally(() => isLoading.value = false);
}

onMounted(() => getServicos());
</script>