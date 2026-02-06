import rateLimit from "express-rate-limit";
import { Request } from "express";
import { response } from "@/utils";

export function getIP(req: Request): string {
  const xfwd = req.headers["x-forwarded-for"];

  if (typeof xfwd === "string" && xfwd.length > 0) {
    return xfwd.split(",")[0]!.trim();
  }

  if (Array.isArray(xfwd) && xfwd.length > 0 && xfwd[0]) {
    return xfwd[0];
  }

  return req.socket?.remoteAddress ?? "unknown";
}

export const globalIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => getIP(req),

  handler: (_req, res) => {
    return response.tooMany(
      res,
      "Too many requests from this network. Slow down.",
    );
  },
});

export const userLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.id;
    if (!userId) return `guest-${getIP(req)}`;
    return `user-${userId}`;
  },

  handler: (_req, res) => {
    return response.tooMany(
      res,
      "You are sending requests too fast. Please slow down.",
    );
  },
});

export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: Request) => {
    const ip = getIP(req);
    const email = req.body?.email || "anon";
    return `auth-${ip}-${email}`;
  },

  handler: (_req, res) => {
    return response.tooMany(res, "Too many attempts. Try again later.");
  },
});
