import { Router } from "express";
import { sendNotFound, sendValidationError } from "../services/apiResponses.js";
import { deleteFilament, getFilamentById, listFilaments, saveFilament } from "../services/repository.js";
import { validateFilamentPayload } from "../services/requestValidation.js";

export const filamentsRouter = Router();

filamentsRouter.get("/", (_request, response) => {
  response.json({ filaments: listFilaments() });
});

filamentsRouter.get("/:id", (request, response) => {
  const filament = getFilamentById(request.params.id);
  if (!filament) {
    sendNotFound(response, "Filament not found.");
    return;
  }
  response.json({ filament });
});

filamentsRouter.post("/", (request, response) => {
  const validation = validateFilamentPayload(request.body);
  if (validation.errors.length) {
    sendValidationError(response, validation.errors, validation.rowErrors);
    return;
  }
  const filament = saveFilament(request.body);
  response.status(201).json({ filament, filaments: listFilaments() });
});

filamentsRouter.put("/:id", (request, response) => {
  if (!getFilamentById(request.params.id)) {
    sendNotFound(response, "Filament not found.");
    return;
  }

  const validation = validateFilamentPayload(request.body);
  if (validation.errors.length) {
    sendValidationError(response, validation.errors, validation.rowErrors);
    return;
  }
  const filament = saveFilament({ ...request.body, id: request.params.id });
  response.json({ filament, filaments: listFilaments() });
});

filamentsRouter.delete("/:id", (request, response) => {
  if (!deleteFilament(request.params.id)) {
    sendNotFound(response, "Filament not found.");
    return;
  }

  response.status(204).send();
});
