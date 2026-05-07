import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import pool from "../config/database.js";

// Un barbero dado de baja no debe aparecer en el wizard de reservas
export const getBarberos = async (req: Request, res: Response) => {
  try {
    const [barberos] = await pool.execute<RowDataPacket[]>(
      "SELECT id, nombre, especialidad FROM barberos WHERE activo = 1",
    );

    res.status(200).json({ success: true, data: barberos });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};
