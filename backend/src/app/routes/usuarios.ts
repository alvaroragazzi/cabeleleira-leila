import express from "express";

import UsuariosController from "../http/controllers/UsuariosController";

import AuthMiddleware from "../http/middlewares/AuthMiddleware";
import useMiddleware from "../helpers/useMiddleware";

import useMulter from "../helpers/useMulter";

const router = express.Router();

router.get("/:id", useMiddleware(AuthMiddleware), UsuariosController.get);
router.get("/",  UsuariosController.getAll);
router.put("/:id", useMiddleware(AuthMiddleware), useMulter.single("imagem"), UsuariosController.update);
router.post("/", useMiddleware(AuthMiddleware), useMulter.single("imagem"), UsuariosController.create);

export default router;