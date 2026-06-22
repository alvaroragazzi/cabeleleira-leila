import express from "express";

import AuthController from "../http/controllers/AuthController";

import ClienteAuthMiddleware from "../http/middlewares/ClienteAuthMiddleware";
import AuthMiddleware from "../http/middlewares/AuthMiddleware";
import useMiddleware from "../helpers/useMiddleware";

const router = express.Router();

router.post("/loginUsuario", AuthController.loginUsuario);
router.post("/logoutUsuario", useMiddleware(AuthMiddleware), AuthController.logoutUsuario);
router.get("/isUsuarioLogado", useMiddleware(AuthMiddleware), AuthController.isUsuarioLogado);

router.post("/loginCliente", AuthController.loginCliente);
router.post("/logoutCliente", useMiddleware(ClienteAuthMiddleware), AuthController.logoutCliente);
router.get("/isClienteLogado", useMiddleware(ClienteAuthMiddleware), AuthController.isClienteLogado);

export default router;