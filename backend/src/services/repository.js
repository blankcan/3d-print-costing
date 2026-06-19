import { getDatabase } from "../db/database.js";
import { createId, nowIso } from "./ids.js";
import { removeStoredJobImage } from "./jobImages.js";
import { mapCustomerRow, mapFilamentRow, mapJobRow } from "./serializers.js";
import { normalizeBooleanFlag, normalizeJobStatus } from "../../../shared/calculations/index.js";

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

export function listCustomers() {
  return db()
    .prepare("SELECT * FROM customers ORDER BY updated_at DESC, name COLLATE NOCASE ASC")
    .all()
    .map(mapCustomerRow);
}

export function getCustomerById(id) {
  const row = db().prepare("SELECT * FROM customers WHERE id = ?").get(id);
  return row ? mapCustomerRow(row) : null;
}

export function saveCustomer(input) {
  const timestamp = nowIso();
  const customer = {
    id: input.id || createId("cust"),
    name: String(input.name || "").trim(),
    cellNumber: String(input.cellNumber || "").trim(),
    email: String(input.email || "").trim(),
    deliveryAddress: String(input.deliveryAddress || "").trim(),
    createdAt: input.createdAt || timestamp,
    updatedAt: timestamp
  };

  db().prepare(`
    INSERT INTO customers (id, name, cell_number, email, delivery_address, created_at, updated_at)
    VALUES (@id, @name, @cellNumber, @email, @deliveryAddress, @createdAt, @updatedAt)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      cell_number = excluded.cell_number,
      email = excluded.email,
      delivery_address = excluded.delivery_address,
      updated_at = excluded.updated_at
  `).run(customer);

  return getCustomerById(customer.id);
}

export function deleteCustomer(id) {
  const existing = getCustomerById(id);
  if (!existing) {
    return false;
  }

  const transaction = db().transaction(() => {
    db().prepare("UPDATE jobs SET customer_id = NULL, updated_at = ? WHERE customer_id = ?").run(nowIso(), id);
    db().prepare("DELETE FROM customers WHERE id = ?").run(id);
  });

  transaction();
  return true;
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
  const result = db().prepare("DELETE FROM filaments WHERE id = ?").run(id);
  return result.changes > 0;
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
      status: normalizeJobStatus(row.status),
      paid: Boolean(row.paid),
      delivered: Boolean(row.delivered),
      customerId: row.customer_id || "",
      imagePath: row.image_path || null,
      imageFileName: row.image_file_name || null,
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
    status: normalizeJobStatus(input.status),
    paid: normalizeBooleanFlag(input.paid) ? 1 : 0,
    delivered: normalizeBooleanFlag(input.delivered) ? 1 : 0,
    customerId: input.customerId || null,
    imagePath: input.imagePath || null,
    imageFileName: input.imageFileName || null,
    createdAt: input.createdAt || timestamp,
    updatedAt: timestamp
  };

  const transaction = db().transaction(() => {
    db().prepare(`
      INSERT INTO jobs (id, job_name, waste_factor_percent, print_time_hours, machine_rate_per_hour_zar, status, paid, delivered, customer_id, image_path, image_file_name, created_at, updated_at)
      VALUES (@id, @jobName, @wasteFactorPercent, @printTimeHours, @machineRatePerHourZar, @status, @paid, @delivered, @customerId, @imagePath, @imageFileName, @createdAt, @updatedAt)
      ON CONFLICT(id) DO UPDATE SET
        job_name = excluded.job_name,
        waste_factor_percent = excluded.waste_factor_percent,
        print_time_hours = excluded.print_time_hours,
        machine_rate_per_hour_zar = excluded.machine_rate_per_hour_zar,
        status = excluded.status,
        paid = excluded.paid,
        delivered = excluded.delivered,
        customer_id = excluded.customer_id,
        image_path = excluded.image_path,
        image_file_name = excluded.image_file_name,
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
    status: "PLANNING",
    paid: false,
    delivered: false,
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
  const existingJob = db().prepare("SELECT image_path FROM jobs WHERE id = ?").get(jobId);
  if (!existingJob) {
    return false;
  }

  const transaction = db().transaction(() => {
    db().prepare("DELETE FROM jobs WHERE id = ?").run(jobId);
    removeStoredJobImage(existingJob.image_path || null);
    const lastOpenJobId = getLastOpenJobId();
    if (lastOpenJobId === jobId) {
      const recent = db().prepare("SELECT id FROM jobs ORDER BY updated_at DESC, created_at DESC LIMIT 1").get();
      setLastOpenJobId(recent?.id || null);
    }
  });

  transaction();
  return true;
}

export function replaceAllData({ filaments, customers, jobs, lastOpenJobId, settings }) {
  const transaction = db().transaction(() => {
    db().prepare("DELETE FROM job_parts").run();
    db().prepare("DELETE FROM jobs").run();
    db().prepare("DELETE FROM filaments").run();
    db().prepare("DELETE FROM customers").run();

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

    for (const customer of customers || []) {
      db().prepare(`
        INSERT INTO customers (id, name, cell_number, email, delivery_address, created_at, updated_at)
        VALUES (@id, @name, @cellNumber, @email, @deliveryAddress, @createdAt, @updatedAt)
      `).run({
        id: customer.id,
        name: customer.name,
        cellNumber: customer.cellNumber,
        email: customer.email,
        deliveryAddress: customer.deliveryAddress,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      });
    }

    for (const job of jobs) {
      db().prepare(`
        INSERT INTO jobs (id, job_name, waste_factor_percent, print_time_hours, machine_rate_per_hour_zar, status, paid, delivered, customer_id, image_path, image_file_name, created_at, updated_at)
        VALUES (@id, @jobName, @wasteFactorPercent, @printTimeHours, @machineRatePerHourZar, @status, @paid, @delivered, @customerId, @imagePath, @imageFileName, @createdAt, @updatedAt)
      `).run({
        id: job.id,
        jobName: job.jobName,
        wasteFactorPercent: job.wasteFactorPercent,
        printTimeHours: job.printTimeHours,
        machineRatePerHourZar: job.machineRatePerHourZar,
        status: normalizeJobStatus(job.status),
        paid: normalizeBooleanFlag(job.paid) ? 1 : 0,
        delivered: normalizeBooleanFlag(job.delivered) ? 1 : 0,
        customerId: job.customerId || null,
        imagePath: job.imagePath || null,
        imageFileName: job.imageFileName || null,
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

export function updateJobImage(jobId, { imagePath, imageFileName }) {
  const result = db().prepare(`
    UPDATE jobs
    SET image_path = ?, image_file_name = ?, updated_at = ?
    WHERE id = ?
  `).run(imagePath || null, imageFileName || null, nowIso(), jobId);

  if (result.changes === 0) {
    return null;
  }

  return getJobById(jobId);
}

export function clearJobImage(jobId) {
  const existing = db().prepare("SELECT image_path FROM jobs WHERE id = ?").get(jobId);
  if (!existing) {
    return null;
  }

  db().prepare(`
    UPDATE jobs
    SET image_path = NULL, image_file_name = NULL, updated_at = ?
    WHERE id = ?
  `).run(nowIso(), jobId);

  return {
    previousImagePath: existing?.image_path || null,
    job: getJobById(jobId)
  };
}
