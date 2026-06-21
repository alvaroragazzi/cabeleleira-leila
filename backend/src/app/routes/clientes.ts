import express from "express";

import ClientesController from "../http/controllers/ClientesController";

import AuthMiddleware from "../http/middlewares/AuthMiddleware";
import useMiddleware from "../helpers/useMiddleware";

import useMulter from "../helpers/useMulter";

const router = express.Router();

//router.use(useMiddleware(AuthMiddleware));

router.get("/:id", ClientesController.get);
router.get("/", ClientesController.getAll);
router.put("/:id", ClientesController.update);
router.post("/", ClientesController.create);

export default router;