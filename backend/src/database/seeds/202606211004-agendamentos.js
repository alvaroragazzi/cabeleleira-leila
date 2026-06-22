require("dotenv").config();

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {
    await knex("agendamentos").del();

    await knex("agendamentos").insert([
        { 
            id_usuario: 1,
            id_cliente: 1,
            dh_agendamento: "2026-06-15 08:15:00",
            tf_confirmado: true,
        },
        { 
            id_usuario: 1,
            id_cliente: 2,
            dh_agendamento: "2026-06-16 08:30:00",
            tf_confirmado: true,
        },
        { 
            id_usuario: 1,
            id_cliente: 3,
            dh_agendamento: "2026-06-17 10:30:00",
            tf_confirmado: true,
        },
        { 
            id_usuario: 1,
            id_cliente: 4,
            dh_agendamento: "2026-06-18 09:30:00",
            tf_confirmado: true,
        },
        { 
            id_usuario: 1,
            id_cliente: 4,
            dh_agendamento: "2026-06-19 09:00:00",
            tf_confirmado: true,
        },
    ]);
};