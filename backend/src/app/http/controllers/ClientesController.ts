import type { Request, Response } from "express";

import Clientes from "../../models/Clientes";

export default class ClientesController {
    public static async create(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            nm_cliente:  "required|string",
            ds_email:    "nullable|string",
            ds_telefone: "required|numeric",
        });

        const cliente = await Clientes.create(data);

        return res.status(201).json(cliente);
    }

    public static async update(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            nm_cliente:  "required|string",
            ds_email:    "nullable|string",
            ds_telefone: "required|numeric",
        });
    
        const cliente = await Clientes.findOrFail(req.params.id);

        await cliente.update(data);

        return res.json(cliente);
    }

    public static async get(req: Request, res: Response): Promise<any> {
        const cliente = await Clientes.findOrFail(req.params.id);

        return res.json(cliente);
    }

    public static async getAll(req: Request, res: Response): Promise<any> {
        const clientes = await Clientes.all();

        return res.json(clientes);
    }
}