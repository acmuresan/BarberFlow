import { Request, Response, NextFunction } from "express";
import { Rol } from "../models/Usuario.js";

export const roleMiddleware = (rol: Rol) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Compruebo si el rol del usuario coincide con el rol requerido
    if (req.user?.rol === rol) {
      return next();
    } else {
      return res.status(403).json({
        success: false,
        error: "No tiene permiso para acceder",
      });
    }
  };
};
