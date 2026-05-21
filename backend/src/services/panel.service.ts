import pool from "../config/database.js";
import { RowDataPacket } from "mysql2";

// Tipamos la fila de barbero
interface BarberoRow extends RowDataPacket {
  id: number;
  nombre: string;
}

// Tipamos la fila de cita
interface CitaPanelRow extends RowDataPacket {
  id: number;
  fecha_hora: string;
  fecha_hora_fin: string;
  estado: "pendiente" | "confirmada" | "completada" | "cancelada";
  nombre_cliente: string;
  nombre_barbero: string;
  servicios_id: number;
}

// Tipamos la fila de walkin
interface WalkinRow extends RowDataPacket {
  id: number;
  nombre: string;
  hora_llegada: Date;
  estado: "esperando" | "atendiendo" | "completado" | "cancelado";
  barberos_id: number;
}

// Tipamos el resultado de COUNT
interface CountRow extends RowDataPacket {
  total: number;
}

// Calcula el tiempo de espera estimado en minutos
export async function calcularTiempoEspera(
  totalPersonas: number,
): Promise<number | null> {
  try {
    const [mediaResult] = await pool.execute<RowDataPacket[]>(
      "SELECT AVG(duracion) as duracion_media FROM servicios",
    );
    const media = mediaResult[0];
    if (media.duracion_media !== null) {
      return totalPersonas * media.duracion_media;
    }
    return null;
  } catch (error) {
    // Devolvemos null para no romper el endpoint
    return null;
  }
}

export async function getPanel(): Promise<
  | {
      citas_activas: number;
      walkins_espera: number;
      total_personas: number;
      tiempo_espera_estimado_min: number | null;
      barberos: BarberoRow[];
      proximas_citas: CitaPanelRow[];
      walkins_cola: WalkinRow[];
    }
  | { error: string; status: number }
> {
  try {
    // Solo citas en curso ahora mismo
    //
    const [
      citasActivasResult,
      walkinsEsperaResult,
      barberosResult,
      proximasCitasResult,
      walkinsColaResult,
    ] = await Promise.all([
      pool.execute<CountRow[]>(
        "SELECT COUNT(*) as total FROM citas WHERE estado IN (?, ?) AND NOW() >= fecha_hora AND NOW() <= fecha_hora_fin",
        ["pendiente", "confirmada"],
      ),
      pool.execute<CountRow[]>(
        "SELECT COUNT(*) as total FROM walkins WHERE DATE(hora_llegada) = CURDATE() AND estado = ?",
        ["esperando"],
      ),
      pool.execute<BarberoRow[]>(
        "SELECT id, nombre FROM barberos WHERE activo = 1",
      ),
      pool.execute<CitaPanelRow[]>(
        "SELECT c.id, c.fecha_hora, c.fecha_hora_fin, c.estado, c.servicios_id, u.nombre AS nombre_cliente, b.nombre AS nombre_barbero FROM citas c JOIN usuarios u ON c.usuarios_id = u.id JOIN barberos b ON c.barberos_id = b.id WHERE c.estado IN (?, ?) AND NOW() >= c.fecha_hora AND NOW() <= c.fecha_hora_fin",
        ["pendiente", "confirmada"],
      ),
      pool.execute<WalkinRow[]>(
        "SELECT id, nombre, hora_llegada, estado, barberos_id FROM walkins WHERE DATE(hora_llegada) = CURDATE() AND estado = ?",
        ["esperando"],
      ),
    ]);

    const citasActivas = citasActivasResult[0];
    const walkinsEspera = walkinsEsperaResult[0];
    const total_personas = citasActivas[0].total + walkinsEspera[0].total;
    const barberos = barberosResult[0];
    const proximasCitas = proximasCitasResult[0];
    const walkinsCola = walkinsColaResult[0];

    return {
      citas_activas: citasActivas[0].total,
      walkins_espera: walkinsEspera[0].total,
      total_personas: citasActivas[0].total + walkinsEspera[0].total,
      tiempo_espera_estimado_min: await calcularTiempoEspera(total_personas),
      barberos: barberos,
      proximas_citas: proximasCitas,
      walkins_cola: walkinsCola,
    };
  } catch (error) {
    return { error: "Error interno del servidor", status: 500 };
  }
}

// Devuelve solo el total de personas y el tiempo estimado
export async function getPanelPublico(): Promise<
  | { total_personas: number; tiempo_espera_estimado_min: number | null }
  | { error: string; status: number }
> {
  try {
    // Mismo criterio que el panel privado, solo citas en curso ahora mismo
    const [citasActivasResult, walkinsEsperaResult] = await Promise.all([
      pool.execute<CountRow[]>(
        "SELECT COUNT(*) as total FROM citas WHERE estado IN (?, ?) AND NOW() >= fecha_hora AND NOW() <= fecha_hora_fin",
        ["pendiente", "confirmada"],
      ),
      pool.execute<CountRow[]>(
        "SELECT COUNT(*) as total FROM walkins WHERE DATE(hora_llegada) = CURDATE() AND estado = ?",
        ["esperando"],
      ),
    ]);

    const citasActivas = citasActivasResult[0];
    const walkinsEspera = walkinsEsperaResult[0];
    const total_personas = citasActivas[0].total + walkinsEspera[0].total;

    return {
      total_personas: citasActivas[0].total + walkinsEspera[0].total,
      tiempo_espera_estimado_min: await calcularTiempoEspera(total_personas),
    };
  } catch (error) {
    return { error: "Error interno del servidor", status: 500 };
  }
}
