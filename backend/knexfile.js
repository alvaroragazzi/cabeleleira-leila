require("dotenv").config();

const path = require("path");

/** @type {import('knex').Knex.Config} */
module.exports = {
    development: {
        client: "pg",
            connection: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ?? 5432,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        },
        migrations: {
            directory: path.resolve("src", "database", "migrations"),
        },
        seeds: {
            directory: path.resolve("src", "database", "seeds"),
        }
    },
};
