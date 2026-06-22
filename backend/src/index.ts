import * as dotenv from "dotenv";
dotenv.config();

import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";

if (!process.env.APP_KEY) {
    const key = `base64:${randomBytes(32).toString("base64")}`;

    process.env.APP_KEY = key;

    const envPath = path.resolve(process.cwd(), ".env");

    fs.appendFileSync(envPath, `\n\nAPP_KEY=${key}\n`);
}

import express, { Request, Response, NextFunction } from "express";
import session from "express-session";

import cookieParser from "cookie-parser";
import cors from "cors";
import DB from "./core/Eloquent/DB";

import database from "./config/database";
import useMiddleware from "./app/helpers/useMiddleware";
import AuthHandlerMiddleware from "./core/auth/AuthHandlerMiddleware";

Object.keys(database).forEach(key => DB.addConnection(key, (database as Record<string, any>)[key]));

const app = express();
const port = process.env.APP_PORT || 3000;

const allowedOrigins = [
    "http://127.0.0.1:9000",
    "http://localhost:9000",
];

app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
}));

app.use(session({
    secret: process.env.APP_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 60 * 1000 * 60 * 24 * 1, // 1 dia
        httpOnly: true,
        secure: process.env.APP_ENV === "production",
    }
}));

app.use(cookieParser());
app.use(useMiddleware(AuthHandlerMiddleware));
app.use(express.urlencoded({ extended: true }));
app.disable('etag');

const helpersDirectory = path.join(__dirname, "app/helpers");

fs.readdirSync(helpersDirectory).forEach((file) => {
    if (file.endsWith(".ts") || file.endsWith(".js")) {
        require(path.join(helpersDirectory, file));
    }
});

const routesDirectory = path.join(__dirname, "app/routes");

fs.readdirSync(routesDirectory).forEach((file) => {
    if (file.endsWith(".ts") || file.endsWith(".js")) {
        const route = require(path.join(routesDirectory, file));
        const routePath = `/api/${file.replace(/\.(ts|js)$/, "")}`;

        app.use(routePath, route.default);
    }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err?.status === 422 && err?.errors) {
        res.status(422).json({
            message: "Validation failed",
            errors: err.errors,
        });
        return;
    }

    console.error(err);
    res.status(500).json({
        message: err.message,
        stack: err.stack,
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});