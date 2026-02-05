import { Response } from "express";

type CookieUser = {
  userId: string;
  email: string;
  role: string;
};

export function setAuthCookie(res: Response, user: CookieUser) {
  res.cookie("auth", user, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie("auth");
}
