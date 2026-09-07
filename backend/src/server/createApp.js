import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getJobImagesDirectoryPath } from "../db/database.js";
import { bootstrapRouter } from "../routes/bootstrap.js";
import { customersRouter } from "../routes/customers.js";
import { filamentsRouter } from "../routes/filaments.js";
import { jobsRouter } from "../routes/jobs.js";
import { settingsRouter } from "../routes/settings.js";
import { getDatabase } from "../db/database.js";

const DEFAULT_FRONTEND_DIRECTORY = fileURLToPath(new URL("../../../frontend/dist", import.meta.url));

function getCorsOrigins() {
  if (process.env.CORS_ORIGINS === undefined) {
    return ["http://localhost:5173"];
  }

  return process.env.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function addSecurityHeaders(_request, response, next) {
  response.set({
    "Content-Security-Policy": "default-src 'self'; base-uri 'self'; frame-ancestors 'self'; object-src 'none'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self' data:",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    "Referrer-Policy": "same-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN"
  });
  next();
}

export function createApp({ frontendDirectory = process.env.APP_FRONTEND_DIR || DEFAULT_FRONTEND_DIRECTORY } = {}) {
  getDatabase();

  const app = express();
  const corsOrigins = getCorsOrigins();
  if (corsOrigins.length) {
    app.use(cors({ origin: corsOrigins }));
  }

  app.use(addSecurityHeaders);
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

  if (fs.existsSync(frontendDirectory)) {
    app.use(express.static(frontendDirectory, { index: false, maxAge: "1h" }));
    app.get("/{*path}", (request, response, next) => {
      if (request.path.startsWith("/api/")) {
        next();
        return;
      }

      response.sendFile(path.join(frontendDirectory, "index.html"));
    });
  }

  app.use((request, response) => {
    if (request.path.startsWith("/api/")) {
      response.status(404).json({ error: "API route not found." });
      return;
    }

    response.status(404).send("Not found.");
  });

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
