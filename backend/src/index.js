import { closeDatabase } from "./db/database.js";
import { createApp } from "./server/createApp.js";

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || "127.0.0.1";
const app = createApp();
const server = app.listen(PORT, HOST, () => {
  console.log(`Backend listening on http://${HOST}:${PORT}`);
});

let isShuttingDown = false;

function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Received ${signal}; shutting down gracefully.`);
  const forceExitTimer = setTimeout(() => {
    console.error("Timed out waiting for the HTTP server to close.");
    closeDatabase();
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  server.close(() => {
    clearTimeout(forceExitTimer);
    closeDatabase();
    process.exit(0);
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
