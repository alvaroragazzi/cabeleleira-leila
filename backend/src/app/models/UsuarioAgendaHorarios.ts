import { Model } from "../../core/Eloquent/Model";

type HorarioLivreDia = {
    dh_agendamento: string;
    horario: string;
    minutos_disponiveis: number;
    menor_duracao: number;
};

type HorarioDia = {
    dh_horario: string;
    horario: string;
    ocupado: boolean;
    agendamento: any | null;
};

type DiaDisponivel = {
    data: string;
    total_horarios_disponiveis: number;
};

type DiaComHorario = {
    data: string;
};

export default class UsuarioAgendaHorarios extends Model {
    static table = "usuario_agenda_horarios";
    static primaryKey = "id";
    static timestamps = false;

    static async calcularDuracaoServicos(idsServicos: number[]): Promise<number> {
        if (!idsServicos.length) {
            throw new Error("Informe ao menos um serviço.");
        }

        const placeholders = idsServicos.map(() => "?").join(", ");

        const resultado = await this.getConnection().raw(`
            SELECT COALESCE(SUM(vl_duracao), 0)::int AS duracao
            FROM servicos
            WHERE id IN (${placeholders})
            AND tf_ativo = true
        `, idsServicos);

        const rows = resultado.rows ?? resultado;
        const duracao = Number(rows[0]?.duracao ?? 0);

        return duracao;
    }

    static async horariosDiaComAgendamentos(
        idUsuario: number,
        data: string
    ): Promise<HorarioDia[]> {
        const resultado = await this.getConnection().raw(`
            WITH parametros AS (
                SELECT
                    ?::int AS id_usuario,
                    ?::date AS data_referencia,
                    DATE_TRUNC('week', ?::date)::timestamp AS inicio_semana,
                    (DATE_TRUNC('week', ?::date) + INTERVAL '1 week')::timestamp AS fim_semana
            ),

            agendamentos_semana AS (
                SELECT
                    a.id,
                    a.id_usuario,
                    a.id_cliente,
                    c.nm_cliente,
                    c.ds_telefone,
                    a.tf_confirmado,
                    a.dh_agendamento AS inicio,
                    a.dh_agendamento + (
                        COALESCE(SUM(s.vl_duracao), 15)::int * INTERVAL '1 minute'
                    ) AS fim,
                    COALESCE(SUM(s.vl_duracao), 15)::int AS duracao_total,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id_servico', s.id,
                            'nm_servico', s.nm_servico,
                            'vl_preco', s.vl_preco,
                            'vl_duracao', s.vl_duracao
                        )
                    ) FILTER (WHERE s.id IS NOT NULL) AS servicos
                FROM agendamentos a
                INNER JOIN clientes c 
                    ON c.id = a.id_cliente
                LEFT JOIN agendamento_servicos ags 
                    ON ags.id_agendamento = a.id
                LEFT JOIN servicos s 
                    ON s.id = ags.id_servico
                CROSS JOIN parametros p
                WHERE a.id_usuario = p.id_usuario
                AND a.dh_agendamento >= p.inicio_semana
                AND a.dh_agendamento < p.fim_semana
                GROUP BY 
                    a.id,
                    a.id_usuario,
                    a.id_cliente,
                    c.nm_cliente,
                    c.ds_telefone,
                    a.dh_agendamento
            ),

            agendamentos_ocupados AS (
                SELECT ag.*
                FROM agendamentos_semana ag
                CROSS JOIN parametros p
                WHERE ag.inicio::date = p.data_referencia
            ),

            menor_servico AS (
                SELECT
                    MIN(sv.vl_duracao)::int AS menor_duracao
                FROM servicos sv
                WHERE sv.tf_ativo = true
            ),

            horarios AS (
                SELECT DISTINCT
                    gs.horario AS horario_real,
                    (p.data_referencia + uah.hr_fim) AS fim_bloco
                FROM usuario_agenda_horarios uah
                CROSS JOIN parametros p
                CROSS JOIN LATERAL generate_series(
                    (p.data_referencia + uah.hr_inicio),
                    (p.data_referencia + uah.hr_fim - INTERVAL '15 minutes'),
                    INTERVAL '15 minutes'
                ) AS gs(horario)
                WHERE uah.id_usuario = p.id_usuario
                AND uah.vl_dia_semana = EXTRACT(ISODOW FROM p.data_referencia)::int
            ),

            base AS (
                SELECT
                    h.horario_real,
                    h.fim_bloco,

                    menor_servico.menor_duracao,

                    agendamento_atual.id AS agendamento_id,
                    agendamento_atual.id_usuario AS agendamento_id_usuario,
                    agendamento_atual.id_cliente AS agendamento_id_cliente,
                    agendamento_atual.nm_cliente AS agendamento_nm_cliente,
                    agendamento_atual.ds_telefone AS agendamento_ds_telefone,
                    agendamento_atual.tf_confirmado AS agendamento_tf_confirmado,
                    agendamento_atual.inicio AS agendamento_inicio,
                    agendamento_atual.fim AS agendamento_fim,
                    agendamento_atual.duracao_total AS agendamento_duracao_total,
                    agendamento_atual.servicos AS agendamento_servicos,

                    proximo_agendamento.id AS proximo_agendamento_id,
                    proximo_agendamento.id_usuario AS proximo_agendamento_id_usuario,
                    proximo_agendamento.id_cliente AS proximo_agendamento_id_cliente,
                    proximo_agendamento.nm_cliente AS proximo_nm_cliente,
                    proximo_agendamento.ds_telefone AS proximo_ds_telefone,
                    proximo_agendamento.tf_confirmado AS proximo_tf_confirmado,
                    proximo_agendamento.inicio AS proximo_inicio,
                    proximo_agendamento.fim AS proximo_fim,
                    proximo_agendamento.duracao_total AS proximo_duracao_total,
                    proximo_agendamento.servicos AS proximo_servicos,

                    limite.horario_limite,

                    GREATEST(
                        FLOOR(
                            EXTRACT(EPOCH FROM (
                                limite.horario_limite - h.horario_real
                            )) / 60
                        )::int,
                        0
                    ) AS minutos_disponiveis

                FROM horarios h

                CROSS JOIN menor_servico

                LEFT JOIN LATERAL (
                    SELECT ao.*
                    FROM agendamentos_ocupados ao
                    WHERE ao.inicio <= h.horario_real
                    AND ao.fim > h.horario_real
                    ORDER BY ao.inicio
                    LIMIT 1
                ) agendamento_atual ON true

                LEFT JOIN LATERAL (
                    SELECT ao.*
                    FROM agendamentos_ocupados ao
                    WHERE ao.inicio > h.horario_real
                    ORDER BY ao.inicio
                    LIMIT 1
                ) proximo_agendamento ON true

                CROSS JOIN LATERAL (
                    SELECT LEAST(
                        COALESCE(proximo_agendamento.inicio, h.fim_bloco),
                        h.fim_bloco
                    ) AS horario_limite
                ) limite
            )

            SELECT
                TO_CHAR(horario_real, 'YYYY-MM-DD HH24:MI:SS') AS dh_horario,
                TO_CHAR(horario_real, 'HH24:MI') AS horario,

                CASE
                    WHEN agendamento_id IS NOT NULL THEN true
                    WHEN menor_duracao IS NULL THEN true
                    WHEN minutos_disponiveis < menor_duracao THEN true
                    ELSE false
                END AS ocupado,

                CASE
                    WHEN agendamento_id IS NOT NULL THEN 'agendamento'
                    WHEN menor_duracao IS NULL THEN 'sem_servicos_ativos'
                    WHEN minutos_disponiveis < menor_duracao THEN 'sem_servico_compatível'
                    ELSE NULL
                END AS tipo_ocupacao,

                minutos_disponiveis,
                menor_duracao,

                CASE 
                    WHEN agendamento_id IS NOT NULL THEN JSON_BUILD_OBJECT(
                        'id', agendamento_id,
                        'id_usuario', agendamento_id_usuario,
                        'id_cliente', agendamento_id_cliente,
                        'nm_cliente', agendamento_nm_cliente,
                        'ds_telefone', agendamento_ds_telefone,
                        'tf_confirmado', agendamento_tf_confirmado,
                        'dh_agendamento', TO_CHAR(agendamento_inicio, 'YYYY-MM-DD HH24:MI:SS'),
                        'data_agendamento', TO_CHAR(agendamento_inicio, 'DD/MM/YYYY'),
                        'hr_inicio', TO_CHAR(agendamento_inicio, 'HH24:MI'),
                        'hr_fim', TO_CHAR(agendamento_fim, 'HH24:MI'),
                        'duracao_total', agendamento_duracao_total,
                        'servicos', agendamento_servicos,

                        'tem_outro_agendamento_semana', EXISTS (
                            SELECT 1
                            FROM agendamentos_semana outro
                            WHERE outro.id_cliente = agendamento_id_cliente
                            AND outro.id <> agendamento_id
                        ),

                        'outros_agendamentos_semana', COALESCE((
                            SELECT JSON_AGG(
                                JSON_BUILD_OBJECT(
                                    'id', outro.id,
                                    'id_usuario', outro.id_usuario,
                                    'id_cliente', outro.id_cliente,
                                    'nm_cliente', outro.nm_cliente,
                                    'ds_telefone', outro.ds_telefone,
                                    'tf_confirmado', outro.tf_confirmado,
                                    'dh_agendamento', TO_CHAR(outro.inicio, 'YYYY-MM-DD HH24:MI:SS'),
                                    'data_agendamento', TO_CHAR(outro.inicio, 'DD/MM/YYYY'),
                                    'hr_inicio', TO_CHAR(outro.inicio, 'HH24:MI'),
                                    'hr_fim', TO_CHAR(outro.fim, 'HH24:MI'),
                                    'duracao_total', outro.duracao_total,
                                    'servicos', outro.servicos
                                )
                                ORDER BY outro.inicio
                            )
                            FROM agendamentos_semana outro
                            WHERE outro.id_cliente = agendamento_id_cliente
                            AND outro.id <> agendamento_id
                        ), '[]'::json)
                    )

                    WHEN agendamento_id IS NULL
                        AND minutos_disponiveis < menor_duracao
                        AND proximo_agendamento_id IS NOT NULL THEN JSON_BUILD_OBJECT(
                        'id', proximo_agendamento_id,
                        'id_usuario', proximo_agendamento_id_usuario,
                        'id_cliente', proximo_agendamento_id_cliente,
                        'nm_cliente', proximo_nm_cliente,
                        'ds_telefone', proximo_ds_telefone,
                        'tf_confirmado', proximo_tf_confirmado,
                        'dh_agendamento', TO_CHAR(proximo_inicio, 'YYYY-MM-DD HH24:MI:SS'),
                        'data_agendamento', TO_CHAR(proximo_inicio, 'DD/MM/YYYY'),
                        'hr_inicio', TO_CHAR(proximo_inicio, 'HH24:MI'),
                        'hr_fim', TO_CHAR(proximo_fim, 'HH24:MI'),
                        'duracao_total', proximo_duracao_total,
                        'servicos', proximo_servicos,

                        'tem_outro_agendamento_semana', EXISTS (
                            SELECT 1
                            FROM agendamentos_semana outro
                            WHERE outro.id_cliente = proximo_agendamento_id_cliente
                            AND outro.id <> proximo_agendamento_id
                        ),

                        'outros_agendamentos_semana', COALESCE((
                            SELECT JSON_AGG(
                                JSON_BUILD_OBJECT(
                                    'id', outro.id,
                                    'id_usuario', outro.id_usuario,
                                    'id_cliente', outro.id_cliente,
                                    'nm_cliente', outro.nm_cliente,
                                    'ds_telefone', outro.ds_telefone,
                                    'tf_confirmado', outro.tf_confirmado,
                                    'dh_agendamento', TO_CHAR(outro.inicio, 'YYYY-MM-DD HH24:MI:SS'),
                                    'data_agendamento', TO_CHAR(outro.inicio, 'DD/MM/YYYY'),
                                    'hr_inicio', TO_CHAR(outro.inicio, 'HH24:MI'),
                                    'hr_fim', TO_CHAR(outro.fim, 'HH24:MI'),
                                    'duracao_total', outro.duracao_total,
                                    'servicos', outro.servicos
                                )
                                ORDER BY outro.inicio
                            )
                            FROM agendamentos_semana outro
                            WHERE outro.id_cliente = proximo_agendamento_id_cliente
                            AND outro.id <> proximo_agendamento_id
                        ), '[]'::json)
                    )

                    ELSE NULL
                END AS agendamento

            FROM base
            ORDER BY horario_real
        `, [
            idUsuario,
            data,
            data,
            data
        ]);

        return resultado.rows ?? resultado;
    }

    static async diasComHorariosMes(
        idUsuario: number,
        dataMes: string
    ): Promise<string[]> {
        const resultado = await this.getConnection().raw(`
            WITH parametros AS (
                SELECT
                    DATE_TRUNC('month', ?::date)::date AS inicio_mes,
                    (DATE_TRUNC('month', ?::date) + INTERVAL '1 month - 1 day')::date AS fim_mes
            ),
            dias AS (
                SELECT
                    GENERATE_SERIES(
                        inicio_mes,
                        fim_mes,
                        INTERVAL '1 day'
                    )::date AS data
                FROM parametros
            )
            SELECT DISTINCT
                TO_CHAR(d.data, 'YYYY-MM-DD') AS data
            FROM dias d
            INNER JOIN usuario_agenda_horarios uah
                ON uah.id_usuario = ?
            AND uah.vl_dia_semana = EXTRACT(ISODOW FROM d.data)::int
            ORDER BY data
        `, [
            dataMes,
            dataMes,
            idUsuario
        ]);

        const rows = resultado.rows ?? resultado;

        return rows.map((row: DiaComHorario) => row.data);
    }

    static async horariosDisponiveis(
            idUsuario: number,
        data: string
    ): Promise<HorarioLivreDia[]> {
        const resultado = await this.getConnection().raw(`
            WITH agendamentos_ocupados AS (
                SELECT
                    a.id,
                    a.id_usuario,
                    c.nm_cliente,
                    c.ds_telefone,
                    a.tf_confirmado,
                    a.dh_agendamento AS inicio,
                    a.dh_agendamento + (
                        COALESCE(SUM(s.vl_duracao), 15)::int * INTERVAL '1 minute'
                    ) AS fim,
                    COALESCE(SUM(s.vl_duracao), 15)::int AS duracao_total
                FROM agendamentos a
                INNER JOIN clientes c 
                    ON c.id = a.id_cliente
                LEFT JOIN agendamento_servicos ags 
                    ON ags.id_agendamento = a.id
                LEFT JOIN servicos s 
                    ON s.id = ags.id_servico
                WHERE a.id_usuario = ?
                AND a.dh_agendamento::date = ?::date
                GROUP BY 
                    a.id,
                    a.id_usuario,
                    c.nm_cliente,
                    c.ds_telefone,
                    a.tf_confirmado,
                    a.dh_agendamento
            ),

            menor_servico AS (
                SELECT
                    MIN(sv.vl_duracao)::int AS menor_duracao
                FROM servicos sv
                WHERE sv.tf_ativo = true
            ),

            horarios AS (
                SELECT DISTINCT
                    gs.horario AS horario_real,
                    (?::date + uah.hr_fim) AS fim_bloco
                FROM usuario_agenda_horarios uah
                CROSS JOIN LATERAL generate_series(
                    (?::date + uah.hr_inicio),
                    (?::date + uah.hr_fim - INTERVAL '15 minutes'),
                    INTERVAL '15 minutes'
                ) AS gs(horario)
                WHERE uah.id_usuario = ?
                AND uah.vl_dia_semana = EXTRACT(ISODOW FROM ?::date)::int
            ),

            base AS (
                SELECT
                    h.horario_real,
                    h.fim_bloco,

                    menor_servico.menor_duracao,

                    agendamento_atual.id AS agendamento_id,

                    limite.horario_limite,

                    GREATEST(
                        FLOOR(
                            EXTRACT(EPOCH FROM (
                                limite.horario_limite - h.horario_real
                            )) / 60
                        )::int,
                        0
                    ) AS minutos_disponiveis

                FROM horarios h

                CROSS JOIN menor_servico

                LEFT JOIN LATERAL (
                    SELECT ao.*
                    FROM agendamentos_ocupados ao
                    WHERE ao.inicio <= h.horario_real
                    AND ao.fim > h.horario_real
                    ORDER BY ao.inicio
                    LIMIT 1
                ) agendamento_atual ON true

                LEFT JOIN LATERAL (
                    SELECT ao.*
                    FROM agendamentos_ocupados ao
                    WHERE ao.inicio > h.horario_real
                    ORDER BY ao.inicio
                    LIMIT 1
                ) proximo_agendamento ON true

                CROSS JOIN LATERAL (
                    SELECT LEAST(
                        COALESCE(proximo_agendamento.inicio, h.fim_bloco),
                        h.fim_bloco
                    ) AS horario_limite
                ) limite
            )

            SELECT
                TO_CHAR(horario_real, 'YYYY-MM-DD HH24:MI:SS') AS dh_agendamento,
                TO_CHAR(horario_real, 'HH24:MI') AS horario,
                minutos_disponiveis,
                menor_duracao

            FROM base
            WHERE agendamento_id IS NULL
            AND menor_duracao IS NOT NULL
            AND minutos_disponiveis >= menor_duracao
            AND horario_real >= NOW()

            ORDER BY horario_real
        `, [
            idUsuario,
            data,

            data,
            data,
            data,
            idUsuario,
            data
        ]);

        return resultado.rows ?? resultado;
    }

    static async diasDisponiveisMes(
        idUsuario: number,
        dataMes: string
    ): Promise<DiaDisponivel[]> {
        const resultado = await this.getConnection().raw(`
            WITH parametros AS (
                SELECT
                    DATE_TRUNC('month', ?::date)::date AS inicio_mes,
                    (DATE_TRUNC('month', ?::date) + INTERVAL '1 month - 1 day')::date AS fim_mes
            ),

            dias AS (
                SELECT
                    GENERATE_SERIES(
                        inicio_mes,
                        fim_mes,
                        INTERVAL '1 day'
                    )::date AS data
                FROM parametros
            ),

            agendamentos_ocupados AS (
                SELECT
                    a.id,
                    a.id_usuario,
                    a.dh_agendamento AS inicio,
                    a.dh_agendamento + (
                        COALESCE(SUM(s.vl_duracao), 15)::int * INTERVAL '1 minute'
                    ) AS fim,
                    COALESCE(SUM(s.vl_duracao), 15)::int AS duracao_total
                FROM agendamentos a
                LEFT JOIN agendamento_servicos ags 
                    ON ags.id_agendamento = a.id
                LEFT JOIN servicos s 
                    ON s.id = ags.id_servico
                CROSS JOIN parametros p
                WHERE a.id_usuario = ?
                AND a.dh_agendamento::date BETWEEN p.inicio_mes AND p.fim_mes
                GROUP BY
                    a.id,
                    a.id_usuario,
                    a.dh_agendamento
            ),

            menor_servico AS (
                SELECT
                    MIN(sv.vl_duracao)::int AS menor_duracao
                FROM servicos sv
                WHERE sv.tf_ativo = true
            ),

            horarios AS (
                SELECT DISTINCT
                    d.data,
                    gs.horario AS horario_real,
                    (d.data + uah.hr_fim) AS fim_bloco
                FROM dias d
                INNER JOIN usuario_agenda_horarios uah
                    ON uah.id_usuario = ?
                AND uah.vl_dia_semana = EXTRACT(ISODOW FROM d.data)::int
                CROSS JOIN LATERAL generate_series(
                    (d.data + uah.hr_inicio),
                    (d.data + uah.hr_fim - INTERVAL '15 minutes'),
                    INTERVAL '15 minutes'
                ) AS gs(horario)
            ),

            base AS (
                SELECT
                    h.data,
                    h.horario_real,
                    h.fim_bloco,

                    menor_servico.menor_duracao,

                    agendamento_atual.id AS agendamento_id,

                    limite.horario_limite,

                    GREATEST(
                        FLOOR(
                            EXTRACT(EPOCH FROM (
                                limite.horario_limite - h.horario_real
                            )) / 60
                        )::int,
                        0
                    ) AS minutos_disponiveis

                FROM horarios h

                CROSS JOIN menor_servico

                LEFT JOIN LATERAL (
                    SELECT ao.*
                    FROM agendamentos_ocupados ao
                    WHERE ao.inicio <= h.horario_real
                    AND ao.fim > h.horario_real
                    ORDER BY ao.inicio
                    LIMIT 1
                ) agendamento_atual ON true

                LEFT JOIN LATERAL (
                    SELECT ao.*
                    FROM agendamentos_ocupados ao
                    WHERE ao.inicio > h.horario_real
                    ORDER BY ao.inicio
                    LIMIT 1
                ) proximo_agendamento ON true

                CROSS JOIN LATERAL (
                    SELECT LEAST(
                        COALESCE(proximo_agendamento.inicio, h.fim_bloco),
                        h.fim_bloco
                    ) AS horario_limite
                ) limite
            )

            SELECT
                TO_CHAR(data, 'YYYY-MM-DD') AS data,
                COUNT(DISTINCT horario_real)::int AS total_horarios_disponiveis
            FROM base
            WHERE agendamento_id IS NULL
            AND menor_duracao IS NOT NULL
            AND minutos_disponiveis >= menor_duracao
            AND horario_real >= NOW()
            GROUP BY data
            ORDER BY data
        `, [
            dataMes,
            dataMes,
            idUsuario,
            idUsuario
        ]);

        return resultado.rows ?? resultado;
    }
}