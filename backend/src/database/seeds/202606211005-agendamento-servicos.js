require("dotenv").config();

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {
    await knex("agendamento_servicos").del();

    await knex("agendamento_servicos").insert([
        { 
            id_agendamento: 1,
            id_servico: 1,
            nm_servico: "Corte de cabelo",
            vl_preco: 65,
        },
        { 
            id_agendamento: 1,
            id_servico: 2,
            nm_servico: "Escova",
            vl_preco: 40,
        },
        { 
            id_agendamento: 1,
            id_servico: 2,
            nm_servico: "Unhas",
            vl_preco: 60,
        },

        { 
            id_agendamento: 2,
            id_servico: 1,
            nm_servico: "Corte de cabelo",
            vl_preco: 65,
        },
        { 
            id_agendamento: 2,
            id_servico: 2,
            nm_servico: "Escova",
            vl_preco: 40,
        },

        { 
            id_agendamento: 3,
            id_servico: 1,
            nm_servico: "Corte de cabelo",
            vl_preco: 65,
        },
        { 
            id_agendamento: 3,
            id_servico: 2,
            nm_servico: "Escova",
            vl_preco: 40,
        },

        { 
            id_agendamento: 4,
            id_servico: 1,
            nm_servico: "Corte de cabelo",
            vl_preco: 65,
        },
        { 
            id_agendamento: 4,
            id_servico: 2,
            nm_servico: "Escova",
            vl_preco: 40,
        },
        { 
            id_agendamento: 4,
            id_servico: 2,
            nm_servico: "Unhas",
            vl_preco: 60,
        },

        { 
            id_agendamento: 5,
            id_servico: 1,
            nm_servico: "Corte de cabelo",
            vl_preco: 65,
        },
        { 
            id_agendamento: 5,
            id_servico: 2,
            nm_servico: "Escova",
            vl_preco: 40,
        },
    ]);
};