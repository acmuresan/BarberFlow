import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/database.js";
import router from "./routes/auth.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", router);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Servidor funcionando" });
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Servidor arrancado en http://localhost:${PORT}`);
});
