import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { SCHEMA_SQL } from "./schema.js";

let databaseInstance;

export function getDatabaseFilePath() {
  return process.env.APP_DB_PATH || path.resolve(process.cwd(), "data", "app.db");
}

export function getDatabase() {
  if (!databaseInstance) {
    const dbPath = getDatabaseFilePath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    databaseInstance = new Database(dbPath);
    databaseInstance.pragma("journal_mode = WAL");
    databaseInstance.exec(SCHEMA_SQL);
  }
  return databaseInstance;
}

export function closeDatabase() {
  if (databaseInstance) {
    databaseInstance.close();
    databaseInstance = undefined;
  }
}
