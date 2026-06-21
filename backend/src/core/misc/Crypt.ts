import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const algorithm = "aes-256-gcm";

const key = Buffer.from(process.env.APP_KEY!.replace("base64:", ""), "base64");

export default class Crypt {
    static encrypt(text: string): string {
        const iv = randomBytes(12);

        const cipher = createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");

        const tag = cipher.getAuthTag();

        return [
            iv.toString("hex"),
            tag.toString("hex"),
            encrypted
        ].join(":");
    }

    static decrypt(payload: string): string {
        const [ivHex, tagHex, encrypted] = payload.split(":");

        const decipher = createDecipheriv(algorithm, key, Buffer.from(ivHex, "hex"));

        decipher.setAuthTag(Buffer.from(tagHex, "hex"));

        let decrypted = decipher.update(encrypted, "hex", "utf8");

        decrypted += decipher.final("utf8");

        return decrypted;
    }
}