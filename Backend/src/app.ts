import express from "express";
import helmet from "helmet";
import cors from "cors";
import pino from "pino-http";
import { json, urlencoded } from "express";
import { errorHandler, notFound } from "./middlewares/error";
import { globalLimiter, authLimiter } from "./middlewares/rateLimit";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import jobRoutes from "./modules/jobs/job.routes";
import fileRoutes from "./modules/files/file.routes";
import atsRoutes from "./modules/ats/ats.routes";
import applicationRoutes from "./modules/applications/application.routes";
import alertRoutes from "./modules/alerts/jobAlert.routes";
import docsRoutes from "./modules/docs/docs.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(pino());
app.use(json({ limit: "1mb" }));
app.use(urlencoded({ extended: true }));

app.get("/v1/health", (_req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

// Global rate limit
app.use(globalLimiter);

// Routes
app.use("/v1/auth", authLimiter, authRoutes);
app.use("/v1", userRoutes);
app.use("/v1", jobRoutes);
app.use("/v1", fileRoutes);
app.use("/v1", atsRoutes);
app.use("/v1", applicationRoutes);
app.use("/v1", alertRoutes);
app.use("/v1", docsRoutes);

// fallbacks
app.use(notFound);
app.use(errorHandler);

export default app;
