import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { closeDatabase } from "../src/db/database.js";
import { getJobById, saveFilament, saveJob } from "../src/services/repository.js";

function setupTempDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "printing-costing-repo-"));
  process.env.APP_DB_PATH = path.join(dir, "app.db");
  closeDatabase();
  return dir;
}

function cleanupTempDb(dir) {
  closeDatabase();
  fs.rmSync(dir, { recursive: true, force: true });
}

test("job replacement remains atomic when a part insert fails", () => {
  const dir = setupTempDb();

  try {
    const filament = saveFilament({
      name: "PLA Black",
      materialType: "PLA",
      brand: "Generic",
      color: "Black",
      costPerKgZar: 300,
      notes: ""
    });

    const job = saveJob({
      jobName: "Atomic test",
      wasteFactorPercent: 5,
      printTimeHours: 1,
      machineRatePerHourZar: 25,
      status: "PLANNING",
      paid: false,
      delivered: false,
      parts: [
        {
          id: "part_1",
          partName: "Valid part",
          filamentId: filament.id,
          weightGramsPerPart: 20,
          quantity: 1
        }
      ]
    });

    assert.throws(() => {
      saveJob({
        ...job,
        printTimeHours: 2,
        parts: [
          {
            id: "part_2",
            partName: "Broken part",
            filamentId: "missing_filament",
            weightGramsPerPart: 10,
            quantity: 1
          }
        ]
      });
    });

    const persisted = getJobById(job.id);
    assert.equal(persisted.printTimeHours, 1);
    assert.equal(persisted.parts.length, 1);
    assert.equal(persisted.parts[0].filamentId, filament.id);
    assert.equal(persisted.parts[0].partName, "Valid part");
  } finally {
    cleanupTempDb(dir);
  }
});
