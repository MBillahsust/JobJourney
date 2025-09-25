import dotenv from "dotenv";
dotenv.config();

// patch express to forward rejected promises from route handlers
import "express-async-errors";

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import app from "./app";

// Import models so indexes are ensured at boot
import { User } from "./modules/auth/user.model";
import { Job } from "./modules/jobs/job.model";
import { JobSave } from "./modules/jobs/jobSave.model";
import { FileModel } from "./modules/files/file.model";
import { ATSEvaluation } from "./modules/ats/ats.model";
import { Application } from "./modules/applications/application.model";
import { JobAlert } from "./modules/alerts/jobAlert.model";
import { LearningPlan } from "./modules/learning/learningPlan.model";

const PORT = Number(process.env.PORT || 4000);
const { MONGODB_URI, JWT_SECRET } = process.env;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error("Missing MONGODB_URI or JWT_SECRET in .env");
  process.exit(1);
}

function ensureLocalUploadDir() {
  const base = process.env.LOCAL_UPLOAD_DIR || "./uploads";
  const abs = path.resolve(base);
  if (!fs.existsSync(abs)) fs.mkdirSync(abs, { recursive: true });
  console.log("✅ Local upload dir:", abs);
}

async function main() {
  ensureLocalUploadDir();

  await mongoose.connect(MONGODB_URI!);
  console.log("✅ MongoDB connected");

  // Ensure indexes
  await Promise.all([
    User.init(),
    Job.init(),
    JobSave.init(),
    FileModel.init(),
    ATSEvaluation.init(),
    Application.init(),
    JobAlert.init(),
    LearningPlan.init()
  ]);
  console.log("✅ Indexes ensured");

  app.listen(PORT, () => {
    console.log(`✅ API running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});