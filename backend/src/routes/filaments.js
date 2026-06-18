import { Router } from "express";
import { deleteFilament, getFilamentById, listFilaments, saveFilament } from "../services/repository.js";
import { getFilamentValidationErrors } from "../services/presentation.js";

export const filamentsRouter = Router();

filamentsRouter.get("/", (_request, response) => {
  response.json({ filaments: listFilaments() });
});

filamentsRouter.get("/:id", (request, response) => {
  const filament = getFilamentById(request.params.id);
  if (!filament) {
    response.status(404).json({ error: "Filament not found." });
    return;
  }
  response.json({ filament });
});

filamentsRouter.post("/", (request, response) => {
  const errors = getFilamentValidationErrors(request.body);
  if (errors.length) {
    response.status(400).json({ error: errors.join(" ") });
    return;
  }
  const filament = saveFilament(request.body);
  response.status(201).json({ filament, filaments: listFilaments() });
});

filamentsRouter.put("/:id", (request, response) => {
  const errors = getFilamentValidationErrors(request.body);
  if (errors.length) {
    response.status(400).json({ error: errors.join(" ") });
    return;
  }
  const filament = saveFilament({ ...request.body, id: request.params.id });
  response.json({ filament, filaments: listFilaments() });
});

filamentsRouter.delete("/:id", (request, response) => {
  deleteFilament(request.params.id);
  response.status(204).send();
});
