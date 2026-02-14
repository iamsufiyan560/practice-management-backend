import rateLimit from "express-rate-limit";
import { Request } from "express";
import { response } from "../utils/index.js";

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

export const globalIpLimiter = (
  windowMs: number = 60 * 1000,
  max: number = 300,
) =>
  rateLimit({
    windowMs,
    max,
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

export const userLimiter = (windowMs: number = 60 * 1000, max: number = 120) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,

    keyGenerator: (req: Request) => {
      const userId = req.user?.userId!;

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

export const authLimiter = (
  windowMs: number = 10 * 60 * 1000,
  max: number = 20,
) =>
  rateLimit({
    windowMs,
    max,
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
