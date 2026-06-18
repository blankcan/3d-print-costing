import { calculateJob, validateFilamentRecord } from "../../../shared/calculations/index.js";
import { getJobById, getActiveJob, listFilaments } from "./repository.js";

export function buildJobResponse(job) {
  const filaments = listFilaments();
  const calculations = calculateJob(job, filaments);
  return {
    job,
    calculations
  };
}

export function buildActiveStateResponse() {
  const filaments = listFilaments();
  let activeJob = getActiveJob();
  if (!activeJob) {
    return {
      filaments,
      jobs: [],
      activeJob: null,
      calculations: null
    };
  }

  activeJob = getJobById(activeJob.id);

  return {
    filaments,
    jobs: [],
    activeJob,
    calculations: calculateJob(activeJob, filaments)
  };
}

export function getFilamentValidationErrors(input) {
  return validateFilamentRecord(input);
}
