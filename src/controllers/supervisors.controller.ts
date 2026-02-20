import { Request, Response } from "express";
import { eq, and, or, count } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.schema.js";
import { userPracticeRoles } from "../db/schema/user-practice-roles.schema.js";
import { supervisors } from "../db/schema/supervisors.schema.js";
import { therapists } from "../db/schema/therapists.schema.js";
import { practices } from "../db/schema/practices.schema.js";
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

export const createSupervisor = async (req: Request, res: Response) => {
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

      // check supervisor role already exists in practice
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
        return response.error(res, "Failed to create supervisor");
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
      role: "SUPERVISOR",
      createdBy,
      updatedBy: createdBy,
    });

    // insert supervisors table
    await db.insert(supervisors).values({
      userId,
      practiceId,
      email,
      firstName,
      lastName,
      phone,
      licenseNumber,
      licenseState,
      licenseExpiry,
      specialty,
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
        subject: "Journi Supervisor Account Created",
        html: emailHtml,
      }).catch((err) => {
        logger.error("Supervisor account email failed", { error: err });
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
            role: "SUPERVISOR",
            addedAt: new Date(),
          });

          await sendEmail({
            to: email,
            subject: "You've been added to a practice as Supervisor",
            html: emailHtml,
          });

          logger.info("Added-to-practice email sent", { email, practiceId });
        } catch (err) {
          logger.error("Added-to-practice email failed", { error: err });
        }
      })();
    }

    logger.info(`Supervisor created ${email} in practice ${practiceId}`);

    return response.created(
      res,
      {
        id: userId,
        email,
        firstName,
        lastName,
        phone,
        role: "SUPERVISOR",
        practiceId,
      },
      "Supervisor created successfully",
    );
  } catch (err) {
    logger.error("Create supervisor error", { error: err });
    return response.error(res, "Failed to create supervisor");
  }
};

export const getAllSupervisorsByPractice = async (
  req: Request,
  res: Response,
) => {
  try {
    const practiceId = req.practiceId!;

    // fetch all supervisors for practice
    const supervisorList = await db
      .select()
      .from(supervisors)
      .where(
        and(
          eq(supervisors.practiceId, practiceId),
          eq(supervisors.isDeleted, false),
        ),
      );

    const therapistCounts = await db
      .select({
        supervisorId: therapists.supervisorId,
        count: count(),
      })
      .from(therapists)
      .where(
        and(
          eq(therapists.practiceId, practiceId),
          eq(therapists.isDeleted, false),
        ),
      )
      .groupBy(therapists.supervisorId);

    const therapistCountMap = new Map(
      therapistCounts.map((tc) => [tc.supervisorId, tc.count]),
    );

    // map supervisors with therapist count
    const result = supervisorList.map((supervisor) => ({
      id: supervisor.userId,
      practiceId: supervisor.practiceId,
      email: supervisor.email,
      firstName: supervisor.firstName,
      lastName: supervisor.lastName,
      phone: supervisor.phone,
      licenseNumber: supervisor.licenseNumber,
      licenseState: supervisor.licenseState,
      licenseExpiry: supervisor.licenseExpiry,
      specialty: supervisor.specialty,
      createdAt: supervisor.createdAt,
      therapistCount: therapistCountMap.get(supervisor.userId) || 0,
    }));

    logger.info(
      `Retrieved ${result.length} supervisors for practice ${practiceId}`,
    );

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get all supervisors error", { error: err });
    return response.error(res, "Failed to fetch supervisors");
  }
};

export const getSupervisorById = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const supervisorIdParam = req.params.supervisorId;

    const supervisorId = Array.isArray(supervisorIdParam)
      ? supervisorIdParam[0]
      : supervisorIdParam;

    if (!supervisorId) {
      logger.warn("Get supervisor called without id");
      return response.badRequest(res, "Supervisor ID is required");
    }

    // fetch supervisor
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
        `Supervisor not found ${supervisorId} in practice ${practiceId}`,
      );
      return response.notFound(res, "Supervisor not found");
    }

    const [therapistCountResult] = await db
      .select({
        count: count(),
      })
      .from(therapists)
      .where(
        and(
          eq(therapists.supervisorId, supervisorId),
          eq(therapists.practiceId, practiceId),
          eq(therapists.isDeleted, false),
        ),
      );

    const therapistCount = therapistCountResult?.count || 0;

    const result = {
      id: supervisor.userId,
      practiceId: supervisor.practiceId,
      email: supervisor.email,
      firstName: supervisor.firstName,
      lastName: supervisor.lastName,
      phone: supervisor.phone,
      licenseNumber: supervisor.licenseNumber,
      licenseState: supervisor.licenseState,
      licenseExpiry: supervisor.licenseExpiry,
      specialty: supervisor.specialty,
      createdAt: supervisor.createdAt,
      therapistCount,
    };

    logger.info(
      `Retrieved supervisor ${supervisorId} from practice ${practiceId}`,
    );

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get supervisor by id error", { error: err });
    return response.error(res, "Failed to fetch supervisor");
  }
};

export const updateSupervisor = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const supervisorIdParam = req.params.supervisorId;
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

    const supervisorId = Array.isArray(supervisorIdParam)
      ? supervisorIdParam[0]
      : supervisorIdParam;

    if (!supervisorId) {
      logger.warn("Update supervisor called without id");
      return response.badRequest(res, "Supervisor ID is required");
    }

    // verify supervisor exists
    const [existingSupervisor] = await db
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

    if (!existingSupervisor) {
      logger.warn(
        `Supervisor not found ${supervisorId} in practice ${practiceId}`,
      );
      return response.notFound(res, "Supervisor not found");
    }

    // update supervisors table first
    await db
      .update(supervisors)
      .set({
        firstName,
        lastName,
        phone,
        licenseNumber,
        licenseState,
        licenseExpiry,
        specialty,
      })
      .where(
        and(
          eq(supervisors.userId, supervisorId),
          eq(supervisors.practiceId, practiceId),
        ),
      );

    // sync userPracticeRoles in background
    (async () => {
      try {
        await db
          .update(userPracticeRoles)
          .set({
            firstName,
            lastName,
            phone,
            updatedBy,
          })
          .where(
            and(
              eq(userPracticeRoles.userId, supervisorId),
              eq(userPracticeRoles.practiceId, practiceId),
              eq(userPracticeRoles.role, "SUPERVISOR"),
            ),
          );
        logger.info(`userPracticeRoles synced for supervisor ${supervisorId}`);
      } catch (err) {
        logger.error("userPracticeRoles sync failed", { error: err });
      }
    })();

    logger.info(`Supervisor updated ${supervisorId} in practice ${practiceId}`);

    return response.ok(res, null, "Supervisor updated successfully");
  } catch (err) {
    logger.error("Update supervisor error", { error: err });
    return response.error(res, "Failed to update supervisor");
  }
};

export const deleteSupervisor = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const supervisorIdParam = req.params.supervisorId;
    const updatedBy = req.user?.userId!;

    const supervisorId = Array.isArray(supervisorIdParam)
      ? supervisorIdParam[0]
      : supervisorIdParam;

    if (!supervisorId) {
      logger.warn("Delete supervisor called without id");
      return response.badRequest(res, "Supervisor ID is required");
    }

    // verify supervisor exists
    const [existingSupervisor] = await db
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

    if (!existingSupervisor) {
      logger.warn(
        `Supervisor not found ${supervisorId} in practice ${practiceId}`,
      );
      return response.notFound(res, "Supervisor not found");
    }

    // soft delete supervisors table first
    await db
      .update(supervisors)
      .set({
        isDeleted: true,
      })
      .where(
        and(
          eq(supervisors.userId, supervisorId),
          eq(supervisors.practiceId, practiceId),
        ),
      );

    // sync soft delete in userPracticeRoles background
    (async () => {
      try {
        await db
          .update(userPracticeRoles)
          .set({
            isDeleted: true,
            updatedBy,
          })
          .where(
            and(
              eq(userPracticeRoles.userId, supervisorId),
              eq(userPracticeRoles.practiceId, practiceId),
              eq(userPracticeRoles.role, "SUPERVISOR"),
            ),
          );
        logger.info(`userPracticeRoles deleted for supervisor ${supervisorId}`);
      } catch (err) {
        logger.error("userPracticeRoles delete sync failed", { error: err });
      }
    })();

    logger.info(
      `Supervisor deleted ${supervisorId} from practice ${practiceId}`,
    );

    return response.ok(res, null, "Supervisor deleted successfully");
  } catch (err) {
    logger.error("Delete supervisor error", { error: err });
    return response.error(res, "Failed to delete supervisor");
  }
};

export const getAllInactiveSupervisorByPractice = async (
  req: Request,
  res: Response,
) => {
  try {
    const practiceId = req.practiceId!;

    // fetch all inactive or deleted supervisors
    const inactiveList = await db
      .select()
      .from(supervisors)
      .where(
        and(
          eq(supervisors.practiceId, practiceId),
          or(eq(supervisors.isDeleted, true)),
        ),
      );

    const therapistCounts = await db
      .select({
        supervisorId: therapists.supervisorId,
        count: count(),
      })
      .from(therapists)
      .where(
        and(
          eq(therapists.practiceId, practiceId),
          eq(therapists.isDeleted, false),
        ),
      )
      .groupBy(therapists.supervisorId);

    const therapistCountMap = new Map(
      therapistCounts.map((tc) => [tc.supervisorId, tc.count]),
    );

    // map result with therapist count
    const result = inactiveList.map((supervisor) => ({
      id: supervisor.userId,
      practiceId: supervisor.practiceId,
      email: supervisor.email,
      firstName: supervisor.firstName,
      lastName: supervisor.lastName,
      phone: supervisor.phone,
      licenseNumber: supervisor.licenseNumber,
      licenseState: supervisor.licenseState,
      licenseExpiry: supervisor.licenseExpiry,
      specialty: supervisor.specialty,
      isDeleted: supervisor.isDeleted,
      createdAt: supervisor.createdAt,
      updatedAt: supervisor.updatedAt,
      therapistCount: therapistCountMap.get(supervisor.userId) || 0,
    }));

    logger.info(
      `Retrieved ${result.length} inactive supervisors for practice ${practiceId}`,
    );

    return response.ok(res, result);
  } catch (err) {
    logger.error("Get inactive supervisors error", { error: err });
    return response.error(res, "Failed to fetch inactive supervisors");
  }
};
