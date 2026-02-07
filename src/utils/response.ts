import { Response } from "express";
import { HTTP_STATUS } from "./httpStatus.js";

type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T | null;
  error?: string | null;
};

function send<T>(res: Response, status: HttpStatus, payload: ApiResponse<T>) {
  return res.status(status).json(payload);
}

export const response = {
  ok<T>(res: Response, data?: T, message = "Success") {
    return send<T>(res, HTTP_STATUS.OK, {
      success: true,
      message,
      ...(data !== undefined && { data }),
    });
  },
  created<T>(res: Response, data?: T, message = "Created") {
    return send<T>(res, HTTP_STATUS.CREATED, {
      success: true,
      message,
      data: data ?? null,
    });
  },

  noContent(res: Response) {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  },

  badRequest(res: Response, message = "Bad request", error?: string) {
    return send(res, HTTP_STATUS.BAD_REQUEST, {
      success: false,
      message,
      error: error ?? null,
    });
  },

  unauthorized(res: Response, message = "Unauthorized") {
    return send(res, HTTP_STATUS.UNAUTHORIZED, {
      success: false,
      message,
      error: null,
    });
  },

  forbidden(res: Response, message = "Forbidden") {
    return send(res, HTTP_STATUS.FORBIDDEN, {
      success: false,
      message,
      error: null,
    });
  },

  notFound(res: Response, message = "Not found") {
    return send(res, HTTP_STATUS.NOT_FOUND, {
      success: false,
      message,
      error: null,
    });
  },

  conflict(res: Response, message = "Conflict") {
    return send(res, HTTP_STATUS.CONFLICT, {
      success: false,
      message,
      error: null,
    });
  },

  tooMany(res: Response, message = "Too many requests") {
    return send(res, HTTP_STATUS.TOO_MANY_REQUESTS, {
      success: false,
      message,
      error: null,
    });
  },

  error(res: Response, message = "Internal server error") {
    return send(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      success: false,
      message,
      error: null,
    });
  },
};
