import { Router } from "express";
import {
  getBarberos,
  postBarbero,
  patchBarbero,
  patchActivoBarbero,
  getAllBarberos,
} from "../controllers/barberos.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// Decisión: GET público — el wizard necesita ver barberos sin estar logado
router.get("/", getBarberos);

// Solo admin puede crear, editar y dar de baja/alta barberos
router.get(
  "/admin/todos",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllBarberos,
);
router.post("/", authMiddleware, roleMiddleware(["admin"]), postBarbero);
router.patch("/:id", authMiddleware, roleMiddleware(["admin"]), patchBarbero);
router.patch(
  "/:id/activo",
  authMiddleware,
  roleMiddleware(["admin"]),
  patchActivoBarbero,
);

export default router;
