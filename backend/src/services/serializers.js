import { splitHoursAndMinutes } from "../../../shared/calculations/index.js";
import { getJobImagePublicUrl, jobImageExists } from "./jobImages.js";

function mapJobStatus(value) {
  return ["PLANNING", "PRINTING", "COMPLETE"].includes(value) ? value : "PLANNING";
}

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

export function mapCustomerRow(row) {
  return {
    id: row.id,
    name: row.name,
    cellNumber: row.cell_number,
    email: row.email,
    deliveryAddress: row.delivery_address,
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
  const imagePath = jobRow.image_path || null;
  return {
    id: jobRow.id,
    jobName: jobRow.job_name,
    wasteFactorPercent: jobRow.waste_factor_percent,
    printTimeHours: jobRow.print_time_hours,
    printTimeInputHours: timeInputs.hours,
    printTimeInputMinutes: timeInputs.minutes,
    machineRatePerHourZar: jobRow.machine_rate_per_hour_zar,
    status: mapJobStatus(jobRow.status),
    paid: Boolean(jobRow.paid),
    delivered: Boolean(jobRow.delivered),
    customerId: jobRow.customer_id || "",
    imagePath,
    imageFileName: jobRow.image_file_name || null,
    imageUrl: getJobImagePublicUrl(imagePath),
    imageAvailable: jobImageExists(imagePath),
    parts: partRows.map(mapPartRow),
    createdAt: jobRow.created_at,
    updatedAt: jobRow.updated_at
  };
}
