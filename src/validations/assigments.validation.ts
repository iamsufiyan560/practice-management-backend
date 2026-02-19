import { z } from "zod";
import { nonEmptyString } from "./common.validation.js";

export const assignTherapistToSupervisorSchema = z.object({
  therapistIds: z
    .array(nonEmptyString("Therapist ID", 36))
    .min(1, "At least one therapist ID required"),
  supervisorId: nonEmptyString("Supervisor ID", 36),
});

export const assignPatientToTherapistSchema = z.object({
  patientIds: z
    .array(nonEmptyString("Patient ID", 36))
    .min(1, "At least one patient ID required"),
  therapistId: nonEmptyString("Therapist ID", 36),
});
