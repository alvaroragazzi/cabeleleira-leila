require("dotenv").config();

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {
    await knex("clientes").del();

    await knex("clientes").insert([
        { 
            nm_cliente: "Marcela",
            ds_telefone: "11987654321",
            ds_email: "marcela@example.com",
        },
        { 
            nm_cliente: "Helena",
            ds_telefone: "11987654322",
            ds_email: "helena@example.com",
        },
        { 
            nm_cliente: "Alice",
            ds_telefone: "11987654323",
            ds_email: "alice@example.com",
        },
        { 
            nm_cliente: "Laura",
            ds_telefone: "11987654324",
            ds_email: "laura@example.com",
        },
        { 
            nm_cliente: "Sophia",
            ds_telefone: "11987654324",
            ds_email: "sophia@example.com",
        },
    ]);
};