import "dotenv/config";
import express from "express";
import cors from "cors";
import { httpLogger } from "./config/httpLogger";
import { logger } from "./config/logger";
import { globalIpLimiter } from "./middleware/rateLimiter.middleware";

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL!;

logger.info("Bootstrapping EventForge API", {
  nodeVersion: process.version,
  environment: process.env.NODE_ENV || "development",
  frontendUrl: FRONTEND_URL ?? "NOT_SET",
});

if (!FRONTEND_URL) {
  logger.error("FRONTEND_URL is not set in environment variables");
  throw new Error("FRONTEND_URL is not set in .env file");
}

app.use(
  cors({
    origin: [FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(httpLogger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(globalIpLimiter);

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
