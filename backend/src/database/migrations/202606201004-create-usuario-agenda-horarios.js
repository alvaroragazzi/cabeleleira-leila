/**
 * @param {import("knex").Knex} knex
 */
exports.up = function (knex) {
    return knex.schema.createTable("usuario_agenda_horarios", function (table) {
        table.increments("id").primary();
        table.integer("id_usuario").unsigned().notNullable().references("id").inTable("usuarios");
        table.integer("vl_dia_semana").notNullable();
        table.time("hr_inicio").notNullable();
        table.time("hr_fim").notNullable();
    });
};

/**
 * @param {import("knex").Knex} knex
 */
exports.down = function (knex) {
    return knex.schema.dropTable("usuario_agenda_horarios");
};