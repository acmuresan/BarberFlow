import { Request, Response } from "express";
import { getPanel, getPanelPublico } from "../services/panel.service.js";

// Devuelve el resumen operativo en vivo de la barbería para hoy
export const getPanelHoy = async (req: Request, res: Response) => {
  try {
    const panel = await getPanel();

    if ("error" in panel) {
      return res
        .status(panel.status)
        .json({ success: false, error: panel.error });
    }

    return res.status(200).json({ success: true, data: panel });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};

// Devuelve total de personas y tiempo estimado — accesible sin JWT
export const getPublico = async (req: Request, res: Response) => {
  try {
    const panel = await getPanelPublico();

    if ("error" in panel) {
      return res
        .status(panel.status)
        .json({ success: false, error: panel.error });
    }

    return res.status(200).json({ success: true, data: panel });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
};
