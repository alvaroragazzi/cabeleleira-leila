import { RequestHandler, Request, Response, NextFunction } from "express";
import BaseMiddleware from "../../core/request/BaseMiddleware";

type MiddlewareClassType<T extends BaseMiddleware> = new (
    req: Request,
    res: Response,
    next: NextFunction,
    ...params: any[]
) => T;

function useMiddleware<T extends BaseMiddleware>(
    MiddlewareClass: MiddlewareClassType<T>,
    ...params: any[]
): RequestHandler {
    return (req, res, next) => {
        const instance = new MiddlewareClass(req, res, next, ...params);
        Promise.resolve(instance.handle()).catch(next);
    };
}

(global as any).useMiddleware = useMiddleware;

export default useMiddleware;