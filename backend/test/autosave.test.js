import test from "node:test";
import assert from "node:assert/strict";
import { createJobAutosaveManager } from "../../frontend/src/utils/jobAutosave.js";

test("stale autosave responses never overwrite newer saves", async () => {
  const requests = [];
  const applied = [];
  const states = [];

  const manager = createJobAutosaveManager({
    delay: 1,
    persist: (job) =>
      new Promise((resolve) => {
        requests.push({
          job,
          resolve
        });
      }),
    onStateChange: (state) => {
      states.push(state.status);
    },
    onApplyServerState: (result) => {
      applied.push(result.job.jobName);
    }
  });

  manager.schedule({ id: "job_1", jobName: "Old value" });
  const firstSave = manager.flushNow();

  manager.schedule({ id: "job_1", jobName: "New value" });
  const secondSave = manager.flushNow();

  requests[0].resolve({ job: { id: "job_1", jobName: "Old value" } });
  await firstSave;
  requests[1].resolve({ job: { id: "job_1", jobName: "New value" } });
  await secondSave;

  assert.deepEqual(applied, ["New value"]);
  assert.ok(states.includes("saving"));
  assert.equal(states.at(-1), "saved");
  manager.dispose();
});
