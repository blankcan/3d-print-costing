import { Router } from "express";
import { sendNotFound, sendValidationError } from "../services/apiResponses.js";
import { removeStoredJobImage, saveJobImageUpload } from "../services/jobImages.js";
import { buildJobResponse } from "../services/presentation.js";
import { buildPersistableJobPayload, validateJobImagePayload, validateJobPayload } from "../services/requestValidation.js";
import {
  clearJobImage,
  createEmptyJob,
  deleteJob,
  getActiveJob,
  getJobById,
  listCustomers,
  listFilaments,
  listJobs,
  saveJob,
  setLastOpenJobId,
  updateJobImage
} from "../services/repository.js";

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
    sendNotFound(response, "Job not found.");
    return;
  }
  setLastOpenJobId(job.id);
  response.json(buildJobResponse(job));
});

jobsRouter.put("/:id", (request, response) => {
  const existingJob = getJobById(request.params.id);
  if (!existingJob) {
    sendNotFound(response, "Job not found.");
    return;
  }

  const payload = { ...request.body, id: request.params.id };
  const validation = validateJobPayload(payload, {
    filaments: listFilaments(),
    customers: listCustomers()
  });
  if (!validation.isComplete) {
    sendValidationError(response, validation.errors, validation.rowErrors);
    return;
  }

  const job = saveJob(buildPersistableJobPayload(payload));
  response.json(buildJobResponse(job));
});

jobsRouter.post("/:id/image", (request, response) => {
  const existingJob = getJobById(request.params.id);
  if (!existingJob) {
    sendNotFound(response, "Job not found.");
    return;
  }

  const validation = validateJobImagePayload(request.body);
  if (validation.errors.length) {
    sendValidationError(response, validation.errors, validation.rowErrors);
    return;
  }

  let savedImage;
  try {
    savedImage = saveJobImageUpload({
      jobId: existingJob.id,
      fileName: request.body?.fileName,
      mimeType: request.body?.mimeType,
      base64Data: request.body?.base64Data
    });
  } catch (error) {
    sendValidationError(response, [error.message || "Image upload failed."]);
    return;
  }

  try {
    const job = updateJobImage(existingJob.id, savedImage);
    if (!job) {
      removeStoredJobImage(savedImage.imagePath);
      sendNotFound(response, "Job not found.");
      return;
    }
    if (existingJob.imagePath && existingJob.imagePath !== savedImage.imagePath) {
      removeStoredJobImage(existingJob.imagePath);
    }
    response.json(buildJobResponse(job));
  } catch (error) {
    removeStoredJobImage(savedImage.imagePath);
    throw error;
  }
});

jobsRouter.delete("/:id/image", (request, response) => {
  const existingJob = getJobById(request.params.id);
  if (!existingJob) {
    sendNotFound(response, "Job not found.");
    return;
  }

  const result = clearJobImage(existingJob.id);
  if (!result) {
    sendNotFound(response, "Job not found.");
    return;
  }

  removeStoredJobImage(result.previousImagePath);
  response.json(buildJobResponse(result.job));
});

jobsRouter.delete("/:id", (request, response) => {
  if (!deleteJob(request.params.id)) {
    sendNotFound(response, "Job not found.");
    return;
  }

  response.status(204).send();
});
