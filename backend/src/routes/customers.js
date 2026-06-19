import { Router } from "express";
import { sendNotFound, sendValidationError } from "../services/apiResponses.js";
import { deleteCustomer, getCustomerById, listCustomers, saveCustomer } from "../services/repository.js";
import { validateCustomerPayload } from "../services/requestValidation.js";

export const customersRouter = Router();

customersRouter.get("/", (_request, response) => {
  response.json({ customers: listCustomers() });
});

customersRouter.get("/:id", (request, response) => {
  const customer = getCustomerById(request.params.id);
  if (!customer) {
    sendNotFound(response, "Customer not found.");
    return;
  }
  response.json({ customer });
});

customersRouter.post("/", (request, response) => {
  const validation = validateCustomerPayload(request.body);
  if (validation.errors.length) {
    sendValidationError(response, validation.errors, validation.rowErrors);
    return;
  }
  const customer = saveCustomer(request.body);
  response.status(201).json({ customer, customers: listCustomers() });
});

customersRouter.put("/:id", (request, response) => {
  if (!getCustomerById(request.params.id)) {
    sendNotFound(response, "Customer not found.");
    return;
  }

  const validation = validateCustomerPayload(request.body);
  if (validation.errors.length) {
    sendValidationError(response, validation.errors, validation.rowErrors);
    return;
  }
  const customer = saveCustomer({ ...request.body, id: request.params.id });
  response.json({ customer, customers: listCustomers() });
});

customersRouter.delete("/:id", (request, response) => {
  if (!deleteCustomer(request.params.id)) {
    sendNotFound(response, "Customer not found.");
    return;
  }

  response.status(204).send();
});
