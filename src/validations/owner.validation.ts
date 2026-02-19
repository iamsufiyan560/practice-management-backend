import { z } from "zod";
import {
  emailField,
  firstNameField,
  lastNameField,
} from "./common.validation.js";

export const createOwnerSchema = z.object({
  email: emailField,
  firstName: firstNameField,
  lastName: lastNameField,
});

export const updateOwnerSchema = createOwnerSchema.omit({ email: true });
