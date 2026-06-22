import express from "express";

import UsuarioAgendaHorariosController from "../http/controllers/UsuarioAgendaHorariosController";

import AuthMiddleware from "../http/middlewares/AuthMiddleware";
import useMiddleware from "../helpers/useMiddleware";

const router = express.Router();

router.get("/horariosDisponiveis", UsuarioAgendaHorariosController.horarioDisponiveis);
router.get("/diasDisponiveisMes", UsuarioAgendaHorariosController.diasDisponiveisMes);

router.get("/horariosDia", useMiddleware(AuthMiddleware), UsuarioAgendaHorariosController.horariosDia);
router.get("/diasComHorariosMes", useMiddleware(AuthMiddleware), UsuarioAgendaHorariosController.diasComHorariosMes);

router.get("/", useMiddleware(AuthMiddleware), UsuarioAgendaHorariosController.getAll);
router.post("/", useMiddleware(AuthMiddleware), UsuarioAgendaHorariosController.create);

export default router;