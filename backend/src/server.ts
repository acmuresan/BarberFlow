import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import "./config/database.js";
import routerAuth from "./routes/auth.routes.js";
import routerCitas from "./routes/citas.routes.js";
import routerWalkins from "./routes/walkins.routes.js";
import routerPanel from "./routes/panel.routes.js";
import routerBarberos from "./routes/barberos.routes.js";
import routerServicios from "./routes/servicios.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", routerAuth);
app.use("/api/citas", routerCitas);
app.use("/api/walkins", routerWalkins);
app.use("/api/panel", routerPanel);
app.use("/api/barberos", routerBarberos);
app.use("/api/servicios", routerServicios);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Servidor funcionando" });
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Servidor arrancado en http://localhost:${PORT}`);
});
