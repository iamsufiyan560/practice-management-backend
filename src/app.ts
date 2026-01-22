import "dotenv/config";
import express from "express";
import cors from "cors";

import { globalIpLimiter, practiceContext } from "./middleware";
import { httpLogger, logger } from "./config";
import routes from "./routes";

const app = express();

app.use(
  cors({
    origin: [
      process.env.LOCAL_FRONTEND_URL!,
      process.env.OWNER_FRONTEND_URL!,
      process.env.USER_FRONTEND_URL!,
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(httpLogger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(globalIpLimiter);
app.use(practiceContext);

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1", routes);

export default app;
