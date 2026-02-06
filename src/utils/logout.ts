import { Response, Request } from "express";
import { eq } from "drizzle-orm";
import { authSessions } from "@/db/schema";
import { db } from "@/db";
import { response } from "./response";
import { clearAuthCookie } from "./cookie";

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
