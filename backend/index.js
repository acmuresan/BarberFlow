// 1. Importamos las librerías necesarias
const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Carga las variables del .env

// 2. Importamos la conexión a la base de datos que creamos en db.js
const db = require("./db");

// 3. Inicializamos la aplicación Express
const app = express();

// 4. Middlewares (Configuraciones de seguridad y datos)
app.use(cors()); // Permite que el frontend se conecte sin bloqueos
app.use(express.json()); // Permite que el servidor entienda datos en formato JSON

// 5. Ruta de prueba (para saber que el servidor responde)
app.get("/", (req, res) => {
  res.send("🚀 Servidor de BarberFlow funcionando y conectado a Laragon");
});

// 6. Ponemos al servidor a escuchar en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`💻 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`===========================================`);
});
