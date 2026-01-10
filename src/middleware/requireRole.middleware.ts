import { Request, Response, NextFunction } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { userPracticeRoles } from "../db/schema/user-practice-roles.schema.js";
import { response } from "../utils/index.js";
import { logger } from "../config/index.js";

export type PracticeRole = "ADMIN" | "SUPERVISOR" | "THERAPIST";

declare global {
  namespace Express {
    interface Request {
      practiceRole?: PracticeRole;
    }
  }
}

export const requireRole = (...allowedRoles: PracticeRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId!;
      const practiceId = req.practiceId!;

      const [role] = await db
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

      if (!role) {
        logger.warn("No role in practice", { userId, practiceId });
        return response.forbidden(res, "Access denied");
      }

      const userRole = role.role as PracticeRole;
      req.practiceRole = userRole;

      if (!allowedRoles.includes(userRole)) {
        logger.warn("Role forbidden", { userId, practiceId, userRole });
        return response.forbidden(res, "You don't have permission");
      }

      next();
    } catch (err) {
      logger.error("requireRole middleware error", { error: err });
      return response.error(res, "Authorization failed");
    }
  };
};
