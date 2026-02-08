import { z } from "zod";
import {
  optionalString255,
  optionalString100,
  optionalString50,
  atLeastOne,
  phoneField,
  emailField,
} from "./common.validation.js";

export const createPracticeSchema = z.object({
  name: z.string().trim().min(1, "Practice name is required").max(255),

  legalName: optionalString255("Legal name"),
  taxId: optionalString50("Tax ID"),
  npiNumber: optionalString50("NPI number"),

  phone: phoneField,
  email: emailField,
  website: optionalString255("Website"),

  addressLine1: optionalString255("Address line 1"),
  addressLine2: optionalString255("Address line 2"),
  city: optionalString100("City"),
  state: optionalString100("State"),
  postalCode: optionalString50("Postal code"),
  country: optionalString100("Country"),
});

export const updatePracticeSchema = atLeastOne(createPracticeSchema.partial());
