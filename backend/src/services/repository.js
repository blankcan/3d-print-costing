import { getDatabase } from "../db/database.js";
import { createId, nowIso } from "./ids.js";
import { mapFilamentRow, mapJobRow } from "./serializers.js";

const DEFAULT_SETTINGS = {
  defaultMachineRatePerHourZar: 0,
  defaultWasteFactorPercent: 0
};

function db() {
  return getDatabase();
}

export function getSettings() {
  const rows = db()
    .prepare("SELECT key, value FROM app_meta WHERE key IN ('default_machine_rate_per_hour_zar', 'default_waste_factor_percent')")
    .all();

  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if (row.key === "default_machine_rate_per_hour_zar") {
      settings.defaultMachineRatePerHourZar = Number(row.value || 0);
    }
    if (row.key === "default_waste_factor_percent") {
      settings.defaultWasteFactorPercent = Number(row.value || 0);
    }
  }

  return settings;
}

export function saveSettings(input) {
  const settings = {
    defaultMachineRatePerHourZar: Number(input.defaultMachineRatePerHourZar ?? 0),
    defaultWasteFactorPercent: Number(input.defaultWasteFactorPercent ?? 0)
  };

  const upsert = db().prepare(`
    INSERT INTO app_meta (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);

  const transaction = db().transaction(() => {
    upsert.run("default_machine_rate_per_hour_zar", String(settings.defaultMachineRatePerHourZar));
    upsert.run("default_waste_factor_percent", String(settings.defaultWasteFactorPercent));
  });

  transaction();
  return getSettings();
}

export function listFilaments() {
  return db()
    .prepare("SELECT * FROM filaments ORDER BY updated_at DESC, name COLLATE NOCASE ASC")
    .all()
    .map(mapFilamentRow);
}

export function getFilamentById(id) {
  const row = db().prepare("SELECT * FROM filaments WHERE id = ?").get(id);
  return row ? mapFilamentRow(row) : null;
}

export function saveFilament(input) {
  const timestamp = nowIso();
  const filament = {
    id: input.id || createId("fil"),
    name: String(input.name || "").trim(),
    materialType: String(input.materialType || "").trim(),
    brand: String(input.brand || "").trim(),
    color: String(input.color || "").trim(),
    costPerKgZar: Number(input.costPerKgZar),
    notes: String(input.notes || ""),
    createdAt: input.createdAt || timestamp,
    updatedAt: timestamp
  };

  db().prepare(`
    INSERT INTO filaments (id, name, material_type, brand, color, cost_per_kg_zar, notes, created_at, updated_at)
    VALUES (@id, @name, @materialType, @brand, @color, @costPerKgZar, @notes, @createdAt, @updatedAt)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      material_type = excluded.material_type,
      brand = excluded.brand,
      color = excluded.color,
      cost_per_kg_zar = excluded.cost_per_kg_zar,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `).run(filament);

  return getFilamentById(filament.id);
}

export function deleteFilament(id) {
  db().prepare("DELETE FROM filaments WHERE id = ?").run(id);
}

export function listJobs() {
  const rows = db()
    .prepare("SELECT * FROM jobs ORDER BY updated_at DESC, created_at DESC")
    .all();

  return rows.map((row) => {
    const partsCount = db().prepare("SELECT COUNT(*) AS count FROM job_parts WHERE job_id = ?").get(row.id).count;
    return {
      id: row.id,
      jobName: row.job_name,
      wasteFactorPercent: row.waste_factor_percent,
      printTimeHours: row.print_time_hours,
      machineRatePerHourZar: row.machine_rate_per_hour_zar,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      partsCount
    };
  });
}

export function getJobById(id) {
  const jobRow = db().prepare("SELECT * FROM jobs WHERE id = ?").get(id);
  if (!jobRow) {
    return null;
  }
  const partRows = db().prepare("SELECT * FROM job_parts WHERE job_id = ? ORDER BY created_at ASC").all(id);
  return mapJobRow(jobRow, partRows);
}

export function getLastOpenJobId() {
  const row = db().prepare("SELECT value FROM app_meta WHERE key = 'last_open_job_id'").get();
  return row?.value || null;
}

export function setLastOpenJobId(jobId) {
  db().prepare(`
    INSERT INTO app_meta (key, value) VALUES ('last_open_job_id', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(jobId || null);
}

export function getActiveJob() {
  const lastOpenJobId = getLastOpenJobId();
  if (lastOpenJobId) {
    const active = getJobById(lastOpenJobId);
    if (active) {
      return active;
    }
  }

  const recent = db().prepare("SELECT id FROM jobs ORDER BY updated_at DESC, created_at DESC LIMIT 1").get();
  if (recent) {
    setLastOpenJobId(recent.id);
    return getJobById(recent.id);
  }
  return null;
}

export function saveJob(input) {
  const timestamp = nowIso();
  const job = {
    id: input.id || createId("job"),
    jobName: String(input.jobName || "").trim(),
    wasteFactorPercent: Number(input.wasteFactorPercent ?? 0),
    printTimeHours: Number(input.printTimeHours ?? 0),
    machineRatePerHourZar: Number(input.machineRatePerHourZar ?? 0),
    createdAt: input.createdAt || timestamp,
    updatedAt: timestamp
  };

  const transaction = db().transaction(() => {
    db().prepare(`
      INSERT INTO jobs (id, job_name, waste_factor_percent, print_time_hours, machine_rate_per_hour_zar, created_at, updated_at)
      VALUES (@id, @jobName, @wasteFactorPercent, @printTimeHours, @machineRatePerHourZar, @createdAt, @updatedAt)
      ON CONFLICT(id) DO UPDATE SET
        job_name = excluded.job_name,
        waste_factor_percent = excluded.waste_factor_percent,
        print_time_hours = excluded.print_time_hours,
        machine_rate_per_hour_zar = excluded.machine_rate_per_hour_zar,
        updated_at = excluded.updated_at
    `).run(job);

    db().prepare("DELETE FROM job_parts WHERE job_id = ?").run(job.id);

    const insertPart = db().prepare(`
      INSERT INTO job_parts (id, job_id, filament_id, part_name, weight_grams_per_part, quantity, created_at, updated_at)
      VALUES (@id, @jobId, @filamentId, @partName, @weightGramsPerPart, @quantity, @createdAt, @updatedAt)
    `);

    for (const inputPart of input.parts || []) {
      const partTimestamp = nowIso();
      insertPart.run({
        id: inputPart.id || createId("part"),
        jobId: job.id,
        filamentId: inputPart.filamentId || null,
        partName: String(inputPart.partName || "").trim(),
        weightGramsPerPart:
          inputPart.weightGramsPerPart === "" || inputPart.weightGramsPerPart === null || inputPart.weightGramsPerPart === undefined
            ? null
            : Number(inputPart.weightGramsPerPart),
        quantity:
          inputPart.quantity === "" || inputPart.quantity === null || inputPart.quantity === undefined
            ? null
            : Number(inputPart.quantity),
        createdAt: inputPart.createdAt || partTimestamp,
        updatedAt: partTimestamp
      });
    }

    setLastOpenJobId(job.id);
  });

  transaction();
  return getJobById(job.id);
}

export function createEmptyJob() {
  const settings = getSettings();
  return saveJob({
    jobName: "",
    wasteFactorPercent: settings.defaultWasteFactorPercent,
    printTimeHours: 0,
    machineRatePerHourZar: settings.defaultMachineRatePerHourZar,
    parts: [
      {
        id: createId("part"),
        partName: "",
        filamentId: "",
        weightGramsPerPart: "",
        quantity: 1,
        createdAt: nowIso()
      }
    ]
  });
}

export function deleteJob(jobId) {
  const transaction = db().transaction(() => {
    db().prepare("DELETE FROM jobs WHERE id = ?").run(jobId);
    const lastOpenJobId = getLastOpenJobId();
    if (lastOpenJobId === jobId) {
      const recent = db().prepare("SELECT id FROM jobs ORDER BY updated_at DESC, created_at DESC LIMIT 1").get();
      setLastOpenJobId(recent?.id || null);
    }
  });

  transaction();
}

export function replaceAllData({ filaments, jobs, lastOpenJobId, settings }) {
  const transaction = db().transaction(() => {
    db().prepare("DELETE FROM job_parts").run();
    db().prepare("DELETE FROM jobs").run();
    db().prepare("DELETE FROM filaments").run();

    for (const filament of filaments) {
      db().prepare(`
        INSERT INTO filaments (id, name, material_type, brand, color, cost_per_kg_zar, notes, created_at, updated_at)
        VALUES (@id, @name, @materialType, @brand, @color, @costPerKgZar, @notes, @createdAt, @updatedAt)
      `).run({
        id: filament.id,
        name: filament.name,
        materialType: filament.materialType,
        brand: filament.brand,
        color: filament.color,
        costPerKgZar: filament.costPerKgZar,
        notes: filament.notes,
        createdAt: filament.createdAt,
        updatedAt: filament.updatedAt
      });
    }

    for (const job of jobs) {
      db().prepare(`
        INSERT INTO jobs (id, job_name, waste_factor_percent, print_time_hours, machine_rate_per_hour_zar, created_at, updated_at)
        VALUES (@id, @jobName, @wasteFactorPercent, @printTimeHours, @machineRatePerHourZar, @createdAt, @updatedAt)
      `).run({
        id: job.id,
        jobName: job.jobName,
        wasteFactorPercent: job.wasteFactorPercent,
        printTimeHours: job.printTimeHours,
        machineRatePerHourZar: job.machineRatePerHourZar,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      });

      const insertPart = db().prepare(`
        INSERT INTO job_parts (id, job_id, filament_id, part_name, weight_grams_per_part, quantity, created_at, updated_at)
        VALUES (@id, @jobId, @filamentId, @partName, @weightGramsPerPart, @quantity, @createdAt, @updatedAt)
      `);

      for (const part of job.parts) {
        insertPart.run({
          id: part.id,
          jobId: job.id,
          filamentId: part.filamentId || null,
          partName: part.partName,
          weightGramsPerPart: part.weightGramsPerPart === "" ? null : part.weightGramsPerPart,
          quantity: part.quantity === "" ? null : part.quantity,
          createdAt: part.createdAt,
          updatedAt: part.updatedAt
        });
      }
    }

    setLastOpenJobId(lastOpenJobId || jobs[0]?.id || null);
    const nextSettings = settings || DEFAULT_SETTINGS;
    const upsert = db().prepare(`
      INSERT INTO app_meta (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    upsert.run("default_machine_rate_per_hour_zar", String(Number(nextSettings.defaultMachineRatePerHourZar ?? 0)));
    upsert.run("default_waste_factor_percent", String(Number(nextSettings.defaultWasteFactorPercent ?? 0)));
  });

  transaction();
}
