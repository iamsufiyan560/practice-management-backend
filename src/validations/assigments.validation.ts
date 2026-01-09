// validation schema
import { z } from "zod";

export const assignTherapistToSupervisorSchema = z.object({
  therapistIds: z
    .array(z.string().length(36))
    .min(1, "At least one therapist ID required"),
  supervisorId: z.string().length(36),
});

export const assignPatientToTherapistSchema = z.object({
  patientIds: z
    .array(z.string().length(36))
    .min(1, "At least one patient ID required"),
  therapistId: z.string().length(36),
});
