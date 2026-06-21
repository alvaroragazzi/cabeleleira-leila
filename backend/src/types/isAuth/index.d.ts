import { ValidationChain } from "express-validator";
import { Request, Response, NextFunction, RequestHandler } from "express";

declare global {
    function isAuth(): RequestHandler;
}