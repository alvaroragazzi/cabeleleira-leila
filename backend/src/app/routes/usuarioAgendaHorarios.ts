import express from "express";

import UsuarioAgendaHorariosController from "../http/controllers/UsuarioAgendaHorariosController";

import AuthMiddleware from "../http/middlewares/AuthMiddleware";
import useMiddleware from "../helpers/useMiddleware";

const router = express.Router();

//router.use(useMiddleware(AuthMiddleware));

router.get("/horariosDisponiveis", UsuarioAgendaHorariosController.horarioDisponiveis);
router.get("/diasDisponiveisMes", UsuarioAgendaHorariosController.diasDisponiveisMes);

router.get("/horariosDia", UsuarioAgendaHorariosController.horariosDia);
router.get("/diasComHorariosMes", UsuarioAgendaHorariosController.diasComHorariosMes);

export default router;