/**
 * @param {import("knex").Knex} knex
 */
exports.up = function (knex) {
    return knex.schema.createTable("clientes", function (table) {
        table.increments("id").primary();
        table.string("nm_cliente", 250).notNullable();
        table.string("ds_email", 250).notNullable().unique();
        table.string("ds_telefone", 15).notNullable();
    });
};

/**
 * @param {import("knex").Knex} knex
 */
exports.down = function (knex) {
    return knex.schema.dropTable("clientes");
};