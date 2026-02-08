import { Request, Response } from "express";
import { eq, and, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.schema.js";
import { userPracticeRoles } from "../db/schema/user-practice-roles.schema.js";
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
import { practices } from "../db/schema/practices.schema.js";

// create admin for practise

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const { email, firstName, lastName, phone } = req.body;
    const createdBy = req.user?.userId!;

    let userId: string;
    let isNewUser = false;
    let generatedPassword = "";

    // 🔍 Check global user
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      userId = existingUser.id;

      // check admin already exists in this practice
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
      //  create global user
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
        logger.error("User insert failed - no id returned");
        return response.error(res, "Failed to create admin");
      }

      userId = inserted[0]!.id;
      isNewUser = true;
    }

    await db.insert(userPracticeRoles).values({
      userId,
      practiceId,
      firstName,
      lastName,
      email,
      phone,
      role: "ADMIN",
      status: "ACTIVE",
      createdBy,
      updatedBy: createdBy,
    });

    if (isNewUser) {
      const emailHtml = generateUserAccountCreatedEmail({
        email,
        tempPassword: generatedPassword,
        firstName,
        createdAt: new Date(),
      });

      sendEmail({
        to: email,
        subject: "Journi Admin Account Created",
        html: emailHtml,
      }).catch((err) => {
        logger.error("Admin email send failed", { error: err });
      });
    } else {
      (async () => {
        try {
          // fetch practice name
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
            role: "ADMIN",
            addedAt: new Date(),
          });

          await sendEmail({
            to: email,
            subject: "You’ve been added to a practice",
            html: emailHtml,
          });

          logger.info("Added-to-practice email sent", { email, practiceId });
        } catch (err) {
          logger.error("Added-to-practice email failed", { error: err });
        }
      })();
    }

    logger.info(`Admin created - ${email} for practice ${practiceId}`);

    return response.created(
      res,
      {
        userId,
        email,
        firstName,
        lastName,
        phone,
        role: "ADMIN",
        status: "ACTIVE",
        practiceId,
      },
      "Admin created successfully",
    );
  } catch (err) {
    logger.error("Create admin error", { error: err });
    return response.error(res, "Failed to create admin");
  }
};

// update admin by id

export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const idParam = req.params.adminId;
    const { firstName, lastName, phone, status } = req.body;
    const updatedBy = req.user?.userId!;

    const adminId = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!adminId) {
      logger.warn("Update admin called without adminId");
      return response.badRequest(res, "Admin ID is required");
    }

    const [existingAdmin] = await db
      .select()
      .from(userPracticeRoles)
      .where(
        and(
          eq(userPracticeRoles.userId, adminId),
          eq(userPracticeRoles.practiceId, practiceId),
          eq(userPracticeRoles.role, "ADMIN"),
          eq(userPracticeRoles.isDeleted, false),
        ),
      )
      .limit(1);

    if (!existingAdmin) {
      logger.warn(`Admin not found - ${adminId} for practice ${practiceId}`);
      return response.notFound(res, "Admin not found");
    }

    await db
      .update(userPracticeRoles)
      .set({
        firstName: firstName ?? existingAdmin.firstName,
        lastName: lastName ?? existingAdmin.lastName,
        phone: phone ?? existingAdmin.phone,
        status: status ?? existingAdmin.status,
        updatedBy,
      })
      .where(
        and(
          eq(userPracticeRoles.userId, adminId),
          eq(userPracticeRoles.practiceId, practiceId),
          eq(userPracticeRoles.role, "ADMIN"),
        ),
      );

    logger.info(`Admin updated - ${adminId} for practice ${practiceId}`);

    return response.ok(res, null, "Admin updated successfully");
  } catch (err) {
    logger.error("Update admin error", { error: err });
    return response.error(res, "Failed to update admin");
  }
};

// delete admin by id

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const idParam = req.params.adminId;
    const updatedBy = req.user?.userId!;

    const adminId = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!adminId) {
      logger.warn("Delete admin called without adminId");
      return response.badRequest(res, "Admin ID is required");
    }

    const [existingAdmin] = await db
      .select()
      .from(userPracticeRoles)
      .where(
        and(
          eq(userPracticeRoles.userId, adminId),
          eq(userPracticeRoles.practiceId, practiceId),
          eq(userPracticeRoles.role, "ADMIN"),
          eq(userPracticeRoles.isDeleted, false),
        ),
      )
      .limit(1);

    if (!existingAdmin) {
      logger.warn(`Admin not found - ${adminId} for practice ${practiceId}`);
      return response.notFound(res, "Admin not found");
    }

    // soft delete only in this practice
    await db
      .update(userPracticeRoles)
      .set({
        isDeleted: true,
        status: "INACTIVE",
        updatedBy,
      })
      .where(
        and(
          eq(userPracticeRoles.userId, adminId),
          eq(userPracticeRoles.practiceId, practiceId),
          eq(userPracticeRoles.role, "ADMIN"),
        ),
      );

    logger.info(`Admin soft deleted - ${adminId} for practice ${practiceId}`);

    return response.ok(res, null, "Admin deleted successfully");
  } catch (err) {
    logger.error("Delete admin error", { error: err });
    return response.error(res, "Failed to delete admin");
  }
};

// get all admin by practise id
export const getAllAdminsByPractice = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;

    const admins = await db
      .select({
        userId: userPracticeRoles.userId,
        practiceId: userPracticeRoles.practiceId,

        firstName: userPracticeRoles.firstName,
        lastName: userPracticeRoles.lastName,
        phone: userPracticeRoles.phone,
        email: userPracticeRoles.email,

        role: userPracticeRoles.role,
        status: userPracticeRoles.status,
        createdAt: userPracticeRoles.createdAt,
      })
      .from(userPracticeRoles)
      .where(
        and(
          eq(userPracticeRoles.practiceId, practiceId),
          eq(userPracticeRoles.role, "ADMIN"),
          eq(userPracticeRoles.status, "ACTIVE"),
          eq(userPracticeRoles.isDeleted, false),
        ),
      );

    logger.info(`Retrieved ${admins.length} admins for practice ${practiceId}`);

    return response.ok(res, admins);
  } catch (err) {
    logger.error("Get all admins error", { error: err });
    return response.error(res, "Failed to fetch admins");
  }
};

// get admin by id

export const getAdminById = async (req: Request, res: Response) => {
  try {
    const practiceId = req.practiceId!;
    const adminIdParam = req.params.adminId;

    const adminId = Array.isArray(adminIdParam)
      ? adminIdParam[0]
      : adminIdParam;

    if (!adminId) {
      logger.warn("Get admin by id called without id");
      return response.badRequest(res, "Admin ID is required");
    }

    const [admin] = await db
      .select({
        userId: userPracticeRoles.userId,
        practiceId: userPracticeRoles.practiceId,

        firstName: userPracticeRoles.firstName,
        lastName: userPracticeRoles.lastName,
        email: userPracticeRoles.email,

        phone: userPracticeRoles.phone,

        role: userPracticeRoles.role,
        status: userPracticeRoles.status,
        createdAt: userPracticeRoles.createdAt,
      })
      .from(userPracticeRoles)
      .where(
        and(
          eq(userPracticeRoles.userId, adminId),
          eq(userPracticeRoles.practiceId, practiceId),
          eq(userPracticeRoles.role, "ADMIN"),
          eq(userPracticeRoles.status, "ACTIVE"),
          eq(userPracticeRoles.isDeleted, false),
        ),
      )
      .limit(1);

    if (!admin) {
      logger.warn(`Admin not found - ${adminId} for practice ${practiceId}`);
      return response.notFound(res, "Admin not found");
    }

    logger.info(`Retrieved admin - ${adminId} for practice ${practiceId}`);

    return response.ok(res, admin);
  } catch (err) {
    logger.error("Get admin by id error", { error: err });
    return response.error(res, "Failed to fetch admin");
  }
};

export const getAllInactiveAdminsByPractice = async (
  req: Request,
  res: Response,
) => {
  try {
    const practiceId = req.practiceId!;

    const inactiveAdmins = await db
      .select({
        userId: userPracticeRoles.userId,
        practiceId: userPracticeRoles.practiceId,

        email: userPracticeRoles.email,
        firstName: userPracticeRoles.firstName,
        lastName: userPracticeRoles.lastName,
        phone: userPracticeRoles.phone,

        role: userPracticeRoles.role,
        status: userPracticeRoles.status,
        isDeleted: userPracticeRoles.isDeleted,
        createdAt: userPracticeRoles.createdAt,
        updatedAt: userPracticeRoles.updatedAt,
      })
      .from(userPracticeRoles)
      .where(
        and(
          eq(userPracticeRoles.practiceId, practiceId),
          eq(userPracticeRoles.role, "ADMIN"),
          or(
            eq(userPracticeRoles.status, "INACTIVE"),
            eq(userPracticeRoles.isDeleted, true),
          ),
        ),
      );

    logger.info(
      `Retrieved ${inactiveAdmins.length} inactive admins for practice ${practiceId}`,
    );

    return response.ok(res, inactiveAdmins);
  } catch (err) {
    logger.error("Get all inactive admins error", { error: err });
    return response.error(res, "Failed to fetch inactive admins");
  }
};
