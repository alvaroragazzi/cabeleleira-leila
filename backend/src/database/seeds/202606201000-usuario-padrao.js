require("dotenv").config();

const argon2 = require("argon2");

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {
    await knex("usuarios").del();

    const senha = await argon2.hash("123456", {
        type: argon2.argon2id,
    });

    await knex("usuarios").insert([
        { 
            nm_usuario: "Leila",
            ds_senha: senha,
            ds_caminho_imagem: "usuarios_imgs/leila.png",
            tf_ativo: true,
        }
    ]);
};