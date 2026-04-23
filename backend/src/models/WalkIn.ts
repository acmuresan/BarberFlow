export interface Walkin {
  id: number;
  nombre: string;
  barberos_id: number | null;
  hora_llegada: Date;
  estado: "esperando" | "atendiendo" | "completado" | "cancelado";
  created_at: Date;
}
