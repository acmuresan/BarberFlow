const mysql = require("mysql2");
require("dotenv").config();

// Configuramos la conexión con los datos del .env
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, // Usamos el 3360 que me has dado
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Probamos si la conexión funciona
connection.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a Laragon: " + err.message);
    return;
  }
  console.log("✅ Conectado con éxito a la base de datos MySQL de Laragon");
});

module.exports = connection;
