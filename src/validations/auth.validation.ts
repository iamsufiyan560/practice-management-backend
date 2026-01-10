import { z } from "zod";
import {
  emailField,
  firstNameField,
  lastNameField,
  passwordField,
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
  token: z.string().trim().min(1, "Token is required"),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be numeric"),
  newPassword: passwordField,
});

/* ---------------- CHANGE PASSWORD ---------------- */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: "Current password is required" })
    .min(1, "Current password is required"),

  newPassword: passwordField,
});

export const generateFirstOwnerSchema = z.object({
  code: z
    .string({ error: "Setup code is required" })
    .trim()
    .min(1, "Setup code is required"),

  email: emailField,
  firstName: firstNameField,
  lastName: lastNameField,
});
