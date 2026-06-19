import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { SCHEMA_SQL } from "./schema.js";

let databaseInstance;

function ensureJobMetadataColumns(database) {
  const columns = database.prepare("PRAGMA table_info(jobs)").all();
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has("status")) {
    database.exec("ALTER TABLE jobs ADD COLUMN status TEXT NOT NULL DEFAULT 'PLANNING'");
  }
  if (!columnNames.has("paid")) {
    database.exec("ALTER TABLE jobs ADD COLUMN paid INTEGER NOT NULL DEFAULT 0");
  }
  if (!columnNames.has("delivered")) {
    database.exec("ALTER TABLE jobs ADD COLUMN delivered INTEGER NOT NULL DEFAULT 0");
  }
  if (!columnNames.has("image_path")) {
    database.exec("ALTER TABLE jobs ADD COLUMN image_path TEXT");
  }
  if (!columnNames.has("image_file_name")) {
    database.exec("ALTER TABLE jobs ADD COLUMN image_file_name TEXT");
  }
  if (!columnNames.has("customer_id")) {
    database.exec("ALTER TABLE jobs ADD COLUMN customer_id TEXT");
  }

  database.exec(`
    UPDATE jobs
    SET
      status = COALESCE(status, 'PLANNING'),
      paid = COALESCE(paid, 0),
      delivered = COALESCE(delivered, 0)
  `);
}

export function getDatabaseFilePath() {
  return process.env.APP_DB_PATH || path.resolve(process.cwd(), "data", "app.db");
}

export function getDataDirectoryPath() {
  return path.dirname(getDatabaseFilePath());
}

export function getJobImagesDirectoryPath() {
  return path.join(getDataDirectoryPath(), "job-images");
}

export function getDatabase() {
  if (!databaseInstance) {
    const dbPath = getDatabaseFilePath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.mkdirSync(getJobImagesDirectoryPath(), { recursive: true });
    databaseInstance = new Database(dbPath);
    databaseInstance.pragma("journal_mode = WAL");
    databaseInstance.exec(SCHEMA_SQL);
    ensureJobMetadataColumns(databaseInstance);
  }
  return databaseInstance;
}

export function closeDatabase() {
  if (databaseInstance) {
    databaseInstance.close();
    databaseInstance = undefined;
  }
}
