"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// app.ts
const express_1 = __importStar(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const pino_http_1 = __importDefault(require("pino-http"));
const error_1 = require("./middlewares/error");
const rateLimit_1 = require("./middlewares/rateLimit");
// Routers
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const job_routes_1 = __importDefault(require("./modules/jobs/job.routes"));
const file_routes_1 = __importDefault(require("./modules/files/file.routes"));
const ats_routes_1 = __importDefault(require("./modules/ats/ats.routes"));
const application_routes_1 = __importDefault(require("./modules/applications/application.routes"));
const jobAlert_routes_1 = __importDefault(require("./modules/alerts/jobAlert.routes"));
const docs_routes_1 = __importDefault(require("./modules/docs/docs.routes"));
const exam_routes_1 = __importDefault(require("./modules/exams/exam.routes"));
// ✅ ADD THIS
const learning_routes_1 = __importDefault(require("./modules/learning/learning.routes"));
const calendar_routes_1 = __importDefault(require("./modules/calendar/calendar.routes"));
const app = (0, express_1.default)();
/* -------------------------- Security headers -------------------------- */
app.use((0, helmet_1.default)());
/* -------------------------- Body parsers ------------------------------ */
app.use((0, express_1.json)({ limit: "1mb" }));
app.use((0, express_1.urlencoded)({ extended: true }));
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
    origin(origin, cb) {
        if (!origin)
            return cb(null, true);
        if (ALLOWED_ORIGINS.includes(origin))
            return cb(null, true);
        return cb(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsDelegate));
app.options("*", (0, cors_1.default)(corsDelegate));
// Short-circuit OPTIONS
app.use((req, res, next) => {
    if (req.method === "OPTIONS")
        return res.sendStatus(200);
    next();
});
/* ------------------------------ Logger -------------------------------- */
app.use((0, pino_http_1.default)({
    serializers: {
        req(req) {
            return { method: req.method, url: req.url, id: req.id };
        },
    },
}));
/* ------------------------------ Health -------------------------------- */
app.get("/v1/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
/* --------------------------- Rate limiting ----------------------------- */
app.use(rateLimit_1.globalLimiter);
/* -------------------------------- Routes ------------------------------- */
app.use("/v1/auth", rateLimit_1.authLimiter, auth_routes_1.default);
app.use("/v1", user_routes_1.default);
app.use("/v1", job_routes_1.default);
app.use("/v1", file_routes_1.default);
app.use("/v1", ats_routes_1.default);
app.use("/v1", application_routes_1.default);
app.use("/v1", jobAlert_routes_1.default);
app.use("/v1", exam_routes_1.default);
app.use("/v1", docs_routes_1.default);
// ✅ MOUNT LEARNING ROUTES
app.use("/v1", learning_routes_1.default);
app.use("/v1", calendar_routes_1.default);
/* ---------------------------- Fallbacks -------------------------------- */
app.use(error_1.notFound);
app.use(error_1.errorHandler);
/* --------- lines appended earlier (optional) --------------------------- */
app.use((0, cors_1.default)());
app.use((0, pino_http_1.default)());
exports.default = app;
