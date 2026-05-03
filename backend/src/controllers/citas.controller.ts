import { RowDataPacket } from "mysql2";
import pool from "../config/database.js";
import {
  actualizarEstadoCita,
  crearCita,
  getCitasCliente,
  getCitasAdmin,
  getCitasBarbero,
} from "../services/citas.service.js";
import { Request, Response } from "express";

// Crea ua nueva cita
export const postCita = async (req: Request, res: Response) => {
  try {
    // Extraemos los datos del body que necesita el sevice para crear la cita
    const { usuario_id, barbero_id, servicio_id, fecha_hora } = req.body;

    // Validamos que el cliente mandó los campos necesarios
    if (!usuario_id || !barbero_id || !servicio_id || !fecha_hora) {
      return res
        .status(400)
        .json({ success: false, error: "Falta campos requeridos" });
    }

    // No permitimos citas en el pasado
    if (new Date(fecha_hora) < new Date()) {
      return res.status(400).json({
        success: false,
        error: "No se puede crear citas en el pasado",
      });
    }

    // Extraemos la hora para validar el horario de la barberia
    const hora = new Date(fecha_hora).getHours();

    if (hora < 10 || hora > 21) {
      return res.status(400).json({
        success: false,
        error: "Fuera del horario de la barberia",
      });
    }

    // Llamos al service que gestiona la lógica del negocio.
    const cita = await crearCita(
      usuario_id,
      barbero_id,
      servicio_id,
      fecha_hora,
    );

    if ("error" in cita) {
      return res
        .status(cita.status)
        .json({ success: false, error: cita.error });
    }

    return res.status(201).json({ success: true, data: cita.cita });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// Devuelve el historial de citas de un usuario.
export const getCitasPorUsuario = async (req: Request, res: Response) => {
  try {
    // Obtenemos el usuario_id de los params de la URL
    const { usuario_id } = req.params;

    // Los params siempre son string, lo convertimos a number para comparar con el token
    const usuarioId = parseInt(usuario_id as string, 10);

    if (req.user?.usuario_id != usuarioId && req.user?.rol !== "admin") {
      return res.status(403).json({
        success: false,
        error: "No tienes permiso para ver las citas.",
      });
    }

    const citasCliente = await getCitasCliente(usuarioId);

    if ("error" in citasCliente) {
      return res
        .status(citasCliente.status)
        .json({ success: false, error: citasCliente.error });
    }

    return res.status(200).json({ success: true, data: citasCliente });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// Actualiza el estado de una cita y manda el email al cliente
export const patchEstadoCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!id || !estado) {
      return res
        .status(400)
        .json({ success: false, error: "Falta campos requeridos" });
    }

    const citaId = parseInt(id as string, 10);

    // Si es cliente solo puede cancelar sus propias citas
    if (req.user?.rol === "cliente") {
      // Solo puede cancelar, no cambiar a otros estados
      if (estado !== "cancelada") {
        return res.status(403).json({
          success: false,
          error: "Solo puedes cancelar tus propias citas",
        });
      }

      // Verificamos que la cita pertenece al cliente
      const [citas] = await pool.execute<RowDataPacket[]>(
        "SELECT usuarios_id, estado FROM citas WHERE id = ?",
        [citaId],
      );

      if (citas.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Cita no encontrada" });
      }

      if (citas[0].usuarios_id !== req.user.usuario_id) {
        return res.status(403).json({
          success: false,
          error: "No puedes cancelar citas de otros usuarios",
        });
      }

      if (citas[0].estado !== "pendiente") {
        return res.status(400).json({
          success: false,
          error: "Solo puedes cancelar citas pendientes",
        });
      }
    }

    const cita = await actualizarEstadoCita(citaId, estado);

    if ("error" in cita) {
      return res
        .status(cita.status)
        .json({ success: false, error: cita.error });
    }

    return res
      .status(200)
      .json({ success: true, data: { mensaje: "Estado actualizado" } });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// Devuelve todas las citas, solo accesible para admin
export const getCitasAdminController = async (req: Request, res: Response) => {
  try {
    const citas = await getCitasAdmin();

    if ("error" in citas) {
      return res
        .status(citas.status)
        .json({ success: false, error: citas.error });
    }

    return res.status(200).json({ success: true, data: citas });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// Devuelve las citas del barbero autenticado, solo puede ver las suyas
export const getCitasBarberoController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Falta campos requeridos" });
    }

    const barberoId = parseInt(id as string, 10);

    if (!req.user?.barbero_id || Number(req.user.barbero_id) !== barberoId) {
      return res.status(403).json({
        success: false,
        error: "No tienes permiso para ver estas citas.",
      });
    }

    const citas = await getCitasBarbero(barberoId);

    if ("error" in citas) {
      return res
        .status(citas.status)
        .json({ success: false, error: citas.error });
    }

    return res.status(200).json({ success: true, data: citas });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};
