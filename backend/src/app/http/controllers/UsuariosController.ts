import type { Request, Response } from "express";

import Usuarios from "../../models/Usuarios";

import argon2 from "argon2";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

export default class UsuariosController {
    public static async create(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            nm_usuario: "required|string",
            senha:      "required|string",
            imagem:     "nullable|file|mimes:jpg,jpeg,png",
        });

        data.senha = await argon2.hash(data.senha, {
            type: argon2.argon2id,
        });

        const imagem = data.imagem as unknown as Express.Multer.File | undefined;
        
        if (imagem) {
            const storageDir = path.resolve("src", "storage", "usuarios_imgs");

            await fs.mkdir(storageDir, { recursive: true });

            const extension = path.extname(imagem.originalname).toLowerCase();
            const filename = `${randomUUID()}${extension}`;

            const filePath = path.join(storageDir, filename);

            await fs.writeFile(filePath, imagem.buffer);

            (data as any).ds_caminho_imagem = path.join("usuarios_imgs", filename);
        }

        const { imagem: _imagem, ...dataWithoutImagem } = data;

        const usuario = await Usuarios.create(dataWithoutImagem);

        return res.status(201).json(usuario);
    }

    public static async update(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            nm_usuario: "string",
            senha:      "string",
            imagem:     "nullable|file|mimes:jpg,jpeg,png",
        });

        if (data.senha) {
            data.senha = await argon2.hash(data.senha, {
                type: argon2.argon2id,
            });
        }

        const imagem = data.imagem as unknown as Express.Multer.File | undefined;
        
        if (imagem) {
            const storageDir = path.resolve("src", "storage", "usuarios_imgs");

            await fs.mkdir(storageDir, { recursive: true });

            const extension = path.extname(imagem.originalname).toLowerCase();
            const filename = `${randomUUID()}${extension}`;

            const filePath = path.join(storageDir, filename);

            await fs.writeFile(filePath, imagem.buffer);

            (data as any).ds_caminho_imagem = path.join("usuarios_imgs", filename);
        }

        const { imagem: _imagem, ...dataWithoutImagem } = data;

        const usuario = await Usuarios.findOrFail(req.params.id);

        await usuario.update(dataWithoutImagem);

        return res.json(usuario);
    }

    public static async get(req: Request, res: Response): Promise<any> {
        const usuario = await Usuarios.findOrFail(req.params.id);

        usuario.setAttribute("ds_senha", undefined);

        return res.json(usuario);
    }

    public static async getAll(req: Request, res: Response): Promise<any> {
        const usuarios = await Usuarios.query().select("id", "nm_usuario", "tf_ativo", "ds_caminho_imagem").get();

        return res.json(usuarios);
    }
}