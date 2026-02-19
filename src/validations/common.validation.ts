import { z } from "zod";

/* -------------------- BASIC STRING RULE -------------------- */
export const nonEmptyString = (field: string, max = 255) =>
  z
    .string({ error: `${field} is required` })
    .trim()
    .min(1, `${field} is required`)
    .max(max, `${field} must be less than ${max} characters`);

/* -------------------- OPTIONAL STRING REUSABLES -------------------- */
export const optionalString255 = (field: string) =>
  z.string().trim().max(255).optional();

export const optionalString100 = (field: string) =>
  z.string().trim().max(100).optional();

export const optionalString50 = (field: string) =>
  z.string().trim().max(50).optional();

/* -------------------- COMMON FIELDS -------------------- */
export const emailField = z
  .string()
  .trim()
  .email("Invalid email format")
  .max(255);

export const optionalEmailField = emailField.optional();

export const passwordField = z
  .string({ error: "Password is required" })
  .trim()
  .min(8, "Password must be at least 8 characters")
  .max(16, "Password must be less than 16 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password");

export const phoneField = nonEmptyString("Phone", 50);

export const optionalPhoneField = optionalString50("Phone");

export const firstNameField = nonEmptyString("First name", 100);
export const lastNameField = nonEmptyString("Last name", 100);

export const optionalFirstNameField = optionalString100("First name");
export const optionalLastNameField = optionalString100("Last name");

/* -------------------- SQL DATE (YYYY-MM-DD) -------------------- */
export const sqlDateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const optionalSqlDateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .optional();

/* -------------------- LICENSE -------------------- */
export const optionalLicenseNumber = optionalString100("License number");
export const optionalLicenseState = optionalString50("License state");

/* -------------------- SPECIALTY ARRAY -------------------- */
export const optionalSpecialty = z
  .array(z.string().min(1, "Specialty cannot be empty"))
  .optional();

/* -------------------- AT LEAST ONE FIELD FOR UPDATE -------------------- */
export const atLeastOne = (schema: z.ZodObject<any>) =>
  schema.refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });
