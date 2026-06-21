import { Model } from "../../core/Eloquent/Model";

import path from "path";
import fs from "fs";

export default class Servicos extends Model {
    static table = "servicos";
    static primaryKey = "id";
    static timestamps = false;

    static appends = ["imagem"];

    getImagemAttribute() {
        const caminho = this.getRawAttribute("ds_caminho_imagem");

        if (!caminho || typeof caminho !== "string") {
            return null;
        }

        const normalizedPath = caminho.replace(/^\/+/, "");

        let filePath: string;

        if (path.isAbsolute(caminho)) {
            filePath = caminho;
        } else if (normalizedPath.startsWith("src/storage/")) {
            filePath = path.resolve(normalizedPath);
        } else if (normalizedPath.startsWith("storage/")) {
            filePath = path.resolve("src", normalizedPath);
        } else {
            filePath = path.resolve("src", "storage", normalizedPath);
        }

        if (!fs.existsSync(filePath)) {
            return null;
        }

        const fileBuffer = fs.readFileSync(filePath);
        const extension = path.extname(filePath).toLowerCase();

        const mimeTypes: Record<string, string> = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
        };

        const mimeType = mimeTypes[extension] ?? "application/octet-stream";

        return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    }
}