import pool from "../config/database.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Tipamos la fila de servicio que necesitamos para obtener la duración
interface ServicioRow extends RowDataPacket {
  id: number;
  duracion: number;
}

// Tipamos la cita completa que devuelve la BD
interface CitaRow extends RowDataPacket {
  id: number;
  fecha_hora: string;
  fecha_hora_fin: string;
  estado: "pendiente" | "confirmada" | "completada" | "cancelada";
  usuarios_id: number;
  barberos_id: number;
  servicios_id: number;
  created_at: Date;
}

// Solo necesitamos el id para saber si existe solapamiento
interface CitasConflicto extends RowDataPacket {
  id: number;
}

// Calculamos fecha_hora_fin en backend con la duración real del servicio.
function calcularFechaFin(fechaHora: string, duracion: number): string {
  const inicio = new Date(fechaHora);

  // Sumamos la duración en milisegundos al inicio
  const fin = new Date(inicio.getTime() + duracion * 60 * 1000);

  // MySQL necesita formato YYYY-MM-DDTHH:mm:ss con dos dígitos en cada parte
  const resultado = `${fin.getFullYear()}-${String(fin.getMonth() + 1).padStart(2, "0")}-${String(fin.getDate()).padStart(2, "0")}T${String(fin.getHours()).padStart(2, "0")}:${String(fin.getMinutes()).padStart(2, "0")}:${String(fin.getSeconds()).padStart(2, "0")}`;

  return resultado;
}

// Comprueba si el barbero ya tiene una cita que solapa con el intervalo dado.
export async function checkDisponibilidad(
  barberos_id: number,
  fechaHora: string,
  fechaHoraFin: string,
): Promise<boolean> {
  // La query usa lógica de intervalos.
  const [citas] = await pool.execute<CitasConflicto[]>(
    "SELECT id FROM citas WHERE barberos_id = ? AND estado NOT IN ('cancelada') AND ? < fecha_hora_fin AND ? > fecha_hora LIMIT 1",
    [barberos_id, fechaHora, fechaHoraFin],
  );

  // Si hay al menos una fila hay conflicto
  const hayConflicto = citas.length > 0;

  return hayConflicto;
}

export async function crearCita(
  usuario_id: number,
  barbero_id: number,
  servicio_id: number,
  fecha_hora: string,
): Promise<{ cita: CitaRow } | { error: string; status: number }> {
  try {
    // Buscamos el servicio para obtener su duración
    const [servicio] = await pool.execute<ServicioRow[]>(
      "SELECT * FROM servicios WHERE id = ?",
      [servicio_id],
    );

    // Si no existe el servicio no podemos continuar
    if (servicio.length === 0) {
      return { error: "El servicio no se ha encontrado.", status: 404 };
    }

    // Calculamos cuando termina la cita sumando la duración al inicio
    const fecha_hora_fin = calcularFechaFin(fecha_hora, servicio[0].duracion);

    // Comprobamos si el barbero ya tiene una cita en ese intervalo
    const hayConflicto = await checkDisponibilidad(
      barbero_id,
      fecha_hora,
      fecha_hora_fin,
    );

    // Si hay solapamiento devolvemos 409, el slot ya está ocupado
    if (hayConflicto) {
      return { error: "No hay disponibilidad a esa hora", status: 409 };
    }

    // Insertamos la cita con estado pendiente por defecto
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO citas (fecha_hora, fecha_hora_fin, estado, usuarios_id, barberos_id, servicios_id) 
      VALUES (?, ?, 'pendiente', ?, ?, ?)`,
      [fecha_hora, fecha_hora_fin, usuario_id, barbero_id, servicio_id],
    );

    // Recuperamos la cita completa para devolverla al cliente
    const [citas] = await pool.execute<CitaRow[]>(
      "SELECT * FROM citas WHERE id = ?",
      [result.insertId],
    );

    return { cita: citas[0] };
  } catch (error) {
    return { error: "Error interno del servidor", status: 500 };
  }
}

export async function getCitasCliente(
  usuario_id: number,
): Promise<RowDataPacket[] | { error: string; status: number }> {
  try {
    /* Devolvemos el historial con JOIN a barberos y servicios para evitar
    que el fronted tenga que hacer llamadas adicionales. */
    const [citas] = await pool.execute<RowDataPacket[]>(
      `SELECT citas.id,
    citas.fecha_hora,
    citas.estado,
    barberos.nombre AS barbero_nombre,
    servicios.nombre AS servicio_nombre,
    servicios.precio,
    servicios.duracion
   FROM citas
   JOIN barberos ON citas.barberos_id = barberos.id
   JOIN servicios ON citas.servicios_id = servicios.id
   WHERE citas.usuarios_id = ?
   ORDER BY citas.fecha_hora DESC`,
      [usuario_id],
    );

    return citas;
  } catch (error) {
    return { error: "Error interno del servidor", status: 500 };
  }
}
