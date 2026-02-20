import { z } from "zod";
import { nonEmptyString, optionalString255 } from "./common.validation.js";

const sessionTypeEnum = z.enum(["INITIAL", "FOLLOW_UP", "CRISIS"]);

export const createSessionSchema = z.object({
  patientId: nonEmptyString("Patient ID", 36),
  scheduledDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/), // MM/DD/YYYY
  startTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  endTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  sessionType: sessionTypeEnum,
  subjective: optionalString255("Subjective"),
  objective: optionalString255("Objective"),
  assessment: optionalString255("Assessment"),
  plan: optionalString255("Plan"),
  additionalNotes: optionalString255("Additional notes"),
});

export const updateSessionSchema = createSessionSchema.omit({
  patientId: true,
});

export const reviewSessionSchema = z.object({
  reviewComment: nonEmptyString("Review comment is required"),
});
