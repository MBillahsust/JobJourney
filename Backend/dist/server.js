"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// patch express to forward rejected promises from route handlers
require("express-async-errors");
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app_1 = __importDefault(require("./app"));
// Import models so indexes are ensured at boot
const user_model_1 = require("./modules/auth/user.model");
const job_model_1 = require("./modules/jobs/job.model");
const jobSave_model_1 = require("./modules/jobs/jobSave.model");
const file_model_1 = require("./modules/files/file.model");
const ats_model_1 = require("./modules/ats/ats.model");
const application_model_1 = require("./modules/applications/application.model");
const jobAlert_model_1 = require("./modules/alerts/jobAlert.model");
const learningPlan_model_1 = require("./modules/learning/learningPlan.model");
const PORT = Number(process.env.PORT || 4000);
const { MONGODB_URI, JWT_SECRET } = process.env;
if (!MONGODB_URI || !JWT_SECRET) {
    console.error("Missing MONGODB_URI or JWT_SECRET in .env");
    process.exit(1);
}
function ensureLocalUploadDir() {
    const base = process.env.LOCAL_UPLOAD_DIR || "./uploads";
    const abs = path_1.default.resolve(base);
    if (!fs_1.default.existsSync(abs))
        fs_1.default.mkdirSync(abs, { recursive: true });
    console.log("✅ Local upload dir:", abs);
}
async function main() {
    ensureLocalUploadDir();
    await mongoose_1.default.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");
    // Ensure indexes
    await Promise.all([
        user_model_1.User.init(),
        job_model_1.Job.init(),
        jobSave_model_1.JobSave.init(),
        file_model_1.FileModel.init(),
        ats_model_1.ATSEvaluation.init(),
        application_model_1.Application.init(),
        jobAlert_model_1.JobAlert.init(),
        learningPlan_model_1.LearningPlan.init()
    ]);
    console.log("✅ Indexes ensured");
    app_1.default.listen(PORT, () => {
        console.log(`✅ API running on http://localhost:${PORT}`);
    });
}
main().catch((err) => {
    console.error("Startup error:", err);
    process.exit(1);
});
