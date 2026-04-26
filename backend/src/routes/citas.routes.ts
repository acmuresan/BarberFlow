import { Router } from "express";
import {
  postCita,
  getCitasPorUsuario,
  patchEstadoCita,
  getCitasAdminController,
  getCitasBarberoController,
} from "../controllers/citas.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// Rutas del módulo de citas. Todas requieren autenticación JWT
router.post("/", authMiddleware, postCita);
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  getCitasAdminController,
);
router.get(
  "/barbero/:id",
  authMiddleware,
  roleMiddleware(["barbero"]),
  getCitasBarberoController,
);
router.get("/:usuario_id", authMiddleware, getCitasPorUsuario);
router.patch(
  "/:id/estado",
  authMiddleware,
  roleMiddleware(["admin", "barbero", "cliente"]),
  patchEstadoCita,
);

export default router;
