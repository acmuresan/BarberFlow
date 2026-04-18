import { Router } from "express";
import { getPanelHoy, getPublico } from "../controllers/panel.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// Solo admin y barbero pueden consultar el panel completo
router.get(
  "/hoy",
  authMiddleware,
  roleMiddleware(["admin", "barbero"]),
  getPanelHoy,
);

// Ruta pública — sin autenticación, cualquier visitante puede consultarla
router.get("/publico", getPublico);

export default router;
