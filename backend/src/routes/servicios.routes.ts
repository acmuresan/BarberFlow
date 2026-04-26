import { Router } from "express";
import {
  getServicios,
  postServicio,
  patchServicio,
  deleteServicio,
} from "../controllers/servicios.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// Decisión: GET público — el wizard necesita ver servicios sin estar logado
router.get("/", getServicios);

// Solo admin puede crear, editar y desactivar servicios
router.post("/", authMiddleware, roleMiddleware(["admin"]), postServicio);
router.patch("/:id", authMiddleware, roleMiddleware(["admin"]), patchServicio);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteServicio,
);

export default router;
