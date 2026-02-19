import { z } from "zod";
import {
  emailField,
  firstNameField,
  lastNameField,
  phoneField,
  nonEmptyString,
  optionalString255,
  optionalString100,
  optionalString50,
  sqlDateField,
} from "./common.validation.js";

/* -------------------- ADDRESS -------------------- */
const addressField = z
  .object({
    addressLine1: optionalString255("Address line 1"),
    addressLine2: optionalString255("Address line 2"),
    city: optionalString100("City"),
    state: optionalString100("State"),
    postalCode: optionalString50("Postal code"),
    country: optionalString100("Country"),
  })
  .optional();

/* -------------------- EMERGENCY CONTACT -------------------- */
const emergencyContactField = z
  .object({
    name: optionalString100("Emergency contact name"),
    relationship: optionalString100("Relationship"),
    phone: optionalString50("Emergency contact phone"),
    email: emailField.optional(),
    authorized: z.boolean().optional(),
  })
  .optional();

/* -------------------- CREATE -------------------- */
/* must match DB .notNull() */
export const createPatientSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,

  email: emailField, // required
  phone: phoneField, // required

  gender: nonEmptyString("Gender", 20), // required
  dob: sqlDateField, // required YYYY-MM-DD

  address: addressField,
  emergencyContact: emergencyContactField,
});

/* -------------------- UPDATE -------------------- */
export const updatePatientSchema = createPatientSchema;
