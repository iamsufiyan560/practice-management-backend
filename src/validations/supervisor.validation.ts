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

export const updateSupervisorSchema = createSupervisorSchema.omit({
  email: true,
});
