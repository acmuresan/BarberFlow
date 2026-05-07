//traducción de la tabla barbero de MySQL a TS
export interface Barbero {
  id: number;
  nombre: string;
  especialidad: string | null;
  activo: number; //llega como 0 o 1 no como boolean
  usuario_id: number | null; //null si el barbero no tiene cuenta
  created_at: Date;
}

//lo que devuelvo al cliente
export interface BarberoPublico {
  id: number;
  nombre: string;
  especialidad: string;
}
