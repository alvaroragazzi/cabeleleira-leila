import { Model } from "../../core/Eloquent/Model";

import Usuarios from "./Usuarios";
import AgendamentoServicos from "./AgendamentoServicos";
import Clientes from "./Clientes";

export default class Agendamentos extends Model {
    static table = "agendamentos";
    static primaryKey = "id";
    static timestamps = false;

    usuario() {
        return this.hasOne(Usuarios, "id", "id_usuario");
    }

    agendamentoServicos() {
        return this.hasMany(AgendamentoServicos, "id_agendamento", "id");
    }

    cliente() {
        return this.hasOne(Clientes, "id", "id_cliente");
    }

    static async minutosDisponiveisParaEdicao(
        idAgendamento: number,
        idCliente: number
    ): Promise<any> {
        const resultado = await this.getConnection().raw(`
            WITH agendamento_atual AS (
                SELECT
                    a.id,
                    a.id_usuario,
                    a.id_cliente,
                    a.dh_agendamento AS inicio,
                    a.dh_agendamento + (
                        COALESCE(SUM(s.vl_duracao), 15)::int * INTERVAL '1 minute'
                    ) AS fim_atual,
                    COALESCE(SUM(s.vl_duracao), 15)::int AS duracao_atual
                FROM agendamentos a
                LEFT JOIN agendamento_servicos ags
                    ON ags.id_agendamento = a.id
                LEFT JOIN servicos s
                    ON s.id = ags.id_servico
                WHERE a.id = ?
                AND a.id_cliente = ?
                GROUP BY
                    a.id,
                    a.id_usuario,
                    a.id_cliente,
                    a.dh_agendamento
            ),

            base AS (
                SELECT
                    aa.*,

                    bloco_agenda.fim_bloco,

                    proximo_agendamento.inicio AS proximo_agendamento_inicio

                FROM agendamento_atual aa

                LEFT JOIN LATERAL (
                    SELECT
                        (aa.inicio::date + uah.hr_fim) AS fim_bloco
                    FROM usuario_agenda_horarios uah
                    WHERE uah.id_usuario = aa.id_usuario
                    AND uah.vl_dia_semana = EXTRACT(ISODOW FROM aa.inicio)::int
                    AND aa.inicio >= (aa.inicio::date + uah.hr_inicio)
                    AND aa.inicio < (aa.inicio::date + uah.hr_fim)
                    ORDER BY uah.hr_fim
                    LIMIT 1
                ) bloco_agenda ON true

                LEFT JOIN LATERAL (
                    SELECT
                        a2.dh_agendamento AS inicio
                    FROM agendamentos a2
                    WHERE a2.id_usuario = aa.id_usuario
                    AND a2.id <> aa.id
                    AND a2.dh_agendamento::date = aa.inicio::date
                    AND a2.dh_agendamento > aa.inicio
                    ORDER BY a2.dh_agendamento
                    LIMIT 1
                ) proximo_agendamento ON true
            ),

            calculado AS (
                SELECT
                    id,
                    id_usuario,
                    id_cliente,
                    inicio,
                    fim_atual,
                    duracao_atual,
                    fim_bloco,
                    proximo_agendamento_inicio,

                    CASE
                        WHEN fim_bloco IS NULL THEN inicio
                        ELSE LEAST(
                            COALESCE(proximo_agendamento_inicio, fim_bloco),
                            fim_bloco
                        )
                    END AS horario_limite
                FROM base
            )

            SELECT
                id,
                duracao_atual,

                TO_CHAR(inicio, 'YYYY-MM-DD HH24:MI:SS') AS dh_agendamento,
                TO_CHAR(fim_atual, 'YYYY-MM-DD HH24:MI:SS') AS dh_fim_atual,

                TO_CHAR(horario_limite, 'YYYY-MM-DD HH24:MI:SS') AS dh_horario_limite,
                TO_CHAR(horario_limite, 'HH24:MI') AS hr_horario_limite,

                GREATEST(
                    FLOOR(
                        EXTRACT(EPOCH FROM (horario_limite - inicio)) / 60
                    )::int,
                    0
                ) AS minutos_disponiveis,

                CASE
                    WHEN inicio > NOW() THEN true
                    ELSE false
                END AS pode_editar,

                (
                    SELECT COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', sv.id,
                                'nm_servico', sv.nm_servico,
                                'vl_preco', sv.vl_preco,
                                'vl_duracao', sv.vl_duracao
                            )
                            ORDER BY sv.nm_servico
                        ),
                        '[]'::json
                    )
                    FROM servicos sv
                    WHERE sv.tf_ativo = true
                    AND sv.vl_duracao <= GREATEST(
                            FLOOR(
                                EXTRACT(EPOCH FROM (horario_limite - inicio)) / 60
                            )::int,
                            0
                    )
                ) AS servicos_compativeis

            FROM calculado
        `, [
            idAgendamento,
            idCliente
        ]);

        const rows = resultado.rows ?? resultado;
        const row = rows[0];

        return {
            duracao_atual: Number(row?.duracao_atual ?? 0),
            minutos_disponiveis: Number(row?.minutos_disponiveis ?? 0),
            dh_horario_limite: row?.dh_horario_limite ?? null,
            hr_horario_limite: row?.hr_horario_limite ?? null,
            pode_editar: row?.pode_editar ?? false,
            servicos_compativeis: row?.servicos_compativeis ?? []
        };
    }
}