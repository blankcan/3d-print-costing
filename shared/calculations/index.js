export const APP_STATE_VERSION_V1 = 1;
export const APP_STATE_VERSION_V2 = 2;

const JOB_STATUSES = new Set(["PLANNING", "PRINTING", "COMPLETE"]);
const MARKUP_PERCENTS = [...Array.from({ length: 10 }, (_, index) => (index + 1) * 10), 125, 150, 175, 200, 225, 250];

export function asNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

export function asInteger(value) {
  const result = asNumber(value);
  return result !== null && Number.isInteger(result) ? result : null;
}

export function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
}

export function normalizeJobStatus(status) {
  const normalized = String(status || "PLANNING").toUpperCase();
  return JOB_STATUSES.has(normalized) ? normalized : "PLANNING";
}

export function normalizeBooleanFlag(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

export function normalizeTimeParts(hoursInput, minutesInput) {
  const hours = asInteger(hoursInput);
  const minutes = asInteger(minutesInput);

  if (hours === null || hours < 0 || minutes === null || minutes < 0 || minutes > 59) {
    return null;
  }

  const totalMinutes = hours * 60 + minutes;
  return {
    hours,
    minutes,
    totalMinutes,
    printTimeHours: totalMinutes / 60
  };
}

export function normalizeTimeHours(hoursInput, minutesInput) {
  return normalizeTimeParts(hoursInput, minutesInput)?.printTimeHours ?? 0;
}

export function splitHoursAndMinutes(printTimeHours) {
  const safeHours = Math.max(0, asNumber(printTimeHours) ?? 0);
  const totalMinutes = Math.max(0, Math.round(safeHours * 60));
  return {
    hours: String(Math.floor(totalMinutes / 60)),
    minutes: String(totalMinutes % 60)
  };
}

export function getFilamentLabel(filament) {
  if (!filament) {
    return "Missing filament";
  }

  if (filament.name) {
    return filament.name;
  }

  return [filament.brand, filament.color].filter(Boolean).join(" ") || "Unnamed filament";
}

function createValidationResult(errors = [], rowErrors = {}) {
  const normalizedRowErrors = Object.fromEntries(
    Object.entries(rowErrors).filter(([, messages]) => Array.isArray(messages) && messages.length)
  );

  return {
    errors,
    rowErrors: normalizedRowErrors,
    isComplete: errors.length === 0 && Object.keys(normalizedRowErrors).length === 0,
    isValid: errors.length === 0 && Object.keys(normalizedRowErrors).length === 0
  };
}

function validateNonNegativeNumber(value, label, errors, { required = true } = {}) {
  if (value === "" || value === null || value === undefined) {
    if (required) {
      errors.push(`${label} is required.`);
    }
    return null;
  }

  const parsed = asNumber(value);
  if (parsed === null) {
    errors.push(`${label} must be a valid number.`);
    return null;
  }

  if (parsed < 0) {
    errors.push(`${label} cannot be negative.`);
    return null;
  }

  return parsed;
}

function validatePositiveNumber(value, label, errors) {
  if (value === "" || value === null || value === undefined) {
    errors.push(`${label} is required.`);
    return null;
  }

  const parsed = asNumber(value);
  if (parsed === null) {
    errors.push(`${label} must be a valid number.`);
    return null;
  }

  if (parsed <= 0) {
    errors.push(`${label} must be greater than 0.`);
    return null;
  }

  return parsed;
}

function validateWholeNumberAtLeastOne(value, label, errors) {
  if (value === "" || value === null || value === undefined) {
    errors.push(`${label} is required.`);
    return null;
  }

  const parsed = asInteger(value);
  if (parsed === null) {
    errors.push(`${label} must be a whole number of at least 1.`);
    return null;
  }

  if (parsed < 1) {
    errors.push(`${label} must be a whole number of at least 1.`);
    return null;
  }

  return parsed;
}

function getFilamentMap(filaments = []) {
  return new Map((filaments || []).map((filament) => [filament.id, filament]));
}

export function validateFilamentRecord(filament) {
  const errors = [];

  if (!filament || typeof filament !== "object" || Array.isArray(filament)) {
    errors.push("Filament payload is malformed.");
    return errors;
  }

  if (!String(filament.name || "").trim()) {
    errors.push("Filament name is required.");
  }
  if (!String(filament.materialType || "").trim()) {
    errors.push("Material type is required.");
  }

  validatePositiveNumber(filament.costPerKgZar, "Cost per kg", errors);
  return errors;
}

export function validateCustomerRecord(customer) {
  const errors = [];

  if (!customer || typeof customer !== "object" || Array.isArray(customer)) {
    errors.push("Customer payload is malformed.");
    return errors;
  }

  if (!String(customer.name || "").trim()) {
    errors.push("Customer name is required.");
  }

  return errors;
}

export function validateSettingsRecord(settings) {
  const errors = [];

  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    errors.push("Settings payload is malformed.");
    return errors;
  }

  validateNonNegativeNumber(settings.defaultMachineRatePerHourZar, "Default machine rate", errors);
  validateNonNegativeNumber(settings.defaultWasteFactorPercent, "Default waste %", errors);

  return errors;
}

export function validatePartInput(part, filaments = []) {
  const messages = [];
  const filamentMap = getFilamentMap(filaments);

  if (!part || typeof part !== "object" || Array.isArray(part)) {
    messages.push("Part row is malformed.");
    return messages;
  }

  if (!part.filamentId) {
    messages.push("Select a filament.");
  } else {
    const filament = filamentMap.get(part.filamentId);
    if (!filament) {
      messages.push("Selected filament no longer exists.");
    } else {
      const filamentCost = asNumber(filament.costPerKgZar);
      if (filamentCost === null || filamentCost <= 0) {
        messages.push("Selected filament must have a cost per kg greater than 0.");
      }
    }
  }

  validateWholeNumberAtLeastOne(part.quantity, "Quantity", messages);
  validatePositiveNumber(part.weightGramsPerPart, "Weight per part", messages);
  return messages;
}

export function validateJobInputs(job, filaments = [], options = {}) {
  const errors = [];
  const rowErrors = {};
  const customers = options.customers || null;
  const customerIds = new Set((customers || []).map((customer) => customer.id));

  if (!job || typeof job !== "object" || Array.isArray(job)) {
    errors.push("Job payload is malformed.");
    return createValidationResult(errors, rowErrors);
  }

  if (!Array.isArray(job.parts)) {
    errors.push("Job parts must be an array.");
    return createValidationResult(errors, rowErrors);
  }

  validateNonNegativeNumber(job.wasteFactorPercent, "Waste factor", errors);
  validateNonNegativeNumber(job.machineRatePerHourZar, "Machine rate", errors);

  const timeParts = normalizeTimeParts(job.printTimeInputHours, job.printTimeInputMinutes);
  if (!timeParts) {
    if (asInteger(job.printTimeInputHours) === null || asInteger(job.printTimeInputHours) < 0) {
      errors.push("Print time hours must be a whole number of 0 or greater.");
    }

    const minutes = asInteger(job.printTimeInputMinutes);
    if (minutes === null || minutes < 0 || minutes > 59) {
      errors.push("Print time minutes must be a whole number from 0 to 59.");
    }
  }

  if (customers && job.customerId && !customerIds.has(job.customerId)) {
    errors.push("Selected customer no longer exists.");
  }

  const normalizedStatus = normalizeJobStatus(job.status);
  if (job.status !== undefined && job.status !== null && String(job.status).trim() && normalizedStatus !== String(job.status).toUpperCase()) {
    errors.push("Job status is invalid.");
  }

  for (const part of job.parts) {
    const partId = part?.id || `part_${Object.keys(rowErrors).length + 1}`;
    const messages = validatePartInput(part, filaments);
    if (messages.length) {
      rowErrors[partId] = messages;
    }
  }

  return createValidationResult(errors, rowErrors);
}

export function generateMarkupSuggestions(grandTotalCostZar) {
  return MARKUP_PERCENTS.map((markupPercent) => {
    const suggestedTotalPriceZar = grandTotalCostZar * (1 + markupPercent / 100);
    const profitZar = suggestedTotalPriceZar - grandTotalCostZar;
    return {
      markupPercent,
      suggestedTotalPriceZar,
      profitZar,
      marginPercent: suggestedTotalPriceZar > 0 ? (profitZar / suggestedTotalPriceZar) * 100 : 0
    };
  });
}

export function calculateJob(job, filaments = []) {
  const validation = validateJobInputs(job, filaments);
  const filamentMap = getFilamentMap(filaments);
  const wasteFactorPercent = asNumber(job?.wasteFactorPercent);
  const wasteMultiplier = wasteFactorPercent !== null && wasteFactorPercent >= 0 ? 1 + wasteFactorPercent / 100 : null;
  const timeParts = normalizeTimeParts(job?.printTimeInputHours, job?.printTimeInputMinutes);
  const normalizedPrintTimeHours = timeParts?.printTimeHours ?? 0;
  const machineRatePerHourZar = asNumber(job?.machineRatePerHourZar);
  const machineCostZar =
    timeParts && machineRatePerHourZar !== null && machineRatePerHourZar >= 0 ? normalizedPrintTimeHours * machineRatePerHourZar : 0;

  const rows = (job?.parts || []).map((part) => {
    const filament = filamentMap.get(part.filamentId) || null;
    const rowMessages = validation.rowErrors[part.id] || [];
    const quantity = asInteger(part.quantity) ?? 0;
    const weightPerPart = asNumber(part.weightGramsPerPart) ?? 0;
    const filamentCostPerKg = filament ? asNumber(filament.costPerKgZar) ?? 0 : 0;
    const baseWeightGrams = rowMessages.length === 0 ? weightPerPart * quantity : 0;
    const adjustedWeightGrams = rowMessages.length === 0 && wasteMultiplier !== null ? baseWeightGrams * wasteMultiplier : 0;
    const materialCostZar = rowMessages.length === 0 && wasteMultiplier !== null ? (adjustedWeightGrams / 1000) * filamentCostPerKg : 0;

    return {
      id: part.id,
      partName: part.partName || "",
      filamentId: part.filamentId || "",
      filamentLabel: getFilamentLabel(filament),
      quantity,
      isValid: rowMessages.length === 0,
      validationMessages: rowMessages,
      baseWeightGrams,
      adjustedWeightGrams,
      materialCostZar,
      allocatedMachineCostZar: 0,
      lineTotalCostZar: materialCostZar,
      costPerPartZar: quantity > 0 ? materialCostZar / quantity : 0,
      weightShare: 0
    };
  });

  const totalAdjustedWeightGrams = rows.reduce((sum, row) => sum + row.adjustedWeightGrams, 0);
  const rowsWithMachineAllocation = rows.map((row) => {
    const weightShare = totalAdjustedWeightGrams > 0 ? row.adjustedWeightGrams / totalAdjustedWeightGrams : 0;
    const allocatedMachineCostZar = row.isValid ? machineCostZar * weightShare : 0;
    const lineTotalCostZar = row.materialCostZar + allocatedMachineCostZar;
    const costPerPartZar = row.quantity > 0 ? lineTotalCostZar / row.quantity : 0;

    return {
      ...row,
      weightShare,
      allocatedMachineCostZar,
      lineTotalCostZar,
      costPerPartZar
    };
  });

  const totalMaterialCostZar = rowsWithMachineAllocation.reduce((sum, row) => sum + row.materialCostZar, 0);
  const grandTotalCostZar = totalMaterialCostZar + machineCostZar;

  return {
    validation,
    normalizedPrintTimeHours,
    totalAdjustedWeightGrams,
    totalMaterialCostZar,
    totalMachineCostZar: machineCostZar,
    grandTotalCostZar,
    rows: rowsWithMachineAllocation,
    suggestions: validation.isComplete ? generateMarkupSuggestions(grandTotalCostZar) : []
  };
}

export function createWorkedExampleCheck() {
  const filaments = [{ id: "fil_a", name: "Filament A", costPerKgZar: 300 }];
  const job = {
    wasteFactorPercent: 10,
    machineRatePerHourZar: 40,
    printTimeInputHours: 2,
    printTimeInputMinutes: 30,
    parts: [
      { id: "p1", partName: "Clip", filamentId: "fil_a", weightGramsPerPart: 20, quantity: 2 },
      { id: "p2", partName: "Bracket", filamentId: "fil_a", weightGramsPerPart: 50, quantity: 1 }
    ]
  };

  const result = calculateJob(job, filaments);
  return {
    passed:
      roundTo(result.totalAdjustedWeightGrams, 2) === 99 &&
      roundTo(result.totalMachineCostZar, 2) === 100 &&
      roundTo(result.grandTotalCostZar, 2) === 129.7 &&
      roundTo(result.rows[0].materialCostZar, 2) === 13.2 &&
      roundTo(result.rows[1].materialCostZar, 2) === 16.5 &&
      roundTo(result.rows[0].allocatedMachineCostZar, 2) === 44.44 &&
      roundTo(result.rows[1].allocatedMachineCostZar, 2) === 55.56 &&
      roundTo(result.suggestions[0].suggestedTotalPriceZar, 2) === 142.67 &&
      roundTo(result.suggestions[9].suggestedTotalPriceZar, 2) === 259.4 &&
      result.suggestions.map((suggestion) => suggestion.markupPercent).join(",") === MARKUP_PERCENTS.join(",") &&
      roundTo(result.suggestions[0].profitZar, 2) === 12.97 &&
      roundTo(result.suggestions[0].marginPercent, 2) === 9.09 &&
      roundTo(result.suggestions[15].suggestedTotalPriceZar, 2) === 453.95 &&
      roundTo(result.suggestions[15].profitZar, 2) === 324.25 &&
      roundTo(result.suggestions[15].marginPercent, 2) === 71.43,
    result
  };
}
