import { z } from "zod";
import {
  emailField,
  firstNameField,
  lastNameField,
  passwordField,
  nonEmptyString,
} from "./common.validation.js";

/* ---------------- LOGIN ---------------- */
export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

/* ---------------- FORGOT PASSWORD ---------------- */
export const forgotPasswordSchema = z.object({
  email: emailField,
});

/* ---------------- RESET PASSWORD ---------------- */
export const resetPasswordSchema = z.object({
  token: nonEmptyString("Token"),
  otp: z
    .string()
    .trim()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be numeric"),
  newPassword: passwordField,
});

/* ---------------- CHANGE PASSWORD ---------------- */
export const changePasswordSchema = z.object({
  currentPassword: nonEmptyString("Current password"),
  newPassword: passwordField,
});

/* ---------------- FIRST OWNER ---------------- */
export const generateFirstOwnerSchema = z.object({
  code: nonEmptyString("Setup code"),
  email: emailField,
  firstName: firstNameField,
  lastName: lastNameField,
});
