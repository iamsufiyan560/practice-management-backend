import { Response, Request } from "express";
import { eq } from "drizzle-orm";
import { authSessions } from "@/db/schema";
import { db } from "@/db";
import { clearAuthCookie } from "@/utils/cookie";

export async function logoutUser(req: Request, res: Response) {
  try {
    const sessionId = req.sessionId;

    if (!sessionId) {
      clearAuthCookie(res);
      return res.status(200).json({ success: true });
    }

    await db
      .update(authSessions)
      .set({ isRevoked: true })
      .where(eq(authSessions.id, sessionId));

    clearAuthCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    clearAuthCookie(res);
    return res.status(200).json({ success: true });
  }
}
