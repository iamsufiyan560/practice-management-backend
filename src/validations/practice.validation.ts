import { z } from "zod";
import {
  nonEmptyString,
  optionalString255,
  optionalString100,
  optionalString50,
  optionalPhoneField,
  emailField,
} from "./common.validation.js";

export const createPracticeSchema = z.object({
  name: nonEmptyString("Practice name"), // required

  legalName: optionalString255("Legal name"),
  taxId: optionalString50("Tax ID"),
  npiNumber: optionalString50("NPI number"),

  phone: optionalPhoneField,
  email: emailField, // required

  website: optionalString255("Website"),

  addressLine1: optionalString255("Address line 1"),
  addressLine2: optionalString255("Address line 2"),
  city: optionalString100("City"),
  state: optionalString100("State"),
  postalCode: optionalString50("Postal code"),
  country: optionalString100("Country"),
});

export const updatePracticeSchema = createPracticeSchema;
