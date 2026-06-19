import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { createApp } from "../src/server/createApp.js";
import { closeDatabase } from "../src/db/database.js";

function createTempDbPath() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "printing-costing-api-"));
  return {
    dir,
    dbPath: path.join(dir, "app.db")
  };
}

function cleanupTempDb(temp) {
  closeDatabase();
  fs.rmSync(temp.dir, { recursive: true, force: true });
}

function requestJson(baseUrl, route, options = {}) {
  const url = new URL(route.replace(/^\//, ""), `${baseUrl}/`);
  const body = options.body || null;

  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search}`,
        method: options.method || "GET",
        headers: body ? { "Content-Type": "application/json" } : {}
      },
      (response) => {
        let raw = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          raw += chunk;
        });
        response.on("end", () => {
          resolve({
            status: response.statusCode,
            json: raw ? JSON.parse(raw) : null
          });
        });
      }
    );

    request.on("error", reject);
    if (body) {
      request.write(body);
    }
    request.end();
  });
}

async function withServer(run) {
  const temp = createTempDbPath();
  process.env.APP_DB_PATH = temp.dbPath;
  const app = createApp();
  const server = app.listen(0);
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

  try {
    await run(baseUrl);
  } finally {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
    cleanupTempDb(temp);
  }
}

test("missing jobs and filaments return 404 on update and delete", async () => {
  await withServer(async (baseUrl) => {
    let response = await requestJson(baseUrl, "/jobs/missing", {
      method: "PUT",
      body: JSON.stringify({})
    });
    assert.equal(response.status, 404);
    assert.equal(response.json.error, "Job not found.");

    response = await requestJson(baseUrl, "/jobs/missing", {
      method: "DELETE"
    });
    assert.equal(response.status, 404);
    assert.equal(response.json.error, "Job not found.");

    response = await requestJson(baseUrl, "/filaments/missing", {
      method: "PUT",
      body: JSON.stringify({})
    });
    assert.equal(response.status, 404);
    assert.equal(response.json.error, "Filament not found.");

    response = await requestJson(baseUrl, "/filaments/missing", {
      method: "DELETE"
    });
    assert.equal(response.status, 404);
    assert.equal(response.json.error, "Filament not found.");
  });
});

test("invalid settings, filament, and job payloads return structured 400 responses", async () => {
  await withServer(async (baseUrl) => {
    let response = await requestJson(baseUrl, "/settings", {
      method: "PUT",
      body: JSON.stringify({
        defaultMachineRatePerHourZar: -1,
        defaultWasteFactorPercent: 0
      })
    });
    assert.equal(response.status, 400);
    assert.equal(response.json.error, "Validation failed.");
    assert.ok(Array.isArray(response.json.validation.errors));

    response = await requestJson(baseUrl, "/filaments", {
      method: "POST",
      body: JSON.stringify({
        name: "",
        materialType: "",
        costPerKgZar: "abc"
      })
    });
    assert.equal(response.status, 400);
    assert.equal(response.json.error, "Validation failed.");
    assert.ok(response.json.validation.errors.length >= 1);

    const filamentResponse = await requestJson(baseUrl, "/filaments", {
      method: "POST",
      body: JSON.stringify({
        name: "PLA Black",
        materialType: "PLA",
        brand: "Generic",
        color: "Black",
        costPerKgZar: 300,
        notes: ""
      })
    });
    const jobResponse = await requestJson(baseUrl, "/jobs", { method: "POST" });

    response = await requestJson(baseUrl, `/jobs/${jobResponse.json.job.id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...jobResponse.json.job,
        wasteFactorPercent: 5,
        machineRatePerHourZar: 30,
        printTimeInputHours: 0,
        printTimeInputMinutes: 60,
        parts: [
          {
            id: "p1",
            partName: "Bracket",
            filamentId: filamentResponse.json.filament.id,
            weightGramsPerPart: 25,
            quantity: 1
          }
        ]
      })
    });
    assert.equal(response.status, 400);
    assert.equal(response.json.error, "Validation failed.");
    assert.deepEqual(response.json.validation.rowErrors, {});
    assert.ok(response.json.validation.errors.includes("Print time minutes must be a whole number from 0 to 59."));
  });
});
