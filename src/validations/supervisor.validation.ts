import { z } from "zod";
import {
  emailField,
  firstNameField,
  lastNameField,
  phoneField,
  optionalLicenseNumber,
  optionalLicenseState,
  optionalSqlDateField,
  optionalSpecialty,
  atLeastOne,
} from "./common.validation.js";

export const createSupervisorSchema = z.object({
  email: emailField,
  firstName: firstNameField,
  lastName: lastNameField,
  phone: phoneField,

  licenseNumber: optionalLicenseNumber,
  licenseState: optionalLicenseState,
  licenseExpiry: optionalSqlDateField,
  specialty: optionalSpecialty,
});

export const updateSupervisorSchema = atLeastOne(
  createSupervisorSchema.omit({ email: true }).partial(),
);
