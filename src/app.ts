import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalIpLimiter } from "./middleware/index.js";
import { httpLogger } from "./config/index.js";
import routes from "./routes/index.js";

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

// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   }),
// );

app.use(httpLogger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(globalIpLimiter());

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1", routes);

export default app;
