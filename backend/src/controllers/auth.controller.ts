import pool from "../config/database.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

// Recibo nombre, email y password del body y registro el usuario
export const register = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password } = req.body;

    // Compruebo si el email ya existe en la BD
    const [usuarios] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
    );

    if (usuarios.length > 0) {
      return res
        .status(409)
        .json({ success: false, error: "El email ya está registrado" });
    }

    // Hasheo la password antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserto el usuario nuevo con rol cliente por defecto
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hashedPassword],
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        nombre,
        email,
        rol: "cliente",
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// Recibo email y password del body y logueo al ususario
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Compruebo si el email existe en la BD
    const [usuarios] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
    );

    if (usuarios.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Credenciales incorrectas" });
    }

    const usuario = usuarios[0];

    // Verificar contraseña
    const passwordValid = await bcrypt.compare(password, usuario.password);
    if (!passwordValid) {
      return res
        .status(401)
        .json({ success: false, error: "Credenciales incorrectas" });
    }

    // Busco si el usuario tiene un barbero vinculado activo
    const [barberos] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM barberos WHERE usuario_id = ? AND activo = ?",
      [usuario.id, 1],
    );

    // Si tiene barbero guardo su id, si no null
    const barbero_id = barberos.length > 0 ? barberos[0].id : null;

    // Genero el token JWT con los datos necesarios
    const token = jwt.sign(
      {
        usuario_id: usuario.id,
        rol: usuario.rol,
        email: usuario.email,
        barbero_id,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" },
    );

    res.status(200).json({
      success: true,
      data: { token, rol: usuario.rol, usuario_id: usuario.id, barbero_id },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};
