import { Router } from "express";
import { getBarberos } from "../controllers/barberos.controller.js";

const router = Router();

// Decisión: ruta pública
// El wizard necesita mostrar barberos antes del login
router.get("/", getBarberos);

export default router;
