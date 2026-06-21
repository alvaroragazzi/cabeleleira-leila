
/**
 * @param {import("knex").Knex} knex
 */
exports.up = function (knex) {
    return knex.schema.createTable("agendamento_servicos", function (table) {
        table.increments("id").primary();
        table.integer("id_agendamento").unsigned().notNullable().references("id").inTable("agendamentos");
        table.integer("id_servico").unsigned().notNullable().references("id").inTable("servicos");
        // salvando nome e preço para manter histórico mesmo que o serviço seja alterado posteriormente
        table.string("nm_servico", 250).notNullable();
        table.decimal("vl_preco", 10, 2).notNullable();
    });
};

/**
 * @param {import("knex").Knex} knex
 */
exports.down = function (knex) {
    return knex.schema.dropTable("agendamento_servicos");
};