<template>
    <q-dialog ref="dialogRef">
        <GCardCadastro
            creating-title="Criar usuário"
            updating-title="Atualizar usuário"
            updated-success-message="Usuário atualizado com sucesso!"
            created-success-message="Usuário criado com sucesso!"
            create-endpoint="/usuarios"
            update-endpoint="/usuarios/{id}"
            load-endpoint="/usuarios/{id}"
            use-form-data
            :id="props.id"
            v-model="dados"
            @loaded="onLoaded"
            style="width: 50%"
            @ok="onOk"
        >
            <div class="q-gutter-y-sm">
                <g-file-picker
                    label="Foto do usuário"
                    class="full-width"
                    v-model="dados.imagem"
                />

                <g-input
                    label="Nome"
                    v-model="dados.nm_usuario"
                    maxlength="100"
                    obrigatorio
                    counter
                    hide-bottom-space
                />

                <g-input
                    label="Senha"
                    v-model="dados.ds_senha"
                    type="password"
                    :obrigatorio="!props.id"
                    hide-bottom-space
                />

                <q-checkbox label="Ativo?" v-model="dados.tf_ativo"/>
            </div>
        </GCardCadastro>
    </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import base64ToFile from "src/functions/base64ToFile.js";

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

const onLoaded = () => {
    if (dados.value.imagem) {
        dados.value.imagem = base64ToFile(dados.value.imagem);
    }
}
</script>