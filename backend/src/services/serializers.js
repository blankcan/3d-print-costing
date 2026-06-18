import { splitHoursAndMinutes } from "../../../shared/calculations/index.js";

export function mapFilamentRow(row) {
  return {
    id: row.id,
    name: row.name,
    materialType: row.material_type,
    brand: row.brand,
    color: row.color,
    costPerKgZar: row.cost_per_kg_zar,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapPartRow(row) {
  return {
    id: row.id,
    jobId: row.job_id,
    filamentId: row.filament_id || "",
    partName: row.part_name,
    weightGramsPerPart: row.weight_grams_per_part === null ? "" : row.weight_grams_per_part,
    quantity: row.quantity === null ? "" : row.quantity,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapJobRow(jobRow, partRows = []) {
  const timeInputs = splitHoursAndMinutes(jobRow.print_time_hours);
  return {
    id: jobRow.id,
    jobName: jobRow.job_name,
    wasteFactorPercent: jobRow.waste_factor_percent,
    printTimeHours: jobRow.print_time_hours,
    printTimeInputHours: timeInputs.hours,
    printTimeInputMinutes: timeInputs.minutes,
    machineRatePerHourZar: jobRow.machine_rate_per_hour_zar,
    parts: partRows.map(mapPartRow),
    createdAt: jobRow.created_at,
    updatedAt: jobRow.updated_at
  };
}
