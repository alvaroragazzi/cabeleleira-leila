import express from "express";

import ServicosController from "../http/controllers/ServicosController";

import AuthMiddleware from "../http/middlewares/AuthMiddleware";
import useMiddleware from "../helpers/useMiddleware";

import useMulter from "../helpers/useMulter";

const router = express.Router();

//router.use(useMiddleware(AuthMiddleware));

router.get("/:id", ServicosController.get);
router.get("/", ServicosController.getAll);
router.put("/:id", useMulter.single("imagem"), ServicosController.update);
router.post("/", useMulter.single("imagem"), ServicosController.create);

export default router;