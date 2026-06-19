import { Router } from "express";
import { calculateJob } from "../../../shared/calculations/index.js";
import { getActiveJob, getSettings, listCustomers, listFilaments, listJobs } from "../services/repository.js";

export const bootstrapRouter = Router();

bootstrapRouter.get("/", (_request, response) => {
  const filaments = listFilaments();
  const customers = listCustomers();
  const jobs = listJobs();
  const activeJob = getActiveJob();
  response.json({
    settings: getSettings(),
    customers,
    filaments,
    jobs,
    activeJob,
    calculations: activeJob ? calculateJob(activeJob, filaments) : null
  });
});
