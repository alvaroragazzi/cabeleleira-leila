require("dotenv").config();

/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {
    await knex("servicos").del();

    await knex("servicos").insert([
        { 
            nm_servico: "Corte de cabelo",
            vl_preco: 65,
            vl_duracao: 60,
            ds_caminho_imagem: "servicos_imgs/corteCabelo.png",
        },
        { 
            nm_servico: "Escova",
            vl_preco: 40,
            vl_duracao: 30,
            ds_caminho_imagem: "servicos_imgs/escova.jpeg",
        },
        { 
            nm_servico: "Unhas",
            vl_preco: 60,
            vl_duracao: 45,
            ds_caminho_imagem: "servicos_imgs/unhas.jpg",
        },
    ]);
};