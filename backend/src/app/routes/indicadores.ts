import express from "express";

import IndicadoresController from "../http/controllers/IndicadoresController";

import AuthMiddleware from "../http/middlewares/AuthMiddleware";
import useMiddleware from "../helpers/useMiddleware";

const router = express.Router();

router.use(useMiddleware(AuthMiddleware));

router.get("/", IndicadoresController.getAll);

export default router;