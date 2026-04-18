import { Router } from "express";
import { getServicios } from "../controllers/servicios.controller.js";

const router = Router();

// Decisión: ruta pública, no requiere JWT
// El catálogo de servicios es información pública de la barbería
router.get("/", getServicios);

export default router;
