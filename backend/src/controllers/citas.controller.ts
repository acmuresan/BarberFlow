import { crearCita, getCitasCliente } from "../services/citas.service.js";
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
