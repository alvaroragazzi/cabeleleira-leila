<template>
    <div class="agendamento-cliente-page q-pa-md q-pa-lg-xl">
        <q-card flat bordered class="agenda-hero q-mb-lg">
            <q-card-section class="row items-center justify-between q-col-gutter-md">
                <div class="col-12 col-md-8">
                    <div class="text-overline text-primary text-weight-medium">Agenda do cliente</div>
                    <div class="text-h5 text-weight-bold q-mt-xs">Seus agendamentos</div>
                    <div class="text-body2 text-grey-7 q-mt-sm agenda-hero__subtitle">
                        Consulte aqui os próximos compromissos, serviços vinculados e horários já marcados.
                    </div>
                </div>

                <div class="col-12 col-md-auto">
                    <g-btn
                        dense
                        size="sm"
                        color="primary"
                        text-color="white"
                        label="Novo agendamento"
                        icon="ClockPlus"
                        @click="abrirModalAgendamento()"
                    />
                </div>
            </q-card-section>
        </q-card>

        <div v-if="loading" class="row justify-center q-py-xl">
            <q-spinner-dots color="primary" size="42px" />
        </div>

        <div v-else-if="agendamentos.length === 0" class="empty-state q-pa-xl text-center">
            <q-icon name="event_busy" size="56px" color="grey-5" />
            <div class="text-h6 q-mt-md">Nenhum agendamento encontrado</div>
            <div class="text-body2 text-grey-7 q-mt-sm">
                Quando houver novos agendamentos, eles aparecerão aqui com os serviços e horários detalhados.
            </div>
        </div>

        <div v-else class="row q-col-gutter-md">
            <div
                v-for="agendamento in agendamentos"
                :key="agendamento.id"
                class="col-12 col-md-6 col-xl-4"
            >
                <q-card class="agenda-card full-height" bordered flat>
                    <q-card-section class="row items-start no-wrap q-col-gutter-md">
                        <div class="col-auto">
                            <q-avatar size="56px" class="agenda-avatar">
                                <img
                                    :src="agendamento.usuario.imagem"
                                    :alt="agendamento.usuario.nm_usuario"
                                />
                            </q-avatar>
                        </div>

                        <div class="col">
                            <div class="row items-center q-gutter-sm">
                                <div class="text-subtitle1 text-weight-bold ellipsis">
                                    {{ agendamento.usuario.nm_usuario }}
                                </div>
                                <q-badge
                                    :color="agendamento.tf_confirmado ? 'positive' : 'warning'"
                                    outline
                                    rounded
                                    class="text-weight-medium"
                                >
                                    {{ agendamento.tf_confirmado ? 'Confirmado' : 'Pendente' }}
                                </q-badge>
                            </div>

                            <div class="text-caption text-grey-7 q-mt-xs row items-center no-wrap">
                                <g-icon name="Clock" size="14px" class="q-mr-xs" />
                                {{ dayjs.utc(agendamento.dh_agendamento).format("DD [de] MMMM [de] YYYY, HH:mm") }}
                            </div>
                        </div>

                        <div class="col-auto agenda-date text-center q-mt-sm">
                            <div class="text-caption text-grey-6 text-uppercase">{{ dayjs(agendamento.dh_agendamento).format("MMMM") }}</div>
                            <div class="text-h5 text-weight-bold line-height-xs">{{ dayjs(agendamento.dh_agendamento).format("DD") }}</div>
                            <div class="text-caption text-grey-6">{{ dayjs(agendamento.dh_agendamento).format("YYYY") }}</div>
                        </div>

                    </q-card-section>

                    <!-- só pode cancelar o agendamento se for no máximo 2 dias antes da data do agendamento -->
                    <div
                        v-if="dayjs(agendamento.dh_agendamento).diff(dayjs(), 'days') >= 2" 
                        class="row items-center q-col-gutter-sm q-pa-md"
                    >
                        <div class="col-lg-6 col-12">
                            <g-btn
                                icon="X" 
                                size="sm" 
                                label="Cancelar agendamento" 
                                dense 
                                color="red-6"
                                class="full-width"
                                @click="cancelarAgendamento(agendamento.id_agendamento)"
                            />
                        </div>

                        <div class="col-lg-6 col-12">
                            <g-btn
                                icon="Edit" 
                                size="sm" 
                                label="Alterar agendamento" 
                                dense 
                                color="primary" 
                                class="full-width"
                                @click="abrirModalAgendamento(agendamento)"
                            />
                        </div>
                    </div>

                    <q-separator />

                    <q-card-section>
                        <div class="text-caption text-grey-7 row items-center no-wrap q-mb-sm">
                            <g-icon name="BriefcaseBusiness" size="14px" class="q-mr-xs" />
                            Serviços
                        </div>

                        <div class="row q-col-gutter-sm">
                            <div
                                v-for="servico in agendamento.agendamentoServicos"
                                :key="servico.id"
                                class="col-12"
                            >
                                <q-chip
                                    dense
                                    square
                                    color="grey-2"
                                    text-color="grey-9"
                                    class="full-width justify-between agenda-service-chip"
                                >
                                    <div class="column">
                                        <span class="ellipsis">{{ servico.nm_servico }}</span>

                                        <div class="items-center row">
                                            <g-icon name="Clock" size="12px" class="q-mr-xs" />
                                            <span class="text-weight-medium">{{ servico.servico.vl_duracao }} min</span>
                                        </div>
                                    </div>
                                </q-chip>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { api } from "boot/axios"
import { onMounted, ref } from "vue"
import { useQuasar } from "quasar"

import ModalAgendamentoCliente from "components/AgendamentoCliente/ModalAgendamentoCliente.vue"

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");
dayjs.extend(utc);

const $q = useQuasar();

const agendamentos = ref([]);
const loading = ref(false);

const getAgendamentos = async () => {
    loading.value = true;

    try {
        const res = await api.get("/agendamentos/agendamentosCliente");
        agendamentos.value = res.data;
    } finally {
        loading.value = false;
    }
}

const abrirModalAgendamento = (agendamento) => {
    let dadosAgendamento = {};

    if (agendamento) {
        dadosAgendamento = {
            ...agendamento,
            servicos: agendamento.agendamentoServicos.map(ag => ag.servico),
            minutos_disponiveis: agendamento.minutos_disponiveis.minutos_disponiveis,
        };
    }

    $q.dialog({
        component: ModalAgendamentoCliente,
        componentProps: {
            agendamento: agendamento ? dadosAgendamento : null,
        },
    }).onOk(() => getAgendamentos());
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

onMounted(() => getAgendamentos());
</script>

<style scoped>
.agendamento-cliente-page {
    max-width: 1240px;
    margin: 0 auto;
}

.agenda-hero {
    border-radius: 24px;
    background: linear-gradient(135deg, rgba(25, 118, 210, 0.12), rgba(0, 0, 0, 0.02));
    overflow: hidden;
}

.agenda-hero__subtitle {
    max-width: 720px;
}

.agenda-card {
    border-radius: 20px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
}

.agenda-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.1);
}

.agenda-avatar {
    border: 2px solid rgba(25, 118, 210, 0.15);
}

.agenda-date {
    min-width: 72px;
    padding: 8px 10px;
    border-radius: 16px;
    background: rgba(25, 118, 210, 0.06);
}

.agenda-service-chip {
    height: auto;
    padding-top: 8px;
    padding-bottom: 8px;
}

.empty-state {
    border: 1px dashed rgba(0, 0, 0, 0.16);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.7);
}

@media (max-width: 599px) {
    .agendamento-cliente-page {
        padding-left: 12px;
        padding-right: 12px;
    }

    .agenda-hero {
        border-radius: 18px;
    }

    .agenda-card {
        border-radius: 18px;
    }
}
</style>