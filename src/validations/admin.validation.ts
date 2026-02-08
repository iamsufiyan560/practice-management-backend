import { z } from "zod";
import {
  emailField,
  firstNameField,
  lastNameField,
  phoneField,
  statusField,
  atLeastOne,
} from "./common.validation.js";

export const createAdminSchema = z.object({
  email: emailField,
  firstName: firstNameField,
  lastName: lastNameField,
  phone: phoneField,
});

export const updateAdminSchema = atLeastOne(
  createAdminSchema.omit({ email: true }).partial().extend({
    status: statusField.optional(),
  }),
);
