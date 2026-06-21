// src/types/express-serve-static-core/index.d.ts
import { Model } from "../../core/Eloquent/Model";

type InferRuleValue<R extends string> =
    R extends `${string}integer${string}` ? number
    : R extends `${string}numeric${string}` ? number
    : R extends `${string}boolean${string}` ? boolean
    : R extends `${string}array${string}` ? unknown[]
    : string;

type InferValidatedData<T extends Record<string, string>> = {
    [K in keyof T]: InferRuleValue<T[K]>;
};

type AuthContract = {
    guardName: string;
    user(): Promise<Model | null>;
    login(id: string | number): Promise<Model>;
    logout(): Promise<void>;
};

declare module "express-serve-static-core" {
    interface Request {
        auth: AuthContract;
        models?: Record<string, unknown>;
        validate<T extends Record<string, string>>(rules: T): Promise<InferValidatedData<T>>;
    }
}