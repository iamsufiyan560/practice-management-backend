import winston from "winston";
import path from "path";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
  return `${timestamp} [${level}]: ${stack || message} ${metaString}`;
});

const isProduction = process.env.NODE_ENV === "production";

export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    isProduction ? json() : logFormat,
  ),
  transports: [
    // Console (always)
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),

    // Error logs
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),

    // All logs
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
    }),
  ],
  exitOnError: false,
});
