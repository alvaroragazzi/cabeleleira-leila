import express from "express";

import AgendamentosController from "../http/controllers/AgendamentosController";

import ClienteAuthMiddleware from "../http/middlewares/ClienteAuthMiddleware";
import AuthMiddleware from "../http/middlewares/AuthMiddleware";
import ValidaClienteAgendamento from "../http/middlewares/ValidaClienteAgendamento";

import useMiddleware from "../helpers/useMiddleware";

const router = express.Router();

router.get("/agendamentosCliente", useMiddleware(ClienteAuthMiddleware), AgendamentosController.agendamentosCliente);
router.post("/agendamentoCliente", useMiddleware(ClienteAuthMiddleware), AgendamentosController.agendamentoCliente);

router.post("/", useMiddleware(AuthMiddleware), AgendamentosController.create);

router.put("/:id", useMiddleware(ValidaClienteAgendamento),  AgendamentosController.update);
router.delete("/:id", useMiddleware(ValidaClienteAgendamento), AgendamentosController.delete);

export default router;