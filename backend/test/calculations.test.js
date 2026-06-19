import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateJob,
  createWorkedExampleCheck,
  normalizeTimeParts,
  splitHoursAndMinutes,
  validateFilamentRecord,
  validateJobInputs,
  validateSettingsRecord
} from "../../shared/calculations/index.js";

test("worked example remains correct", () => {
  assert.equal(createWorkedExampleCheck().passed, true);
});

test("splitHoursAndMinutes never returns 60 minutes after rounding", () => {
  assert.deepEqual(splitHoursAndMinutes(1.999), { hours: "2", minutes: "0" });
  assert.deepEqual(splitHoursAndMinutes(0.999), { hours: "1", minutes: "0" });
});

test("normalizeTimeParts accepts 0 to 59 minutes and rejects 60", () => {
  assert.deepEqual(normalizeTimeParts(0, 59), {
    hours: 0,
    minutes: 59,
    totalMinutes: 59,
    printTimeHours: 59 / 60
  });
  assert.equal(normalizeTimeParts(0, 60), null);
});

test("partial calculations preserve valid rows while invalid rows contribute zero", () => {
  const filaments = [
    { id: "fil_1", name: "PLA Black", costPerKgZar: 300 }
  ];
  const job = {
    wasteFactorPercent: 10,
    machineRatePerHourZar: 40,
    printTimeInputHours: 1,
    printTimeInputMinutes: 30,
    parts: [
      { id: "valid", partName: "Bracket", filamentId: "fil_1", weightGramsPerPart: 50, quantity: 2 },
      { id: "invalid", partName: "", filamentId: "", weightGramsPerPart: "", quantity: 1 }
    ]
  };

  const result = calculateJob(job, filaments);

  assert.equal(result.validation.isComplete, false);
  assert.ok(result.validation.rowErrors.invalid.length > 0);
  assert.equal(result.rows[0].materialCostZar > 0, true);
  assert.equal(result.rows[1].materialCostZar, 0);
  assert.equal(result.totalMaterialCostZar > 0, true);
  assert.equal(result.totalMachineCostZar > 0, true);
  assert.deepEqual(result.suggestions, []);
});

test("missing filament references stay invalid without zeroing valid rows", () => {
  const filaments = [{ id: "fil_1", name: "PLA", costPerKgZar: 250 }];
  const validation = validateJobInputs(
    {
      wasteFactorPercent: 5,
      machineRatePerHourZar: 20,
      printTimeInputHours: 0,
      printTimeInputMinutes: 30,
      parts: [
        { id: "p1", partName: "Okay", filamentId: "fil_1", weightGramsPerPart: 10, quantity: 2 },
        { id: "p2", partName: "Missing", filamentId: "missing", weightGramsPerPart: 12, quantity: 1 }
      ]
    },
    filaments
  );

  assert.deepEqual(validation.rowErrors.p2, ["Selected filament no longer exists."]);
});

test("validation rejects negative, non-numeric, and fractional persistence inputs", () => {
  assert.deepEqual(validateFilamentRecord({ name: "x", materialType: "PLA", costPerKgZar: -1 }), [
    "Cost per kg must be greater than 0."
  ]);
  assert.deepEqual(validateSettingsRecord({ defaultMachineRatePerHourZar: Infinity, defaultWasteFactorPercent: 0 }), [
    "Default machine rate must be a valid number."
  ]);

  const jobValidation = validateJobInputs(
    {
      wasteFactorPercent: 0,
      machineRatePerHourZar: 10,
      printTimeInputHours: 0,
      printTimeInputMinutes: 10,
      parts: [{ id: "p1", partName: "Part", filamentId: "fil_1", weightGramsPerPart: 5, quantity: 1.5 }]
    },
    [{ id: "fil_1", name: "PLA", costPerKgZar: 200 }]
  );

  assert.deepEqual(jobValidation.rowErrors.p1, ["Quantity must be a whole number of at least 1."]);
});
