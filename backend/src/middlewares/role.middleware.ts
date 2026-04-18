import { Request, Response, NextFunction } from "express";
import { Rol } from "../models/Usuario.js";

export const roleMiddleware = (roles: Rol[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Compruebo si el rol usuario está enntre los roles permitidos para esa ruta
    if (roles.includes(req.user!.rol)) {
      return next();
    } else {
      return res.status(403).json({
        success: false,
        error: "No tiene permiso para acceder",
      });
    }
  };
};
