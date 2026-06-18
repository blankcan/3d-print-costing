import { Router } from "express";
import { normalizeTimeHours } from "../../../shared/calculations/index.js";
import { buildJobResponse } from "../services/presentation.js";
import { createEmptyJob, deleteJob, getActiveJob, getJobById, listJobs, saveJob, setLastOpenJobId } from "../services/repository.js";

export const jobsRouter = Router();

jobsRouter.get("/", (_request, response) => {
  response.json({ jobs: listJobs() });
});

jobsRouter.get("/active/current", (_request, response) => {
  const job = getActiveJob();
  if (!job) {
    const created = createEmptyJob();
    response.json(buildJobResponse(created));
    return;
  }
  response.json(buildJobResponse(job));
});

jobsRouter.post("/", (_request, response) => {
  const job = createEmptyJob();
  response.status(201).json(buildJobResponse(job));
});

jobsRouter.get("/:id", (request, response) => {
  const job = getJobById(request.params.id);
  if (!job) {
    response.status(404).json({ error: "Job not found." });
    return;
  }
  setLastOpenJobId(job.id);
  response.json(buildJobResponse(job));
});

jobsRouter.put("/:id", (request, response) => {
  const payload = {
    ...request.body,
    id: request.params.id,
    printTimeHours: normalizeTimeHours(request.body.printTimeInputHours, request.body.printTimeInputMinutes)
  };
  const job = saveJob(payload);
  response.json(buildJobResponse(job));
});

jobsRouter.delete("/:id", (request, response) => {
  deleteJob(request.params.id);
  response.status(204).send();
});
