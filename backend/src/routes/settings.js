import { Router } from "express";
import { sendValidationError } from "../services/apiResponses.js";
import { getSettings, saveSettings } from "../services/repository.js";
import { validateSettingsPayload } from "../services/requestValidation.js";

export const settingsRouter = Router();

settingsRouter.get("/", (_request, response) => {
  response.json({ settings: getSettings() });
});

settingsRouter.put("/", (request, response) => {
  const validation = validateSettingsPayload(request.body);
  if (validation.errors.length) {
    sendValidationError(response, validation.errors, validation.rowErrors);
    return;
  }

  response.json({ settings: saveSettings(request.body) });
});
