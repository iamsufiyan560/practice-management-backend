import { Response, Request } from "express";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { response } from "./response.js";
import { clearAuthCookie } from "./cookie.js";
import { authSessions } from "../db/schema/authSessions.schema.js";

export async function logoutUser(req: Request, res: Response) {
  try {
    const sessionId = req.sessionId;

    if (!sessionId) {
      clearAuthCookie(res);
      return response.ok(res, null, "Logged out");
    }

    await db
      .update(authSessions)
      .set({ isRevoked: true })
      .where(eq(authSessions.id, sessionId));

    clearAuthCookie(res);

    return response.ok(res, null, "Logged out successfully");
  } catch (err) {
    clearAuthCookie(res);
    return response.ok(res, null, "Logged out");
  }
}
