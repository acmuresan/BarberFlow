import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../models/Token.js";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Leo el header de autorización de la peticion
  const authHeader = req.headers.authorization;

  // Compruebo que el header existe y tiene el formato correcto
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Token no proporcionado o formato incorrecto",
    });
  }

  // Extraigo el token eliminando el Bearer del principio
  const token = authHeader.split(" ")[1];
  try {
    // Verifico el token y añado los datos del usuario req para que el controller los pueda usar
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as TokenPayload;
    req.user = {
      usuario_id: payload.usuario_id,
      rol: payload.rol,
      barbero_id: payload.barbero_id,
    };
    next();
  } catch (error) {
    //Si el token es invalido o ha expirado no lo dejmaos pasar
    return res.status(401).json({
      success: false,
      error: "Token invalido o expirado",
    });
  }
};
