import express from "express";

import AgendamentosController from "../http/controllers/AgendamentosController";

import ClienteAuthMiddleware from "../http/middlewares/ClienteAuthMiddleware";

import AuthMiddleware from "../http/middlewares/AuthMiddleware";
import useMiddleware from "../helpers/useMiddleware";

const router = express.Router();

//router.use(useMiddleware(AuthMiddleware));

router.get("/agendamentosCliente", useMiddleware(ClienteAuthMiddleware), AgendamentosController.agendamentosCliente);
router.post("/agendamentoCliente", useMiddleware(ClienteAuthMiddleware), AgendamentosController.agendamentoCliente);

router.post("/", AgendamentosController.create);
router.put("/:id", AgendamentosController.update);
router.delete("/:id", AgendamentosController.delete);

export default router;