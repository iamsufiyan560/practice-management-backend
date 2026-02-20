// controller
import { Request, Response } from "express";
import { eq, and, gt, desc, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { patientSessions } from "../db/schema/patientSessions.schema.js";
import { patients } from "../db/schema/patients.schema.js";
import { therapists } from "../db/schema/therapists.schema.js";
import { logger } from "../config/index.js";
import { response } from "../utils/index.js";

const formatSessionResponse = (
  session: any,
  patient: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null,
  therapist: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null,
) => ({
  id: session.id,
  practiceId: session.practiceId,
  patientId: session.patientId,
  therapistId: session.therapistId,
  scheduledStart: session.scheduledStart,
  scheduledEnd: session.scheduledEnd,
  sessionType: session.sessionType,
  subjective: session.subjective,
  objective: session.objective,
  assessment: session.assessment,
  plan: session.plan,
  additionalNotes: session.additionalNotes,
  aiSummary: session.aiSummary,
  reviewStatus: session.reviewStatus,
  reviewComment: session.reviewComment,
  createdAt: session.createdAt,
  updatedAt: session.updatedAt,
  patient: patient
    ? {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
      }
    : null,
  therapist: therapist
    ? {
        id: therapist.id,
        firstName: therapist.firstName,
        lastName: therapist.lastName,
      }
    : null,
});

export const createSession = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const therapistId = req.user?.userId!;
    const createdBy = req.user?.userId!;
    const {
      patientId,
      scheduledDate,
      startTime,
      endTime,
      sessionType,
      subjective,
      objective,
      assessment,
      plan,
      additionalNotes,
    } = req.body;

    const [month, day, year] = scheduledDate.split("/");
    const scheduledStart = new Date(`${year}-${month}-${day}T${startTime}:00`);
    const scheduledEnd = new Date(`${year}-${month}-${day}T${endTime}:00`);

    // verify patient exists in practice and assigned to this therapist
    const [patient] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, patientId),
          eq(patients.practiceId, practiceId),
          eq(patients.therapistId, therapistId),
          eq(patients.isDeleted, false),
        ),
      )
      .limit(1);

    if (!patient) {
      logger.warn(
        `Patient ${patientId} not found or not assigned to therapist ${therapistId}`,
      );
      return response.badRequest(
        res,
        "Patient not found or not assigned to you",
      );
    }

    const inserted = await db
      .insert(patientSessions)
      .values({
        practiceId,
        patientId,
        therapistId,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        sessionType,
        subjective,
        objective,
        assessment,
        plan,
        additionalNotes,
        reviewStatus: "DRAFT",
        createdBy,
        updatedBy: createdBy,
      })
      .$returningId();

    if (!inserted.length) {
      logger.error("Session insert failed");
      return response.error(res, "Failed to create session");
    }

    const sessionId = inserted[0]!.id;

    logger.info(
      `Session created ${sessionId} by therapist ${therapistId} for patient ${patientId}`,
    );

    return response.created(
      res,
      {
        id: sessionId,
        practiceId,
        patientId,
        therapistId,
        reviewStatus: "DRAFT",
      },
      "Session created successfully",
    );
  } catch (err) {
    logger.error("Create session error", { error: err });
    return response.error(res, "Failed to create session");
  }
};

export const getSessionById = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const sessionIdParam = req.params.sessionId;

    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId) {
      logger.warn("Get session called without id");
      return response.badRequest(res, "Session ID is required");
    }

    const [result] = await db
      .select({
        id: patientSessions.id,
        practiceId: patientSessions.practiceId,
        patientId: patientSessions.patientId,
        therapistId: patientSessions.therapistId,
        scheduledStart: patientSessions.scheduledStart,
        scheduledEnd: patientSessions.scheduledEnd,
        sessionType: patientSessions.sessionType,
        subjective: patientSessions.subjective,
        objective: patientSessions.objective,
        assessment: patientSessions.assessment,
        plan: patientSessions.plan,
        additionalNotes: patientSessions.additionalNotes,
        aiSummary: patientSessions.aiSummary,
        reviewStatus: patientSessions.reviewStatus,
        reviewComment: patientSessions.reviewComment,
        createdAt: patientSessions.createdAt,
        updatedAt: patientSessions.updatedAt,
        patientFirstName: patients.firstName,
        patientLastName: patients.lastName,
        therapistFirstName: therapists.firstName,
        therapistLastName: therapists.lastName,
      })
      .from(patientSessions)
      .leftJoin(patients, eq(patientSessions.patientId, patients.id))
      .leftJoin(therapists, eq(patientSessions.therapistId, therapists.userId))
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.practiceId, practiceId),
          eq(patientSessions.isDeleted, false),
        ),
      )
      .limit(1);

    if (!result) {
      logger.warn(`Session not found ${sessionId} in practice ${practiceId}`);
      return response.notFound(res, "Session not found");
    }

    const formattedResult = formatSessionResponse(
      result,
      result.patientFirstName || result.patientLastName
        ? {
            id: result.patientId,
            firstName: result.patientFirstName,
            lastName: result.patientLastName,
          }
        : null,
      result.therapistFirstName || result.therapistLastName
        ? {
            id: result.therapistId,
            firstName: result.therapistFirstName,
            lastName: result.therapistLastName,
          }
        : null,
    );

    logger.info(`Retrieved session ${sessionId} from practice ${practiceId}`);

    return response.ok(res, formattedResult);
  } catch (err) {
    logger.error("Get session by id error", { error: err });
    return response.error(res, "Failed to fetch session");
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const sessionIdParam = req.params.sessionId;
    const updatedBy = req.user?.userId!;
    const {
      scheduledDate,
      startTime,
      endTime,
      sessionType,
      subjective,
      objective,
      assessment,
      plan,
      additionalNotes,
    } = req.body;

    const [month, day, year] = scheduledDate.split("/");
    const scheduledStart = new Date(`${year}-${month}-${day}T${startTime}:00`);
    const scheduledEnd = new Date(`${year}-${month}-${day}T${endTime}:00`);

    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId) {
      logger.warn("Update session called without id");
      return response.badRequest(res, "Session ID is required");
    }

    const [existingSession] = await db
      .select()
      .from(patientSessions)
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.practiceId, practiceId),
          eq(patientSessions.isDeleted, false),
        ),
      )
      .limit(1);

    if (!existingSession) {
      logger.warn(`Session not found ${sessionId} in practice ${practiceId}`);
      return response.notFound(res, "Session not found");
    }

    if (existingSession.reviewStatus !== "DRAFT") {
      logger.warn(
        `Cannot update session ${sessionId} with status ${existingSession.reviewStatus}`,
      );
      return response.badRequest(res, "Only DRAFT sessions can be updated");
    }

    await db
      .update(patientSessions)
      .set({
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        sessionType,
        subjective,
        objective,
        assessment,
        plan,
        additionalNotes,
        updatedBy,
      })
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.practiceId, practiceId),
        ),
      );

    logger.info(`Session updated ${sessionId} in practice ${practiceId}`);

    return response.ok(res, null, "Session updated successfully");
  } catch (err) {
    logger.error("Update session error", { error: err });
    return response.error(res, "Failed to update session");
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const sessionIdParam = req.params.sessionId;
    const updatedBy = req.user?.userId!;

    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId) {
      logger.warn("Delete session called without id");
      return response.badRequest(res, "Session ID is required");
    }

    const [existingSession] = await db
      .select()
      .from(patientSessions)
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.practiceId, practiceId),
          eq(patientSessions.isDeleted, false),
        ),
      )
      .limit(1);

    if (!existingSession) {
      logger.warn(`Session not found ${sessionId} in practice ${practiceId}`);
      return response.notFound(res, "Session not found");
    }

    await db
      .update(patientSessions)
      .set({
        isDeleted: true,
        updatedBy,
      })
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.practiceId, practiceId),
        ),
      );

    logger.info(`Session deleted ${sessionId} from practice ${practiceId}`);

    return response.ok(res, null, "Session deleted successfully");
  } catch (err) {
    logger.error("Delete session error", { error: err });
    return response.error(res, "Failed to delete session");
  }
};

export const getPatientSessionHistory = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const patientIdParam = req.params.patientId;

    const patientId = Array.isArray(patientIdParam)
      ? patientIdParam[0]
      : patientIdParam;

    if (!patientId) {
      logger.warn("Get patient session history called without patient id");
      return response.badRequest(res, "Patient ID is required");
    }

    // Fetch patient info first
    const [patient] = await db
      .select({
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
      })
      .from(patients)
      .where(
        and(eq(patients.id, patientId), eq(patients.practiceId, practiceId)),
      )
      .limit(1);

    if (!patient) {
      logger.warn(`Patient not found ${patientId}`);
      return response.notFound(res, "Patient not found");
    }

    // Fetch sessions with JOIN for therapist info
    const sessionList = await db
      .select({
        id: patientSessions.id,
        practiceId: patientSessions.practiceId,
        patientId: patientSessions.patientId,
        therapistId: patientSessions.therapistId,
        scheduledStart: patientSessions.scheduledStart,
        scheduledEnd: patientSessions.scheduledEnd,
        sessionType: patientSessions.sessionType,
        subjective: patientSessions.subjective,
        objective: patientSessions.objective,
        assessment: patientSessions.assessment,
        plan: patientSessions.plan,
        additionalNotes: patientSessions.additionalNotes,
        aiSummary: patientSessions.aiSummary,
        reviewStatus: patientSessions.reviewStatus,
        reviewComment: patientSessions.reviewComment,
        createdAt: patientSessions.createdAt,
        updatedAt: patientSessions.updatedAt,
        therapistFirstName: therapists.firstName,
        therapistLastName: therapists.lastName,
      })
      .from(patientSessions)
      .leftJoin(therapists, eq(patientSessions.therapistId, therapists.userId))
      .where(
        and(
          eq(patientSessions.patientId, patientId),
          eq(patientSessions.practiceId, practiceId),
          eq(patientSessions.isDeleted, false),
        ),
      )
      .orderBy(desc(patientSessions.updatedAt));

    // Format sessions without patient info (it's at top level)
    const sessions = sessionList.map((session) =>
      formatSessionResponse(
        session,
        null, // patient already top level
        session.therapistFirstName || session.therapistLastName
          ? {
              id: session.therapistId,
              firstName: session.therapistFirstName,
              lastName: session.therapistLastName,
            }
          : null,
      ),
    );

    const result = {
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
      },
      sessions,
    };

    logger.info(
      `Retrieved ${sessions.length} sessions for patient ${patientId}`,
    );

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get patient session history error", { error: err });
    return response.error(res, "Failed to fetch patient session history");
  }
};

export const getLatestPatientSession = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const patientIdParam = req.params.patientId;

    const patientId = Array.isArray(patientIdParam)
      ? patientIdParam[0]
      : patientIdParam;

    if (!patientId) {
      logger.warn("Get latest patient session called without patient id");
      return response.badRequest(res, "Patient ID is required");
    }

    // Fetch patient info first
    const [patient] = await db
      .select({
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
      })
      .from(patients)
      .where(
        and(eq(patients.id, patientId), eq(patients.practiceId, practiceId)),
      )
      .limit(1);

    if (!patient) {
      logger.warn(`Patient not found ${patientId}`);
      return response.notFound(res, "Patient not found");
    }

    // Fetch latest session with JOIN for therapist info
    const [session] = await db
      .select({
        id: patientSessions.id,
        practiceId: patientSessions.practiceId,
        patientId: patientSessions.patientId,
        therapistId: patientSessions.therapistId,
        scheduledStart: patientSessions.scheduledStart,
        scheduledEnd: patientSessions.scheduledEnd,
        sessionType: patientSessions.sessionType,
        subjective: patientSessions.subjective,
        objective: patientSessions.objective,
        assessment: patientSessions.assessment,
        plan: patientSessions.plan,
        additionalNotes: patientSessions.additionalNotes,
        aiSummary: patientSessions.aiSummary,
        reviewStatus: patientSessions.reviewStatus,
        reviewComment: patientSessions.reviewComment,
        createdAt: patientSessions.createdAt,
        updatedAt: patientSessions.updatedAt,
        therapistFirstName: therapists.firstName,
        therapistLastName: therapists.lastName,
      })
      .from(patientSessions)
      .leftJoin(therapists, eq(patientSessions.therapistId, therapists.userId))
      .where(
        and(
          eq(patientSessions.patientId, patientId),
          eq(patientSessions.practiceId, practiceId),
          eq(patientSessions.isDeleted, false),
        ),
      )
      .orderBy(desc(patientSessions.updatedAt))
      .limit(1);

    if (!session) {
      logger.warn(`No sessions found for patient ${patientId}`);
      return response.notFound(res, "No sessions found for this patient");
    }

    // Format session without patient info (it's at top level)
    const result = {
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
      },
      session: formatSessionResponse(
        session,
        null, // patient at top
        session.therapistFirstName || session.therapistLastName
          ? {
              id: session.therapistId,
              firstName: session.therapistFirstName,
              lastName: session.therapistLastName,
            }
          : null,
      ),
    };

    logger.info(`Retrieved latest session for patient ${patientId}`);

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get latest patient session error", { error: err });
    return response.error(res, "Failed to fetch latest patient session");
  }
};

export const getDraftSessionsByTherapist = async (
  req: Request,
  res: Response,
) => {
  try {
    const practiceId = req.practiceId!;
    const therapistId = req.user?.userId!;

    // Fetch sessions with JOIN for patient info
    const sessionList = await db
      .select({
        id: patientSessions.id,
        practiceId: patientSessions.practiceId,
        patientId: patientSessions.patientId,
        therapistId: patientSessions.therapistId,
        scheduledStart: patientSessions.scheduledStart,
        scheduledEnd: patientSessions.scheduledEnd,
        sessionType: patientSessions.sessionType,
        subjective: patientSessions.subjective,
        objective: patientSessions.objective,
        assessment: patientSessions.assessment,
        plan: patientSessions.plan,
        additionalNotes: patientSessions.additionalNotes,
        aiSummary: patientSessions.aiSummary,
        reviewStatus: patientSessions.reviewStatus,
        reviewComment: patientSessions.reviewComment,
        createdAt: patientSessions.createdAt,
        updatedAt: patientSessions.updatedAt,
        patientFirstName: patients.firstName,
        patientLastName: patients.lastName,
      })
      .from(patientSessions)
      .leftJoin(patients, eq(patientSessions.patientId, patients.id))
      .where(
        and(
          eq(patientSessions.therapistId, therapistId),
          eq(patientSessions.practiceId, practiceId),
          eq(patientSessions.reviewStatus, "DRAFT"),
          eq(patientSessions.isDeleted, false),
        ),
      )
      .orderBy(desc(patientSessions.updatedAt));

    // Fetch therapist info
    const [therapist] = await db
      .select({
        id: therapists.userId,
        firstName: therapists.firstName,
        lastName: therapists.lastName,
      })
      .from(therapists)
      .where(eq(therapists.userId, therapistId))
      .limit(1);

    const result = sessionList.map((session) =>
      formatSessionResponse(
        session,
        session.patientFirstName || session.patientLastName
          ? {
              id: session.patientId,
              firstName: session.patientFirstName,
              lastName: session.patientLastName,
            }
          : null,
        therapist || null,
      ),
    );

    logger.info(
      `Retrieved ${result.length} draft sessions for therapist ${therapistId}`,
    );

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get draft sessions error", { error: err });
    return response.error(res, "Failed to fetch draft sessions");
  }
};

export const getUpcomingSessionsByTherapist = async (
  req: Request,
  res: Response,
) => {
  try {
    const practiceId = req.practiceId!;
    const therapistId = req.user?.userId!;
    const now = new Date();

    // Fetch sessions with JOIN for patient info
    const sessionList = await db
      .select({
        id: patientSessions.id,
        practiceId: patientSessions.practiceId,
        patientId: patientSessions.patientId,
        therapistId: patientSessions.therapistId,
        scheduledStart: patientSessions.scheduledStart,
        scheduledEnd: patientSessions.scheduledEnd,
        sessionType: patientSessions.sessionType,
        subjective: patientSessions.subjective,
        objective: patientSessions.objective,
        assessment: patientSessions.assessment,
        plan: patientSessions.plan,
        additionalNotes: patientSessions.additionalNotes,
        aiSummary: patientSessions.aiSummary,
        reviewStatus: patientSessions.reviewStatus,
        reviewComment: patientSessions.reviewComment,
        createdAt: patientSessions.createdAt,
        updatedAt: patientSessions.updatedAt,
        patientFirstName: patients.firstName,
        patientLastName: patients.lastName,
      })
      .from(patientSessions)
      .leftJoin(patients, eq(patientSessions.patientId, patients.id))
      .where(
        and(
          eq(patientSessions.therapistId, therapistId),
          eq(patientSessions.practiceId, practiceId),
          eq(patientSessions.reviewStatus, "DRAFT"),
          gt(patientSessions.scheduledStart, now),
          eq(patientSessions.isDeleted, false),
        ),
      )
      .orderBy(desc(patientSessions.updatedAt));

    // Fetch therapist info
    const [therapist] = await db
      .select({
        id: therapists.userId,
        firstName: therapists.firstName,
        lastName: therapists.lastName,
      })
      .from(therapists)
      .where(eq(therapists.userId, therapistId))
      .limit(1);

    const result = sessionList.map((session) =>
      formatSessionResponse(
        session,
        session.patientFirstName || session.patientLastName
          ? {
              id: session.patientId,
              firstName: session.patientFirstName,
              lastName: session.patientLastName,
            }
          : null,
        therapist || null,
      ),
    );

    logger.info(
      `Retrieved ${result.length} upcoming sessions for therapist ${therapistId}`,
    );

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get upcoming sessions error", { error: err });
    return response.error(res, "Failed to fetch upcoming sessions");
  }
};

export const getPendingReviewSessions = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const supervisorId = req.user?.userId!;

    // get all therapists under this supervisor
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

    if (therapistIds.length === 0) {
      logger.info(`No therapists found under supervisor ${supervisorId}`);
      return response.ok(res, []);
    }

    // Fetch sessions with SQL-level filtering using inArray and JOINs
    const sessionList = await db
      .select({
        id: patientSessions.id,
        practiceId: patientSessions.practiceId,
        patientId: patientSessions.patientId,
        therapistId: patientSessions.therapistId,
        scheduledStart: patientSessions.scheduledStart,
        scheduledEnd: patientSessions.scheduledEnd,
        sessionType: patientSessions.sessionType,
        subjective: patientSessions.subjective,
        objective: patientSessions.objective,
        assessment: patientSessions.assessment,
        plan: patientSessions.plan,
        additionalNotes: patientSessions.additionalNotes,
        aiSummary: patientSessions.aiSummary,
        reviewStatus: patientSessions.reviewStatus,
        reviewComment: patientSessions.reviewComment,
        createdAt: patientSessions.createdAt,
        updatedAt: patientSessions.updatedAt,
        patientFirstName: patients.firstName,
        patientLastName: patients.lastName,
        therapistFirstName: therapists.firstName,
        therapistLastName: therapists.lastName,
      })
      .from(patientSessions)
      .leftJoin(patients, eq(patientSessions.patientId, patients.id))
      .leftJoin(therapists, eq(patientSessions.therapistId, therapists.userId))
      .where(
        and(
          eq(patientSessions.practiceId, practiceId),
          eq(patientSessions.reviewStatus, "PENDING"),
          eq(patientSessions.isDeleted, false),
          inArray(patientSessions.therapistId, therapistIds),
        ),
      )
      .orderBy(desc(patientSessions.updatedAt));

    const result = sessionList.map((session) =>
      formatSessionResponse(
        session,
        session.patientFirstName || session.patientLastName
          ? {
              id: session.patientId,
              firstName: session.patientFirstName,
              lastName: session.patientLastName,
            }
          : null,
        session.therapistFirstName || session.therapistLastName
          ? {
              id: session.therapistId,
              firstName: session.therapistFirstName,
              lastName: session.therapistLastName,
            }
          : null,
      ),
    );

    logger.info(
      `Retrieved ${result.length} pending review sessions for supervisor ${supervisorId}`,
    );

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get pending review sessions error", { error: err });
    return response.error(res, "Failed to fetch pending review sessions");
  }
};

export const sendSessionForReview = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const therapistId = req.user?.userId!;
    const updatedBy = req.user?.userId!;
    const sessionIdParam = req.params.sessionId;

    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId) {
      logger.warn("Send session for review called without id");
      return response.badRequest(res, "Session ID is required");
    }

    const [existingSession] = await db
      .select()
      .from(patientSessions)
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.practiceId, practiceId),
          eq(patientSessions.therapistId, therapistId),
          eq(patientSessions.isDeleted, false),
        ),
      )
      .limit(1);

    if (!existingSession) {
      logger.warn(
        `Session not found ${sessionId} or not owned by therapist ${therapistId}`,
      );
      return response.notFound(res, "Session not found or not owned by you");
    }

    if (existingSession.reviewStatus !== "DRAFT") {
      logger.warn(
        `Cannot send session ${sessionId} with status ${existingSession.reviewStatus}`,
      );
      return response.badRequest(
        res,
        "Only DRAFT sessions can be sent for review",
      );
    }

    await db
      .update(patientSessions)
      .set({
        reviewStatus: "PENDING",
        updatedBy,
      })
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.practiceId, practiceId),
        ),
      );

    logger.info(
      `Session ${sessionId} sent for review by therapist ${therapistId}`,
    );

    return response.ok(res, null, "Session sent for review successfully");
  } catch (err) {
    logger.error("Send session for review error", { error: err });
    return response.error(res, "Failed to send session for review");
  }
};

export const approveSession = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const supervisorId = req.user?.userId!;
    const updatedBy = req.user?.userId!;
    const sessionIdParam = req.params.sessionId;
    const { reviewComment } = req.body;

    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId) {
      logger.warn("Approve session called without id");
      return response.badRequest(res, "Session ID is required");
    }

    const [existingSession] = await db
      .select()
      .from(patientSessions)
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.practiceId, practiceId),
          eq(patientSessions.isDeleted, false),
        ),
      )
      .limit(1);

    if (!existingSession) {
      logger.warn(`Session not found ${sessionId} in practice ${practiceId}`);
      return response.notFound(res, "Session not found");
    }

    if (existingSession.reviewStatus !== "PENDING") {
      logger.warn(
        `Cannot approve session ${sessionId} with status ${existingSession.reviewStatus}`,
      );
      return response.badRequest(res, "Only PENDING sessions can be approved");
    }

    // verify therapist belongs to this supervisor
    const [therapist] = await db
      .select()
      .from(therapists)
      .where(
        and(
          eq(therapists.userId, existingSession.therapistId),
          eq(therapists.practiceId, practiceId),
          eq(therapists.supervisorId, supervisorId),
          eq(therapists.isDeleted, false),
        ),
      )
      .limit(1);

    if (!therapist) {
      logger.warn(
        `Therapist ${existingSession.therapistId} not under supervisor ${supervisorId}`,
      );
      return response.forbidden(
        res,
        "You are not authorized to approve this session",
      );
    }

    await db
      .update(patientSessions)
      .set({
        reviewStatus: "APPROVED",
        reviewComment,
        updatedBy,
      })
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.practiceId, practiceId),
        ),
      );

    logger.info(`Session ${sessionId} approved by supervisor ${supervisorId}`);

    return response.ok(res, null, "Session approved successfully");
  } catch (err) {
    logger.error("Approve session error", { error: err });
    return response.error(res, "Failed to approve session");
  }
};

export const rejectSession = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const supervisorId = req.user?.userId!;
    const updatedBy = req.user?.userId!;
    const sessionIdParam = req.params.sessionId;
    const { reviewComment } = req.body;

    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId) {
      logger.warn("Reject session called without id");
      return response.badRequest(res, "Session ID is required");
    }

    const [existingSession] = await db
      .select()
      .from(patientSessions)
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.practiceId, practiceId),
          eq(patientSessions.isDeleted, false),
        ),
      )
      .limit(1);

    if (!existingSession) {
      logger.warn(`Session not found ${sessionId} in practice ${practiceId}`);
      return response.notFound(res, "Session not found");
    }

    if (existingSession.reviewStatus !== "PENDING") {
      logger.warn(
        `Cannot reject session ${sessionId} with status ${existingSession.reviewStatus}`,
      );
      return response.badRequest(res, "Only PENDING sessions can be rejected");
    }

    // verify therapist belongs to this supervisor
    const [therapist] = await db
      .select()
      .from(therapists)
      .where(
        and(
          eq(therapists.userId, existingSession.therapistId),
          eq(therapists.practiceId, practiceId),
          eq(therapists.supervisorId, supervisorId),
          eq(therapists.isDeleted, false),
        ),
      )
      .limit(1);

    if (!therapist) {
      logger.warn(
        `Therapist ${existingSession.therapistId} not under supervisor ${supervisorId}`,
      );
      return response.forbidden(
        res,
        "You are not authorized to reject this session",
      );
    }

    await db
      .update(patientSessions)
      .set({
        reviewStatus: "REJECTED",
        reviewComment,
        updatedBy,
      })
      .where(
        and(
          eq(patientSessions.id, sessionId),
          eq(patientSessions.practiceId, practiceId),
        ),
      );

    logger.info(`Session ${sessionId} rejected by supervisor ${supervisorId}`);

    return response.ok(res, null, "Session rejected successfully");
  } catch (err) {
    logger.error("Reject session error", { error: err });
    return response.error(res, "Failed to reject session");
  }
};
