import { Router } from "express";
import {
  postWalkin,
  patchEstadoWalkin,
} from "../controllers/walkins.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// Rutas del módulo de walkin
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "barbero"]),
  postWalkin,
);
router.patch(
  "/:id/estado",
  authMiddleware,
  roleMiddleware(["admin", "barbero"]),
  patchEstadoWalkin,
);

export default router;
