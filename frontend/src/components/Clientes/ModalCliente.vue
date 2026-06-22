<template>
    <q-dialog ref="dialogRef">
        <GCardCadastro
            creating-title="Criar cliente"
            updating-title="Atualizar cliente"
            updated-success-message="Cliente atualizado com sucesso!"
            created-success-message="Cliente criado com sucesso!"
            create-endpoint="/clientes"
            update-endpoint="/clientes/{id}"
            load-endpoint="/clientes/{id}"
            :id="props.id"
            v-model="dados"
            @loaded="onLoaded"
            style="width: 50%"
            @ok="onOk"
        >
            <div class="q-gutter-y-sm">
                <g-input
                    label="Nome"
                    v-model="dados.nm_cliente"
                    maxlength="100"
                    obrigatorio
                    counter
                    hide-bottom-space
                />

                <g-input
                    label="Telefone"
                    v-model="dados.ds_telefone"
                    :obrigatorio="!props.id"
                    hide-bottom-space
                />

                <g-input
                    label="E-mail"
                    v-model="dados.ds_email"
                    type="email"
                    :obrigatorio="!props.id"
                    hide-bottom-space
                />
            </div>
        </GCardCadastro>
    </q-dialog>
</template>

<script setup>
import { ref } from "vue";
const dados = ref({ tf_ativo: true });
const dialogRef = ref();

const emit = defineEmits([
    "ok",
]);

const props = defineProps({
    id: Number
});

const onOk = () => {
    dialogRef.value.hide();
    emit("ok");
}
</script>