import { Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { patients } from "../db/schema/patients.schema.js";
import { therapists } from "../db/schema/therapists.schema.js";
import { logger } from "../config/index.js";
import { response } from "../utils/index.js";

// insertPatient interface update
const insertPatient = async (
  practiceId: string,
  therapistId: string | null,
  createdBy: string,
  patientData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: string;
    dob: Date;
    address?: {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
      email?: string;
      authorized?: boolean;
    };
  },
) => {
  const inserted = await db
    .insert(patients)
    .values({
      practiceId,
      therapistId,
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      email: patientData.email,
      phone: patientData.phone,
      gender: patientData.gender,
      dob: patientData.dob,
      address: patientData.address,
      emergencyContact: patientData.emergencyContact,
      createdBy,
      updatedBy: createdBy,
    })
    .$returningId();

  if (!inserted.length) {
    throw new Error("Patient insert failed");
  }

  return inserted[0]!.id;
};

export const createPatient = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const createdBy = req.user?.userId!;

    const patientId = await insertPatient(
      practiceId,
      null,
      createdBy,
      req.body,
    );

    logger.info(
      `Patient created ${patientId} in practice ${practiceId} by admin/supervisor`,
    );

    return response.created(
      res,
      {
        id: patientId,
        practiceId,
        therapistId: null,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
      },
      "Patient created successfully",
    );
  } catch (err) {
    logger.error("Create patient error", { error: err });
    return response.error(res, "Failed to create patient");
  }
};

export const createPatientByTherapist = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const createdBy = req.user?.userId!;
    const therapistId = req.user?.userId!;

    const patientId = await insertPatient(
      practiceId,
      therapistId,
      createdBy,
      req.body,
    );

    logger.info(
      `Patient created ${patientId} by therapist ${therapistId} in practice ${practiceId}`,
    );

    return response.created(
      res,
      {
        id: patientId,
        practiceId,
        therapistId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
      },
      "Patient created successfully",
    );
  } catch (err) {
    logger.error("Create patient by therapist error", { error: err });
    return response.error(res, "Failed to create patient");
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const patientIdParam = req.params.patientId;
    const updatedBy = req.user?.userId!;
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      dob,
      address,
      emergencyContact,
    } = req.body;

    const patientId = Array.isArray(patientIdParam)
      ? patientIdParam[0]
      : patientIdParam;

    if (!patientId) {
      logger.warn("Update patient called without id");
      return response.badRequest(res, "Patient ID is required");
    }

    const [existingPatient] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, patientId),
          eq(patients.practiceId, practiceId),
          eq(patients.isDeleted, false),
        ),
      )
      .limit(1);

    if (!existingPatient) {
      logger.warn(`Patient not found ${patientId} in practice ${practiceId}`);
      return response.notFound(res, "Patient not found");
    }

    await db
      .update(patients)
      .set({
        firstName,
        lastName,
        email,
        phone,
        gender,
        dob,
        address,
        emergencyContact,
        updatedBy,
      })
      .where(
        and(eq(patients.id, patientId), eq(patients.practiceId, practiceId)),
      );

    logger.info(`Patient updated ${patientId} in practice ${practiceId}`);

    return response.ok(res, null, "Patient updated successfully");
  } catch (err) {
    logger.error("Update patient error", { error: err });
    return response.error(res, "Failed to update patient");
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const patientIdParam = req.params.patientId;
    const updatedBy = req.user?.userId!;

    const patientId = Array.isArray(patientIdParam)
      ? patientIdParam[0]
      : patientIdParam;

    if (!patientId) {
      logger.warn("Delete patient called without id");
      return response.badRequest(res, "Patient ID is required");
    }

    const [existingPatient] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, patientId),
          eq(patients.practiceId, practiceId),
          eq(patients.isDeleted, false),
        ),
      )
      .limit(1);

    if (!existingPatient) {
      logger.warn(`Patient not found ${patientId} in practice ${practiceId}`);
      return response.notFound(res, "Patient not found");
    }

    await db
      .update(patients)
      .set({
        isDeleted: true,
        updatedBy,
      })
      .where(
        and(eq(patients.id, patientId), eq(patients.practiceId, practiceId)),
      );

    logger.info(`Patient deleted ${patientId} from practice ${practiceId}`);

    return response.ok(res, null, "Patient deleted successfully");
  } catch (err) {
    logger.error("Delete patient error", { error: err });
    return response.error(res, "Failed to delete patient");
  }
};

export const getAllPatientsByPractice = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;

    const patientList = await db
      .select()
      .from(patients)
      .where(
        and(eq(patients.practiceId, practiceId), eq(patients.isDeleted, false)),
      );

    // get unique therapist ids
    const therapistIds = [
      ...new Set(
        patientList
          .map((p) => p.therapistId)
          .filter((id): id is string => id !== null),
      ),
    ];

    // fetch all therapists in one query
    let therapistMap = new Map<string, any>();
    if (therapistIds.length > 0) {
      const therapistData = await db
        .select()
        .from(therapists)
        .where(
          and(
            eq(therapists.practiceId, practiceId),
            eq(therapists.isDeleted, false),
          ),
        );

      therapistData.forEach((ther) => {
        therapistMap.set(ther.userId, {
          id: ther.userId,
          email: ther.email,
          firstName: ther.firstName,
          lastName: ther.lastName,
          phone: ther.phone,
          licenseNumber: ther.licenseNumber,
          licenseState: ther.licenseState,
          licenseExpiry: ther.licenseExpiry,
          specialty: ther.specialty,
        });
      });
    }

    const result = patientList.map((patient) => ({
      id: patient.id,
      practiceId: patient.practiceId,
      therapistId: patient.therapistId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      gender: patient.gender,
      dob: patient.dob,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      createdAt: patient.createdAt,
      therapist: patient.therapistId
        ? therapistMap.get(patient.therapistId) || null
        : null,
    }));

    logger.info(
      `Retrieved ${result.length} patients for practice ${practiceId}`,
    );

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get all patients error", { error: err });
    return response.error(res, "Failed to fetch patients");
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const patientIdParam = req.params.patientId;

    const patientId = Array.isArray(patientIdParam)
      ? patientIdParam[0]
      : patientIdParam;

    if (!patientId) {
      logger.warn("Get patient called without id");
      return response.badRequest(res, "Patient ID is required");
    }

    const [patient] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, patientId),
          eq(patients.practiceId, practiceId),
          eq(patients.isDeleted, false),
        ),
      )
      .limit(1);

    if (!patient) {
      logger.warn(`Patient not found ${patientId} in practice ${practiceId}`);
      return response.notFound(res, "Patient not found");
    }

    let therapistData = null;
    if (patient.therapistId) {
      const [therapist] = await db
        .select()
        .from(therapists)
        .where(
          and(
            eq(therapists.userId, patient.therapistId),
            eq(therapists.practiceId, practiceId),
            eq(therapists.isDeleted, false),
          ),
        )
        .limit(1);

      if (therapist) {
        therapistData = {
          id: therapist.userId,
          firstName: therapist.firstName,
          lastName: therapist.lastName,
        };
      }
    }

    const result = {
      id: patient.id,
      practiceId: patient.practiceId,
      therapistId: patient.therapistId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      gender: patient.gender,
      dob: patient.dob,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      therapist: therapistData,
    };

    logger.info(`Retrieved patient ${patientId} from practice ${practiceId}`);

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get patient by id error", { error: err });
    return response.error(res, "Failed to fetch patient");
  }
};

export const getPatientsByTherapist = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const therapistIdParam = req.params.therapistId;

    const therapistId = Array.isArray(therapistIdParam)
      ? therapistIdParam[0]
      : therapistIdParam;

    if (!therapistId) {
      logger.warn("Get patients by therapist called without therapist id");
      return response.badRequest(res, "Therapist ID is required");
    }

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

    const patientList = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.therapistId, therapistId),
          eq(patients.practiceId, practiceId),
          eq(patients.isDeleted, false),
        ),
      );

    const result = patientList.map((patient) => ({
      id: patient.id,
      practiceId: patient.practiceId,
      therapistId: patient.therapistId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      gender: patient.gender,
      dob: patient.dob,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      createdAt: patient.createdAt,
      therapist: {
        id: therapist.userId,
        firstName: therapist.firstName,
        lastName: therapist.lastName,
      },
    }));

    logger.info(
      `Retrieved ${result.length} patients for therapist ${therapistId}`,
    );

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get patients by therapist error", { error: err });
    return response.error(res, "Failed to fetch patients by therapist");
  }
};
