// src/config/database.ts
import mysql from "mysql2/promise";
import dontenv from "dotenv";

dontenv.config({ quiet: true });

// Pool de conexiones: permite atender varias peticiones a la vez
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "barberflow",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  timezone: "+00:00", // fechas en UTC para evitar problemas de zona horaria
});

// Verificamos la conexion al arrancar. Si falla, paramos el servidor
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ Conexión a MySQL establecida correctamente");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Error al conectar con MySQL:", err.message);
    process.exit(1);
  });

export default pool;
