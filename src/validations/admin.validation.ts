import { z } from "zod";
import {
  emailField,
  firstNameField,
  lastNameField,
  phoneField,
} from "./common.validation.js";

export const createAdminSchema = z.object({
  email: emailField,
  firstName: firstNameField,
  lastName: lastNameField,
  phone: phoneField,
});

export const updateAdminSchema = createAdminSchema.omit({ email: true });
