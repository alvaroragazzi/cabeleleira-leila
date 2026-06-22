import type { Request, Response } from "express";

import Usuarios from "../../models/Usuarios";
import Clientes from "../../models/Clientes";

import argon2 from "argon2";

class AuthController {
    public static async loginUsuario(req: Request, res: Response): Promise<any> {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Basic ")) {
            return res.sendStatus(400);
        }

        const credentials = Buffer.from(authHeader.split(" ")[1], "base64").toString("ascii");
        const [id, ds_senha] = credentials.split(":");

        const usuario = await Usuarios.where("id", "=", id).first();

        // usuário não existe ou senha incorreta
        if (!usuario || !(await argon2.verify(usuario.getAttribute("ds_senha"), ds_senha))) {
            return res.sendStatus(401);
        }

        await req.auth.login(usuario.getAttribute("id"));

        return res.sendStatus(200);
    }

    public static async logoutUsuario(req: Request, res: Response): Promise<any> {
        await req.auth.logout();

        return res.sendStatus(200);
    }

    public static async isUsuarioLogado(req: Request, res: Response): Promise<any> {
        const user = await req.auth.user();

        user?.setAttribute("ds_senha", undefined);

        return res.json(user);
    }

    public static async loginCliente(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            nm_cliente:  "nullable|string",
            ds_email:    "nullable|string",
            ds_telefone: "required|numeric",
        });
        
        const cliente = await Clientes.query().where("ds_telefone", data.ds_telefone).first();

        if (!data.nm_cliente && !data.ds_email) {
            if (!cliente) {
                return res.status(404).json({ message: "Cliente não encontrado" });
            }
        } else {
            if (!cliente) {
                const novoCliente = await Clientes.create(data);

                req.session.id_cliente = novoCliente.getAttribute("id");

                return res.status(201).json(novoCliente);
            }
        }

        req.session.id_cliente = cliente.getAttribute("id");

        return res.json(cliente);
    }

    public static async logoutCliente(req: Request, res: Response): Promise<any> {
        req.session.id_cliente = null;

        return res.sendStatus(200);
    }

    public static async isClienteLogado(req: Request, res: Response): Promise<any> {
        const cliente = await Clientes.findOrFail(req.session.id_cliente);

        return res.json(cliente);
    }
}

export default AuthController;