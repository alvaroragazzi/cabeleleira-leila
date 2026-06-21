/**
 * @param {import("knex").Knex} knex
 */
exports.up = function (knex) {
    return knex.schema.createTable("usuarios", function (table) {
        table.increments("id").primary();
        table.string("nm_usuario", 250).notNullable();
        table.boolean("tf_ativo").notNullable();
        table.string("ds_senha", 250).notNullable();
        table.string("ds_caminho_imagem", 255).nullable();
    });
};

/**
 * @param {import("knex").Knex} knex
 */
exports.down = function (knex) {
    return knex.schema.dropTable("usuarios");
};