import { Rol } from "./Usuario.js";

export interface TokenPayload {
  usuario_id: number;
  rol: Rol;
  email: string;
  barbero_id: number | null;
}
