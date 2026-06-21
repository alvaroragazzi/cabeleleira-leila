import express from "express";

import AgendamentosController from "../http/controllers/AgendamentosController";

import AuthMiddleware from "../http/middlewares/AuthMiddleware";
import useMiddleware from "../helpers/useMiddleware";

import useMulter from "../helpers/useMulter";

const router = express.Router();

//router.use(useMiddleware(AuthMiddleware));

router.post("/", AgendamentosController.create);
router.put("/:id", AgendamentosController.update);

export default router;