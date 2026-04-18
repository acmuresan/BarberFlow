import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/database.js";
import routerAuth from "./routes/auth.routes.js";
import routerCitas from "./routes/citas.routes.js";
import routerWalkins from "./routes/walkins.routes.js";
import routerPanel from "./routes/panel.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", routerAuth);
app.use("/api/citas", routerCitas);
app.use("/api/walkins", routerWalkins);
app.use("/api/panel", routerPanel);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Servidor funcionando" });
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Servidor arrancado en http://localhost:${PORT}`);
});
