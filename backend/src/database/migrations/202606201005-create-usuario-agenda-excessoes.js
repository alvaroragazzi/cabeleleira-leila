/**
 * @param {import("knex").Knex} knex
 */
exports.up = function (knex) {
    return knex.schema.createTable("usuario_agenda_excessoes", function (table) {
        table.increments("id").primary();
        table.integer("id_usuario").unsigned().notNullable().references("id").inTable("usuarios");
        table.datetime("dh_inicio").notNullable();
        table.datetime("dh_fim").notNullable();
    });
};

/**
 * @param {import("knex").Knex} knex
 */
exports.down = function (knex) {
    return knex.schema.dropTable("usuario_agenda_excessoes");
};