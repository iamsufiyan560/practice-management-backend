import { Request, Response } from "express";
import { eq, and, or, count } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.schema.js";
import { userPracticeRoles } from "../db/schema/user-practice-roles.schema.js";
import { therapists } from "../db/schema/therapists.schema.js";
import { supervisors } from "../db/schema/supervisors.schema.js";
import { practices } from "../db/schema/practices.schema.js";
import { patients } from "../db/schema/patients.schema.js";
import { sendEmail } from "../mail/send-mail.js";
import {
  generateUserAccountCreatedEmail,
  userAddedToPracticeEmail,
} from "../mail/templates/index.js";
import { logger } from "../config/index.js";
import {
  response,
  hashPassword,
  generateSecurePassword,
} from "../utils/index.js";

export const createTherapist = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const {
      email,
      firstName,
      lastName,
      phone,
      licenseNumber,
      licenseState,
      licenseExpiry,
      specialty,
    } = req.body;
    const createdBy = req.user?.userId!;

    if (!email || !firstName || !lastName || !phone) {
      logger.warn("Create therapist missing required fields");
      return response.badRequest(
        res,
        "Email, first name, last name and phone are required",
      );
    }

    let userId: string;
    let isNewUser = false;
    let generatedPassword = "";

    // check global user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      userId = existingUser.id;

      // check therapist role already exists in practice
      const [existingRole] = await db
        .select()
        .from(userPracticeRoles)
        .where(
          and(
            eq(userPracticeRoles.userId, userId),
            eq(userPracticeRoles.practiceId, practiceId),
            eq(userPracticeRoles.isDeleted, false),
          ),
        )
        .limit(1);

      if (existingRole) {
        logger.warn(
          `User already exists in this practice with role ${existingRole.role}`,
        );
        return response.conflict(
          res,
          `User already exists in this practice as ${existingRole.role}`,
        );
      }
    } else {
      // create global user
      generatedPassword = generateSecurePassword();
      const passwordHash = await hashPassword(generatedPassword);

      const inserted = await db
        .insert(users)
        .values({
          email,
          passwordHash,
        })
        .$returningId();

      if (!inserted.length) {
        logger.error("User insert failed");
        return response.error(res, "Failed to create therapist");
      }

      userId = inserted[0]!.id;
      isNewUser = true;
    }

    // insert userPracticeRoles first
    await db.insert(userPracticeRoles).values({
      userId,
      practiceId,
      firstName,
      lastName,
      email,
      phone,
      role: "THERAPIST",
      status: "ACTIVE",
      createdBy,
      updatedBy: createdBy,
    });

    // insert therapists table
    await db.insert(therapists).values({
      userId,
      practiceId,
      email,
      firstName,
      lastName,
      phone,
      licenseNumber: licenseNumber || null,
      licenseState: licenseState || null,
      licenseExpiry: licenseExpiry || null,
      specialty: specialty || null,
    });

    // send email based on new or existing user
    if (isNewUser) {
      const emailHtml = generateUserAccountCreatedEmail({
        email,
        tempPassword: generatedPassword,
        firstName,
        createdAt: new Date(),
      });

      sendEmail({
        to: email,
        subject: "Journi Therapist Account Created",
        html: emailHtml,
      }).catch((err) => {
        logger.error("Therapist account email failed", { error: err });
      });
    } else {
      (async () => {
        try {
          const [practice] = await db
            .select({ name: practices.name })
            .from(practices)
            .where(eq(practices.id, practiceId))
            .limit(1);

          const practiceName = practice?.name ?? "Journi Practice";

          const emailHtml = userAddedToPracticeEmail({
            email,
            firstName,
            practiceName,
            role: "THERAPIST",
            addedAt: new Date(),
          });

          await sendEmail({
            to: email,
            subject: "You've been added to a practice as Therapist",
            html: emailHtml,
          });

          logger.info("Added-to-practice email sent", { email, practiceId });
        } catch (err) {
          logger.error("Added-to-practice email failed", { error: err });
        }
      })();
    }

    logger.info(`Therapist created ${email} in practice ${practiceId}`);

    return response.created(
      res,
      {
        id: userId,
        email,
        firstName,
        lastName,
        phone,
        role: "THERAPIST",
        status: "ACTIVE",
        practiceId,
      },
      "Therapist created successfully",
    );
  } catch (err) {
    logger.error("Create therapist error", { error: err });
    return response.error(res, "Failed to create therapist");
  }
};

export const getAllTherapistsByPractice = async (
  req: Request,
  res: Response,
) => {
  try {
    const practiceId = req.practiceId!;

    // fetch all therapists for practice
    const therapistList = await db
      .select()
      .from(therapists)
      .where(
        and(
          eq(therapists.practiceId, practiceId),
          eq(therapists.isDeleted, false),
        ),
      );

    const patientCounts = await db
      .select({
        therapistId: patients.therapistId,
        count: count(),
      })
      .from(patients)
      .where(
        and(eq(patients.practiceId, practiceId), eq(patients.isDeleted, false)),
      )
      .groupBy(patients.therapistId);

    const patientCountMap = new Map(
      patientCounts.map((pc) => [pc.therapistId, pc.count]),
    );

    // get unique supervisor ids
    const supervisorIds = [
      ...new Set(
        therapistList
          .map((t) => t.supervisorId)
          .filter((id): id is string => id !== null),
      ),
    ];

    // fetch all supervisors in one query
    let supervisorMap = new Map<string, any>();
    if (supervisorIds.length > 0) {
      const supervisorData = await db
        .select()
        .from(supervisors)
        .where(
          and(
            eq(supervisors.practiceId, practiceId),
            eq(supervisors.isDeleted, false),
          ),
        );

      supervisorData.forEach((sup) => {
        supervisorMap.set(sup.userId, {
          id: sup.userId,
          email: sup.email,
          firstName: sup.firstName,
          lastName: sup.lastName,
          phone: sup.phone,
          licenseNumber: sup.licenseNumber,
          licenseState: sup.licenseState,
          licenseExpiry: sup.licenseExpiry,
          specialty: sup.specialty,
        });
      });
    }

    // map therapists with supervisor data
    const result = therapistList.map((therapist) => ({
      id: therapist.userId,
      practiceId: therapist.practiceId,
      email: therapist.email,
      firstName: therapist.firstName,
      lastName: therapist.lastName,
      phone: therapist.phone,
      licenseNumber: therapist.licenseNumber,
      licenseState: therapist.licenseState,
      licenseExpiry: therapist.licenseExpiry,
      specialty: therapist.specialty,
      createdAt: therapist.createdAt,
      patientCount: patientCountMap.get(therapist.userId) || 0,
      supervisor: therapist.supervisorId
        ? supervisorMap.get(therapist.supervisorId) || null
        : null,
    }));

    logger.info(
      `Retrieved ${result.length} therapists for practice ${practiceId}`,
    );

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get all therapists error", { error: err });
    return response.error(res, "Failed to fetch therapists");
  }
};

export const getTherapistById = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const therapistIdParam = req.params.therapistId;

    const therapistId = Array.isArray(therapistIdParam)
      ? therapistIdParam[0]
      : therapistIdParam;

    if (!therapistId) {
      logger.warn("Get therapist called without id");
      return response.badRequest(res, "Therapist ID is required");
    }

    // fetch therapist
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
        `Therapist not found ${therapistId} in practice ${practiceId}`,
      );
      return response.notFound(res, "Therapist not found");
    }

    const [patientCountResult] = await db
      .select({
        count: count(),
      })
      .from(patients)
      .where(
        and(
          eq(patients.therapistId, therapistId),
          eq(patients.practiceId, practiceId),
          eq(patients.isDeleted, false),
        ),
      );

    const patientCount = patientCountResult?.count || 0;

    // fetch supervisor if exists
    let supervisor = null;
    if (therapist.supervisorId) {
      const [supervisorData] = await db
        .select()
        .from(supervisors)
        .where(
          and(
            eq(supervisors.userId, therapist.supervisorId),
            eq(supervisors.practiceId, practiceId),
            eq(supervisors.isDeleted, false),
          ),
        )
        .limit(1);

      if (supervisorData) {
        supervisor = {
          id: supervisorData.userId,
          email: supervisorData.email,
          firstName: supervisorData.firstName,
          lastName: supervisorData.lastName,
          phone: supervisorData.phone,
          licenseNumber: supervisorData.licenseNumber,
          licenseState: supervisorData.licenseState,
          licenseExpiry: supervisorData.licenseExpiry,
          specialty: supervisorData.specialty,
        };
      }
    }

    const result = {
      id: therapist.userId,
      practiceId: therapist.practiceId,
      email: therapist.email,
      firstName: therapist.firstName,
      lastName: therapist.lastName,
      phone: therapist.phone,
      licenseNumber: therapist.licenseNumber,
      licenseState: therapist.licenseState,
      licenseExpiry: therapist.licenseExpiry,
      specialty: therapist.specialty,
      createdAt: therapist.createdAt,
      patientCount,
      supervisor,
    };

    logger.info(
      `Retrieved therapist ${therapistId} from practice ${practiceId}`,
    );

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get therapist by id error", { error: err });
    return response.error(res, "Failed to fetch therapist");
  }
};

export const updateTherapist = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const therapistIdParam = req.params.therapistId;
    const {
      firstName,
      lastName,
      phone,
      licenseNumber,
      licenseState,
      licenseExpiry,
      specialty,
    } = req.body;
    const updatedBy = req.user?.userId!;

    const therapistId = Array.isArray(therapistIdParam)
      ? therapistIdParam[0]
      : therapistIdParam;

    if (!therapistId) {
      logger.warn("Update therapist called without id");
      return response.badRequest(res, "Therapist ID is required");
    }

    if (
      !firstName &&
      !lastName &&
      !phone &&
      !licenseNumber &&
      !licenseState &&
      !licenseExpiry &&
      !specialty
    ) {
      logger.warn("Update therapist called with no fields");
      return response.badRequest(res, "At least one field is required");
    }

    // verify therapist exists
    const [existingTherapist] = await db
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

    if (!existingTherapist) {
      logger.warn(
        `Therapist not found ${therapistId} in practice ${practiceId}`,
      );
      return response.notFound(res, "Therapist not found");
    }

    // update therapists table first
    await db
      .update(therapists)
      .set({
        firstName: firstName ?? existingTherapist.firstName,
        lastName: lastName ?? existingTherapist.lastName,
        phone: phone ?? existingTherapist.phone,
        licenseNumber: licenseNumber ?? existingTherapist.licenseNumber,
        licenseState: licenseState ?? existingTherapist.licenseState,
        licenseExpiry: licenseExpiry ?? existingTherapist.licenseExpiry,
        specialty: specialty ?? existingTherapist.specialty,
      })
      .where(
        and(
          eq(therapists.userId, therapistId),
          eq(therapists.practiceId, practiceId),
        ),
      );

    // sync userPracticeRoles in background
    (async () => {
      try {
        await db
          .update(userPracticeRoles)
          .set({
            firstName: firstName ?? undefined,
            lastName: lastName ?? undefined,
            phone: phone ?? undefined,
            updatedBy,
          })
          .where(
            and(
              eq(userPracticeRoles.userId, therapistId),
              eq(userPracticeRoles.practiceId, practiceId),
              eq(userPracticeRoles.role, "THERAPIST"),
            ),
          );
        logger.info(`userPracticeRoles synced for therapist ${therapistId}`);
      } catch (err) {
        logger.error("userPracticeRoles sync failed", { error: err });
      }
    })();

    logger.info(`Therapist updated ${therapistId} in practice ${practiceId}`);

    return response.ok(res, null, "Therapist updated successfully");
  } catch (err) {
    logger.error("Update therapist error", { error: err });
    return response.error(res, "Failed to update therapist");
  }
};

export const deleteTherapist = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const therapistIdParam = req.params.therapistId;
    const updatedBy = req.user?.userId!;

    const therapistId = Array.isArray(therapistIdParam)
      ? therapistIdParam[0]
      : therapistIdParam;

    if (!therapistId) {
      logger.warn("Delete therapist called without id");
      return response.badRequest(res, "Therapist ID is required");
    }

    // verify therapist exists
    const [existingTherapist] = await db
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

    if (!existingTherapist) {
      logger.warn(
        `Therapist not found ${therapistId} in practice ${practiceId}`,
      );
      return response.notFound(res, "Therapist not found");
    }

    // soft delete therapists table first
    await db
      .update(therapists)
      .set({
        isDeleted: true,
      })
      .where(
        and(
          eq(therapists.userId, therapistId),
          eq(therapists.practiceId, practiceId),
        ),
      );

    // sync soft delete in userPracticeRoles background
    (async () => {
      try {
        await db
          .update(userPracticeRoles)
          .set({
            isDeleted: true,
            status: "INACTIVE",
            updatedBy,
          })
          .where(
            and(
              eq(userPracticeRoles.userId, therapistId),
              eq(userPracticeRoles.practiceId, practiceId),
              eq(userPracticeRoles.role, "THERAPIST"),
            ),
          );
        logger.info(`userPracticeRoles deleted for therapist ${therapistId}`);
      } catch (err) {
        logger.error("userPracticeRoles delete sync failed", { error: err });
      }
    })();

    logger.info(`Therapist deleted ${therapistId} from practice ${practiceId}`);

    return response.ok(res, null, "Therapist deleted successfully");
  } catch (err) {
    logger.error("Delete therapist error", { error: err });
    return response.error(res, "Failed to delete therapist");
  }
};

export const getAllInactiveTherapistsByPractice = async (
  req: Request,
  res: Response,
) => {
  try {
    const practiceId = req.practiceId!;

    // fetch all inactive or deleted therapists
    const inactiveList = await db
      .select()
      .from(therapists)
      .where(
        and(
          eq(therapists.practiceId, practiceId),
          or(eq(therapists.isDeleted, true)),
        ),
      );

    const patientCounts = await db
      .select({
        therapistId: patients.therapistId,
        count: count(),
      })
      .from(patients)
      .where(
        and(eq(patients.practiceId, practiceId), eq(patients.isDeleted, false)),
      )
      .groupBy(patients.therapistId);

    const patientCountMap = new Map(
      patientCounts.map((pc) => [pc.therapistId, pc.count]),
    );

    // get unique supervisor ids
    const supervisorIds = [
      ...new Set(
        inactiveList
          .map((t) => t.supervisorId)
          .filter((id): id is string => id !== null),
      ),
    ];

    // fetch supervisors
    let supervisorMap = new Map<string, any>();
    if (supervisorIds.length > 0) {
      const supervisorData = await db
        .select()
        .from(supervisors)
        .where(eq(supervisors.practiceId, practiceId));

      supervisorData.forEach((sup) => {
        supervisorMap.set(sup.userId, {
          id: sup.userId,
          email: sup.email,
          firstName: sup.firstName,
          lastName: sup.lastName,
          phone: sup.phone,
          licenseNumber: sup.licenseNumber,
          licenseState: sup.licenseState,
          licenseExpiry: sup.licenseExpiry,
          specialty: sup.specialty,
        });
      });
    }

    // map result with supervisor
    const result = inactiveList.map((therapist) => ({
      id: therapist.userId,
      practiceId: therapist.practiceId,
      email: therapist.email,
      firstName: therapist.firstName,
      lastName: therapist.lastName,
      phone: therapist.phone,
      licenseNumber: therapist.licenseNumber,
      licenseState: therapist.licenseState,
      licenseExpiry: therapist.licenseExpiry,
      specialty: therapist.specialty,
      isDeleted: therapist.isDeleted,
      createdAt: therapist.createdAt,

      updatedAt: therapist.updatedAt,
      patientCount: patientCountMap.get(therapist.userId) || 0,
      supervisor: therapist.supervisorId
        ? supervisorMap.get(therapist.supervisorId) || null
        : null,
    }));

    logger.info(
      `Retrieved ${result.length} inactive therapists for practice ${practiceId}`,
    );

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get inactive therapists error", { error: err });
    return response.error(res, "Failed to fetch inactive therapists");
  }
};
