// los tres roles posibles del sistema
// lo definimos una vez aquí y lo reutilizamos donde haga falta
export type Rol = "admin" | "barbero" | "cliente";

//traduccion de la tabla de ususario de MySQL a TS
// asi ts sabe que campos me devuelver la query
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
  telefono: string | null; // en la base de datos es DEFAULT NULL
  rol: "admin" | "barberos" | "cliente";
  created_at: Date;
}

//lo que devuelvo al cliente en la respuesta JSON
export interface UsuarioPublico {
  id: number;
  nombre: string;
  email: string;
  rol: Rol; //si cambias el rol solo lo tocamos arriba
}
