(function () {
  function asNumber(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    var result = Number(value);
    return Number.isFinite(result) ? result : null;
  }

  function roundTo(value, decimals) {
    var factor = Math.pow(10, decimals || 2);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function normalizeTimeHours(hoursInput, minutesInput) {
    var hours = asNumber(hoursInput);
    var minutes = asNumber(minutesInput);

    hours = hours === null ? 0 : hours;
    minutes = minutes === null ? 0 : minutes;

    return hours + (minutes / 60);
  }

  function findFilamentById(filaments, filamentId) {
    return filaments.find(function (filament) {
      return filament.id === filamentId;
    }) || null;
  }

  function validateJobInputs(job, filaments) {
    var errors = [];
    var rowErrors = {};

    var wasteFactor = asNumber(job.wasteFactorPercent);
    if (wasteFactor !== null && wasteFactor < 0) {
      errors.push("Waste factor cannot be negative.");
    }

    var machineRate = asNumber(job.machineRatePerHourZar);
    if (machineRate !== null && machineRate < 0) {
      errors.push("Machine rate cannot be negative.");
    }

    var inputHours = asNumber(job.printTimeInputHours);
    var inputMinutes = asNumber(job.printTimeInputMinutes);
    if (inputHours !== null && inputHours < 0) {
      errors.push("Print time hours cannot be negative.");
    }
    if (inputMinutes !== null && inputMinutes < 0) {
      errors.push("Print time minutes cannot be negative.");
    }

    (job.parts || []).forEach(function (part) {
      var partMessages = [];
      if (!part.filamentId) {
        partMessages.push("Select a filament.");
      } else {
        var filament = findFilamentById(filaments, part.filamentId);
        if (!filament) {
          partMessages.push("Selected filament no longer exists.");
        } else {
          var filamentCost = asNumber(filament.costPerKgZar);
          if (filamentCost === null || filamentCost <= 0) {
            partMessages.push("Selected filament must have a cost per kg greater than 0.");
          }
        }
      }

      var quantity = asNumber(part.quantity);
      if (quantity === null || quantity < 1 || !Number.isInteger(quantity)) {
        partMessages.push("Quantity must be a whole number of at least 1.");
      }

      var weight = asNumber(part.weightGramsPerPart);
      if (weight === null || weight <= 0) {
        partMessages.push("Weight per part must be greater than 0.");
      }

      if (partMessages.length) {
        rowErrors[part.id] = partMessages;
      }
    });

    return {
      errors: errors,
      rowErrors: rowErrors,
      isValid: !errors.length && !Object.keys(rowErrors).length
    };
  }

  function calculateRow(part, job, filament, totalAdjustedWeightGrams, machineCostZar) {
    var wasteFactorPercent = asNumber(job.wasteFactorPercent) || 0;
    var weightPerPart = asNumber(part.weightGramsPerPart) || 0;
    var quantity = asNumber(part.quantity) || 0;
    var filamentCostPerKg = filament ? (asNumber(filament.costPerKgZar) || 0) : 0;

    var baseWeightGrams = weightPerPart * quantity;
    var adjustedWeightGrams = baseWeightGrams * (1 + (wasteFactorPercent / 100));
    var adjustedWeightKg = adjustedWeightGrams / 1000;
    var materialCostZar = adjustedWeightKg * filamentCostPerKg;
    var weightShare = totalAdjustedWeightGrams > 0 ? adjustedWeightGrams / totalAdjustedWeightGrams : 0;
    var allocatedMachineCostZar = machineCostZar * weightShare;
    var lineTotalCostZar = materialCostZar + allocatedMachineCostZar;
    var costPerPartZar = quantity > 0 ? lineTotalCostZar / quantity : 0;

    return {
      id: part.id,
      partName: part.partName || "",
      filamentId: part.filamentId || "",
      filamentLabel: filament ? filament.name || [filament.brand, filament.color].filter(Boolean).join(" ") : "Missing filament",
      quantity: quantity,
      baseWeightGrams: baseWeightGrams,
      adjustedWeightGrams: adjustedWeightGrams,
      materialCostZar: materialCostZar,
      allocatedMachineCostZar: allocatedMachineCostZar,
      lineTotalCostZar: lineTotalCostZar,
      costPerPartZar: costPerPartZar,
      weightShare: weightShare
    };
  }

  function generateMarkupSuggestions(grandTotalCostZar) {
    var suggestions = [];
    for (var markup = 10; markup <= 100; markup += 10) {
      var suggestedTotalPriceZar = grandTotalCostZar * (1 + (markup / 100));
      suggestions.push({
        markupPercent: markup,
        suggestedTotalPriceZar: suggestedTotalPriceZar,
        profitZar: suggestedTotalPriceZar - grandTotalCostZar
      });
    }
    return suggestions;
  }

  function calculateJob(job, filaments) {
    var validation = validateJobInputs(job, filaments);
    var normalizedHours = normalizeTimeHours(job.printTimeInputHours, job.printTimeInputMinutes);
    var machineRatePerHourZar = asNumber(job.machineRatePerHourZar) || 0;
    var machineCostZar = normalizedHours * machineRatePerHourZar;

    var totalAdjustedWeightGrams = 0;
    if (validation.isValid) {
      totalAdjustedWeightGrams = (job.parts || []).reduce(function (sum, part) {
        var quantity = asNumber(part.quantity) || 0;
        var weight = asNumber(part.weightGramsPerPart) || 0;
        var wasteFactorPercent = asNumber(job.wasteFactorPercent) || 0;
        return sum + (weight * quantity * (1 + (wasteFactorPercent / 100)));
      }, 0);
    }

    var rows = (job.parts || []).map(function (part) {
      var filament = findFilamentById(filaments, part.filamentId);
      if (!validation.isValid) {
        return {
          id: part.id,
          partName: part.partName || "",
          filamentId: part.filamentId || "",
          filamentLabel: filament ? filament.name : "",
          quantity: asNumber(part.quantity) || 0,
          baseWeightGrams: 0,
          adjustedWeightGrams: 0,
          materialCostZar: 0,
          allocatedMachineCostZar: 0,
          lineTotalCostZar: 0,
          costPerPartZar: 0,
          weightShare: 0
        };
      }
      return calculateRow(part, job, filament, totalAdjustedWeightGrams, machineCostZar);
    });

    var totalMaterialCostZar = rows.reduce(function (sum, row) {
      return sum + row.materialCostZar;
    }, 0);
    var grandTotalCostZar = totalMaterialCostZar + machineCostZar;

    return {
      validation: validation,
      normalizedPrintTimeHours: normalizedHours,
      totalAdjustedWeightGrams: totalAdjustedWeightGrams,
      totalMaterialCostZar: totalMaterialCostZar,
      totalMachineCostZar: validation.isValid ? machineCostZar : 0,
      grandTotalCostZar: validation.isValid ? grandTotalCostZar : 0,
      rows: rows,
      suggestions: validation.isValid ? generateMarkupSuggestions(grandTotalCostZar) : []
    };
  }

  function runWorkedExampleCheck() {
    var filaments = [{
      id: "fil_a",
      name: "Filament A",
      costPerKgZar: 300
    }];

    var job = {
      wasteFactorPercent: 10,
      machineRatePerHourZar: 40,
      printTimeInputHours: 2,
      printTimeInputMinutes: 30,
      parts: [
        { id: "p1", partName: "Clip", filamentId: "fil_a", weightGramsPerPart: 20, quantity: 2 },
        { id: "p2", partName: "Bracket", filamentId: "fil_a", weightGramsPerPart: 50, quantity: 1 }
      ]
    };

    var result = calculateJob(job, filaments);
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
        roundTo(result.suggestions[9].suggestedTotalPriceZar, 2) === 259.4,
      result: result
    };
  }

  window.Calculations = {
    asNumber: asNumber,
    roundTo: roundTo,
    normalizeTimeHours: normalizeTimeHours,
    validateJobInputs: validateJobInputs,
    calculateJob: calculateJob,
    generateMarkupSuggestions: generateMarkupSuggestions,
    runWorkedExampleCheck: runWorkedExampleCheck
  };
}());
