export function buildValidationPayload(errors = [], rowErrors = {}) {
  return {
    errors,
    rowErrors
  };
}

export function sendValidationError(response, errors = [], rowErrors = {}) {
  response.status(400).json({
    error: "Validation failed.",
    validation: buildValidationPayload(errors, rowErrors)
  });
}

export function sendNotFound(response, message) {
  response.status(404).json({ error: message });
}
