import { Router } from "express";
import {
  postCita,
  getCitasPorUsuario,
} from "../controllers/citas.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas del módulo de citas. Todas requieren autenticación JWT
router.post("/", authMiddleware, postCita);
router.get("/:usuario_id", authMiddleware, getCitasPorUsuario);

export default router;
