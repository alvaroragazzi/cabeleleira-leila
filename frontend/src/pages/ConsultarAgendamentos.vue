<template>
    <div style="margin: 0 auto">
        <div>
            <q-card flat bordered class="q-mb-md">
                <q-card-section>
                    <div class="row items-center justify-between q-col-gutter-md q-mb-md">
                        <div class="col-12">
                            <div class="text-h6">
                                <q-icon name="filter_list" size="22px" class="q-mr-xs" />
                                Filtros de Agendamento
                            </div>
                        </div>
                    </div>

                    <div class="row no-wrap items-start" style="width: 100%;">
                        <div class="column">
                            <q-date
                                v-model="filtros.dt_referencia"
                                @update:model-value="alterouData"
                                @navigation="onNavegacaoCalendario"
                                landscape 
                                today-btn
                                event-color="red"
                                :events="feriadosNacionais"
                                :options="dataDisponiveis"
                            />

                            <q-card-section class="row q-px-sm">
                                <q-badge rounded color="red" class="q-mr-xs" />
                                <div>Feriados nacionais</div>
                            </q-card-section>
                        </div>

                        <q-separator vertical class="q-mx-md" />

                        <div class="col column q-gutter-md q-ml-sm">
                            <SelectPrestador
                                dense
                                label="Prestador"
                                v-model="filtros.id_prestador"
                                clearable
                                map-options
                                emit-value
                                outlined
                                class="full-width"
                                @update:model-value="onPrestadorMudou"
                            />

                            <q-card flat bordered class="full-width " style="height: 237px;">
                                <q-card-section>
                                    <div class="text-subtitle1 text-weight-medium">
                                        <q-icon name="sym_o_contract_edit" size="20px" class="q-mr-xs" />
                                        Observações do parametro
                                    </div>

                                    <q-separator class="q-my-sm" />

                                    <div class="q-mt-md">
                                        {{ horariosDisponiveis.length > 0 ? horariosDisponiveis[0].ds_preparo: " Não existe observação " }}
                                        
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                </q-card-section>
            </q-card>

            <q-card 
                flat 
                bordered
            >
                <q-card-section>
                    <div class="row text-h6 q-mb-md">
                        <div class="col">
                            <q-icon name="schedule" size="22px" class="q-mr-xs" />
                            Horários
                        </div>

                        <div class="justify-end q-gutter-sm row q-ml-auto" v-if="horariosDisponiveis.length > 0">
                            <q-btn
                                color="orange-6"
                                label="Agendamento Extra"
                                class="botoes-btn"
                                no-caps
                                unelevated
                                dense
                                icon="sym_o_add_task"
                                @click="incluirAgendamento(null, true)"
                            />

                            <q-btn
                                color="teal-4"
                                label="Buscar Proximo dia com Horário Livre"
                                class="botoes-btn"
                                no-caps
                                unelevated
                                dense
                                icon="sym_o_search"
                                @click="incluirAgendamento(null, true)"
                            />

                            <q-btn
                                color="red-13"
                                label="Bloquear o Dia Todo"
                                class="botoes-btn"
                                no-caps
                                unelevated
                                dense
                                icon="sym_o_lock"
                                @click="incluirAgendamento(null, true)"
                            />
                        </div>
                    </div>

                    <div v-if="loading" class="q-mt-md text-center">
                        <q-spinner-dots color="primary" />
                    </div>

                    <div v-else-if="horariosDisponiveis.length === 0" class="q-mt-md text-center text-grey-7">
                        <p>Nenhum horário disponível encontrado para os filtros selecionados.</p>
                    </div>

                    <div v-else class="timeline-list">
                        <div v-for="horario in horariosDisponiveis" :key="`${horario.id_parametro_agenda}-${horario.hrInicio}`" class="timeline-item">
                            <div class="timeline-hour">{{ horario.hrInicio }}</div>

                            <div class="timeline-rail">
                                <div class="timeline-dot" :class="{ 'timeline-dot--ocupado': horario.nm_paciente != null, 'timeline-dot--extra': horario.tf_extra, 'timeline-dot--bloqueado': horario.tf_bloqueado }"></div>
                            </div>

                            <q-card class="timeline-card" :class="{ 'timeline-card--ocupado': horario.nm_paciente != null, 'timeline-card--extra': horario.tf_extra, 'timeline-card--bloqueado': horario.tf_bloqueado }" bordered>
                                <q-card-section>
                                    <div class="row items-stretch no-wrap q-col-gutter-md full-width">
                                        <div class="col q-gutter-sm">
                                            <div class="row" v-if="horario.nm_paciente != null">
                                                <div class="text-primary"><q-icon name="sym_o_person" size="19px" class="q-mr-xs" /> {{ horario.nm_paciente }}</div>
                                            </div>
                                            <div class="row">
                                                <div>
                                                    <div class="text-caption text-grey-7 row items-center no-wrap">
                                                        <q-icon name="sym_o_schedule" size="14px" class="q-mr-xs" />
                                                        Início
                                                    </div>
                                                    <div class="text-subtitle2">{{ horario.hrInicio }}</div>
                                                </div>
                                                <div class="q-ml-md">
                                                    <div class="text-caption text-grey-7 row items-center no-wrap">
                                                        <q-icon name="sym_o_timer" size="14px" class="q-mr-xs" />
                                                        Fim
                                                    </div>
                                                    <div class="text-subtitle2">{{ horario.hrFim }}</div>
                                                </div>

                                                <div class="q-ml-xl" v-if="horario.fone_contato">
                                                    <div class="text-caption text-grey-7 row items-center no-wrap">
                                                        <q-icon name="sym_o_call" size="14px" class="q-mr-xs" />
                                                        Telefone
                                                    </div>
                                                    <div class="text-subtitle2">{{ horario.fone_contato }}</div>
                                                </div>

                                                <div class="q-ml-xl" v-if="horario.observacoes">
                                                    <div class="text-caption text-grey-7 row items-center no-wrap">
                                                        <q-icon name="sym_o_info" size="14px" class="q-mr-xs" />
                                                        Observação
                                                    </div>
                                                    <div class="text-subtitle2">{{ horario.observacoes }}</div>
                                                </div>
                                            </div>

                                            <div class="row" v-if="horario.nm_paciente != null">
                                                <q-badge 
                                                    :color="horario.tf_confirmado ? 'green-13' : 'red-11'"
                                                    class="text-weight-bold q-mr-md">
                                                    {{ horario.tf_confirmado ? 'CONFIRMADO' : 'SEM CONFIRMAÇÃO' }}
                                                    
                                                </q-badge>

                                                <q-badge 
                                                    color="brown-6"
                                                    class="text-weight-bold q-mr-md">
                                                    {{ horario.id_convenio ? horario.convenio.nm_convenio : 'CONVÊNIO NÃO INFORMADO' }}
                                                </q-badge>

                                                <q-badge 
                                                    color="cyan-5"
                                                    class="text-weight-bold q-mr-md">
                                                    {{ horario.id_tipo_consulta ? horario.tipoConsulta.nm_tipo_consulta : 'TIPO DE CONSULTA NÃO INFORMADO' }}
                                                </q-badge>

                                                <q-badge 
                                                    v-if="horario.tf_extra"
                                                    color="orange-6"
                                                    class="text-weight-bold">
                                                    {{ horario.tf_extra ? 'AGENDAMENTO EXTRA' : '' }}
                                                </q-badge>
                                            </div>

                                            <div class="row" v-if="horario.tf_bloqueado">
                                                <q-badge 
                                                    color="red-13"
                                                    class="text-weight-bold">
                                                    {{ horario.tf_bloqueado ? 'HORÁRIO BLOQUEADO' : '' }}
                                                </q-badge>
                                            </div>
                                        </div>
                                        
                                        <div class="botoes-btn-slot q-ml-auto">
                                            <q-btn
                                                v-if="horario.nm_paciente == null && horario.tf_bloqueado == false"
                                                class="botoes-btn q-mr-md"
                                                color="primary"
                                                label="Agendar"
                                                no-caps
                                                unelevated
                                                dense
                                                icon="sym_o_table_edit"
                                                @click="incluirAgendamento(horario, false)"
                                            />
                                            <q-btn
                                                v-if="horario.nm_paciente == null && horario.tf_bloqueado == false"
                                                class="botoes-btn q-mr-md"
                                                color="red-13"
                                                label="Bloquear"
                                                no-caps
                                                unelevated
                                                dense
                                                icon="sym_o_lock"
                                                @click="IncluirExcluirBloqueio(horario, true)"
                                            />
                                            <q-btn
                                                v-if="horario.tf_bloqueado == true"
                                                class="botoes-btn q-mr-md"
                                                color="green-5"
                                                label="Desbloquear"
                                                no-caps
                                                unelevated
                                                dense
                                                icon="sym_o_lock_open_right"
                                                @click="IncluirExcluirBloqueio(horario, false)"
                                            />
                                            <q-btn
                                                v-if="horario.nm_paciente != null && !horario.tf_confirmado"
                                                class="botoes-btn q-mr-md"
                                                color="green-13"
                                                label="Confirmar"
                                                no-caps
                                                unelevated
                                                dense
                                                icon="sym_o_check"
                                                @click="confirmarDesconfirmarAgendamento(horario, true)"
                                            />
                                            <q-btn
                                                v-if="horario.nm_paciente != null && !horario.tf_confirmado"
                                                class="botoes-btn q-mr-md"
                                                color="purple-4"
                                                label="Transferir"
                                                no-caps
                                                unelevated
                                                dense
                                                icon="sym_o_convert_to_text"
                                                @click="transferirAgendamento(horario)"
                                            />
                                            <q-btn
                                                v-if="horario.tf_confirmado"
                                                class="botoes-btn q-mr-md"
                                                color="blue-grey-4"
                                                label="Gerar Atendimento"
                                                no-caps
                                                unelevated
                                                dense
                                                icon="sym_o_medical_services"
                                                @click="incluirAgendamento(horario)"
                                            />
                                            <q-btn
                                                v-if="horario.tf_confirmado"
                                                class="botoes-btn q-mr-md"
                                                color="red-11"
                                                label="Desconfirmar"
                                                no-caps
                                                unelevated
                                                dense
                                                icon="sym_o_event_busy"
                                                @click="confirmarDesconfirmarAgendamento(horario, false)"
                                            />
                                            <q-btn
                                                v-if="horario.nm_paciente != null"
                                                class="botoes-btn"
                                                color="red-5"
                                                label="Cancelar"
                                                no-caps
                                                unelevated
                                                dense
                                                icon="sym_o_delete"
                                                @click="cancelarAgendamento(horario)"
                                            />
                                        </div>
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import moment from "moment";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const $q = useQuasar();
const filtros = ref({ dt_referencia: moment().format("YYYY/MM/DD") });

const dataDisponiveis = ref([]);
const horariosDisponiveis = ref([]);
const agendamentosMes = ref({});
const feriadosNacionais = ref([]);
const anoFeriadosCarregado = ref(null);
const tempo_consulta = ref(null);

const loading = ref(false);

const mesCalendario = ref({
    year: moment().year(),
    month: moment().month() + 1,
});

const onPrestadorMudou = () => {
    consultarDisponibilidade();
};

const alterouData = async () => {
    if (!filtros.value.dt_referencia) {
        return;
    }
    
    const dataSelecionada = moment(filtros.value.dt_referencia, "YYYY/MM/DD", true);

    if (!dataSelecionada.isValid()) {
        horariosDisponiveis.value = [];
        return;
    }

    const chaveData = dataSelecionada.format("YYYY-MM-DD");
    const agendamentos = Array.isArray(agendamentosMes.value) ? agendamentosMes.value : [];

    const agendamentosDoDia = agendamentos
        .filter((agendamento) => (
            moment(agendamento.dh_inicioagendamento, 'DD/MM/YYYY HH:mm:ss').format("YYYY-MM-DD") === chaveData
        ))
        .sort((a, b) => moment(a.dh_inicioagendamento, 'DD/MM/YYYY HH:mm:ss').diff(moment(b.dh_inicioagendamento, 'DD/MM/YYYY HH:mm:ss')));

    horariosDisponiveis.value = agendamentosDoDia.map((agendamento) => {
        if (agendamento.intervaloParametro){
            tempo_consulta.value = agendamento.intervaloParametro.parametroAgenda.tempo_consulta;
        }
        
        const inicio = moment(agendamento.dh_inicioagendamento, 'DD/MM/YYYY HH:mm:ss');
        const fim = moment(agendamento.dh_fimagendamento, 'DD/MM/YYYY HH:mm:ss');
        return {
            ...agendamento,
            horario: `${inicio.format("HH:mm")} - ${fim.format("HH:mm")}`,
            hrInicio: inicio.format("HH:mm"),
            hrFim: fim.format("HH:mm"),
            dt_referencia: inicio.format("YYYY/MM/DD"),
        };
    });  
};

const onNavegacaoCalendario = (navegacao) => {
    mesCalendario.value = navegacao;
    carregarFeriadosNacionais(navegacao.year);

    const dataReferencia = filtros.value.dt_referencia
        ? moment(filtros.value.dt_referencia, "YYYY/MM/DD", true)
        : null;

    const mudouMesOuAno = !dataReferencia
        || !dataReferencia.isValid()
        || dataReferencia.year() !== navegacao.year
        || dataReferencia.month() + 1 !== navegacao.month;

    if (mudouMesOuAno) {
        const mes = String(navegacao.month).padStart(2, "0");
        filtros.value.dt_referencia = `${navegacao.year}/${mes}/01`;
        consultarDisponibilidade();
    }
};

const carregarFeriadosNacionais = async (ano) => {
    if (!ano || anoFeriadosCarregado.value === ano) {
        return;
    }

    try {
        const res = await api.get(`https://brasilapi.com.br/api/feriados/v1/${ano}`);

        feriadosNacionais.value = (res.data || [])
            .map((feriado) => moment(feriado.date, "YYYY-MM-DD", true))
            .filter((data) => data.isValid())
            .map((data) => data.format("YYYY/MM/DD"));

        anoFeriadosCarregado.value = ano;
    } catch (error) {
        feriadosNacionais.value = [];
        console.error("Erro ao carregar feriados nacionais:", error);
    }
};

onMounted(() => {
    const anoInicial = moment(filtros.value.dt_referencia, "YYYY/MM/DD", true).year();
    carregarFeriadosNacionais(anoInicial);
    consultarDisponibilidade();
});

const consultarDisponibilidade = async () => {
    if (!filtros.value.id_prestador) {
        dataDisponiveis.value = [];
        horariosDisponiveis.value = [];
        agendamentosMes.value = {};
        return;
    }

    if (!filtros.value.dt_referencia) {
        const mes = String(mesCalendario.value.month).padStart(2, "0");
        filtros.value.dt_referencia = `${mesCalendario.value.year}/${mes}/01`;
    }

    loading.value = true;

    const filtrosBkp = JSON.parse(JSON.stringify(filtros.value));

    const res = await api.get("/agendamentos/getDiasDisponiveis/", { params: filtrosBkp });
    if (res.status !== 200) {
        $q.notify({
            type: "negative",
            message: "Erro ao consultar disponibilidade. Por favor, tente novamente.",
        });
        dataDisponiveis.value = [];
        agendamentosMes.value = {};
        horariosDisponiveis.value = [];
        return;
    }else if (res.data.length === 0) {
        $q.notify({
            type: "info",
            message: "Nenhum agendamento disponível para os filtros selecionados.",
        });
        dataDisponiveis.value = [];
        agendamentosMes.value = {};
        horariosDisponiveis.value = [];
    }else{
        agendamentosMes.value = res.data || [];

        const datasUnicas = [...new Set(
            agendamentosMes.value.map((agendamento) => moment(agendamento.dh_inicioagendamento, "DD/MM/YYYY HH:mm:ss").format("YYYY/MM/DD"))
        )];
        dataDisponiveis.value = datasUnicas;
        alterouData();
    }
    loading.value = false;
};

const incluirAgendamento = (horario, extra) => {
    console.log(tempo_consulta.value);
    $q.dialog({
        component: ModalCadastroAgendamento,
        componentProps: {
            cdId: horario ? horario.id_agendamento : null,
            parametros : horario,
            dtAgendamento: filtros.value.dt_referencia,
            hrAgendamento: horario ? horario.hrInicio : null,
            tempo_consulta: tempo_consulta.value,
            extra: extra || false,
            id_prestador: filtros.value.id_prestador,
        },
    }).onOk(() => consultarDisponibilidade());
};

const cancelarAgendamento = (horario) => {
    $q.dialog({
        title: "Confirmação",
        message: "Tem certeza que deseja cancelar este agendamento?",
        cancel: true,
        persistent: true,
    }).onOk(async () => {
        //se extra, deleta. Se não for extra, apenas muda o status para L (Livre)
        if (horario.tf_extra) {
             const res = await api.delete(`/agendamentos/${horario.id_agendamento}`);
            if (res.status !== 200) {
                $q.notify({
                    type: "negative",
                    message: "Erro ao cancelar agendamento extra. Por favor, tente novamente.",
                });
                return;
            }else {
                $q.notify({
                    type: "positive",
                    message: "Agendamento extra cancelado com sucesso.",
                });
                consultarDisponibilidade();
                return;
            }
        }else{
            const res = await api.put(`/agendamentos/${horario.id_agendamento}`, { tf_cancelar: true });
            if (res.status !== 200) {
                $q.notify({
                    type: "negative",
                    message: "Erro ao cancelar agendamento. Por favor, tente novamente.",
                });
                return;
            }else {
                $q.notify({
                    type: "positive",
                    message: "Agendamento cancelado com sucesso.",
                });
                horario.nm_paciente = null;
                horario.tf_confirmado = false;
                horario.tf_extra = false;
            }
        }
    });
};

const confirmarDesconfirmarAgendamento = async (horario, confirmar) => {
    const res = await api.put(`/agendamentos/${horario.id_agendamento}`, { tf_confirmado: confirmar });
    if (res.status !== 200) {
        $q.notify({
            type: "negative",
            message: `Erro ao ${confirmar ? "confirmar" : "desconfirmar"} agendamento. Por favor, tente novamente.`,
        });
        return;
    }else {
        $q.notify({
            type: "positive",
            message: `Agendamento ${confirmar ? "confirmado" : "desconfirmado"} com sucesso.`,
        });
        horario.tf_confirmado = confirmar;
    }
};

const IncluirExcluirBloqueio = async (horario, bloquear) => {
    const res = await api.put(`/agendamentos/${horario.id_agendamento}`, { tf_bloqueado: bloquear });
    if (res.status !== 200) {
        $q.notify({
            type: "negative",
            message: `Erro ao ${bloquear ? "incluir" : "excluir"} bloqueio. Por favor, tente novamente.`,
        });
        return;
    }else {
        $q.notify({
            type: "positive",
            message: `Bloqueio ${bloquear ? "incluido" : "excluido"} com sucesso.`,
        });
        horario.tf_bloqueado = bloquear;
    }
};

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