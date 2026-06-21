import { Request, Response, NextFunction } from "express";
import BaseMiddleware from "../classes/BaseMiddleware";

export {};

declare global {
    type MiddlewareClassType<T extends BaseMiddleware> = new (
        req: Request,
        res: Response,
        next: NextFunction,
        ...params: any[]
    ) => T;

    function useMiddleware<T extends BaseMiddleware>(
        MiddlewareClass: MiddlewareClassType<T>,
        ...params: any[]
    ): (req: Request, res: Response, next: NextFunction) => Promise<void>;
}