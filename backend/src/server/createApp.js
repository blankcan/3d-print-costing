import cors from "cors";
import express from "express";
import { getJobImagesDirectoryPath } from "../db/database.js";
import { bootstrapRouter } from "../routes/bootstrap.js";
import { customersRouter } from "../routes/customers.js";
import { filamentsRouter } from "../routes/filaments.js";
import { jobsRouter } from "../routes/jobs.js";
import { settingsRouter } from "../routes/settings.js";
import { getDatabase } from "../db/database.js";

export function createApp() {
  getDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use("/api/job-images", express.static(getJobImagesDirectoryPath(), { fallthrough: true }));

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use("/api/bootstrap", bootstrapRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/customers", customersRouter);
  app.use("/api/filaments", filamentsRouter);
  app.use("/api/jobs", jobsRouter);

  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({
      error: "Internal server error.",
      validation: {
        errors: [],
        rowErrors: {}
      }
    });
  });

  return app;
}
