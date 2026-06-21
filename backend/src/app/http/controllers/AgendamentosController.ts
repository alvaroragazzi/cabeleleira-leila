import type { Request, Response } from "express";

import DB from "../../../core/Eloquent/DB";

import Agendamentos from "../../models/Agendamentos";
import AgendamentoServicos from "../../models/AgendamentoServicos";
import Clientes from "../../models/Clientes";
import Servicos from "../../models/Servicos";

export default class AgendamentosController {
    public static async create(req: Request, res: Response): Promise<any> {
        const dados = await req.validate({
            id_usuario: "required|integer",
            id_cliente: "nullable|integer",
            nm_cliente: "nullable|string",
            ds_telefone: "nullable|string",
            ds_email: "nullable|string",
            dh_agendamento: "required|date",
            id_servicos: "required|array",
                "id_servicos.*": "integer",
        });

        await DB.connection().transaction(async (trx) => {
            if (!dados.id_cliente) {
                const clienteExistente = await Clientes.query(trx).where("ds_telefone", dados.ds_telefone).orWhere("ds_email", dados.ds_email).first();

                if (clienteExistente) {
                    dados.id_cliente = clienteExistente.getAttribute("id");
                } else {
                    const cliente = await Clientes.create({
                        nm_cliente: dados.nm_cliente,
                        ds_telefone: dados.ds_telefone,
                        ds_email: dados.ds_email
                    }, trx);

                    dados.id_cliente = cliente.getAttribute("id");
                }
            }

            const id_servicos = dados.id_servicos;

            const {
                nm_cliente: _nm_cliente,
                ds_telefone: _ds_telefone,
                ds_email: _ds_email,
                id_servicos: _id_servicos,
                ...dataWithoutClientInfo
            } = dados;

            const agendamento = await Agendamentos.create(dataWithoutClientInfo, trx);

            for (const id_servico of id_servicos) {
                const servico = await Servicos.findOrFail(id_servico, trx);

                await AgendamentoServicos.create({
                    id_agendamento: agendamento.getAttribute("id"),
                    id_servico,
                    nm_servico: servico.getAttribute("nm_servico"),
                    vl_preco: servico.getAttribute("vl_preco"),
                }, trx);
            }
        });

        return res.status(201).send();
    }

    public static async update(req: Request, res: Response): Promise<any> {
        const dados = await req.validate({
            tf_confirmado: "nullable|boolean",
        });

        const agendamento = await Agendamentos.findOrFail(req.params.id);
        
        await agendamento.update(dados);

        return res.send();
    }
}