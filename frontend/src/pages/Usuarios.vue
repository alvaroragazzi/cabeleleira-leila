<template>
    <q-card flat bordered style="border-radius: 20px; border-left: 4px solid var(--primary);" class="q-mb-md">
        <q-card-section>
            <div class="text-h6">Usuários</div>
            <div class="text-subtitle2">Gerencie os usuários do sistema no salão</div>
        </q-card-section>
    </q-card>

    <g-btn
        icon="Plus"
        label="Novo usuário"
        color="primary"
        class="q-mb-sm"
        @click="abrirModalUsuario()"
    />

    <g-table
        :columns="columns"
        :loading="isLoading"
        :rows="servicos"
    >
        <template #body-cell-Nome="props">
            <div class="row items-center">
                <q-avatar size="40px" class="q-mr-sm">
                    <img :src="props.row.imagem" />
                </q-avatar>

                <div class="column">
                    <span>{{ props.row.nm_usuario }}</span>
                    <q-rating readonly :model-value="4" size="1rem" :max="4" color="yellow-8" />
                </div>
            </div>
        </template>

        <template #body-cell-Status="props">
            <q-badge
                dense
                :color="props.row.tf_ativo ? 'positive' : 'negative'""
            >
                <g-icon 
                    :name="props.row.tf_ativo ? 'Check' : 'X'"
                    size=".8rem"
                />
                {{ props.row.tf_ativo ? "Ativo" : "Inativo" }}
            </q-badge>
        </template>

        <template #body-cell-Acoes="props">
            <div class="items-center row q-gutter-x-sm">
                <g-btn dense color="primary" icon="Edit" label="Editar" @click="abrirModalUsuario(props.row.id)"/>
            </div>
        </template>
    </g-table>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

import ModalUsuario from "components/Usuarios/ModalUsuario.vue";

const $q = useQuasar();

const isLoading = ref(true);

const servicos = ref([]);

const columns = [
    { name: "Código", label: "Código", field: "id" },
    { name: "Nome", label: "Nome", field: "nm_usuario" },
    { name: "Status", label: "Status", field: "tf_ativo" },
    { name: "Acoes", label: "Ações" },
];

const abrirModalUsuario = (id) => {
    $q.dialog({
        component: ModalUsuario,
        componentProps: { 
            id,
        },
    }).onOk(() => getUsuarios());
};

const getUsuarios = () => {
    isLoading.value = true;

    api.get("/usuarios")
        .then(res => {
            servicos.value = res.data;
        })
        .finally(() => isLoading.value = false);
}

onMounted(() => getUsuarios());
</script>