export const APP_STATE_VERSION_V1 = 1;
export const APP_STATE_VERSION_V2 = 2;

export function asNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

export function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(value || 0) + Number.EPSILON) * factor) / factor;
}

export function normalizeTimeHours(hoursInput, minutesInput) {
  const hours = asNumber(hoursInput) ?? 0;
  const minutes = asNumber(minutesInput) ?? 0;
  return hours + minutes / 60;
}

export function splitHoursAndMinutes(printTimeHours) {
  const safeHours = Math.max(0, asNumber(printTimeHours) ?? 0);
  const wholeHours = Math.floor(safeHours);
  const minutes = Math.round((safeHours - wholeHours) * 60);
  return {
    hours: String(wholeHours),
    minutes: String(minutes)
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

export function validateFilamentRecord(filament) {
  const errors = [];
  if (!String(filament.name || "").trim()) {
    errors.push("Filament name is required.");
  }
  if (!String(filament.materialType || "").trim()) {
    errors.push("Material type is required.");
  }
  const costPerKgZar = asNumber(filament.costPerKgZar);
  if (costPerKgZar === null || costPerKgZar <= 0) {
    errors.push("Cost per kg must be greater than 0.");
  }
  return errors;
}

export function validateJobInputs(job, filaments) {
  const errors = [];
  const rowErrors = {};

  const wasteFactor = asNumber(job.wasteFactorPercent);
  if (wasteFactor !== null && wasteFactor < 0) {
    errors.push("Waste factor cannot be negative.");
  }

  const machineRate = asNumber(job.machineRatePerHourZar);
  if (machineRate !== null && machineRate < 0) {
    errors.push("Machine rate cannot be negative.");
  }

  const inputHours = asNumber(job.printTimeInputHours);
  const inputMinutes = asNumber(job.printTimeInputMinutes);
  if (inputHours !== null && inputHours < 0) {
    errors.push("Print time hours cannot be negative.");
  }
  if (inputMinutes !== null && inputMinutes < 0) {
    errors.push("Print time minutes cannot be negative.");
  }

  for (const part of job.parts || []) {
    const messages = [];
    if (!part.filamentId) {
      messages.push("Select a filament.");
    } else {
      const filament = filaments.find((item) => item.id === part.filamentId);
      if (!filament) {
        messages.push("Selected filament no longer exists.");
      } else {
        const filamentCost = asNumber(filament.costPerKgZar);
        if (filamentCost === null || filamentCost <= 0) {
          messages.push("Selected filament must have a cost per kg greater than 0.");
        }
      }
    }

    const quantity = asNumber(part.quantity);
    if (quantity === null || quantity < 1 || !Number.isInteger(quantity)) {
      messages.push("Quantity must be a whole number of at least 1.");
    }

    const weight = asNumber(part.weightGramsPerPart);
    if (weight === null || weight <= 0) {
      messages.push("Weight per part must be greater than 0.");
    }

    if (messages.length) {
      rowErrors[part.id] = messages;
    }
  }

  return {
    errors,
    rowErrors,
    isValid: errors.length === 0 && Object.keys(rowErrors).length === 0
  };
}

export function generateMarkupSuggestions(grandTotalCostZar) {
  const markupPercents = [...Array.from({ length: 10 }, (_, index) => (index + 1) * 10), 125, 150, 175, 200, 225, 250];
  const suggestions = [];
  for (const markup of markupPercents) {
    const suggestedTotalPriceZar = grandTotalCostZar * (1 + markup / 100);
    const profitZar = suggestedTotalPriceZar - grandTotalCostZar;
    suggestions.push({
      markupPercent: markup,
      suggestedTotalPriceZar,
      profitZar,
      marginPercent: suggestedTotalPriceZar > 0 ? (profitZar / suggestedTotalPriceZar) * 100 : 0
    });
  }
  return suggestions;
}

export function calculateJob(job, filaments) {
  const validation = validateJobInputs(job, filaments);
  const normalizedPrintTimeHours = normalizeTimeHours(job.printTimeInputHours, job.printTimeInputMinutes);
  const machineRatePerHourZar = asNumber(job.machineRatePerHourZar) ?? 0;
  const machineCostZar = normalizedPrintTimeHours * machineRatePerHourZar;

  const totalAdjustedWeightGrams = validation.isValid
    ? (job.parts || []).reduce((sum, part) => {
        const quantity = asNumber(part.quantity) ?? 0;
        const weight = asNumber(part.weightGramsPerPart) ?? 0;
        const wasteFactorPercent = asNumber(job.wasteFactorPercent) ?? 0;
        return sum + weight * quantity * (1 + wasteFactorPercent / 100);
      }, 0)
    : 0;

  const rows = (job.parts || []).map((part) => {
    const filament = filaments.find((item) => item.id === part.filamentId) || null;
    if (!validation.isValid) {
      return {
        id: part.id,
        partName: part.partName || "",
        filamentId: part.filamentId || "",
        filamentLabel: filament ? getFilamentLabel(filament) : "",
        quantity: asNumber(part.quantity) ?? 0,
        baseWeightGrams: 0,
        adjustedWeightGrams: 0,
        materialCostZar: 0,
        allocatedMachineCostZar: 0,
        lineTotalCostZar: 0,
        costPerPartZar: 0,
        weightShare: 0
      };
    }

    const wasteFactorPercent = asNumber(job.wasteFactorPercent) ?? 0;
    const weightPerPart = asNumber(part.weightGramsPerPart) ?? 0;
    const quantity = asNumber(part.quantity) ?? 0;
    const filamentCostPerKg = filament ? asNumber(filament.costPerKgZar) ?? 0 : 0;

    const baseWeightGrams = weightPerPart * quantity;
    const adjustedWeightGrams = baseWeightGrams * (1 + wasteFactorPercent / 100);
    const adjustedWeightKg = adjustedWeightGrams / 1000;
    const materialCostZar = adjustedWeightKg * filamentCostPerKg;
    const weightShare = totalAdjustedWeightGrams > 0 ? adjustedWeightGrams / totalAdjustedWeightGrams : 0;
    const allocatedMachineCostZar = machineCostZar * weightShare;
    const lineTotalCostZar = materialCostZar + allocatedMachineCostZar;
    const costPerPartZar = quantity > 0 ? lineTotalCostZar / quantity : 0;

    return {
      id: part.id,
      partName: part.partName || "",
      filamentId: part.filamentId || "",
      filamentLabel: getFilamentLabel(filament),
      quantity,
      baseWeightGrams,
      adjustedWeightGrams,
      materialCostZar,
      allocatedMachineCostZar,
      lineTotalCostZar,
      costPerPartZar,
      weightShare
    };
  });

  const totalMaterialCostZar = rows.reduce((sum, row) => sum + row.materialCostZar, 0);
  const grandTotalCostZar = totalMaterialCostZar + machineCostZar;

  return {
    validation,
    normalizedPrintTimeHours,
    totalAdjustedWeightGrams,
    totalMaterialCostZar,
    totalMachineCostZar: validation.isValid ? machineCostZar : 0,
    grandTotalCostZar: validation.isValid ? grandTotalCostZar : 0,
    rows,
    suggestions: validation.isValid ? generateMarkupSuggestions(grandTotalCostZar) : []
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
      result.suggestions.map((suggestion) => suggestion.markupPercent).join(",") === "10,20,30,40,50,60,70,80,90,100,125,150,175,200,225,250" &&
      roundTo(result.suggestions[0].profitZar, 2) === 12.97 &&
      roundTo(result.suggestions[0].marginPercent, 2) === 9.09 &&
      roundTo(result.suggestions[15].suggestedTotalPriceZar, 2) === 453.95 &&
      roundTo(result.suggestions[15].profitZar, 2) === 324.25 &&
      roundTo(result.suggestions[15].marginPercent, 2) === 71.43,
    result
  };
}
