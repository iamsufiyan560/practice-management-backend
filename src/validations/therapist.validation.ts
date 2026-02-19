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

export const createTherapistSchema = z.object({
  email: emailField,
  firstName: firstNameField,
  lastName: lastNameField,
  phone: phoneField,

  licenseNumber: optionalLicenseNumber,
  licenseState: optionalLicenseState,
  licenseExpiry: optionalSqlDateField,
  specialty: optionalSpecialty,
});

export const updateTherapistSchema = createTherapistSchema.omit({
  email: true,
});
