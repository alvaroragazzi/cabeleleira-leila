<template>
    <q-dialog ref="dialogRef">
        <g-card
            :title="props.agendamento ? 'Editar agendamento' : 'Novo agendamento'"
            class="full-width modal-agendamento-cliente"
            @submit="criarAgendamento"
            use-form
        >
            <div style="max-height: 600px">
                <div class="q-pa-md row items-center justify-between q-col-gutter-md">
                    <div class="col-12 col-md">
                        <div class="text-overline text-primary text-weight-medium">Agendamento online</div>
                        <div class="text-h5 text-weight-bold q-mt-xs">Escolha a data, o horário e os serviços</div>
                    </div>
                </div>

                <SelectUsuario
                    outlined
                    dense
                    hide-id
                    emit-value
                    map-options
                    v-model="funcionarioSelecionado"
                    @update:model-value="getDiasDisponiveis"
                    label="Funcionário"
                    style="max-width: 300px"
                    class="q-ml-md"
                />

                <div class="row q-col-gutter-md q-pa-md">
                    <div class="col-12 col-lg-5">
                        <g-card flat bordered class="full-height">
                            <q-card-section class="q-pb-sm">
                                <div class="text-subtitle1 text-weight-bold row items-center">
                                    <g-icon class="q-mr-sm" name="CalendarDays" size="18px" />
                                    Selecione o dia
                                </div>
                                <div class="text-caption text-grey-7 q-mt-xs">
                                    Apenas dias disponíveis ficam habilitados no calendário.
                                </div>
                            </q-card-section>

                            <q-separator />

                            <q-card-section class="q-pa-none">
                                <q-date
                                    v-model="dataSelecionada"
                                    @update:model-value="onDataSelecionadaChange"
                                    @navigation="onNavegacaoCalendario"
                                    minimal
                                    flat
                                    :options="datasDisponiveis"
                                    class="full-width full-height"
                                />
                            </q-card-section>
                        </g-card>
                    </div>

                    <div class="col-12 col-lg-7">
                        <g-card flat bordered class="agenda-panel full-height">
                            <q-card-section class="q-pb-sm">
                                <div class="row items-start justify-between q-col-gutter-sm">
                                    <div class="col">
                                        <div class="text-subtitle1 text-weight-bold row items-center">
                                            <g-icon class="q-mr-sm" name="Clock" size="18px" />
                                            Horários disponíveis
                                        </div>
                                        <div class="text-caption text-grey-7 q-mt-xs">
                                            {{ selectedDateLongLabel }}
                                        </div>
                                    </div>

                                    <q-badge outline color="primary" rounded class="text-weight-medium">
                                        {{ horariosDisponiveis.length }} opções
                                    </q-badge>
                                </div>
                            </q-card-section>

                            <q-separator />

                            <q-card-section class="agenda-scroll q-pt-md">
                                <div v-if="horariosDisponiveis.length === 0" class="text-center q-pa-xl">
                                    <q-icon name="event_busy" size="56px" color="grey-5" />
                                    <div class="text-h6 q-mt-md">Nenhum horário disponível</div>
                                    <div class="text-body2 text-grey-7 q-mt-sm">
                                        Tente outra data no calendário para ver novos horários.
                                    </div>
                                </div>

                                <div v-else class="row q-col-gutter-sm">
                                    <div
                                        v-for="horario in horariosDisponiveis"
                                        :key="horario.dh_agendamento"
                                        class="col-6 col-sm-4 col-md-3 col-xl-2"
                                    >
                                        <q-btn
                                            :label="horario.horario"
                                            class="full-width"
                                            rounded
                                            unelevated
                                            :color="horarioSelecionado?.dh_agendamento === horario.dh_agendamento ? 'primary' : 'grey-3'"
                                            :text-color="horarioSelecionado?.dh_agendamento === horario.dh_agendamento ? 'white' : 'grey-9'"
                                            :outline="horarioSelecionado?.dh_agendamento !== horario.dh_agendamento"
                                            @click="onHorarioSelecionadoChange(horario)"
                                        />
                                    </div>
                                </div>
                            </q-card-section>

                            <q-separator v-if="horarioSelecionado" />

                            <q-card-section v-if="horarioSelecionado" class="q-pt-md">
                                <div class="row items-start justify-between q-col-gutter-sm q-mb-md">
                                    <div class="col">
                                        <div class="text-subtitle1 text-weight-bold row items-center">
                                            <g-icon class="q-mr-sm" name="BriefcaseBusiness" size="18px" />
                                            Serviços prestados
                                        </div>
                                        <div class="text-caption text-grey-7 q-mt-xs">
                                            Selecione os serviços dentro do tempo disponível para este horário.
                                        </div>
                                    </div>

                                    <div class="col-auto row q-gutter-sm items-center">
                                        <q-badge color="secondary" rounded class="text-weight-medium">
                                            {{ servicosSelecionados.length }} selecionado{{ servicosSelecionados.length === 1 ? '' : 's' }}
                                        </q-badge>
                                        <q-badge outline color="primary" rounded class="text-weight-medium">
                                            {{ totalDuracaoSelecionada }} / {{ horarioSelecionado.minutos_disponiveis }} min
                                        </q-badge>
                                    </div>
                                </div>

                                <q-field
                                    hide-bottom-space
                                    borderless
                                    no-error-icon
                                    :rules="[
                                        () => servicosSelecionados.length > 0 || 'Selecione pelo menos um serviço'
                                    ]"
                                >
                                    <template #control>
                                        <div class="row q-col-gutter-sm full-width">
                                            <div
                                                v-for="servico in servicos"
                                                :key="servico.id_servico"
                                                class="col-12 col-sm-6"
                                            >
                                                <g-card
                                                    flat
                                                    bordered
                                                    class="full-width full-height"
                                                    :class="{
                                                        'cursor-pointer': servicoPodeSerSelecionadoDesselecionado(servico),
                                                        'service-card--selected': servicosSelecionados.find(s => s.id === servico.id),
                                                        'service-card--disabled': !servicosSelecionados.find(s => s.id === servico.id) && (servico.vl_duracao > horarioSelecionado.minutos_disponiveis || servicosSelecionados.reduce((acc, s) => acc + s.vl_duracao, 0) + servico.vl_duracao > horarioSelecionado.minutos_disponiveis)
                                                    }"
                                                    @click="onSelecionarServico(servico)"
                                                >
                                                    <q-tooltip 
                                                        v-if="!servicosSelecionados.find(s => s.id === servico.id) && (servico.vl_duracao > horarioSelecionado.minutos_disponiveis || servicosSelecionados.reduce((acc, s) => acc + s.vl_duracao, 0) + servico.vl_duracao > horarioSelecionado.minutos_disponiveis)"
                                                        class="text-caption"
                                                    >
                                                        O tempo deste serviço ultrapassa o horário disponível.
                                                    </q-tooltip>

                                                    <q-card-section class="row items-center no-wrap q-gutter-md">
                                                        <q-avatar size="52px" square>
                                                            <q-img class="rounded-borders" :src="servico.imagem" />
                                                        </q-avatar>

                                                        <div class="col">
                                                            <div class="row items-center justify-between q-gutter-sm">
                                                                <div class="text-subtitle2 text-weight-medium ellipsis">
                                                                    {{ servico.nm_servico }}
                                                                </div>

                                                                <q-icon
                                                                    :name="servicosSelecionados.find(s => s.id === servico.id) ? 'sym_o_check_circle' : 'sym_o_add_circle'"
                                                                    :color="servicosSelecionados.find(s => s.id === servico.id) ? 'primary' : 'grey-5'"
                                                                    size="20px"
                                                                />
                                                            </div>

                                                            <div class="text-caption text-grey-7 row items-center q-mt-xs">
                                                                <g-icon name="Clock" size="14px" class="q-mr-xs" />
                                                                {{ servico.vl_duracao }} min
                                                            </div>
                                                        </div>
                                                    </q-card-section>
                                                </g-card>
                                            </div>
                                        </div>
                                    </template>
                                </q-field>
                            </q-card-section>

                            <q-separator v-if="horarioSelecionado" />

                            <q-card-section v-if="horarioSelecionado" class="q-pt-md">
                                <div class="agenda-summary row items-center justify-between q-gutter-md">
                                    <div>
                                        <div class="text-caption text-grey-7">Resumo da seleção</div>
                                        <div class="text-body2 text-weight-medium">
                                            {{ selectedDateLabel }} · {{ horarioSelecionado.horario }}
                                        </div>
                                    </div>

                                    <q-chip color="primary" text-color="white" icon="sym_o_schedule" square>
                                        {{ totalDuracaoSelecionada }} min agendados
                                    </q-chip>
                                </div>
                            </q-card-section>
                        </g-card>
                    </div>
                </div>
            </div>
        </g-card>
    </q-dialog>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/pt-br";

dayjs.extend(utc);
dayjs.locale("pt-br");

import SelectUsuario from "components/Selects/SelectUsuario.vue";

const dataSelecionada = ref(dayjs().format("YYYY/MM/DD"));
const mesAnoSelecionado = ref(dayjs().format("YYYY-MM"));

const datasDisponiveis = ref([]);
const horariosDisponiveis = ref([]);

const servicos = ref([]);

const servicosSelecionados = ref([]);
const horarioSelecionado = ref();

const funcionarioSelecionado = ref();

const selectedDateLabel = computed(() => dayjs(dataSelecionada.value).format("DD/MM/YYYY"));
const selectedDateLongLabel = computed(() => dayjs(dataSelecionada.value).format("DD [de] MMMM [de] YYYY"));
const totalDuracaoSelecionada = computed(() => servicosSelecionados.value.reduce((acc, servico) => acc + servico.vl_duracao, 0));

const $q = useQuasar();
const dialogRef = ref();
const emit = defineEmits(["ok"]);

const props = defineProps({
    agendamento: {
        type: Object,
        required: false,
    },
});

const servicoPodeSerSelecionadoDesselecionado = (servico) => {
    const duracaoTotal = totalDuracaoSelecionada.value + servico.vl_duracao;

    return duracaoTotal <= horarioSelecionado.value.minutos_disponiveis || servicosSelecionados.value.find(s => s.id === servico.id);
}

const getDiasDisponiveis = () => {
    return api.get("/usuarioAgendaHorarios/diasDisponiveisMes", {
        params: {
            id_usuario: funcionarioSelecionado.value,
            data: `${mesAnoSelecionado.value}-01`,
        },
    }).then(res => {
        if (props.agendamento) {
            dataSelecionada.value = dayjs(props.agendamento.dh_agendamento).format("YYYY/MM/DD");
        }

        datasDisponiveis.value = res.data.map(dia => dayjs(dia.data, "YYYY-MM-DD").format("YYYY/MM/DD"));
    });
}

const getHorariosDisponiveis = () => {
    api.get("/usuarioAgendaHorarios/horariosDisponiveis", {
        params: {
            id_usuario: funcionarioSelecionado.value,
            data: dayjs(dataSelecionada.value).format("YYYY-MM-DD"),
        },
    }).then(res => {
        horariosDisponiveis.value = res.data || [];

        if (props.agendamento) {
            const horario = {
                dh_agendamento: dayjs.utc(props.agendamento.dh_agendamento).format("YYYY-MM-DD HH:mm"),
                horario: dayjs.utc(props.agendamento.dh_agendamento).format("HH:mm"),
                minutos_disponiveis: props.agendamento.minutos_disponiveis,
            }

            horariosDisponiveis.value.push(horario);

            horariosDisponiveis.value.sort((a, b) => {
                return a.dh_agendamento.localeCompare(b.dh_agendamento);
            });

            horarioSelecionado.value = horario;
        }
    });
};

const onNavegacaoCalendario = (navegacao) => {
    mesAnoSelecionado.value = `${navegacao.year}-${String(navegacao.month).padStart(2, "0")}`;

    getDiasDisponiveis();
};

const onHorarioSelecionadoChange = (novoHorario) => {
    horarioSelecionado.value = novoHorario;
    servicosSelecionados.value = [];
}

const onDataSelecionadaChange = (novaData) => {
    if (novaData) {
        horarioSelecionado.value = null;
        servicosSelecionados.value = [];
        getHorariosDisponiveis();
    }
};

const onSelecionarServico = (servico) => {
    if (servicoPodeSerSelecionadoDesselecionado(servico)) {
        const idx = servicosSelecionados.value.findIndex(s => s.id == servico.id);

        if (idx > -1) {
            servicosSelecionados.value.splice(idx, 1);
        } else {
            servicosSelecionados.value.push(servico);
        }
    }
}

const getServicos = () => {
    api.get("/servicos").then(res => {
        servicos.value = res.data || [];
    });
}

const criarAgendamento = () => {
    $q.loading.show();

    if (!props.agendamento) {
        api.post("/agendamentos/agendamentoCliente", {
            id_usuario: funcionarioSelecionado.value,
            dh_agendamento: horarioSelecionado.value.dh_agendamento,
            id_servicos: servicosSelecionados.value.map(s => s.id),
        }).then(() => {
            $q.dialog({
                title: "Agendamento criado",
                message: "Seu agendamento foi criado com sucesso!",
                icon: "sym_o_check_circle",
                color: "green",
            });
            emit("ok");
            dialogRef.value.hide();
        }).catch(err => {
            if (err.response.status == 400) {
                $q.dialog({
                    title: "Erro ao criar agendamento",
                    message: "O horário selecionado não está mais disponível. Por favor, escolha outro horário ou data.",
                    type: "negative",
                });
            }
        })
        .finally(() => $q.loading.hide());
    } else {
        api.put(`/agendamentos/${props.agendamento.id}`, {
            id_usuario: funcionarioSelecionado.value,
            dh_agendamento: horarioSelecionado.value.dh_agendamento,
            id_servicos: servicosSelecionados.value.map(s => s.id),
        }).then(() => {
            $q.dialog({
                title: "Agendamento atualizado",
                message: "Seu agendamento foi atualizado com sucesso!",
                icon: "sym_o_check_circle",
                color: "primary",
            });
            emit("ok");
            dialogRef.value.hide();
        }).catch(err => {
            if (err.response.status == 400) {
                $q.dialog({
                    title: "Erro ao atualizar agendamento",
                    message: "O horário selecionado não está mais disponível. Por favor, escolha outro horário ou data.",
                    type: "negative",
                });
            }
        })
        .finally(() => $q.loading.hide());
    }
};

onMounted(() => {
    if (props.agendamento) {
        funcionarioSelecionado.value = props.agendamento.id_usuario;
        servicosSelecionados.value = props.agendamento.servicos || [];

        console.log(props.agendamento.servicos)
    }

    getDiasDisponiveis().then(() => getHorariosDisponiveis());
    getServicos();
});
</script>