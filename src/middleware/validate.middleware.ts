import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { response } from "../utils/index.js";
import { logger } from "../config/index.js";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        logger.warn("Validation failed", { errors });

        return response.badRequest(
          res,
          errors[0]?.message || "Validation failed",
          errors[0]?.field,
        );

        // return response.badRequest(
        //   res,
        //   errors.map((m) => m.message).join(", ") || "Validation failed",
        //   errors.map((m) => m.field).join(", "),
        // );
      }

      logger.error("Validation middleware error", { error });
      return response.error(res, "Validation error");
    }
  };
};
