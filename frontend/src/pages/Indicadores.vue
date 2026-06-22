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

                        <div class="row items-center q-mt-md text-weight-medium" :class="1">
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

                        <div class="row items-center q-mt-md text-weight-medium" :class="1">
                            <g-icon name="TrendingUp" size="18px" class="q-mr-xs" />
                            {{ comparacaoTaxaConfirmacaoSemanaPassada }}
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
                                v-for="item in desempenhoSemana"
                                :key="item.dia"
                                class="performance-row"
                            >
                                <div class="performance-row__label">
                                    {{ item.dia }}
                                </div>

                                <div class="performance-row__bar-wrap">
                                    <q-linear-progress
                                        :value="item.value / maxDesempenho"
                                        rounded
                                        size="18px"
                                        color="transparent"
                                        track-color="grey-3"
                                        class="performance-bar"
                                        :style="{ '--bar-width': `${(item.value / maxDesempenho) * 100}%` }"
                                    />
                                </div>

                                <div class="performance-row__value">
                                    {{ item.value }}
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

const comparacaoAgendamentosSemanaPassada = computed(() => {
    if (dados.value.quantidade_agendamentos_semana_passada == 0) {
        return "N/A";
    }

    const qtd = dados.value.quantidade_agendamentos_semana_atual - dados.value.quantidade_agendamentos_semana_passada;

    return `${qtd > 0 ? '+' : ''}${qtd} vs. semana passada`;
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

const desempenhoSemana = [
    { dia: "Seg", value: 3 },
    { dia: "Ter", value: 5 },
    { dia: "Qua", value: 2 },
    { dia: "Qui", value: 6 },
    { dia: "Sex", value: 4 },
    { dia: "Sáb", value: 7 },
]

const servicosMaisSolicitados = [
    {
        nome: "Escova",
        solicitacoes: 12,
        receita: "R$ 660",
        icon: "content_cut",
    },
    {
        nome: "Corte feminino",
        solicitacoes: 9,
        receita: "R$ 585",
        icon: "face_retouching_natural",
    },
    {
        nome: "Hidratação",
        solicitacoes: 7,
        receita: "R$ 630",
        icon: "spa",
    },
    {
        nome: "Coloração",
        solicitacoes: 5,
        receita: "R$ 900",
        icon: "palette",
    },
]

const maxDesempenho = computed(() => Math.max(...desempenhoSemana.map(item => item.value)));

onMounted(() => getIndicadores());
</script>