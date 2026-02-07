import { Request, Response, NextFunction } from "express";

import { eq, and, gt } from "drizzle-orm";
import { response } from "../utils/index.js";
import { db } from "../db/index.js";
import { authSessions } from "../db/schema/authSessions.schema.js";
import { logger } from "../config/index.js";

export type AuthUser = {
  userId: string;
  email: string;
  role: "ADMIN" | "SUPERVISOR" | "THERAPIST" | "OWNER";
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      sessionId?: string;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const cookie = req.cookies?.auth;

    logger.warn(`cookie - ${req.cookies?.auth.sessionId}`);

    if (!cookie?.sessionId) {
      return response.unauthorized(res, "Unauthorized");
    }

    const session = await db
      .select()
      .from(authSessions)
      .where(
        and(
          eq(authSessions.id, cookie.sessionId),
          eq(authSessions.isRevoked, false),
          gt(authSessions.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!session.length) {
      return response.unauthorized(res, "Session expired");
    }

    const s = session[0]!;

    req.user = {
      userId: s.userId,
      email: s.email,
      role: s.role as AuthUser["role"],
    };

    req.sessionId = s.id;

    next();
  } catch {
    return response.unauthorized(res, "Unauthorized");
  }
}
