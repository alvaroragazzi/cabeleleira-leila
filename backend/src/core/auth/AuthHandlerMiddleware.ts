import { Request, Response } from "express";

import BaseMiddleware from "../request/BaseMiddleware";

import { Model } from "../Eloquent/Model";

import auth from "../../config/auth";

import DB from "../Eloquent/DB";

import { createHash, randomBytes, randomInt } from "crypto";

import Crypt from "../misc/Crypt";

import dayjs from "dayjs";

class AuthHandlerMiddleware extends BaseMiddleware {
    public async handle() {
        const requestAuth = new RequestAuth(this.req, this.res);
        this.req.auth = requestAuth;
        
        this.next();
    }
}

class RequestAuth {
    private guard = auth.guards[auth.default as keyof typeof auth.guards];
    public guardName = auth.default;

    constructor(
        private readonly req: Request,
        private readonly res: Response
    ) {}

    async user(): Promise<Model | null> {
        const token = this.req.cookies?.session;
        const csrf = this.req.cookies?.csrf;

        if (!token || !csrf) {
            return null;
        }

        console.log(token);
        console.log(csrf);

        const decryptedToken = Crypt.decrypt(token);

        const session = await DB.connection().table("sessions").where("token_hash", "=", createHash("sha256").update(decryptedToken).digest("hex")).first();

        if (session) {
            if (dayjs(session.expires_at).isBefore(dayjs())) {
                await DB.connection().table("sessions").where("token_hash", "=", createHash("sha256").update(decryptedToken).digest("hex")).delete();
                return null;
            } else if (dayjs(session.expires_at).diff(dayjs(), "seconds") >= 60) {
                const newExpiresAt = dayjs().add(1, "hour").toDate();

                await DB.connection().table("sessions").where("token_hash", "=", createHash("sha256").update(decryptedToken).digest("hex")).update({
                    expires_at: newExpiresAt,
                });

                this.res.cookie("session", token, {
                    httpOnly: true,
                    sameSite: "lax",
                    secure: process.env.NODE_ENV === "production",
                    path: "/",
                    expires: newExpiresAt,
                });

                this.res.cookie("csrf", csrf, {
                    httpOnly: false,
                    sameSite: "lax",
                    secure: process.env.NODE_ENV === "production",
                    path: "/",
                    expires: newExpiresAt,
                });
            }

            const authModel = await this.guard.model.findOrFail(session.identifier);

            return authModel;
        }

        return null;
    }

    async login(id: string | number): Promise<Model> {
        const authModel = await this.guard.model.findOrFail(id);

        const token = randomBytes(randomInt(16, 32)).toString("hex");
        const csrf = randomBytes(randomInt(16, 32)).toString("hex");

        const expires_at = dayjs().add(1, "hour").toDate();

        await DB.connection().table("sessions").insert({
            token_hash: createHash("sha256").update(token).digest("hex"),
            csrf_hash: createHash("sha256").update(csrf).digest("hex"),
            identifier: id,
            ip_address: this.req.ip,
            guard: this.guardName,
            expires_at: expires_at,
        });

        const sessionCrypt = Crypt.encrypt(token);
        const csrfCrypt = Crypt.encrypt(csrf);

        this.res.cookie("session", sessionCrypt, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            expires: expires_at,
        });

        this.res.cookie("csrf", csrfCrypt, {
            httpOnly: false,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            expires: expires_at,
        });

        return authModel;
    }

    async logout(): Promise<void> {
        const token: string = Crypt.decrypt(this.req.cookies?.session);

        this.res.clearCookie("session", { path: "/" });
        this.res.clearCookie("csrf", { path: "/" });

        await DB.connection().table("sessions").where("token_hash", "=", createHash("sha256").update(token).digest("hex")).delete();
    }
}

export default AuthHandlerMiddleware;