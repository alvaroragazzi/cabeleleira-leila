/**
 * @param {import("knex").Knex} knex
 */
exports.up = function (knex) {
    return knex.schema.createTable("servicos", function (table) {
        table.increments("id").primary();
        table.string("nm_servico", 250).notNullable();
        table.decimal("vl_preco", 10, 2).notNullable();
        table.integer("vl_duracao").notNullable();
        table.boolean("tf_ativo").notNullable().defaultTo(true);
        table.string("ds_caminho_imagem", 255).nullable();
    });
};

/**
 * @param {import("knex").Knex} knex
 */
exports.down = function (knex) {
    return knex.schema.dropTable("servicos");
};