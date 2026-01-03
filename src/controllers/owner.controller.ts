import { Request, Response } from "express";
import { eq, and, count, desc } from "drizzle-orm";
import { db } from "../db/index.js";

import { owners } from "../db/schema/owners.schema.js";
import { authSessions } from "../db/schema/authSessions.schema.js";
import { passwordResets } from "../db/schema/passwordResets.schema.js";
import { practices } from "../db/schema/practices.schema.js";
import { sendEmail } from "../mail/send-mail.js";
import {
  generateOwnerForgotPasswordEmail,
  generateOwnerPasswordResetSuccessEmail,
  generateOwnerPasswordChangedEmail,
  generateOwnerAccountCreatedEmail,
} from "../mail/templates/index.js";
import { logger } from "../config/index.js";
import {
  clearAuthCookie,
  comparePassword,
  hashPassword,
  response,
  setAuthCookie,
  logoutUser,
  generateSecurePassword,
  generateOtpBundle,
} from "../utils/index.js";

export const generateFirstOwner = async (req: Request, res: Response) => {
  try {
    const { code, email, firstName, lastName } = req.body;

    if (code !== process.env.OWNER_GENERATION_CODE) {
      logger.warn("Generate first owner called with invalid code");
      return response.unauthorized(res, "Invalid generation code");
    }

    const [existingOwner] = await db
      .select()
      .from(owners)
      .where(eq(owners.email, email))
      .limit(1);

    if (existingOwner) {
      logger.warn(`Generate first owner: email already exists - ${email}`);
      return response.conflict(res, "Owner with this email already exists");
    }

    const tempPassword = generateSecurePassword();
    const passwordHash = await hashPassword(tempPassword);

    await db.insert(owners).values({
      email,
      passwordHash,
      firstName: firstName,
      lastName: lastName,
    });

    // Fire and forget - don't await
    const emailHtml = generateOwnerAccountCreatedEmail({
      email,
      tempPassword,
      firstName: firstName || "Owner",
      createdAt: new Date(),
    });

    sendEmail({
      to: email,
      subject: "Welcome to Your Journi Owner Account",
      html: emailHtml,
    }).catch((err) => {
      logger.error("Failed to send owner creation email", {
        error: err,
        email,
      });
    });

    logger.info(`First owner generated - ${email}`);

    return response.created(
      res,
      { email },
      "Owner account created successfully",
    );
  } catch (err) {
    logger.error("Generate first owner error", { error: err });
    return response.error(res, "Failed to generate owner account");
  }
};

export const createOwner = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName } = req.body;
    const createdBy = req.user?.userId!;

    const [existingOwner] = await db
      .select()
      .from(owners)
      .where(and(eq(owners.email, email), eq(owners.isDeleted, false)))
      .limit(1);

    if (existingOwner) {
      logger.warn(`Create owner: email already exists - ${email}`);
      return response.conflict(res, "Owner with this email already exists");
    }

    const tempPassword = generateSecurePassword();
    const passwordHash = await hashPassword(tempPassword);

    const ownerId = crypto.randomUUID();

    await db.insert(owners).values({
      id: ownerId,
      email,
      passwordHash,
      firstName,
      lastName,
      createdBy,
      updatedBy: createdBy,
    });

    const emailHtml = generateOwnerAccountCreatedEmail({
      email,
      tempPassword,
      firstName,
      createdAt: new Date(),
    });

    sendEmail({
      to: email,
      subject: "Welcome to Your Journi Owner Account",
      html: emailHtml,
    }).catch((err) => {
      logger.error("Failed to send owner creation email", {
        error: err,
        email,
      });
    });

    logger.info(`Owner created by ${createdBy} - ${email}`);

    return response.created(
      res,
      { id: ownerId, email },
      "Owner created successfully",
    );
  } catch (err) {
    logger.error("Create owner error", { error: err });
    return response.error(res, "Failed to create owner");
  }
};

export const ownerLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [owner] = await db
      .select()
      .from(owners)
      .where(and(eq(owners.email, email), eq(owners.isDeleted, false)))
      .limit(1);

    if (!owner) {
      logger.warn(`Owner login failed: email not found - ${email}`);
      return response.unauthorized(res, "Invalid credentials");
    }

    const isPasswordValid = await comparePassword(password, owner.passwordHash);

    if (!isPasswordValid) {
      logger.warn(`Owner login failed: invalid password - ${email}`);
      return response.unauthorized(res, "Invalid credentials");
    }

    const sessionId = crypto.randomUUID();
    const { expiresAt } = generateOtpBundle(); // 7 days

    await db.insert(authSessions).values({
      id: sessionId,
      userId: owner.id,
      email: owner.email,
      role: "OWNER",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      device: req.headers["user-agent"],
      expiresAt,
      lastActivityAt: new Date(),
      isRevoked: false,
    });

    setAuthCookie(res, sessionId);

    logger.info(`Owner logged in successfully - ${email}`);

    return response.ok(
      res,
      {
        id: owner.id,
        email: owner.email,
        firstName: owner.firstName,
        lastName: owner.lastName,
      },
      "Login successful",
    );
  } catch (err) {
    logger.error("Owner login error", { error: err });
    return response.error(res, "Failed to login");
  }
};

// Logout
export const ownerLogout = async (req: Request, res: Response) => {
  return logoutUser(req, res);
};

// Get Me

export const getOwnerMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId!;

    const [owner] = await db
      .select({
        id: owners.id,
        email: owners.email,
        firstName: owners.firstName,
        lastName: owners.lastName,
        createdAt: owners.createdAt,
        updatedAt: owners.updatedAt,
      })
      .from(owners)
      .where(and(eq(owners.id, userId), eq(owners.isDeleted, false)))
      .limit(1);

    if (!owner) {
      logger.warn(`Owner not found - ${userId}`);
      return response.notFound(res, "Owner not found");
    }

    logger.info(`Owner /me successful - ${owner.email}`);

    return response.ok(res, owner);
  } catch (err) {
    logger.error("Owner /me error", { error: err });
    return response.error(res, "Failed to fetch user data");
  }
};

// Get Profile
export const getOwnerProfile = async (req: Request, res: Response) => {
  try {
    const ownerIdParam = req.params.ownerId;

    const ownerId = Array.isArray(ownerIdParam)
      ? ownerIdParam[0]
      : ownerIdParam;

    if (!ownerId) {
      logger.warn("Get owner profile called without ownerId");
      return response.badRequest(res, "Owner ID is required");
    }

    const [owner] = await db
      .select({
        id: owners.id,
        email: owners.email,
        firstName: owners.firstName,
        lastName: owners.lastName,
        createdAt: owners.createdAt,
        updatedAt: owners.updatedAt,
      })
      .from(owners)
      .where(and(eq(owners.id, ownerId), eq(owners.isDeleted, false)))
      .limit(1);

    if (!owner) {
      logger.warn(`Owner profile not found - ${ownerId}`);
      return response.notFound(res, "Owner not found");
    }

    logger.info(`Owner profile retrieved - ${ownerId}`);

    return response.ok(res, owner);
  } catch (err) {
    logger.error("Get owner profile error", { error: err });
    return response.error(res, "Failed to fetch profile");
  }
};

//get getAllOwners

export const getAllOwners = async (req: Request, res: Response) => {
  try {
    const ownersList = await db
      .select({
        id: owners.id,
        email: owners.email,
        firstName: owners.firstName,
        lastName: owners.lastName,
        createdAt: owners.createdAt,
        updatedAt: owners.updatedAt,
      })
      .from(owners)
      .where(eq(owners.isDeleted, false))
      .orderBy(desc(owners.createdAt));

    logger.info(`All owners retrieved`, { count: ownersList.length });

    return response.ok(res, ownersList);
  } catch (err) {
    logger.error("Get all owners error", { error: err });
    return response.error(res, "Failed to fetch owners");
  }
};

// update owner profile
export const updateOwnerProfile = async (req: Request, res: Response) => {
  try {
    const ownerIdParam = req.params.ownerId;
    const { firstName, lastName } = req.body;
    const updatedBy = req.user?.userId!;

    const ownerId = Array.isArray(ownerIdParam)
      ? ownerIdParam[0]
      : ownerIdParam;

    if (!ownerId) {
      logger.warn("Update owner profile called without ownerId");
      return response.badRequest(res, "Owner ID is required");
    }

    const [owner] = await db
      .select()
      .from(owners)
      .where(and(eq(owners.id, ownerId), eq(owners.isDeleted, false)))
      .limit(1);

    if (!owner) {
      logger.warn(`Owner not found for update - ${ownerId}`);
      return response.notFound(res, "Owner not found");
    }

    await db
      .update(owners)
      .set({
        firstName: firstName ?? owner.firstName,
        lastName: lastName ?? owner.lastName,
        updatedBy,
      })
      .where(eq(owners.id, ownerId));

    logger.info(`Owner profile updated - ${ownerId}`);

    return response.ok(res, null, "Profile updated successfully");
  } catch (err) {
    logger.error("Update owner profile error", { error: err });
    return response.error(res, "Failed to update profile");
  }
};

// delete owner profile
export const deleteOwnerProfile = async (req: Request, res: Response) => {
  try {
    const ownerIdParam = req.params.ownerId;
    const updatedBy = req.user?.userId!;

    const ownerId = Array.isArray(ownerIdParam)
      ? ownerIdParam[0]
      : ownerIdParam;

    if (!ownerId) {
      logger.warn("Delete owner profile called without ownerId");
      return response.badRequest(res, "Owner ID is required");
    }

    const [owner] = await db
      .select()
      .from(owners)
      .where(and(eq(owners.id, ownerId), eq(owners.isDeleted, false)))
      .limit(1);

    if (!owner) {
      logger.warn(`Owner not found for deletion - ${ownerId}`);
      return response.notFound(res, "Owner not found");
    }

    await db
      .update(owners)
      .set({
        isDeleted: true,
        updatedBy,
      })
      .where(eq(owners.id, ownerId));

    // revoke all sessions of this owner
    await db
      .update(authSessions)
      .set({ isRevoked: true })
      .where(eq(authSessions.userId, ownerId));

    clearAuthCookie(res);

    logger.info(`Owner profile deleted - ${ownerId}`);

    return response.ok(res, null, "Profile deleted successfully");
  } catch (err) {
    logger.error("Delete owner profile error", { error: err });
    return response.error(res, "Failed to delete profile");
  }
};

// Get Dashboard
export const getOwnerDashboard = async (req: Request, res: Response) => {
  try {
    const [totalOwners] = await db
      .select({ count: count() })
      .from(owners)
      .where(eq(owners.isDeleted, false));

    const [totalPractices] = await db
      .select({ count: count() })
      .from(practices)
      .where(eq(practices.isDeleted, false));

    logger.info(`Owner dashboard accessed`);

    return response.ok(res, {
      totalOwners: totalOwners?.count,
      totalPractices: totalPractices?.count,
    });
  } catch (err) {
    logger.error("Owner dashboard error", { error: err });
    return response.error(res, "Failed to fetch dashboard data");
  }
};

// Forgot Password
export const ownerForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const [owner] = await db
      .select()
      .from(owners)
      .where(and(eq(owners.email, email), eq(owners.isDeleted, false)))
      .limit(1);

    if (!owner) {
      logger.warn(`Forgot password: owner not found - ${email}`);
      return response.ok(
        res,
        null,
        "If the email exists, a reset link has been sent",
      );
    }

    const { otp, token, otpExpiry, tokenExpiry } = generateOtpBundle();

    await db.insert(passwordResets).values({
      userId: owner.id,
      email: owner.email,
      otp,
      otpType: "FORGOT_PASSWORD",
      otpExpiry,
      token,
      tokenExpiry,
      isUsed: false,
    });

    const emailHtml = generateOwnerForgotPasswordEmail({
      otp,
      token,
      otpExpiry,
      expiryMinutes: 15,
    });

    sendEmail({
      to: owner.email,
      subject: "Journi Password Reset Request",
      html: emailHtml,
    });

    logger.info(`Forgot password email sent - ${email}`);

    return response.ok(
      res,
      null,
      "If the email exists, a reset link has been sent",
    );
  } catch (err) {
    logger.error("Forgot password error", { error: err });
    return response.error(res, "Failed to process request");
  }
};

// Reset Password
export const ownerResetPassword = async (req: Request, res: Response) => {
  try {
    const { token, otp, newPassword } = req.body;

    const [resetRecord] = await db
      .select()
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.token, token),
          eq(passwordResets.otp, otp),
          eq(passwordResets.isUsed, false),
          eq(passwordResets.otpType, "FORGOT_PASSWORD"),
        ),
      )
      .limit(1);

    if (!resetRecord) {
      logger.warn("Reset password: invalid token or OTP");
      return response.badRequest(res, "Invalid or expired reset token");
    }

    if (
      new Date() > resetRecord.otpExpiry ||
      new Date() > resetRecord.tokenExpiry
    ) {
      logger.warn("Reset password: expired token or OTP");
      return response.badRequest(res, "Reset token has expired");
    }

    const [owner] = await db
      .select()
      .from(owners)
      .where(
        and(eq(owners.id, resetRecord.userId), eq(owners.isDeleted, false)),
      )
      .limit(1);

    if (!owner) {
      logger.warn(`Reset password: owner not found - ${resetRecord.userId}`);
      return response.notFound(res, "Owner not found");
    }

    const passwordHash = await hashPassword(newPassword);

    await db
      .update(owners)
      .set({
        passwordHash,
        updatedBy: owner.id,
      })
      .where(eq(owners.id, owner.id));

    await db
      .update(passwordResets)
      .set({ isUsed: true })
      .where(eq(passwordResets.id, resetRecord.id));

    await db
      .update(authSessions)
      .set({ isRevoked: true })
      .where(eq(authSessions.userId, owner.id));

    const emailHtml = generateOwnerPasswordResetSuccessEmail({
      changedAt: new Date(),
    });

    sendEmail({
      to: owner.email,
      subject: "Journi Password Reset Successful",
      html: emailHtml,
    });

    logger.info(`Password reset successful - ${owner.email}`);

    return response.ok(res, null, "Password reset successful");
  } catch (err) {
    logger.error("Reset password error", { error: err });
    return response.error(res, "Failed to reset password");
  }
};

// Change Password
export const ownerChangePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId!;

    const [owner] = await db
      .select()
      .from(owners)
      .where(and(eq(owners.id, userId), eq(owners.isDeleted, false)))
      .limit(1);

    if (!owner) {
      logger.warn(`Change password: owner not found - ${userId}`);
      return response.notFound(res, "Owner not found");
    }

    const isPasswordValid = await comparePassword(
      currentPassword,
      owner.passwordHash,
    );

    if (!isPasswordValid) {
      logger.warn(`Change password: invalid current password - ${owner.email}`);
      return response.badRequest(res, "Current password is incorrect");
    }

    const passwordHash = await hashPassword(newPassword);

    await db
      .update(owners)
      .set({
        passwordHash,
        updatedBy: owner.id,
      })
      .where(eq(owners.id, owner.id));

    await db
      .update(authSessions)
      .set({ isRevoked: true })
      .where(eq(authSessions.userId, owner.id));

    const emailHtml = generateOwnerPasswordChangedEmail({
      changedAt: new Date(),
      ipAddress: req.ip || "Unknown",
    });

    sendEmail({
      to: owner.email,
      subject: "Journi Password Changed",
      html: emailHtml,
    });

    clearAuthCookie(res);

    logger.info(`Password changed successfully - ${owner.email}`);

    return response.ok(
      res,
      null,
      "Password changed successfully. Please login again.",
    );
  } catch (err) {
    logger.error("Change password error", { error: err });
    return response.error(res, "Failed to change password");
  }
};
