<template>
    <div style="margin: 0 auto">
        <div>
            <g-card flat bordered class="q-mb-md">
                <q-card-section>
                    <div class="row items-center justify-between q-col-gutter-md q-mb-md">
                        <div class="col-12">
                            <div class="text-h6 items-center row">
                                <g-icon name="ListFilter" size="22px" class="q-mr-xs" />
                                Filtros de Agendamento
                            </div>
                        </div>
                    </div>

                    <div class="row q-col-gutter-sm" style="width: 100%;">
                        <div class="column col-lg-4 col-md-6 col-12">
                            <q-date
                                v-model="dataSelecionada"
                                @update:model-value="onDataSelecionadaChange"
                                @navigation="onNavegacaoCalendario"
                                landscape 
                                today-btn
                                event-color="red"
                                class="full-width full-height"
                                :events="feriadosNacionais"
                                :options="datasDisponiveis"
                            />
                        </div>

                        <div class="col-lg col-md-6 col-12 column">
                            <SelectUsuario 
                                ref="selectUsuario"
                                label="Usuário"
                                v-model="usuarioSelecionado"
                                outlined 
                                dense 
                                hide-id
                                options-dense
                                emit-value
                                map-options
                            />

                            <g-btn 
                                label="Editar horário de trabalho"
                                color="primary"
                                class="q-mt-sm"
                                icon="Edit"
                                @click="abrirModalHorarioTrabalho"
                            />
                        </div>
                    </div>
                </q-card-section>
            </g-card>

            <g-card 
                flat 
                bordered
            >
                <q-card-section>
                    <div class="row text-h6 q-mb-md">
                        <div class="col items-center row">
                            <g-icon name="Clock" size="22px" class="q-mr-xs" />
                            Horários - {{ dayjs(dataSelecionada).format("DD/MM/YYYY") }}
                        </div>
                    </div>

                    <div v-if="loading" class="q-mt-md text-center">
                        <q-spinner-dots color="primary" />
                    </div>

                    <div v-else-if="horariosDisponiveis.length === 0" class="q-mt-md text-center text-grey-7">
                        <p>Nenhum horário disponível encontrado para os filtros selecionados.</p>
                    </div>

                    <div v-else class="timeline-list">
                        <div 
                            v-for="horario in horariosDisponiveis.filter(r => !r.ocupado || (r.ocupado && dayjs(r.agendamento?.dh_agendamento).format('HH:mm') == r.horario))" 
                            :key="horario.dh_horario" "
                            class="timeline-item"
                        >
                            <div class="timeline-hour">{{ dayjs(horario.dh_horario).format('HH:mm') }}</div>

                            <div class="timeline-rail">
                                <div 
                                    class="timeline-dot" 
                                    :class="{ 
                                        'timeline-dot--ocupado': !horario.ocupado,
                                        'timeline-dot--extra': horario.tf_extra,
                                        'timeline-dot--bloqueado': horario.tf_bloqueado
                                    }"
                                />
                            </div>

                            <g-card class="timeline-card" :class="{ 'timeline-card--ocupado': !horario.ocupado, 'timeline-card--extra': horario.tf_extra, 'timeline-card--bloqueado': horario.tf_bloqueado }" bordered>
                                <q-card-section>
                                    <div
                                        class="row items-stretch no-wrap q-col-gutter-md full-width"
                                    >
                                        <div class="col q-gutter-sm">
                                            <div
                                                v-if="horario.ocupado"
                                                class="row"
                                            >
                                                <div class="text-primary"><q-icon name="sym_o_person" size="19px" class="q-mr-xs" /> {{ horario.agendamento.nm_cliente }}</div>
                                            </div>

                                            <q-badge v-if="horario.ocupado && horario.agendamento.tem_outro_agendamento_semana" color="yellow-8" text-color="white">
                                                <div class="column text-caption">
                                                    <div class="row items-center q-gutter-x-xs">
                                                        <g-icon name="TriangleAlert" size="14px" class="q-mr-xs" />
                                                        Este cliente tem outro(s) agendamento nesta semana
                                                    </div>

                                                    <ul>
                                                        <li v-for="outroAgendamento in horario.agendamento.outros_agendamentos_semana" :key="outroAgendamento.id" class="text-xs text-white">
                                                            {{ dayjs(outroAgendamento.dh_agendamento).format("DD/MM/YYYY [às] HH:mm") }}
                                                        </li>
                                                    </ul>
                                                </div>
                                            </q-badge>

                                            <div 
                                                v-if="horario.ocupado"
                                                class="q-gutter-y-sm"
                                            >
                                                <div class="row q-gutter-x-xl">
                                                    <div>
                                                        <div class="text-caption text-grey-7 row items-center no-wrap">
                                                            <g-icon name="Clock" size="14px" class="q-mr-xs" />
                                                            Início
                                                        </div>
                                                        <div class="text-subtitle2">{{ horario.horario }}</div>
                                                    </div>

                                                    <div>
                                                        <div class="text-caption text-grey-7 row items-center no-wrap">
                                                            <g-icon name="Clock" size="14px" class="q-mr-xs" />
                                                            Fim
                                                        </div>
                                                        <div class="text-subtitle2">{{ horario.agendamento.hr_fim }}</div>
                                                    </div>

                                                    <div 
                                                        v-if="horario.agendamento.ds_telefone"
                                                    >
                                                        <div class="text-caption text-grey-7 row items-center no-wrap">
                                                            <g-icon name="Phone" size="14px" class="q-mr-xs" />
                                                            Telefone
                                                        </div>
                                                        <div class="text-subtitle2">{{ horario.agendamento.ds_telefone }}</div>
                                                    </div>
                                                </div>

                                                <div
                                                    v-if="dayjs(horario.agendamento.dh_agendamento).format('HH:mm') == horario.horario"
                                                    class="column"
                                                >
                                                    <div class="text-caption text-grey-7 row items-center no-wrap">
                                                        <g-icon name="BriefcaseBusiness" size="14px" class="q-mr-xs" />
                                                        Serviços
                                                    </div>

                                                    <ul class="q-ml-md">
                                                        <li
                                                            v-for="servico in horario.agendamento.servicos"
                                                            :key="servico.id"
                                                            class="text-caption text-grey-7 text-bold"
                                                        >
                                                            {{ servico.nm_servico }} - {{ servico.vl_duracao }} min
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div v-else-if="dayjs(horario.dh_horario).isAfter(dayjs())">
                                                <div class="column text-teal-4">
                                                    <g-icon name="ClockCheck" size="2rem"/>
                                                    <div>Horário disponível para agendamento.</div>
                                                </div>
                                            </div>

                                            <div v-else>
                                                <div class="column">
                                                    <g-icon name="ClockAlert" size="2rem"/>
                                                    <div>Nenhum agendamento neste horário.</div>
                                                </div>
                                            </div>

                                            <div class="row" v-if="horario.ocupado">
                                                <q-badge 
                                                    :color="horario.agendamento.tf_confirmado ? 'green-13' : 'red-11'"
                                                    class="text-weight-bold q-mr-md">
                                                    {{ horario.agendamento.tf_confirmado ? 'CONFIRMADO' : 'SEM CONFIRMAÇÃO' }}
                                                    
                                                </q-badge>
                                            </div>
                                        </div>
                                        
                                        <div 
                                            class="botoes-btn-slot column items-center q-gutter-y-xs"
                                        >
                                            <g-btn
                                                v-if="!horario.ocupado && dayjs(horario.dh_horario).isAfter(dayjs())"
                                                class="botoes-btn col full-width"
                                                color="primary"
                                                label="Agendar"
                                                no-caps
                                                unelevated
                                                dense
                                                icon="CalendarPlus"
                                                @click="abrirModalAgendamento(horario)"
                                            />

                                            <g-btn
                                                v-if="horario.ocupado && !horario.agendamento.tf_confirmado"
                                                class="col full-width"
                                                color="teal-4"
                                                label="Confirmar"
                                                no-caps
                                                unelevated
                                                dense
                                                icon="Check"
                                                @click="confirmarDesconfirmarAgendamento(horario.agendamento.id, true)"
                                            />

                                            <g-btn
                                                v-if="horario.ocupado"
                                                class="botoes-btn col full-width"
                                                color="info"
                                                label="Editar"
                                                no-caps
                                                unelevated
                                                dense
                                                icon="Edit"
                                                @click="abrirModalAgendamentoCliente(horario)"
                                            />

                                            <g-btn
                                                v-if="horario.ocupado && horario.agendamento.tf_confirmado"
                                                class="botoes-btn col full-width"
                                                color="red-11"
                                                label="Desconfirmar"
                                                no-caps
                                                unelevated
                                                dense
                                                icon="CalendarX"
                                                @click="confirmarDesconfirmarAgendamento(horario.agendamento.id, false)"
                                            />

                                            <g-btn
                                                v-if="horario.ocupado"
                                                class="botoes-btn col full-width"
                                                color="red-7"
                                                label="Cancelar"
                                                no-caps
                                                unelevated
                                                dense
                                                icon="X"
                                                @click="cancelarAgendamento(horario.agendamento.id)"
                                            />
                                        </div>
                                    </div>
                                </q-card-section>
                            </g-card>
                        </div>
                    </div>
                </q-card-section>
            </g-card>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, toRaw  } from "vue";
import dayjs from "dayjs";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

import SelectUsuario from "components/Selects/SelectUsuario.vue";
import ModalAgendamento from "components/Agendas/ModalAgendamento.vue";
import ModalHorarioTrabalho from "components/Agendas/ModalHorarioTrabalho.vue";
import ModalAgendamentoCliente from "components/AgendamentoCliente/ModalAgendamentoCliente.vue";

const $q = useQuasar();

const selectUsuario = ref();

const dataSelecionada = ref(dayjs().format("YYYY/MM/DD"));

const mesAnoSelecionado = ref(dayjs().format("YYYY-MM"));

const datasDisponiveis = ref([]);
const horariosDisponiveis = ref([]);

const feriadosNacionais = ref([]);

const usuarioSelecionado = ref(1);

const loading = ref(false);

const onDataSelecionadaChange = (novaData) => {
    if (novaData) {
        getHorariosDisponiveis();
    }
};

const getDiasDisponiveis = () => {
    return api.get("/usuarioAgendaHorarios/diasComHorariosMes", {
        params: {
            id_usuario: usuarioSelecionado.value,
            data: `${mesAnoSelecionado.value}-01`,
        },
    }).then(res => {
        datasDisponiveis.value = res.data.map(dia => dayjs(dia, "YYYY-MM-DD").format("YYYY/MM/DD"));
    });
}

const getHorariosDisponiveis = () => {
    api.get("/usuarioAgendaHorarios/horariosDia", {
        params: {
            id_usuario: usuarioSelecionado.value,
            data: dayjs(dataSelecionada.value).format("YYYY-MM-DD"),
        },
    }).then(res => {
        horariosDisponiveis.value = res.data || [];
    });
};

const abrirModalHorarioTrabalho = () => {
    $q.dialog({
        component: ModalHorarioTrabalho,
        componentProps: {
            idUsuario: usuarioSelecionado.value,
        },
    }).onOk(() => getDiasDisponiveis());
};

const onNavegacaoCalendario = (navegacao) => {
    mesAnoSelecionado.value = `${navegacao.year}-${String(navegacao.month).padStart(2, "0")}`;

    getDiasDisponiveis();
};

const abrirModalAgendamento = (horario) => {
    $q.dialog({
        component: ModalAgendamento,
        componentProps: {
            horario,
            usuario: selectUsuario.value.$refs.select.getSelectedOption(),
        },
    }).onOk(() => getHorariosDisponiveis());
};

const abrirModalAgendamentoCliente = (horario) => {
    let dadosAgendamento = null;

    if (horario) {
        dadosAgendamento = structuredClone(toRaw(horario.agendamento));

        dadosAgendamento.servicos = (dadosAgendamento.servicos || []).map((servico) => {
            return {
                ...servico,
                id: servico.id ?? servico.id_servico,
                id_servico: servico.id_servico ?? servico.id
            };
        });

        dadosAgendamento.minutos_disponiveis = horario.minutos_disponiveis;
    }

    $q.dialog({
        component: ModalAgendamentoCliente,
        componentProps: {
            agendamento: dadosAgendamento,
        },
    }).onOk(() => getHorariosDisponiveis());
};

const confirmarDesconfirmarAgendamento = (id_agendamento, tf_confirmado) => {
    $q.dialog({
        title: `${tf_confirmado ? "Confirmar" : "Desconfirmar"} agendamento`,
        message: `Deseja realmente ${tf_confirmado ? "confirmar" : "desconfirmar"} este agendamento?`,
        cancel: true,
        persistent: true,
    }).onOk(() => {
        $q.loading.show();

        api.put(`/agendamentos/${id_agendamento}`, { tf_confirmado: tf_confirmado })
            .then(() => {
                $q.notify({
                    type: "positive",
                    message: `${tf_confirmado ? "Agendamento confirmado" : "Agendamento desconfirmado"} com sucesso!`,
                });

                getHorariosDisponiveis();
            })
            .finally(() => $q.loading.hide());
    });
}

const cancelarAgendamento = (id_agendamento) => {
    $q.dialog({
        title: "Cancelar agendamento",
        message: "Deseja realmente cancelar este agendamento?",
        cancel: true,
        persistent: true,
    }).onOk(() => {
        $q.loading.show();

        api.delete(`/agendamentos/${id_agendamento}`)
            .then(() => {
                $q.notify({
                    type: "positive",
                    message: "Agendamento cancelado com sucesso!",
                });

                getHorariosDisponiveis();
            })
            .finally(() => $q.loading.hide());
    });
}

onMounted(() => getDiasDisponiveis().then(() => getHorariosDisponiveis()));
</script>

<style scoped>
.timeline-list {
    position: relative;
}

.timeline-item {
    display: grid;
    grid-template-columns: 72px 34px minmax(0, 1fr);
    align-items: center;
    column-gap: 16px;
    position: relative;
    padding-bottom: 18px;
}

.timeline-hour {
    font-size: 20px;
    line-height: 1;
    font-weight: 600;
    color: #334155;
    border-radius: 8px;
    padding: 10px 8px;
    text-align: center;
}

.timeline-rail {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: stretch;
    min-height: 100%;
}

.timeline-rail::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: -18px;
    width: 4px;
    background: #bfdbfe;
    border-radius: 999px;
}

.timeline-item:last-child .timeline-rail::before {
    bottom: 0;
}

.timeline-dot {
    position: relative;
    z-index: 1;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3b82f6;
    border: 4px solid #93c5fd;
    box-shadow: 0 0 0 4px #dbeafe;
}

.timeline-dot--ocupado {
    background: #33a895;
    border-color: #3accb4;
    box-shadow: 0 0 0 4px #d1fae5;
}

.timeline-dot--extra {
    background: #FB8C00;
    border-color: #fdc167;
    box-shadow: 0 0 0 4px #FFE0B2;
}

.timeline-dot--bloqueado {
    background: #E5484D;
    border-color: #f58e91;
    box-shadow: 0 0 0 4px #fdc6c8;
}

.timeline-card {
    border-left: 6px solid var(--q-primary);
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
}

.timeline-card--ocupado {
    border-left-color: #33a895;
}

.timeline-card--extra {
    border-left-color: #FB8C00;
}

.timeline-card--bloqueado {
    border-left-color: #E5484D;
}

.botoes-btn {
    min-width: 128px;
    min-height: 34px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid rgba(16, 24, 40, 0.06);
    font-weight: 700;
}

.botoes-btn-slot {
    display: flex;
    align-items: center;
}

:deep(.q-date__event.bg-red) {
    position: absolute;
    bottom: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: none;
    z-index: -1;
}

@media (max-width: 768px) {
    .timeline-item {
        grid-template-columns: 1fr;
        row-gap: 10px;
    }

    .timeline-hour {
        width: fit-content;
    }

    .timeline-rail {
        display: none;
    }
}
</style>