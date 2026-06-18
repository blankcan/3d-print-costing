const fs = require("fs");
const vm = require("vm");

const context = { window: {}, console };
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync("scripts/calculations.js", "utf8"), context, { filename: "scripts/calculations.js" });

const Calculations = context.window.Calculations;

function assertClose(actual, expected, label) {
  const roundedActual = Calculations.roundTo(actual, 2);
  const roundedExpected = Calculations.roundTo(expected, 2);
  if (roundedActual !== roundedExpected) {
    throw new Error(`${label}: expected ${roundedExpected}, got ${roundedActual}`);
  }
}

function runScenario(name, fn) {
  fn();
  console.log(`PASS: ${name}`);
}

const sharedFilament = { id: "fil_1", name: "PLA Black", costPerKgZar: 300 };
const secondFilament = { id: "fil_2", name: "PETG Blue", costPerKgZar: 420 };

runScenario("worked example", () => {
  const check = Calculations.runWorkedExampleCheck();
  if (!check.passed) {
    throw new Error("Worked example did not match expected totals.");
  }
});

runScenario("multiple rows same filament", () => {
  const result = Calculations.calculateJob({
    wasteFactorPercent: 0,
    machineRatePerHourZar: 50,
    printTimeInputHours: 1,
    printTimeInputMinutes: 0,
    parts: [
      { id: "a", partName: "A", filamentId: "fil_1", weightGramsPerPart: 10, quantity: 2 },
      { id: "b", partName: "B", filamentId: "fil_1", weightGramsPerPart: 20, quantity: 1 }
    ]
  }, [sharedFilament]);

  assertClose(result.totalMaterialCostZar, 12, "same filament material total");
  assertClose(result.totalMachineCostZar, 50, "same filament machine total");
  assertClose(result.rows[0].allocatedMachineCostZar, 25, "row A machine share");
  assertClose(result.rows[1].allocatedMachineCostZar, 25, "row B machine share");
});

runScenario("multiple rows different filaments", () => {
  const result = Calculations.calculateJob({
    wasteFactorPercent: 0,
    machineRatePerHourZar: 0,
    printTimeInputHours: 0,
    printTimeInputMinutes: 0,
    parts: [
      { id: "a", partName: "PLA Part", filamentId: "fil_1", weightGramsPerPart: 10, quantity: 1 },
      { id: "b", partName: "PETG Part", filamentId: "fil_2", weightGramsPerPart: 10, quantity: 1 }
    ]
  }, [sharedFilament, secondFilament]);

  assertClose(result.rows[0].materialCostZar, 3, "PLA material cost");
  assertClose(result.rows[1].materialCostZar, 4.2, "PETG material cost");
});

runScenario("waste factor increases adjusted weight and material cost", () => {
  const noWaste = Calculations.calculateJob({
    wasteFactorPercent: 0,
    machineRatePerHourZar: 0,
    printTimeInputHours: 0,
    printTimeInputMinutes: 0,
    parts: [{ id: "a", partName: "Part", filamentId: "fil_1", weightGramsPerPart: 100, quantity: 1 }]
  }, [sharedFilament]);

  const withWaste = Calculations.calculateJob({
    wasteFactorPercent: 15,
    machineRatePerHourZar: 0,
    printTimeInputHours: 0,
    printTimeInputMinutes: 0,
    parts: [{ id: "a", partName: "Part", filamentId: "fil_1", weightGramsPerPart: 100, quantity: 1 }]
  }, [sharedFilament]);

  assertClose(noWaste.totalAdjustedWeightGrams, 100, "base adjusted weight");
  assertClose(withWaste.totalAdjustedWeightGrams, 115, "waste adjusted weight");
  assertClose(noWaste.totalMaterialCostZar, 30, "base material cost");
  assertClose(withWaste.totalMaterialCostZar, 34.5, "waste material cost");
});

runScenario("quantity changes cost per part correctly", () => {
  const result = Calculations.calculateJob({
    wasteFactorPercent: 0,
    machineRatePerHourZar: 0,
    printTimeInputHours: 0,
    printTimeInputMinutes: 0,
    parts: [{ id: "a", partName: "Part", filamentId: "fil_1", weightGramsPerPart: 20, quantity: 4 }]
  }, [sharedFilament]);

  assertClose(result.rows[0].lineTotalCostZar, 24, "line total");
  assertClose(result.rows[0].costPerPartZar, 6, "cost per part");
});

runScenario("heavier part gets larger machine allocation", () => {
  const result = Calculations.calculateJob({
    wasteFactorPercent: 0,
    machineRatePerHourZar: 60,
    printTimeInputHours: 2,
    printTimeInputMinutes: 0,
    parts: [
      { id: "a", partName: "Light", filamentId: "fil_1", weightGramsPerPart: 10, quantity: 1 },
      { id: "b", partName: "Heavy", filamentId: "fil_1", weightGramsPerPart: 30, quantity: 1 }
    ]
  }, [sharedFilament]);

  assertClose(result.totalMachineCostZar, 120, "job machine cost");
  assertClose(result.rows[0].allocatedMachineCostZar, 30, "light row machine share");
  assertClose(result.rows[1].allocatedMachineCostZar, 90, "heavy row machine share");
});

runScenario("invalid input suppresses full costing", () => {
  const result = Calculations.calculateJob({
    wasteFactorPercent: -1,
    machineRatePerHourZar: 10,
    printTimeInputHours: 1,
    printTimeInputMinutes: 0,
    parts: [{ id: "a", partName: "Part", filamentId: "", weightGramsPerPart: "", quantity: "" }]
  }, [sharedFilament]);

  if (result.validation.isValid) {
    throw new Error("Expected invalid result.");
  }
  assertClose(result.grandTotalCostZar, 0, "suppressed grand total");
});
