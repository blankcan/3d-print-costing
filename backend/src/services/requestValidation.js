import {
  getSupportedImageMimeTypes
} from "./jobImages.js";
import {
  normalizeBooleanFlag,
  normalizeJobStatus,
  normalizeTimeHours,
  validateCustomerRecord,
  validateFilamentRecord,
  validateJobInputs,
  validateSettingsRecord
} from "../../../shared/calculations/index.js";

export function validateSettingsPayload(payload) {
  return {
    errors: validateSettingsRecord(payload),
    rowErrors: {}
  };
}

export function validateFilamentPayload(payload) {
  return {
    errors: validateFilamentRecord(payload),
    rowErrors: {}
  };
}

export function validateCustomerPayload(payload) {
  return {
    errors: validateCustomerRecord(payload),
    rowErrors: {}
  };
}

export function validateJobPayload(payload, { filaments, customers }) {
  return validateJobInputs(payload, filaments, { customers });
}

export function buildPersistableJobPayload(payload) {
  return {
    ...payload,
    status: normalizeJobStatus(payload.status),
    paid: normalizeBooleanFlag(payload.paid),
    delivered: normalizeBooleanFlag(payload.delivered),
    printTimeHours: normalizeTimeHours(payload.printTimeInputHours, payload.printTimeInputMinutes)
  };
}

export function validateJobImagePayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    errors.push("Image payload is malformed.");
    return {
      errors,
      rowErrors: {}
    };
  }

  if (!String(payload.fileName || "").trim()) {
    errors.push("Image file name is required.");
  }

  if (!String(payload.base64Data || "").trim()) {
    errors.push("Image file data is required.");
  }

  if (!getSupportedImageMimeTypes().includes(String(payload.mimeType || "").toLowerCase())) {
    errors.push(`Unsupported image type. Supported formats: ${getSupportedImageMimeTypes().join(", ")}.`);
  }

  return {
    errors,
    rowErrors: {}
  };
}
