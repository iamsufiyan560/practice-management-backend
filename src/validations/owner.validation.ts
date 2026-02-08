import { z } from "zod";
import {
  emailField,
  atLeastOne,
  firstNameField,
  lastNameField,
} from "./common.validation.js";

export const createOwnerSchema = z.object({
  email: emailField,
  firstName: firstNameField,
  lastName: lastNameField,
});

export const updateOwnerSchema = atLeastOne(
  createOwnerSchema.omit({ email: true }).partial(),
);
