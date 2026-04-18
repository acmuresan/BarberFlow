import { Request, Response } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../config/database.js";

// Registro un nuevo walk-in en la cola de espera
export const postWalkin = async (req: Request, res: Response) => {
  try {
    // Extraigo nombre y barbero opcional del body
    const { nombre, barberos_id } = req.body;

    if (!nombre) {
      return res
        .status(400)
        .json({ success: false, error: "Falta campos requeridos" });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO walkins (nombre, barberos_id) VALUES (?, ?)",
      [nombre, barberos_id],
    );

    // Inserto el walk-in, hora_llegada y estado los pone la BD por defecto
    res.status(201).json({
      success: true,
      data: { id: result.insertId, nombre, barberos_id },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// Cambio el estado de un walk-in, solo el barbero puede modificarlo
export const patchEstadoWalkin = async (req: Request, res: Response) => {
  try {
    // Extraigo el id del walk-in de la URL y el nuevo estado del body
    const { id } = req.params;
    const { estado } = req.body;

    if (!id || !estado) {
      return res
        .status(400)
        .json({ success: false, error: "Falta campos requeridos" });
    }

    const [walkins] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM walkins WHERE id = ?",
      [id],
    );

    if (walkins.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Walk-in no encotrado" });
    }

    if (walkins[0].barberos_id !== req.user!.barbero_id) {
      return res.status(403).json({
        success: false,
        error: "No tienes permisos para modificar este walk-in",
      });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE walkins SET estado = ? WHERE id = ?",
      [estado, id],
    );

    res.status(200).json({ success: true, data: { id, estado } });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};
