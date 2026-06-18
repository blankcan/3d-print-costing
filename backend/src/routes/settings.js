import { Router } from "express";
import { getSettings, saveSettings } from "../services/repository.js";

export const settingsRouter = Router();

function validateSettings(input) {
  const errors = [];
  const machineRate = Number(input?.defaultMachineRatePerHourZar ?? 0);
  const wasteFactor = Number(input?.defaultWasteFactorPercent ?? 0);

  if (!Number.isFinite(machineRate) || machineRate < 0) {
    errors.push("Default machine rate must be 0 or greater.");
  }
  if (!Number.isFinite(wasteFactor) || wasteFactor < 0) {
    errors.push("Default waste % must be 0 or greater.");
  }

  return errors;
}

settingsRouter.get("/", (_request, response) => {
  response.json({ settings: getSettings() });
});

settingsRouter.put("/", (request, response) => {
  const errors = validateSettings(request.body);
  if (errors.length) {
    response.status(400).json({ error: errors.join(" ") });
    return;
  }

  response.json({ settings: saveSettings(request.body) });
});
