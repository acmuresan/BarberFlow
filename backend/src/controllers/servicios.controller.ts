import { Request, Response } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../config/database.js";

// Devuelve solo servicios activos — endpoint público para el wizard
export const getServicios = async (req: Request, res: Response) => {
  try {
    const [servicios] = await pool.execute<RowDataPacket[]>(
      "SELECT id, nombre, precio, duracion FROM servicios WHERE activo = 1",
    );
    res.status(200).json({ success: true, data: servicios });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// Crea un nuevo servicio — solo admin
export const postServicio = async (req: Request, res: Response) => {
  try {
    const { nombre, precio, duracion } = req.body;

    if (!nombre || !precio || !duracion) {
      return res
        .status(400)
        .json({ success: false, error: "Falta campos requeridos" });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO servicios (nombre, precio, duracion) VALUES (?, ?, ?)",
      [nombre, precio, duracion],
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, nombre, precio, duracion, activo: 1 },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// Edita un servicio existente — solo admin
export const patchServicio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, precio, duracion } = req.body;

    if (!nombre || !precio || !duracion) {
      return res
        .status(400)
        .json({ success: false, error: "Falta campos requeridos" });
    }

    const servicioId = parseInt(id as string, 10);

    const [servicios] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM servicios WHERE id = ?",
      [servicioId],
    );

    if (servicios.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Servicio no encontrado" });
    }

    await pool.execute<ResultSetHeader>(
      "UPDATE servicios SET nombre = ?, precio = ?, duracion = ? WHERE id = ?",
      [nombre, precio, duracion, servicioId],
    );

    res.status(200).json({
      success: true,
      data: { id: servicioId, nombre, precio, duracion },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// Soft-delete — marca el servicio como inactivo — solo admin
// Decisión: no borramos para preservar el historial de citas asociadas
export const deleteServicio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const servicioId = parseInt(id as string, 10);

    const [servicios] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM servicios WHERE id = ?",
      [servicioId],
    );

    if (servicios.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Servicio no encontrado" });
    }

    await pool.execute<ResultSetHeader>(
      "UPDATE servicios SET activo = 0 WHERE id = ?",
      [servicioId],
    );

    res.status(200).json({
      success: true,
      data: { mensaje: "Servicio desactivado correctamente" },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};
