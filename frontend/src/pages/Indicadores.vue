<template>
    <div class="indicadores-page">
        <div class="row items-start justify-between q-col-gutter-lg q-mb-lg">
            <div class="col-12 col-md">
                <div class="text-overline text-primary text-weight-medium">Painel gerencial</div>
                <div class="text-h4 text-weight-bold q-mt-xs">Indicadores do salão</div>
                <div class="text-body2 text-grey-7 q-mt-sm indicadores-page__subtitle">
                    Acompanhe o desempenho semanal do salão com uma leitura rápida de faturamento, volume de agendamentos,
                    taxa de confirmação e serviços mais procurados.
                </div>
            </div>
        </div>

        <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-md-4">
                <g-card flat bordered class="full-height">
                    <q-card-section class="summary-card__content">
                        <div class="summary-card__badge" />
                        <div class="text-subtitle2 text-weight-bold text-grey-7">Faturamento semanal</div>
                        <div class="text-h4 text-weight-bold q-mt-sm">{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.faturamento_semana_atual) }}</div>

                        <div 
                            class="row items-center q-mt-md text-weight-medium" 
                            :class="{
                                'text-positive': temLucro,
                                'text-negative': !temLucro,
                            }"
                        >
                            <g-icon 
                                :name="temLucro ? 'TrendingUp' : 'TrendingDown'" 
                                size="18px" class="q-mr-xs"
                            />
                            {{ porcentagemCrescimento }}
                        </div>
                    </q-card-section>
                </g-card>
            </div>

            <div class="col-12 col-md-4">
                <g-card flat bordered class="full-height">
                    <q-card-section class="summary-card__content">
                        <div class="summary-card__badge" />
                        <div class="text-subtitle2 text-weight-bold text-grey-7">Agendamentos</div>
                        <div class="text-h4 text-weight-bold q-mt-sm">{{ dados.quantidade_agendamentos_semana_atual }}</div>

                        <div 
                            class="row items-center q-mt-md text-weight-medium"
                            :class="{
                                'text-positive': desempenhoAgendamentos > 0,
                                'text-negative': desempenhoAgendamentos < 0,
                            }"
                        >
                            <g-icon name="Calendar" size="18px" class="q-mr-xs" />
                            {{ comparacaoAgendamentosSemanaPassada }}
                        </div>
                    </q-card-section>
                </g-card>
            </div>

            <div class="col-12 col-md-4">
                <g-card flat bordered class="full-height">
                    <q-card-section class="summary-card__content">
                        <div class="summary-card__badge" />
                        <div class="text-subtitle2 text-weight-bold text-grey-7">Taxa de confirmação</div>
                        <div class="text-h4 text-weight-bold q-mt-sm">{{ dados.taxa_confirmacao }}%</div>

                        <div 
                            class="row items-center q-mt-md text-weight-medium"
                            :class="{
                                'text-positive': dados.taxa_confirmacao > 70,
                                'text-warning': dados.taxa_confirmacao > 50 && dados.taxa_confirmacao <= 70,
                                'text-negative': dados.taxa_confirmacao < 50,
                            }"
                        >
                            <g-icon :name="dados.taxa_confirmacao > 70 ? 'BadgeCheck' : dados.taxa_confirmacao < 50 ? 'BadgeAlert' : 'BadgeMinus'" size="18px" class="q-mr-xs" />
                            {{ taxaConfirmacaoLabel }}
                        </div>
                    </q-card-section>
                </g-card>
            </div>
        </div>

        <div class="row q-col-gutter-md">
            <div class="col-12 col-lg-7">
                <g-card flat bordered class="full-height">
                    <q-card-section>
                        <div class="row items-start justify-between q-col-gutter-sm q-mb-sm">
                            <div class="col">
                                <div class="text-h6 text-weight-bold">Desempenho por dia</div>
                                <div class="text-body2 text-grey-7 q-mt-xs">
                                    Quantidade de atendimentos realizados e previstos na semana.
                                </div>
                            </div>

                            <q-badge rounded color="primary" class="text-weight-medium q-px-md q-py-sm">
                                Semana atual
                            </q-badge>
                        </div>

                        <div class="q-mt-lg q-gutter-md">
                            <div
                                v-for="item in dados.agendamentos_por_dia_semana"
                                :key="item.dia_semana"
                            >
                                <div class="performance-row__label">
                                    {{ item.dia_semana }}
                                </div>

                                <div class="performance-row__bar-wrap">
                                    <q-linear-progress
                                        :value="item.total_agendamentos / maxDesempenho"
                                        rounded
                                        size="18px"
                                        track-color="grey-3"
                                        :style="{ '--bar-width': `${(item.total_agendamentos / maxDesempenho) * 100}%` }"
                                    />
                                </div>

                                <div class="performance-row__value">
                                    {{ item.total_agendamentos }}
                                </div>
                            </div>
                        </div>
                    </q-card-section>
                </g-card>
            </div>

            <div class="col-12 col-lg-5">
                <g-card flat bordered class="full-height">
                    <q-card-section>
                        <div class="row items-start justify-between q-col-gutter-sm q-mb-sm">
                            <div class="col">
                                <div class="text-h6 text-weight-bold">Serviços mais solicitados</div>
                                <div class="text-body2 text-grey-7 q-mt-xs">
                                    Serviços com maior número de solicitações para a semana, indicando as preferências dos clientes.
                                </div>
                            </div>

                            <q-badge rounded color="secondary" outline class="text-weight-medium q-px-md q-py-sm">
                                Top serviços
                            </q-badge>
                        </div>

                        <div class="q-gutter-md q-mt-md">
                            <q-card
                                v-for="servico in dados.servicos_mais_solicitados"
                                :key="servico.id_servico"
                                flat
                                bordered
                                class="service-item"
                            >
                                <q-card-section class="row items-center no-wrap q-gutter-md q-pa-md">
                                    <!--
                                    <q-avatar size="52px" class="service-item__avatar">
                                        <q-icon :name="servico.icon" size="24px" color="primary" />
                                    </q-avatar>
                                    -->

                                    <div class="col">
                                        <div class="text-subtitle1 text-weight-bold">{{ servico.nm_servico }}</div>
                                        <div class="text-caption text-grey-7 q-mt-xs">
                                            {{ servico.total_solicitado }} solicitações na semana
                                        </div>
                                    </div>

                                    <div class="text-right">
                                        <div class="text-subtitle1 text-weight-bold text-primary">{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servico.faturamento) }}</div>
                                        <div class="text-caption text-grey-7">faturamento estimado</div>
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </q-card-section>
                </g-card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { api } from "boot/axios";

const dados = ref({});

const getIndicadores = () => {
    api.get("/indicadores").then(res => {
        dados.value = res.data;
    });
}

const temLucro = computed(() => dados.value.faturamento_semana_atual >= dados.value.faturamento_semana_passada);

const porcentagemCrescimento = computed(() => {
    if (dados.value.faturamento_semana_passada == 0) {
        return "N/A";
    }

    const crescimento = ((dados.value.faturamento_semana_atual - dados.value.faturamento_semana_passada) / dados.value.faturamento_semana_passada) * 100;
    
    return `${crescimento.toFixed(2)}% vs. semana passada`;
});

const desempenhoAgendamentos = computed(() => dados.value.quantidade_agendamentos_semana_atual - dados.value.quantidade_agendamentos_semana_passada);

const comparacaoAgendamentosSemanaPassada = computed(() => {
    if (dados.value.quantidade_agendamentos_semana_passada == 0) {
        return "N/A";
    }

    const qtd = desempenhoAgendamentos.value;

    return `${qtd > 0 ? '+' : ''}${qtd} vs. semana passada`;
});

const taxaConfirmacaoLabel = computed(() => {
    const taxa = dados.value.taxa_confirmacao;

    if (taxa > 70) {
        return "Excelente";
    } else if (taxa > 50) {
        return "Boa";
    }
   
    return "Ruim";
});

const resumoCards = [
    {
        label: "Agendamentos",
        value: "32",
        detail: "+7 novos clientes",
        icon: "calendar_month",
        variantTextClass: "text-positive",
    },
    {
        label: "Taxa de confirmação",
        value: "91%",
        detail: "Boa ocupação da agenda",
        icon: "verified",
        variantTextClass: "text-positive",
    },
]

const maxDesempenho = computed(() => Math.max(...dados.value.agendamentos_por_dia_semana?.map(item => item.total_agendamentos)));

onMounted(() => getIndicadores());
</script>