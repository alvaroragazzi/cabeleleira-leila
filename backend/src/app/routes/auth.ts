import express from "express";

import AuthController from "../http/controllers/AuthController";

import AuthMiddleware from "../http/middlewares/AuthMiddleware";
import useMiddleware from "../helpers/useMiddleware";

const router = express.Router();

router.post("/login", AuthController.login);
router.get("/isAuth", useMiddleware(AuthMiddleware), AuthController.isAuth);

export default router;