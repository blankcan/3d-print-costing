import {
  APP_STATE_VERSION_V1,
  APP_STATE_VERSION_V2,
  normalizeTimeHours,
  splitHoursAndMinutes
} from "../../../shared/calculations/index.js";
import { createId, nowIso } from "./ids.js";
import {
  createEmptyJob,
  getActiveJob,
  getSettings,
  listFilaments,
  listJobs,
  replaceAllData,
  getJobById
} from "./repository.js";

function normalizeFilamentRecord(record) {
  if (!record || typeof record !== "object") {
    throw new Error("A filament entry is invalid.");
  }

  const timestamp = nowIso();
  return {
    id: String(record.id || createId("fil")),
    name: String(record.name || ""),
    materialType: String(record.materialType || ""),
    brand: String(record.brand || ""),
    color: String(record.color || ""),
    costPerKgZar: Number(record.costPerKgZar),
    notes: String(record.notes || ""),
    createdAt: String(record.createdAt || timestamp),
    updatedAt: String(record.updatedAt || record.createdAt || timestamp)
  };
}

function normalizePartRecord(part, jobId) {
  if (!part || typeof part !== "object") {
    throw new Error("A part row is invalid.");
  }

  const timestamp = nowIso();
  return {
    id: String(part.id || createId("part")),
    jobId,
    partName: String(part.partName || ""),
    filamentId: String(part.filamentId || ""),
    weightGramsPerPart: part.weightGramsPerPart === "" ? "" : Number(part.weightGramsPerPart ?? 0),
    quantity: part.quantity === "" ? "" : Number(part.quantity ?? 0),
    createdAt: String(part.createdAt || timestamp),
    updatedAt: String(part.updatedAt || part.createdAt || timestamp)
  };
}

function normalizeJobRecord(job) {
  if (!job || typeof job !== "object" || !Array.isArray(job.parts)) {
    throw new Error("A job entry is invalid.");
  }

  const timestamp = nowIso();
  const printTimeHours =
    job.printTimeHours !== undefined
      ? Number(job.printTimeHours || 0)
      : normalizeTimeHours(job.printTimeInputHours, job.printTimeInputMinutes);

  const timeInputs = splitHoursAndMinutes(printTimeHours);
  const jobId = String(job.id || createId("job"));

  return {
    id: jobId,
    jobName: String(job.jobName || ""),
    wasteFactorPercent: job.wasteFactorPercent === "" ? "" : Number(job.wasteFactorPercent || 0),
    printTimeHours,
    printTimeInputHours: String(job.printTimeInputHours ?? timeInputs.hours),
    printTimeInputMinutes: String(job.printTimeInputMinutes ?? timeInputs.minutes),
    machineRatePerHourZar: job.machineRatePerHourZar === "" ? "" : Number(job.machineRatePerHourZar || 0),
    parts: job.parts.map((part) => normalizePartRecord(part, jobId)),
    createdAt: String(job.createdAt || timestamp),
    updatedAt: String(job.updatedAt || job.createdAt || timestamp)
  };
}

function normalizeSettingsRecord(settings) {
  const defaultMachineRatePerHourZar = Number(settings?.defaultMachineRatePerHourZar ?? 0);
  const defaultWasteFactorPercent = Number(settings?.defaultWasteFactorPercent ?? 0);

  if (!Number.isFinite(defaultMachineRatePerHourZar) || defaultMachineRatePerHourZar < 0) {
    throw new Error("Imported settings defaultMachineRatePerHourZar must be 0 or greater.");
  }
  if (!Number.isFinite(defaultWasteFactorPercent) || defaultWasteFactorPercent < 0) {
    throw new Error("Imported settings defaultWasteFactorPercent must be 0 or greater.");
  }

  return {
    defaultMachineRatePerHourZar,
    defaultWasteFactorPercent
  };
}

export function exportAppState() {
  const jobSummaries = listJobs();
  const jobs = jobSummaries.map((summary) => getJobById(summary.id));
  const activeJob = getActiveJob();
  return {
    version: APP_STATE_VERSION_V2,
    settings: getSettings(),
    filaments: listFilaments(),
    jobs,
    lastOpenJobId: activeJob?.id || null,
    exportedAt: nowIso()
  };
}

export function importAppState(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Imported file does not contain a valid app state object.");
  }

  if (!Array.isArray(payload.filaments) || !Array.isArray(payload.jobs)) {
    throw new Error("Imported data is missing filaments or jobs arrays.");
  }

  if (![APP_STATE_VERSION_V1, APP_STATE_VERSION_V2].includes(payload.version)) {
    throw new Error("Unsupported app-state version. Expected version 1 or 2.");
  }

  const filaments = payload.filaments.map(normalizeFilamentRecord);
  const jobs = payload.jobs.map(normalizeJobRecord);
  const lastOpenJobId = payload.lastOpenJobId || jobs[0]?.id || null;
  const settings = normalizeSettingsRecord(payload.settings);

  replaceAllData({ filaments, jobs, lastOpenJobId, settings });

  if (!jobs.length) {
    createEmptyJob();
  }

  return exportAppState();
}
