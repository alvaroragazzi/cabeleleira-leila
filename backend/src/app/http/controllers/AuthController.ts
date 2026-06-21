import type { Request, Response } from "express";

import Usuarios from "../../models/Usuarios";

import argon2 from "argon2";

class AuthController {
    public static async login(req: Request, res: Response): Promise<any> {
        const authHeader = req.headers.authorization;
        const id_cliente = req.headers["x-id-cliente"];

        if (!authHeader || !authHeader.startsWith("Basic ")) {
            return res.sendStatus(400);
        }

        const credentials = Buffer.from(authHeader.split(" ")[1], "base64").toString("ascii");
        const [login, senha] = credentials.split(":");

        const usuario = await Usuarios.where("login", "=", login).where("id_cliente", "=", id_cliente).first();

        // usuário não existe ou senha incorreta
        if (!usuario || !(await argon2.verify(usuario.getAttribute("senha"), senha))) {
            return res.sendStatus(401);
        }

        await req.auth.login(usuario.getAttribute("id_usuario"));

        return res.sendStatus(200);
    }

    public static async logout(req: Request, res: Response): Promise<any> {
        await req.auth.logout();

        return res.sendStatus(200);
    }

    public static async isAuth(req: Request, res: Response): Promise<any> {
        const user = await req.auth.user();

        return res.json(user);
    }
}

export default AuthController;