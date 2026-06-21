import type { Request, Response } from "express";

import { randomUUID } from "crypto";

import Servicos from "../../models/Servicos";

import path from "path";
import fs from "fs/promises";

export default class ServicosController {
    public static async create(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            imagem:     "nullable|file|mimes:jpg,jpeg,png",
            nm_servico: "required|string",
            vl_preco:   "required|numeric",
            vl_duracao: "required|numeric",
        });

        const imagem = data.imagem as unknown as Express.Multer.File | undefined;

        if (imagem) {
            const storageDir = path.resolve("src", "storage", "servicos_imgs");

            await fs.mkdir(storageDir, { recursive: true });

            const extension = path.extname(imagem.originalname).toLowerCase();
            const filename = `${randomUUID()}${extension}`;

            const filePath = path.join(storageDir, filename);

            await fs.writeFile(filePath, imagem.buffer);

            (data as any).ds_caminho_imagem = path.join("servicos_imgs", filename);
        }

        const { imagem: _imagem, ...dataWithoutImagem } = data;

        const servico = await Servicos.create(dataWithoutImagem);

        return res.status(201).json(servico);
    }

    public static async update(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            imagem:     "nullable|file|mimes:jpg,jpeg,png",
            nm_servico: "string",
            vl_preco:   "numeric",
            vl_duracao: "numeric",
        });
    
        const servico = await Servicos.findOrFail(req.params.id);

        const imagem = data.imagem as unknown as Express.Multer.File | undefined;

        if (imagem) {
            const storageDir = path.resolve("src", "storage", "servicos_imgs");

            await fs.mkdir(storageDir, { recursive: true });

            const extension = path.extname(imagem.originalname).toLowerCase();
            const filename = `${randomUUID()}${extension}`;

            const filePath = path.join(storageDir, filename);

            await fs.writeFile(filePath, imagem.buffer);

            (data as any).ds_caminho_imagem = path.join("servicos_imgs", filename);
        }

        const { imagem: _imagem, ...dataWithoutImagem } = data;

        await servico.update(dataWithoutImagem);

        return res.json(servico);
    }

    public static async get(req: Request, res: Response): Promise<any> {
        const servico = await Servicos.findOrFail(req.params.id);

        return res.json(servico);
    }

    public static async getAll(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            somente_ativos: "boolean",
        });

        const servicosQuery = Servicos.query();

        if (data.somente_ativos) {
            servicosQuery.where("ativo", true);
        }

        const servicos = await servicosQuery.get();

        return res.json(servicos);
    }
}