import { Router } from "express";
import { calculateJob } from "../../../shared/calculations/index.js";
import { getActiveJob, getSettings, listFilaments, listJobs } from "../services/repository.js";

export const bootstrapRouter = Router();

bootstrapRouter.get("/", (_request, response) => {
  const filaments = listFilaments();
  const jobs = listJobs();
  const activeJob = getActiveJob();
  response.json({
    settings: getSettings(),
    filaments,
    jobs,
    activeJob,
    calculations: activeJob ? calculateJob(activeJob, filaments) : null
  });
});
