import { Response } from "express";

export function setAuthCookie(res: Response, sessionId: string) {
  res.cookie(
    "auth",
    { sessionId },
    {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  );
}

export function clearAuthCookie(res: Response) {
  res.clearCookie("auth");
}
