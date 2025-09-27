// app.ts
import express, { json, urlencoded } from "express";
import helmet from "helmet";
import cors from "cors";
import pino from "pino-http";

import { errorHandler, notFound } from "./middlewares/error";
import { globalLimiter, authLimiter } from "./middlewares/rateLimit";

// Routers
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import jobRoutes from "./modules/jobs/job.routes";
import fileRoutes from "./modules/files/file.routes";
import atsRoutes from "./modules/ats/ats.routes";
import applicationRoutes from "./modules/applications/application.routes";
import alertRoutes from "./modules/alerts/jobAlert.routes";
import docsRoutes from "./modules/docs/docs.routes";
import examRoutes from "./modules/exams/exam.routes";
// ✅ ADD THIS
import learningRoutes from "./modules/learning/learning.routes";
import calendarRoutes from "./modules/calendar/calendar.routes";


const app = express();

/* -------------------------- Security headers -------------------------- */
app.use(helmet());

/* -------------------------- Body parsers ------------------------------ */
app.use(json({ limit: "1mb" }));
app.use(urlencoded({ extended: true }));

/* -------------------------- CORS (whitelist) -------------------------- */
const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const fromEnv = (process.env.WEB_ORIGINS || process.env.WEB_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = [...new Set([...DEFAULT_ORIGINS, ...fromEnv])];

const corsDelegate = {
  origin(origin: string | undefined, cb: (err: Error | null, ok?: boolean) => void) {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsDelegate));
app.options("*", cors(corsDelegate));

// Short-circuit OPTIONS
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

/* ------------------------------ Logger -------------------------------- */
app.use(
  pino({
    serializers: {
      req(req) {
        return { method: req.method, url: req.url, id: (req as any).id };
      },
    },
  })
);

/* ------------------------------ Health -------------------------------- */
app.get("/v1/health", (_req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

/* --------------------------- Rate limiting ----------------------------- */
app.use(globalLimiter);

/* -------------------------------- Routes ------------------------------- */
app.use("/v1/auth", authLimiter, authRoutes);
app.use("/v1", userRoutes);
app.use("/v1", jobRoutes);
app.use("/v1", fileRoutes);
app.use("/v1", atsRoutes);
app.use("/v1", applicationRoutes);
app.use("/v1", alertRoutes);
app.use("/v1", examRoutes);
app.use("/v1", docsRoutes);
// ✅ MOUNT LEARNING ROUTES
app.use("/v1", learningRoutes);
app.use("/v1", calendarRoutes);

/* ---------------------------- Fallbacks -------------------------------- */
app.use(notFound);
app.use(errorHandler);

/* --------- lines appended earlier (optional) --------------------------- */
app.use(cors());
app.use(pino());

export default app;
