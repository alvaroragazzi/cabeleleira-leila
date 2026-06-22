import express from "express";

import ServicosController from "../http/controllers/ServicosController";

import AuthMiddleware from "../http/middlewares/AuthMiddleware";
import useMiddleware from "../helpers/useMiddleware";

import useMulter from "../helpers/useMulter";

const router = express.Router();

router.get("/:id", useMiddleware(AuthMiddleware), ServicosController.get);
router.get("/", ServicosController.getAll);
router.put("/:id", useMiddleware(AuthMiddleware), useMulter.single("imagem"), ServicosController.update);
router.post("/", useMiddleware(AuthMiddleware), useMulter.single("imagem"), ServicosController.create);

export default router;