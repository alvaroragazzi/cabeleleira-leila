<template>
    <q-dialog ref="dialogRef" padding>
        <g-card flat bordered use-form @submit="salvar">
            <q-card-section>
                <div class="text-h6">
                    Horários de trabalho
                </div>

                <div class="text-caption text-grey-7">
                    Configure os horários disponíveis para atendimento.
                </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
                <q-list bordered separator>
                    <q-expansion-item
                        v-for="dia in diasSemana"
                        :key="dia.vl_dia_semana"
                        expand-separator
                        :label="dia.nome"
                        :caption="montarResumoDia(dia)"
                    >
                        <q-card>
                            <q-card-section>
                                <div
                                    v-if="dia.horarios.length == 0"
                                    class="text-grey-7 q-mb-md"
                                >
                                    Nenhum horário cadastrado para este dia.
                                </div>

                                <div
                                    v-for="(horario, index) in dia.horarios"
                                    :key="index"
                                    class="row q-col-gutter-md q-mb-md items-center"
                                >
                                    <div class="col-12 col-md-5">
                                        <g-input
                                            v-model="horario.hr_inicio"
                                            type="time"
                                            label="Hora início"
                                            outlined
                                            dense
                                            obrigatorio
                                        />
                                    </div>

                                    <div class="col-12 col-md-5">
                                        <g-input
                                            v-model="horario.hr_fim"
                                            type="time"
                                            label="Hora fim"
                                            outlined
                                            dense
                                            obrigatorio
                                            :rules="[
                                                val => validarHoraFim(horario.hr_inicio, val)
                                            ]"
                                        />
                                    </div>

                                    <div class="col-12 col-md-2">
                                        <g-btn
                                            color="negative"
                                            icon="Delete"
                                            outline
                                            class="full-width"
                                            @click="removerHorario(dia.vl_dia_semana, index)"
                                        />
                                    </div>
                                </div>

                                <q-btn
                                    color="primary"
                                    icon="add"
                                    label="Adicionar horário"
                                    outline
                                    @click="adicionarHorario(dia.vl_dia_semana)"
                                />
                            </q-card-section>
                        </q-card>
                    </q-expansion-item>
                </q-list>
            </q-card-section>
        </g-card>
    </q-dialog>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";

const $q = useQuasar();
const dialogRef = ref();

const props = defineProps({
    idUsuario: {
        type: Number,
        required: true
    }
});

const emit = defineEmits(["ok"]);

const salvando = ref(false);

const diasSemana = ref([
    {
        vl_dia_semana: 1,
        nome: "Segunda-feira",
        horarios: []
    },
    {
        vl_dia_semana: 2,
        nome: "Terça-feira",
        horarios: []
    },
    {
        vl_dia_semana: 3,
        nome: "Quarta-feira",
        horarios: []
    },
    {
        vl_dia_semana: 4,
        nome: "Quinta-feira",
        horarios: []
    },
    {
        vl_dia_semana: 5,
        nome: "Sexta-feira",
        horarios: []
    },
    {
        vl_dia_semana: 6,
        nome: "Sábado",
        horarios: []
    },
    {
        vl_dia_semana: 7,
        nome: "Domingo",
        horarios: []
    }
]);

onMounted(() => {
    carregarHorarios();
});

async function carregarHorarios() {
    try {
        const response = await api.get("usuarioAgendaHorarios/", {
            params: {
                id_usuario: props.idUsuario
            }
        });

        const horarios = response.data ?? [];

        diasSemana.value.forEach((dia) => {
            dia.horarios = horarios
                .filter((horario) => Number(horario.vl_dia_semana) === dia.vl_dia_semana)
                .map((horario) => {
                    return {
                        id: horario.id,
                        id_usuario: horario.id_usuario,
                        vl_dia_semana: horario.vl_dia_semana,
                        hr_inicio: formatarHora(horario.hr_inicio),
                        hr_fim: formatarHora(horario.hr_fim)
                    };
                })
                .sort((a, b) => {
                    return a.hr_inicio.localeCompare(b.hr_inicio);
                });
        });

    } catch (error) {
        console.error(error);

        $q.notify({
            type: "negative",
            message: "Erro ao carregar horários."
        });
    }
}

function adicionarHorario(vlDiaSemana) {
    const dia = diasSemana.value.find((item) => {
        return item.vl_dia_semana === vlDiaSemana;
    });

    if (!dia) return;

    dia.horarios.push({
        id_usuario: props.idUsuario,
        vl_dia_semana: vlDiaSemana,
        hr_inicio: "08:00",
        hr_fim: "12:00"
    });
}

function removerHorario(vlDiaSemana, index) {
    const dia = diasSemana.value.find((item) => {
        return item.vl_dia_semana === vlDiaSemana;
    });

    if (!dia) return;

    dia.horarios.splice(index, 1);
}

function validarHoraFim(hrInicio, hrFim) {
    if (!hrInicio || !hrFim) {
        return true;
    }

    if (hrFim <= hrInicio) {
        return "A hora final precisa ser maior que a hora inicial";
    }

    return true;
}

function montarResumoDia(dia) {
    if (dia.horarios.length === 0) {
        return "Sem atendimento";
    }

    return dia.horarios
        .map((horario) => {
            return `${horario.hr_inicio} às ${horario.hr_fim}`;
        })
        .join(" | ");
}

function formatarHora(valor) {
    if (!valor) return "";

    return String(valor).substring(0, 5);
}

function validarSobreposicao() {
    for (const dia of diasSemana.value) {
        const horariosOrdenados = [...dia.horarios].sort((a, b) => {
            return a.hr_inicio.localeCompare(b.hr_inicio);
        });

        for (let i = 0; i < horariosOrdenados.length - 1; i++) {
            const atual = horariosOrdenados[i];
            const proximo = horariosOrdenados[i + 1];

            if (atual.hr_fim > proximo.hr_inicio) {
                $q.notify({
                    type: "negative",
                    message: `Existe sobreposição de horários em ${dia.nome}.`
                });

                return false;
            }
        }
    }

    return true;
}

async function salvar() {
    try {
        if (!validarSobreposicao()) {
            return;
        }

        salvando.value = true;

        const horarios = diasSemana.value.flatMap((dia) => {
            return dia.horarios.map((horario) => {
                return {
                    id: horario.id,
                    id_usuario: props.idUsuario,
                    vl_dia_semana: dia.vl_dia_semana,
                    hr_inicio: horario.hr_inicio,
                    hr_fim: horario.hr_fim
                };
            });
        });

        await api.post("usuarioAgendaHorarios", {
            horarios
        });

        $q.notify({
            type: "positive",
            message: "Horários salvos com sucesso."
        });

        emit("ok");
        dialogRef.value.hide();
    } catch (error) {
        console.error(error);

        $q.notify({
            type: "negative",
            message: "Erro ao salvar horários."
        });

    } finally {
        salvando.value = false;
    }
}
</script>