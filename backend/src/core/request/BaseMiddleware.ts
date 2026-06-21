import { Request, Response, NextFunction } from "express";

abstract class BaseMiddleware {
    constructor(
        protected readonly req: Request,
        protected readonly res: Response,
        protected readonly next: NextFunction
    ) {}

    abstract handle(): void | Promise<any>;
}

export default BaseMiddleware;