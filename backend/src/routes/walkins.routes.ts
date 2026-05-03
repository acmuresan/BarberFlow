import { Router } from "express";
import {
  postWalkin,
  patchEstadoWalkin,
  getWalkins,
} from "../controllers/walkins.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "barbero"]),
  getWalkins,
);
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
