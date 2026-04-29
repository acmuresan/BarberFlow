import { Request, Response } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../config/database.js";
import bcrypt from "bcryptjs";

// Devuelve solo barberos activos — endpoint público para el wizard
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

// Crea un nuevo barbero con cuenta de usuario — solo admin
export const postBarbero = async (req: Request, res: Response) => {
  try {
    const { nombre, especialidad, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Falta campos requeridos" });
    }

    // Comprobamos que el email no existe ya en usuarios
    const [usuariosExistentes] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM usuarios WHERE email = ?",
      [email],
    );

    if (usuariosExistentes.length > 0) {
      return res
        .status(409)
        .json({ success: false, error: "El email ya está registrado" });
    }

    // Hasheamos la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creamos el usuario con rol barbero
    const [resultUsuario] = await pool.execute<ResultSetHeader>(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, 'barbero')",
      [nombre, email, hashedPassword],
    );

    const usuarioId = resultUsuario.insertId;

    // Creamos el barbero vinculado al usuario recién creado
    const [resultBarbero] = await pool.execute<ResultSetHeader>(
      "INSERT INTO barberos (nombre, especialidad, usuario_id) VALUES (?, ?, ?)",
      [nombre, especialidad || null, usuarioId],
    );

    res.status(201).json({
      success: true,
      data: {
        id: resultBarbero.insertId,
        nombre,
        especialidad: especialidad || null,
        activo: 1,
        usuario_id: usuarioId,
        email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// Edita nombre y especialidad de un barbero — solo admin
// Edita nombre y especialidad de un barbero — solo admin
// Edita nombre y especialidad de un barbero — solo admin
export const patchBarbero = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, especialidad, email } = req.body;

    if (!nombre) {
      return res
        .status(400)
        .json({ success: false, error: "Falta campos requeridos" });
    }

    const barberoId = parseInt(id as string, 10);

    const [barberos] = await pool.execute<RowDataPacket[]>(
      "SELECT id, usuario_id FROM barberos WHERE id = ?",
      [barberoId],
    );

    if (barberos.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Barbero no encontrado" });
    }

    // Actualizamos el barbero
    await pool.execute<ResultSetHeader>(
      "UPDATE barberos SET nombre = ?, especialidad = ? WHERE id = ?",
      [nombre, especialidad || null, barberoId],
    );

    // Si el barbero tiene usuario vinculado actualizamos nombre y email en usuarios
    const usuarioId = barberos[0].usuario_id;
    if (usuarioId) {
      // Verificamos que el email nuevo no existe ya en otro usuario
      if (email) {
        const [emailExistente] = await pool.execute<RowDataPacket[]>(
          "SELECT id FROM usuarios WHERE email = ? AND id != ?",
          [email, usuarioId],
        );

        if (emailExistente.length > 0) {
          return res.status(409).json({
            success: false,
            error: "El email ya está en uso por otro usuario",
          });
        }

        await pool.execute<ResultSetHeader>(
          "UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?",
          [nombre, email, usuarioId],
        );
      } else {
        await pool.execute<ResultSetHeader>(
          "UPDATE usuarios SET nombre = ? WHERE id = ?",
          [nombre, usuarioId],
        );
      }
    }

    res.status(200).json({
      success: true,
      data: {
        id: barberoId,
        nombre,
        especialidad: especialidad || null,
        email: email || null,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};
// Cambia el campo activo entre 0 y 1 — soft delete/restore — solo admin
export const patchActivoBarbero = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    // Decisión: activo solo puede ser 0 o 1
    if (activo === undefined || (activo !== 0 && activo !== 1)) {
      return res
        .status(400)
        .json({ success: false, error: "El campo activo debe ser 0 o 1" });
    }

    const barberoId = parseInt(id as string, 10);

    const [barberos] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM barberos WHERE id = ?",
      [barberoId],
    );

    if (barberos.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Barbero no encontrado" });
    }

    await pool.execute<ResultSetHeader>(
      "UPDATE barberos SET activo = ? WHERE id = ?",
      [activo, barberoId],
    );

    res.status(200).json({
      success: true,
      data: { id: barberoId, activo },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// Devuelve todos los barberos incluyendo inactivos — solo admin
export const getAllBarberos = async (req: Request, res: Response) => {
  try {
    const [barberos] = await pool.execute<RowDataPacket[]>(
      "SELECT id, nombre, especialidad, activo FROM barberos",
    );
    res.status(200).json({ success: true, data: barberos });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};
