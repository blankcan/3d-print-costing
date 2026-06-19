export const SCHEMA_SQL = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS filaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    material_type TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '',
    cost_per_kg_zar REAL NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cell_number TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    delivery_address TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    job_name TEXT NOT NULL DEFAULT '',
    waste_factor_percent REAL NOT NULL DEFAULT 0,
    print_time_hours REAL NOT NULL DEFAULT 0,
    machine_rate_per_hour_zar REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PLANNING',
    paid INTEGER NOT NULL DEFAULT 0,
    delivered INTEGER NOT NULL DEFAULT 0,
    customer_id TEXT,
    image_path TEXT,
    image_file_name TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS job_parts (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    filament_id TEXT,
    part_name TEXT NOT NULL DEFAULT '',
    weight_grams_per_part REAL,
    quantity INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY(filament_id) REFERENCES filaments(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`;
