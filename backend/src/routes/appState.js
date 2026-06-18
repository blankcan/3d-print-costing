import { Router } from "express";
import { importAppState, exportAppState } from "../services/appState.js";

export const appStateRouter = Router();

appStateRouter.get("/export", (_request, response) => {
  response.json(exportAppState());
});

appStateRouter.post("/import", (request, response) => {
  try {
    const state = importAppState(request.body);
    response.json(state);
  } catch (error) {
    response.status(400).json({ error: error.message || "Import failed." });
  }
});
