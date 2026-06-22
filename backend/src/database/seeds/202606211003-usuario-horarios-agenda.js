require("dotenv").config();

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {
    await knex("usuario_agenda_horarios").del();

    await knex("usuario_agenda_horarios").insert([
        { 
            id_usuario: 1,
            vl_dia_semana: 1,
            hr_inicio: "08:00",
            hr_fim: "12:00"
        },
        { 
            id_usuario: 1,
            vl_dia_semana: 1,
            hr_inicio: "13:00",
            hr_fim: "17:00"
        },
        { 
            id_usuario: 1,
            vl_dia_semana: 2,
            hr_inicio: "08:00",
            hr_fim: "12:00"
        },
        { 
            id_usuario: 1,
            vl_dia_semana: 2,
            hr_inicio: "13:00",
            hr_fim: "17:00"
        },
        { 
            id_usuario: 1,
            vl_dia_semana: 3,
            hr_inicio: "08:00",
            hr_fim: "12:00"
        },
        { 
            id_usuario: 1,
            vl_dia_semana: 3,
            hr_inicio: "13:00",
            hr_fim: "17:00"
        },
        { 
            id_usuario: 1,
            vl_dia_semana: 4,
            hr_inicio: "08:00",
            hr_fim: "12:00"
        },
        { 
            id_usuario: 1,
            vl_dia_semana: 4,
            hr_inicio: "13:00",
            hr_fim: "17:00"
        },
        { 
            id_usuario: 1,
            vl_dia_semana: 5,
            hr_inicio: "08:00",
            hr_fim: "12:00"
        },
        { 
            id_usuario: 1,
            vl_dia_semana: 5,
            hr_inicio: "13:00",
            hr_fim: "17:00"
        },
        { 
            id_usuario: 1,
            vl_dia_semana: 6,
            hr_inicio: "08:00",
            hr_fim: "12:00"
        },
        { 
            id_usuario: 1,
            vl_dia_semana: 6,
            hr_inicio: "13:00",
            hr_fim: "17:00"
        },
    ]);
};