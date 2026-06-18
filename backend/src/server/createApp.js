import cors from "cors";
import express from "express";
import { bootstrapRouter } from "../routes/bootstrap.js";
import { filamentsRouter } from "../routes/filaments.js";
import { jobsRouter } from "../routes/jobs.js";
import { appStateRouter } from "../routes/appState.js";
import { settingsRouter } from "../routes/settings.js";
import { getDatabase } from "../db/database.js";

export function createApp() {
  getDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use("/api/bootstrap", bootstrapRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/filaments", filamentsRouter);
  app.use("/api/jobs", jobsRouter);
  app.use("/api/app-state", appStateRouter);

  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ error: "Internal server error." });
  });

  return app;
}
