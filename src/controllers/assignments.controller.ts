// controller
import { Request, Response } from "express";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { therapists } from "../db/schema/therapists.schema.js";
import { patients } from "../db/schema/patients.schema.js";
import { supervisors } from "../db/schema/supervisors.schema.js";
import { logger } from "../config/index.js";
import { response } from "../utils/index.js";

export const assignTherapistToSupervisor = async (
  req: Request,
  res: Response,
) => {
  try {
    const practiceId = req.practiceId!;
    const { therapistIds, supervisorId } = req.body;

    // verify supervisor exists
    const [supervisor] = await db
      .select()
      .from(supervisors)
      .where(
        and(
          eq(supervisors.userId, supervisorId),
          eq(supervisors.practiceId, practiceId),
          eq(supervisors.isDeleted, false),
        ),
      )
      .limit(1);

    if (!supervisor) {
      logger.warn(
        `Supervisor ${supervisorId} not found in practice ${practiceId}`,
      );
      return response.notFound(res, "Supervisor not found");
    }

    // update all therapists
    await db
      .update(therapists)
      .set({ supervisorId })
      .where(
        and(
          inArray(therapists.userId, therapistIds),
          eq(therapists.practiceId, practiceId),
          eq(therapists.isDeleted, false),
        ),
      );

    logger.info(
      `Assigned ${therapistIds.length} therapists to supervisor ${supervisorId}`,
    );

    return response.ok(
      res,
      null,
      "Therapists assigned to supervisor successfully",
    );
  } catch (err) {
    logger.error("Assign therapist to supervisor error", { error: err });
    return response.error(res, "Failed to assign therapists to supervisor");
  }
};

export const assignPatientToTherapist = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const updatedBy = req.user?.userId!;
    const { patientIds, therapistId } = req.body;

    // verify therapist exists
    const [therapist] = await db
      .select()
      .from(therapists)
      .where(
        and(
          eq(therapists.userId, therapistId),
          eq(therapists.practiceId, practiceId),
          eq(therapists.isDeleted, false),
        ),
      )
      .limit(1);

    if (!therapist) {
      logger.warn(
        `Therapist ${therapistId} not found in practice ${practiceId}`,
      );
      return response.notFound(res, "Therapist not found");
    }

    // update all patients
    await db
      .update(patients)
      .set({ therapistId, updatedBy })
      .where(
        and(
          inArray(patients.id, patientIds),
          eq(patients.practiceId, practiceId),
          eq(patients.isDeleted, false),
        ),
      );

    logger.info(
      `Assigned ${patientIds.length} patients to therapist ${therapistId}`,
    );

    return response.ok(
      res,
      null,
      "Patients assigned to therapist successfully",
    );
  } catch (err) {
    logger.error("Assign patient to therapist error", { error: err });
    return response.error(res, "Failed to assign patients to therapist");
  }
};
