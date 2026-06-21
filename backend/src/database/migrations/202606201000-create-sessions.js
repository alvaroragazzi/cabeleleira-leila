/**
 * @param {import("knex").Knex} knex
 */
exports.up = function (knex) {
    return knex.schema.createTable("sessions", function (table) {
        table.string("token_hash", 255).notNullable().unique();
        table.string("csrf_hash", 255).notNullable();
        table.string("identifier", 255).notNullable();
        table.string("guard", 100).notNullable();
        table.string("ip_address", 45).notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
        table.timestamp("expires_at").notNullable();
        table.timestamp("renewed_at").defaultTo(knex.fn.now()).notNullable();
    });
};

/**
 * @param {import("knex").Knex} knex
 */
exports.down = function (knex) {
    return knex.schema.dropTable("sessions");
};