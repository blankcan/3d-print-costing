import fs from "node:fs";
import path from "node:path";
import assert from "assert";
import http from "node:http";
import { createWorkedExampleCheck, roundTo } from "../../shared/calculations/index.js";
import { createApp } from "../src/server/createApp.js";
import { closeDatabase } from "../src/db/database.js";

const tempDir = path.resolve(process.cwd(), "data");
const tempDbPath = path.join(tempDir, "verify-app.db");
process.env.APP_DB_PATH = tempDbPath;

if (fs.existsSync(tempDbPath)) {
  fs.unlinkSync(tempDbPath);
}

const app = createApp();

function requestJson(urlString, options = {}) {
  const url = new URL(urlString);
  const payload = options.body || null;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search}`,
        method: options.method || "GET",
        headers
      },
      (response) => {
        let raw = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          raw += chunk;
        });
        response.on("end", () => {
          if (response.statusCode === 204) {
            resolve({ ok: true, status: 204, json: null });
            return;
          }

          const json = raw ? JSON.parse(raw) : null;
          resolve({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode,
            json
          });
        });
      }
    );

    request.on("error", reject);
    if (payload) {
      request.write(payload);
    }
    request.end();
  });
}

async function main() {
  const workedExample = createWorkedExampleCheck();
  assert.equal(workedExample.passed, true, "Worked example check should pass.");

  const server = app.listen(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}/api`;

  try {
    let result = await requestJson(`${baseUrl}/filaments`, {
      method: "POST",
      body: JSON.stringify({
        name: "Filament A",
        materialType: "PLA",
        brand: "Generic",
        color: "Black",
        costPerKgZar: 300,
        notes: ""
      })
    });
    assert.equal(result.status, 201);
    const filament = result.json.filament;

    result = await requestJson(`${baseUrl}/settings`, {
      method: "PUT",
      body: JSON.stringify({
        defaultWasteFactorPercent: 10,
        defaultMachineRatePerHourZar: 45
      })
    });
    assert.equal(result.ok, true);
    assert.equal(result.json.settings.defaultWasteFactorPercent, 10);
    assert.equal(result.json.settings.defaultMachineRatePerHourZar, 45);

    result = await requestJson(`${baseUrl}/jobs`, { method: "POST" });
    assert.equal(result.status, 201);
    const jobId = result.json.job.id;
    assert.equal(result.json.job.wasteFactorPercent, 10);
    assert.equal(result.json.job.machineRatePerHourZar, 45);

    result = await requestJson(`${baseUrl}/jobs/${jobId}`, {
      method: "PUT",
      body: JSON.stringify({
        jobName: "Worked Example",
        wasteFactorPercent: 10,
        printTimeInputHours: 2,
        printTimeInputMinutes: 30,
        machineRatePerHourZar: 40,
        parts: [
          { id: "p1", partName: "Clip", filamentId: filament.id, weightGramsPerPart: 20, quantity: 2 },
          { id: "p2", partName: "Bracket", filamentId: filament.id, weightGramsPerPart: 50, quantity: 1 }
        ]
      })
    });
    assert.equal(result.ok, true);
    assert.equal(roundTo(result.json.calculations.grandTotalCostZar, 2), 129.7);
    assert.deepEqual(
      result.json.calculations.suggestions.map((suggestion) => suggestion.markupPercent),
      [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200, 225, 250]
    );
    assert.equal(roundTo(result.json.calculations.suggestions[0].suggestedTotalPriceZar, 2), 142.67);
    assert.equal(roundTo(result.json.calculations.suggestions[0].profitZar, 2), 12.97);
    assert.equal(roundTo(result.json.calculations.suggestions[0].marginPercent, 2), 9.09);
    assert.equal(roundTo(result.json.calculations.suggestions[9].suggestedTotalPriceZar, 2), 259.4);
    assert.equal(roundTo(result.json.calculations.suggestions[9].profitZar, 2), 129.7);
    assert.equal(roundTo(result.json.calculations.suggestions[9].marginPercent, 2), 50);
    assert.equal(roundTo(result.json.calculations.suggestions[15].suggestedTotalPriceZar, 2), 453.95);
    assert.equal(roundTo(result.json.calculations.suggestions[15].profitZar, 2), 324.25);
    assert.equal(roundTo(result.json.calculations.suggestions[15].marginPercent, 2), 71.43);

    result = await requestJson(`${baseUrl}/app-state/export`);
    assert.equal(result.ok, true);
    assert.equal(result.json.version, 2);
    assert.equal(result.json.settings.defaultWasteFactorPercent, 10);
    assert.equal(result.json.settings.defaultMachineRatePerHourZar, 45);
    assert.equal(result.json.filaments.length, 1);
    assert.equal(result.json.jobs.length >= 1, true);

    const v1State = {
      version: 1,
      settings: {
        defaultWasteFactorPercent: 12,
        defaultMachineRatePerHourZar: 50
      },
      filaments: [
        {
          id: "fil_legacy",
          name: "Legacy PLA",
          materialType: "PLA",
          brand: "Legacy",
          color: "White",
          costPerKgZar: 250,
          notes: "",
          createdAt: "2026-06-18T10:00:00.000Z",
          updatedAt: "2026-06-18T10:00:00.000Z"
        }
      ],
      jobs: [
        {
          id: "job_legacy",
          jobName: "Legacy Job",
          wasteFactorPercent: 5,
          printTimeHours: 1.5,
          machineRatePerHourZar: 35,
          parts: [
            {
              id: "part_legacy",
              partName: "Legacy Part",
              filamentId: "fil_legacy",
              weightGramsPerPart: 15,
              quantity: 2,
              createdAt: "2026-06-18T10:05:00.000Z",
              updatedAt: "2026-06-18T10:05:00.000Z"
            }
          ],
          createdAt: "2026-06-18T10:05:00.000Z",
          updatedAt: "2026-06-18T10:05:00.000Z"
        }
      ],
      lastOpenJobId: "job_legacy"
    };

    result = await requestJson(`${baseUrl}/app-state/import`, {
      method: "POST",
      body: JSON.stringify(v1State)
    });
    assert.equal(result.ok, true);
    assert.equal(result.json.version, 2);
    assert.equal(result.json.lastOpenJobId, "job_legacy");
    assert.equal(result.json.settings.defaultWasteFactorPercent, 12);
    assert.equal(result.json.settings.defaultMachineRatePerHourZar, 50);

    result = await requestJson(`${baseUrl}/jobs/job_legacy`);
    assert.equal(result.ok, true);
    assert.equal(result.json.job.parts.length, 1);
    assert.equal(roundTo(result.json.calculations.totalAdjustedWeightGrams, 2), 31.5);

    result = await requestJson(`${baseUrl}/jobs`, { method: "POST" });
    assert.equal(result.status, 201);
    assert.equal(result.json.job.wasteFactorPercent, 12);
    assert.equal(result.json.job.machineRatePerHourZar, 50);

    console.log("Verification passed.");
  } finally {
    await new Promise((resolve) => server.close(resolve));
    closeDatabase();
    if (fs.existsSync(tempDbPath)) {
      fs.unlinkSync(tempDbPath);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
