import { calculateJob } from "../../../shared/calculations/index.js";
import { listFilaments } from "./repository.js";

export function buildJobResponse(job) {
  const filaments = listFilaments();
  return {
    job,
    calculations: calculateJob(job, filaments)
  };
}
