import { Request, Response, NextFunction } from "express";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/db";
import { authSessions } from "@/db/schema";

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
    if (!cookie?.sessionId) {
      return res.status(401).json({ message: "Unauthorized" });
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
      return res.status(401).json({ message: "Session expired" });
    }

    const s = session[0]!;

    req.user = {
      userId: s.userId,
      email: s.email,
      role: s.role as AuthUser["role"],
    };

    req.sessionId = s.id;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
