import { Rol } from "../models/Usuario.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        usuario_id: number;
        rol: Rol;
        barbero_id: number | null;
      };
    }
  }
}
