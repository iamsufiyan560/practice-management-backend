import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      practiceId?: string;
    }
  }
}

export function practiceContext(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const pid = req.headers["x-practice-id"];

  if (typeof pid === "string" && pid.trim().length > 0) {
    req.practiceId = pid.trim();
  } else if (Array.isArray(pid) && pid.length > 0) {
    req.practiceId = pid[0]!;
  }

  next();
}
