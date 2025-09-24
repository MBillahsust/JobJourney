"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const pino_http_1 = __importDefault(require("pino-http"));
const express_2 = require("express");
const error_1 = require("./middlewares/error");
const rateLimit_1 = require("./middlewares/rateLimit");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const job_routes_1 = __importDefault(require("./modules/jobs/job.routes"));
const file_routes_1 = __importDefault(require("./modules/files/file.routes"));
const ats_routes_1 = __importDefault(require("./modules/ats/ats.routes"));
const application_routes_1 = __importDefault(require("./modules/applications/application.routes"));
const jobAlert_routes_1 = __importDefault(require("./modules/alerts/jobAlert.routes"));
const docs_routes_1 = __importDefault(require("./modules/docs/docs.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, pino_http_1.default)());
app.use((0, express_2.json)({ limit: "1mb" }));
app.use((0, express_2.urlencoded)({ extended: true }));
app.get("/v1/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
// Global rate limit
app.use(rateLimit_1.globalLimiter);
// Routes
app.use("/v1/auth", rateLimit_1.authLimiter, auth_routes_1.default);
app.use("/v1", user_routes_1.default);
app.use("/v1", job_routes_1.default);
app.use("/v1", file_routes_1.default);
app.use("/v1", ats_routes_1.default);
app.use("/v1", application_routes_1.default);
app.use("/v1", jobAlert_routes_1.default);
app.use("/v1", docs_routes_1.default);
// fallbacks
app.use(error_1.notFound);
app.use(error_1.errorHandler);
exports.default = app;
