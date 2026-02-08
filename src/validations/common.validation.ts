import { z } from "zod";

/* -------------------- BASIC STRING RULE -------------------- */
const nonEmptyString = (field: string, max = 255) =>
  z
    .string({ error: `${field} is required` })
    .trim()
    .min(1, `${field} is required`)
    .max(max, `${field} must be less than ${max} characters`);

/* -------------------- COMMON FIELDS -------------------- */
export const emailField = z.email("Invalid email format").max(255);

export const optionalEmailField = z

  .email("Invalid email format")
  .max(255)
  .optional();

export const phoneField = nonEmptyString("Phone", 50);

export const optionalPhoneField = z
  .string()
  .trim()
  .min(1, "Phone cannot be empty")
  .max(50)
  .optional();

export const firstNameField = nonEmptyString("First name", 100);
export const lastNameField = nonEmptyString("Last name", 100);

export const optionalFirstNameField = z
  .string()
  .trim()
  .min(1, "First name cannot be empty")
  .max(100)
  .optional();

export const optionalLastNameField = z
  .string()
  .trim()
  .min(1, "Last name cannot be empty")
  .max(100)
  .optional();

/* -------------------- SQL DATE (YYYY-MM-DD) -------------------- */
export const sqlDateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const optionalSqlDateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .optional();

/* -------------------- STATUS ENUMS -------------------- */
export const statusField = z.enum(["ACTIVE", "INACTIVE"]);

/* -------------------- LICENSE -------------------- */
export const optionalLicenseNumber = z
  .string()
  .trim()
  .min(1, "License number cannot be empty")
  .max(100)
  .optional();

export const optionalLicenseState = z
  .string()
  .trim()
  .min(1, "License state cannot be empty")
  .max(50)
  .optional();

/* -------------------- SPECIALTY ARRAY -------------------- */
export const optionalSpecialty = z
  .array(z.string().min(1, "Specialty cannot be empty"))
  .optional();

/* -------------------- PRACTICE ADDRESS -------------------- */
export const optionalString255 = (field: string) =>
  z.string().trim().min(1, `${field} cannot be empty`).max(255).optional();

export const optionalString100 = (field: string) =>
  z.string().trim().min(1, `${field} cannot be empty`).max(100).optional();

export const optionalString50 = (field: string) =>
  z.string().trim().min(1, `${field} cannot be empty`).max(50).optional();

/* -------------------- AT LEAST ONE FIELD FOR UPDATE -------------------- */
export const atLeastOne = (schema: z.ZodObject<any>) =>
  schema.refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });
