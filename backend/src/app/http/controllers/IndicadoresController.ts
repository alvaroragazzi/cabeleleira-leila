type ServicoMaisSolicitado = {
    id_servico: number;
    nm_servico: string;
    total_solicitado: number;
    faturamento: number;
};

import type { Request, Response } from "express";

import DB from "../../../core/Eloquent/DB";

export default class ServicosController {
    public static async getAll(req: Request, res: Response): Promise<any> {
        const resultado = await DB.connection().raw(`
            WITH parametros AS (
                SELECT
                    ?::int AS id_usuario,
                    DATE_TRUNC('week', NOW()) AS inicio_semana_atual,
                    DATE_TRUNC('week', NOW()) + INTERVAL '1 week' AS fim_semana_atual,
                    DATE_TRUNC('week', NOW()) - INTERVAL '1 week' AS inicio_semana_passada,
                    DATE_TRUNC('week', NOW()) AS fim_semana_passada
            ),

            agendamentos_base AS (
                SELECT
                    a.id,
                    a.id_usuario,
                    a.tf_confirmado,
                    a.dh_agendamento,
                    COALESCE(SUM(s.vl_preco), 0)::numeric(10, 2) AS valor_total
                FROM agendamentos a
                LEFT JOIN agendamento_servicos ags
                    ON ags.id_agendamento = a.id
                LEFT JOIN servicos s
                    ON s.id = ags.id_servico
                CROSS JOIN parametros p
                WHERE a.id_usuario = p.id_usuario
                AND a.dh_agendamento >= p.inicio_semana_passada
                AND a.dh_agendamento < p.fim_semana_atual
                GROUP BY
                    a.id,
                    a.id_usuario,
                    a.tf_confirmado,
                    a.dh_agendamento
            ),

            resumo AS (
                SELECT
                    COALESCE(SUM(ab.valor_total) FILTER (
                        WHERE ab.dh_agendamento >= p.inicio_semana_atual
                        AND ab.dh_agendamento < p.fim_semana_atual
                    ), 0)::numeric(10, 2) AS faturamento_semana_atual,

                    COALESCE(SUM(ab.valor_total) FILTER (
                        WHERE ab.dh_agendamento >= p.inicio_semana_passada
                        AND ab.dh_agendamento < p.fim_semana_passada
                    ), 0)::numeric(10, 2) AS faturamento_semana_passada,

                    COUNT(ab.id) FILTER (
                        WHERE ab.dh_agendamento >= p.inicio_semana_atual
                        AND ab.dh_agendamento < p.fim_semana_atual
                    )::int AS quantidade_agendamentos_semana_atual,

                    COUNT(ab.id) FILTER (
                        WHERE ab.dh_agendamento >= p.inicio_semana_passada
                        AND ab.dh_agendamento < p.fim_semana_passada
                    )::int AS quantidade_agendamentos_semana_passada,

                    COUNT(ab.id) FILTER (
                        WHERE ab.dh_agendamento >= p.inicio_semana_atual
                        AND ab.dh_agendamento < p.fim_semana_atual
                        AND ab.tf_confirmado = true
                    )::int AS quantidade_confirmados_semana_atual,

                    COUNT(ab.id) FILTER (
                        WHERE ab.dh_agendamento >= p.inicio_semana_atual
                        AND ab.dh_agendamento < p.fim_semana_atual
                        AND ab.tf_confirmado = true
                        AND ab.dh_agendamento < NOW()
                    )::int AS quantidade_agendamentos_concluidos_semana_atual

                FROM parametros p
                LEFT JOIN agendamentos_base ab
                    ON true
                GROUP BY
                    p.inicio_semana_atual,
                    p.fim_semana_atual,
                    p.inicio_semana_passada,
                    p.fim_semana_passada
            ),

            servicos_mais_solicitados AS (
                SELECT
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id_servico', dados.id_servico,
                                'nm_servico', dados.nm_servico,
                                'total_solicitado', dados.total_solicitado,
                                'faturamento', dados.faturamento
                            )
                            ORDER BY dados.total_solicitado DESC, dados.nm_servico ASC
                        ),
                        '[]'::json
                    ) AS servicos
                FROM (
                    SELECT
                        s.id AS id_servico,
                        s.nm_servico,
                        COUNT(*)::int AS total_solicitado,
                        COALESCE(SUM(s.vl_preco), 0)::numeric(10, 2) AS faturamento
                    FROM agendamentos a
                    INNER JOIN agendamento_servicos ags
                        ON ags.id_agendamento = a.id
                    INNER JOIN servicos s
                        ON s.id = ags.id_servico
                    CROSS JOIN parametros p
                    WHERE a.id_usuario = p.id_usuario
                    AND a.dh_agendamento >= p.inicio_semana_atual
                    AND a.dh_agendamento < p.fim_semana_atual
                    GROUP BY
                        s.id,
                        s.nm_servico
                    ORDER BY
                        total_solicitado DESC,
                        s.nm_servico ASC
                    LIMIT 5
                ) dados
            )

            SELECT
                r.faturamento_semana_atual,
                r.faturamento_semana_passada,

                CASE
                    WHEN r.faturamento_semana_passada = 0
                        AND r.faturamento_semana_atual > 0 THEN 100

                    WHEN r.faturamento_semana_passada = 0
                        AND r.faturamento_semana_atual = 0 THEN 0

                    ELSE ROUND(
                        (
                            (
                                r.faturamento_semana_atual - r.faturamento_semana_passada
                            ) / r.faturamento_semana_passada
                        ) * 100,
                        2
                    )
                END AS percentual_faturamento,

                r.quantidade_agendamentos_semana_atual,
                r.quantidade_agendamentos_semana_passada,

                CASE
                    WHEN r.quantidade_agendamentos_semana_atual = 0 THEN 0
                    ELSE ROUND(
                        (
                            r.quantidade_confirmados_semana_atual::numeric
                            / r.quantidade_agendamentos_semana_atual::numeric
                        ) * 100,
                        2
                    )
                END AS taxa_confirmacao,

                r.quantidade_agendamentos_concluidos_semana_atual,

                sms.servicos AS servicos_mais_solicitados

            FROM resumo r
            CROSS JOIN servicos_mais_solicitados sms
        `, [
            1
        ]);

        const rows = resultado.rows ?? resultado;
        const row = rows[0];

        return res.json({
            faturamento_semana_atual: Number(row?.faturamento_semana_atual ?? 0),
            faturamento_semana_passada: Number(row?.faturamento_semana_passada ?? 0),
            percentual_faturamento: Number(row?.percentual_faturamento ?? 0),

            quantidade_agendamentos_semana_atual: Number(row?.quantidade_agendamentos_semana_atual ?? 0),
            quantidade_agendamentos_semana_passada: Number(row?.quantidade_agendamentos_semana_passada ?? 0),

            taxa_confirmacao: Number(row?.taxa_confirmacao ?? 0),

            quantidade_agendamentos_concluidos_semana_atual: Number(row?.quantidade_agendamentos_concluidos_semana_atual ?? 0),

            servicos_mais_solicitados: row?.servicos_mais_solicitados ?? []
        });
    }
}