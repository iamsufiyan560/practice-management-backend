import { z } from "zod";
import {
  emailField,
  firstNameField,
  lastNameField,
  phoneField,
  optionalSqlDateField,
  atLeastOne,
} from "./common.validation.js";

const addressField = z
  .object({
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  })
  .optional();

const emergencyContactField = z
  .object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    authorized: z.boolean().optional(),
  })
  .optional();

export const createPatientSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  email: emailField.optional(),
  phone: phoneField.optional(),
  gender: z.string().max(20).optional(),
  dob: optionalSqlDateField,
  address: addressField,
  emergencyContact: emergencyContactField,
});

export const updatePatientSchema = atLeastOne(createPatientSchema.partial());
