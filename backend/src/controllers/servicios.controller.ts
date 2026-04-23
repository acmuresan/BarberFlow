import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import pool from "../config/database.js";

// El catálogo completo siempre está disponible para el wizard
export const getServicios = async (req: Request, res: Response) => {
  try {
    const [servicios] = await pool.execute<RowDataPacket[]>(
      "SELECT id, nombre, precio, duracion FROM servicios",
    );

    res.status(200).json({ success: true, data: servicios });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};
