<template>
    <q-dialog ref="dialogRef">
        <g-card
            title="Incluir agendamento"
            style="width: 50%"
            @submit="agendar"
            use-form
        >
            <g-card class="q-ma-sm" bordered flat>
                <div class="row">
                    <div class="col-3 items-center column flex flex-center">
                        <q-avatar>
                            <img :src="props.usuario.imagem" />
                        </q-avatar>

                        <div class="column">
                            <span>{{ props.usuario.nm_usuario }}</span>
                        </div>
                    </div>

                    <q-separator vertical spaced/>

                    <div class="column col">
                        <div class="row items-center q-gutter-x-xs">
                            <g-icon name="Clock"/>
                            <span>{{ dayjs(props.horario.dh_horario).format('DD/MM/YYYY HH:mm') }}</span>
                        </div>

                        <SelectCliente
                            v-if="!clienteSemCadastro"
                            label="Cliente"
                            class="q-mt-md"
                            v-model="dados.id_cliente"
                            hide-id
                            outlined
                            dense
                            obrigatorio
                            hide-bottom-space
                            emit-value
                            map-options
                            clearable
                        />

                        <div v-else>
                            <g-input
                                label="Nome do cliente"
                                class="q-mt-md"
                                v-model="dados.nm_cliente"
                                outlined
                                dense
                                obrigatorio
                                hide-bottom-space
                                autofocus
                            />

                            <g-input
                                label="Telefone do cliente"
                                v-model="dados.ds_telefone"
                                class="q-mt-sm"
                                outlined
                                dense
                                hide-bottom-space
                                obrigatorio
                            />

                            <g-input
                                label="E-mail do cliente"
                                class="q-mt-sm"
                                v-model="dados.ds_email"
                                outlined
                                dense
                            />
                        </div>

                        <q-checkbox
                            label="Cliente não está cadastrado no sistema"
                            class="text-caption q-mt-sm"
                            v-model="clienteSemCadastro"
                            dense
                        />
                    </div>
                </div>
            </g-card>

            <g-card class="q-ma-sm" flat bordered>
                <div>
                    <div class="row q-gutter-x-xs items-center">
                        <g-icon name="BriefcaseBusiness"/>
                        <div>
                            <div>Serviços</div>
                            <div class="text-caption text-grey-6">Selecione os serviços que serão executados no agendamento</div>
                        </div>
                    </div>
                </div>

                <q-separator spaced/>

                <q-field
                    hide-bottom-space
                    borderless
                    no-error-icon
                    :rules="[
                        () => servicosSelecionados.length > 0 || 'Selecione pelo menos um serviço'
                    ]"
                >
                    <template #control>
                        <div class="row q-col-gutter-xs full-width">
                            <div
                                v-for="servico in servicos"
                                :key="servico.id_servico"
                                class="col-lg-6 col-12"
                            >
                                <q-item
                                    class="bg-grey-3 full-width full-height rounded-borders"
                                    clickable
                                    :active="servicosSelecionados.find(s => s.id === servico.id) ? true : false"
                                    :focused="servicosSelecionados.find(s => s.id === servico.id) ? true : false"
                                    @click="onSelecionarServico(servico)"
                                    :disable="!servicosSelecionados.find(s => s.id === servico.id) && (servico.vl_duracao > props.horario.minutos_disponiveis || servicosSelecionados.reduce((acc, s) => acc + s.vl_duracao, 0) + servico.vl_duracao > props.horario.minutos_disponiveis)"
                                >
                                    <q-tooltip 
                                        v-if="!servicosSelecionados.find(s => s.id === servico.id) && (servico.vl_duracao > props.horario.minutos_disponiveis || servicosSelecionados.reduce((acc, s) => acc + s.vl_duracao, 0) + servico.vl_duracao > props.horario.minutos_disponiveis)"
                                        class="text-caption"
                                    >
                                        O tempo de duração deste serviço é maior do que o tempo disponível para este horário.
                                    </q-tooltip>
                                
                                    <q-item-section avatar>
                                        <q-img class="rounded-borders" width="50px" :src="servico.imagem"/>
                                    </q-item-section>

                                    <q-item-section>
                                        <q-item-label>{{ servico.nm_servico }}</q-item-label>
                                        <q-item-label caption>
                                            <div class="row items-center">
                                                <g-icon name="Clock" size="1rem" class="q-mr-xs"/>
                                                {{ servico.vl_duracao }} min
                                            </div>
                                        </q-item-label>
                                    </q-item-section>
                                </q-item>
                            </div>
                        </div>
                    </template>
                </q-field>
            </g-card>
        </g-card>
    </q-dialog>
</template>

<script setup>
import { api } from "boot/axios";
import dayjs from "dayjs";
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";

import SelectCliente from "components/Selects/SelectCliente.vue";

const $q = useQuasar();

const dialogRef = ref();

const clienteSemCadastro = ref(false);
const servicos = ref([]);
const servicosSelecionados = ref([]);

const dados = ref({
    id_cliente: null,
    nm_cliente: null,
    ds_telefone: null,
    ds_email: null,
});

const emit = defineEmits(["ok"]);

const props = defineProps({
    horario: {
        type: Object,
        required: true,
    },
    usuario: {
        type: Object,
        required: false,
    },
});

const onSelecionarServico = (servico) => {
    const idx = servicosSelecionados.value.findIndex(s => s.id === servico.id);

    if (idx > -1) {
        servicosSelecionados.value.splice(idx, 1);
    } else {
        servicosSelecionados.value.push(servico);
    }
}

const getServicos = () => {
    api.get("/servicos").then(res => {
        servicos.value = res.data || [];
    });
}

const agendar = () => {
    $q.loading.show();

    api.post("/agendamentos", {
        id_usuario: props.usuario.id,
        dh_agendamento: props.horario.dh_horario,
        id_servicos: servicosSelecionados.value.map(s => s.id),
        ...dados.value,
    }).then(res => {
        $q.notify({
            type: "positive",
            message: "Agendamento incluído com sucesso!",
        });
        emit("ok");
        dialogRef.value.hide();
    }).finally(() => $q.loading.hide());
}

onMounted(() => getServicos());
</script>