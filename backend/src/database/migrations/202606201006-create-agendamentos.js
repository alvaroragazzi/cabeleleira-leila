/**
 * @param {import("knex").Knex} knex
 */
exports.up = function (knex) {
    return knex.schema.createTable("agendamentos", function (table) {
        table.increments("id").primary();
        table.integer("id_usuario").unsigned().notNullable().references("id").inTable("usuarios");
        table.integer("id_cliente").unsigned().notNullable().references("id").inTable("clientes");
        table.integer("vl_nota").unsigned().nullable();
        table.datetime("dh_agendamento").notNullable();
    });
};

/**
 * @param {import("knex").Knex} knex
 */
exports.down = function (knex) {
    return knex.schema.dropTable("agendamentos");
};