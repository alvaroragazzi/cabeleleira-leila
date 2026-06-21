<template>
    <q-dialog ref="dialogRef">
        <GCardCadastro
            creating-title="Criar serviço"
            updating-title="Atualizar serviço"
            updated-success-message="Serviço atualizado com sucesso!"
            created-success-message="Serviço criado com sucesso!"
            create-endpoint="/servicos"
            update-endpoint="/servicos/{id}"
            load-endpoint="/servicos/{id}"
            use-form-data
            :id="props.id"
            v-model="dados"
            @loaded="onLoaded"
            style="width: 50%"
            @ok="onOk"
        >
            <div class="q-gutter-y-sm">
                <g-file-picker
                    label="Imagem do serviço"
                    class="full-width"
                    v-model="dados.imagem"
                />

                <g-input
                    label="Nome do serviço"
                    v-model="dados.nm_servico"
                    maxlength="100"
                    obrigatorio
                    counter
                    hide-bottom-space
                />

                <g-input
                    label="Preço"
                    v-model="dados.vl_preco"
                    obrigatorio
                    monetario
                    hide-bottom-space
                />

                <g-input
                    label="Duração (minutos)"
                    type="number"
                    v-model="dados.vl_duracao"
                />
            </div>
        </GCardCadastro>
    </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import base64ToFile from "src/functions/base64ToFile.js";

const dados = ref({});
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