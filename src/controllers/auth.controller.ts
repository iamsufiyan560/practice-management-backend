import { Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";

import { users } from "../db/schema/users.schema.js";
import { authSessions } from "../db/schema/authSessions.schema.js";
import { passwordResets } from "../db/schema/passwordResets.schema.js";
import { userPracticeRoles } from "../db/schema/user-practice-roles.schema.js";
import { sendEmail } from "../mail/send-mail.js";
import {
  generateUserForgotPasswordEmail,
  generateUserPasswordResetSuccessEmail,
  generateUserPasswordChangedEmail,
} from "../mail/templates/index.js";
import { logger } from "../config/index.js";
import {
  clearAuthCookie,
  comparePassword,
  hashPassword,
  response,
  setAuthCookie,
  logoutUser,
  generateOtpBundle,
} from "../utils/index.js";

export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn("User login attempt with missing credentials");
      return response.badRequest(res, "Email and password are required");
    }

    if (password.length > 16) {
      logger.warn("User login attempt with password exceeding length limit");
      return response.badRequest(res, "Password must not exceed 16 characters");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      logger.warn(`User login failed: email not found - ${email}`);
      return response.unauthorized(res, "Invalid credentials");
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      logger.warn(`User login failed: invalid password - ${email}`);
      return response.unauthorized(res, "Invalid credentials");
    }

    // Get user's practice roles
    const practiceRoles = await db
      .select()
      .from(userPracticeRoles)
      .where(
        and(
          eq(userPracticeRoles.userId, user.id),
          eq(userPracticeRoles.status, "ACTIVE"),
        ),
      );

    if (practiceRoles.length === 0) {
      logger.warn(`User login failed: no active practice role - ${email}`);
      return response.unauthorized(
        res,
        "No active practice role found for this user",
      );
    }

    const sessionId = crypto.randomUUID();
    const { expiresAt } = generateOtpBundle(); // 7 days

    await db.insert(authSessions).values({
      id: sessionId,
      userId: user.id,
      email: user.email,
      role: "USER",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      device: req.headers["user-agent"],
      expiresAt,
      lastActivityAt: new Date(),
      isRevoked: false,
    });

    setAuthCookie(res, sessionId);

    logger.info(`User logged in successfully - ${email}`);

    return response.ok(
      res,
      {
        id: user.id,
        email: user.email,
        practiceRoles: practiceRoles.map((pr) => ({
          practiceId: pr.practiceId,
          role: pr.role,
          status: pr.status,
        })),
        createdAt: user.createdAt,
      },
      "Login successful",
    );
  } catch (err) {
    logger.error("User login error", { error: err });
    return response.error(res, "Failed to login");
  }
};

export const userLogout = async (req: Request, res: Response) => {
  return logoutUser(req, res);
};

export const getLoggedInUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId!;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      logger.warn(`User not found - ${userId}`);
      return response.notFound(res, "User not found");
    }

    // Get user's practice roles
    const practiceRoles = await db
      .select()
      .from(userPracticeRoles)
      .where(
        and(
          eq(userPracticeRoles.userId, user.id),
          eq(userPracticeRoles.status, "ACTIVE"),
        ),
      );

    logger.info(`User /me successful - ${user.email}`);

    return response.ok(res, {
      id: user.id,
      email: user.email,
      practiceRoles: practiceRoles.map((pr) => ({
        practiceId: pr.practiceId,
        role: pr.role,
        status: pr.status,
      })),
      createdAt: user.createdAt,
    });
  } catch (err) {
    logger.error("User /me error", { error: err });
    return response.error(res, "Failed to fetch user data");
  }
};

export const userForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      logger.warn("Forgot password called without email");
      return response.badRequest(res, "Email is required");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      logger.warn(`Forgot password: user not found - ${email}`);
      return response.ok(
        res,
        null,
        "If the email exists, a reset link has been sent",
      );
    }

    const { otp, token, otpExpiry, tokenExpiry } = generateOtpBundle();

    await db.insert(passwordResets).values({
      userId: user.id,
      email: user.email,
      otp,
      otpType: "FORGOT_PASSWORD",
      otpExpiry,
      token,
      tokenExpiry,
      isUsed: false,
    });

    const emailHtml = generateUserForgotPasswordEmail({
      otp,
      token,
      otpExpiry,
      expiryMinutes: 15,
    });

    sendEmail({
      to: user.email,
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

export const userResetPassword = async (req: Request, res: Response) => {
  try {
    const { token, otp, newPassword } = req.body;

    if (!token || !otp || !newPassword) {
      logger.warn("Reset password called with missing fields");
      return response.badRequest(
        res,
        "Token, OTP, and new password are required",
      );
    }

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

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, resetRecord.userId))
      .limit(1);

    if (!user) {
      logger.warn(`Reset password: user not found - ${resetRecord.userId}`);
      return response.notFound(res, "User not found");
    }

    const passwordHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await db
      .update(passwordResets)
      .set({ isUsed: true })
      .where(eq(passwordResets.id, resetRecord.id));

    await db
      .update(authSessions)
      .set({ isRevoked: true })
      .where(eq(authSessions.userId, user.id));

    const emailHtml = generateUserPasswordResetSuccessEmail({
      changedAt: new Date(),
    });

    sendEmail({
      to: user.email,
      subject: "Journi Password Reset Successful",
      html: emailHtml,
    });

    logger.info(`Password reset successful - ${user.email}`);

    return response.ok(res, null, "Password reset successful");
  } catch (err) {
    logger.error("Reset password error", { error: err });
    return response.error(res, "Failed to reset password");
  }
};

export const userChangePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId!;

    if (!currentPassword || !newPassword) {
      logger.warn("Change password called with missing fields");
      return response.badRequest(
        res,
        "Current password and new password are required",
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      logger.warn(`Change password: user not found - ${userId}`);
      return response.notFound(res, "User not found");
    }

    const isPasswordValid = await comparePassword(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      logger.warn(`Change password: invalid current password - ${user.email}`);
      return response.badRequest(res, "Current password is incorrect");
    }

    const passwordHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await db
      .update(authSessions)
      .set({ isRevoked: true })
      .where(eq(authSessions.userId, user.id));

    const emailHtml = generateUserPasswordChangedEmail({
      changedAt: new Date(),
      ipAddress: req.ip || "Unknown",
    });

    sendEmail({
      to: user.email,
      subject: "Journi Password Changed",
      html: emailHtml,
    });

    clearAuthCookie(res);

    logger.info(`Password changed successfully - ${user.email}`);

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
