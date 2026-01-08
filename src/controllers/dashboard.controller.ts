// controller
import { Request, Response } from "express";
import { eq, and, inArray, count } from "drizzle-orm";
import { db } from "../db/index.js";
import { supervisors } from "../db/schema/supervisors.schema.js";
import { therapists } from "../db/schema/therapists.schema.js";
import { patients } from "../db/schema/patients.schema.js";
import { patientSessions } from "../db/schema/patientSessions.schema.js";
import { logger } from "../config/index.js";
import { response } from "../utils/index.js";

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;

    const [
      [supervisorCount],
      [therapistCount],
      [patientCount],
      [draftSessionCount],
      [pendingSessionCount],
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(supervisors)
        .where(
          and(
            eq(supervisors.practiceId, practiceId),
            eq(supervisors.isDeleted, false),
          ),
        ),
      db
        .select({ count: count() })
        .from(therapists)
        .where(
          and(
            eq(therapists.practiceId, practiceId),
            eq(therapists.isDeleted, false),
          ),
        ),
      db
        .select({ count: count() })
        .from(patients)
        .where(
          and(
            eq(patients.practiceId, practiceId),
            eq(patients.isDeleted, false),
          ),
        ),
      db
        .select({ count: count() })
        .from(patientSessions)
        .where(
          and(
            eq(patientSessions.practiceId, practiceId),
            eq(patientSessions.reviewStatus, "DRAFT"),
            eq(patientSessions.isDeleted, false),
          ),
        ),
      db
        .select({ count: count() })
        .from(patientSessions)
        .where(
          and(
            eq(patientSessions.practiceId, practiceId),
            eq(patientSessions.reviewStatus, "PENDING"),
            eq(patientSessions.isDeleted, false),
          ),
        ),
    ]);

    const result = {
      practiceId,
      totalNumberOfSupervisors: supervisorCount?.count || 0,
      totalNumberOfTherapists: therapistCount?.count || 0,
      totalNumberOfPatients: patientCount?.count || 0,
      totalNumberOfDraftSessions: draftSessionCount?.count || 0,
      totalNumberOfPendingSessions: pendingSessionCount?.count || 0,
    };

    logger.info(`Admin dashboard data retrieved for practice ${practiceId}`);

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get admin dashboard error", { error: err });
    return response.error(res, "Failed to fetch admin dashboard data");
  }
};

export const getSupervisorDashboard = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const supervisorId = req.user?.userId!;

    // get all therapist IDs under this supervisor
    const therapistList = await db
      .select({ userId: therapists.userId })
      .from(therapists)
      .where(
        and(
          eq(therapists.practiceId, practiceId),
          eq(therapists.supervisorId, supervisorId),
          eq(therapists.isDeleted, false),
        ),
      );

    const therapistIds = therapistList.map((t) => t.userId);
    const numberOfTherapists = therapistIds.length;

    let patientCount = 0;
    let pendingSessionCount = 0;

    if (therapistIds.length > 0) {
      const [[patientCountResult], [pendingSessionCountResult]] =
        await Promise.all([
          db
            .select({ count: count() })
            .from(patients)
            .where(
              and(
                eq(patients.practiceId, practiceId),
                inArray(patients.therapistId, therapistIds),
                eq(patients.isDeleted, false),
              ),
            ),
          db
            .select({ count: count() })
            .from(patientSessions)
            .where(
              and(
                eq(patientSessions.practiceId, practiceId),
                inArray(patientSessions.therapistId, therapistIds),
                eq(patientSessions.reviewStatus, "PENDING"),
                eq(patientSessions.isDeleted, false),
              ),
            ),
        ]);

      patientCount = patientCountResult?.count || 0;
      pendingSessionCount = pendingSessionCountResult?.count || 0;
    }

    const result = {
      practiceId,
      numberOfTherapists,
      numberOfPatients: patientCount,
      numberOfSessionsPendingReview: pendingSessionCount,
    };

    logger.info(
      `Supervisor dashboard data retrieved for supervisor ${supervisorId}`,
    );

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get supervisor dashboard error", { error: err });
    return response.error(res, "Failed to fetch supervisor dashboard data");
  }
};

export const getTherapistDashboard = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const therapistId = req.user?.userId!;

    const [[patientCount], [draftSessionCount]] = await Promise.all([
      db
        .select({ count: count() })
        .from(patients)
        .where(
          and(
            eq(patients.practiceId, practiceId),
            eq(patients.therapistId, therapistId),
            eq(patients.isDeleted, false),
          ),
        ),
      db
        .select({ count: count() })
        .from(patientSessions)
        .where(
          and(
            eq(patientSessions.practiceId, practiceId),
            eq(patientSessions.therapistId, therapistId),
            eq(patientSessions.reviewStatus, "DRAFT"),
            eq(patientSessions.isDeleted, false),
          ),
        ),
    ]);

    const result = {
      practiceId,
      numberOfPatients: patientCount?.count || 0,
      numberOfSessionsInDraft: draftSessionCount?.count || 0,
    };

    logger.info(
      `Therapist dashboard data retrieved for therapist ${therapistId}`,
    );

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get therapist dashboard error", { error: err });
    return response.error(res, "Failed to fetch therapist dashboard data");
  }
};
