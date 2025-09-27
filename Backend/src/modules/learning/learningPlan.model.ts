import mongoose, { Schema, Document } from "mongoose";

export type LearningPlanKind = "manual" | "job_description" | "comprehensive";

export interface LearningPlanDoc extends Document {
  userId: mongoose.Types.ObjectId;
  kind: LearningPlanKind;
  // Raw request we sent to provider
  request: any;
  // Raw provider JSON response
  providerResponse?: any;
  // Normalized extracted plan fields
  dailyPlan?: string;
  weeklyMilestones?: string;
  resources?: string;
  progressTracking?: string;
  providerJobId?: string; // id field in provider response (e.g. M2JOBDESC003)
  providerName?: string; // name field in provider response (e.g. APIOutput)
  status: "ready" | "error";
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LearningPlanSchema = new Schema<LearningPlanDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind: { type: String, enum: ["manual", "job_description", "comprehensive"], required: true },
    request: Schema.Types.Mixed,
    providerResponse: Schema.Types.Mixed,
    dailyPlan: String,
    weeklyMilestones: String,
    resources: String,
    progressTracking: String,
    providerJobId: String,
    providerName: String,
    status: { type: String, enum: ["ready", "error"], default: "ready" },
    errorMessage: String
  },
  { timestamps: true }
);

LearningPlanSchema.index({ userId: 1, createdAt: -1 });

export const LearningPlan = mongoose.model<LearningPlanDoc>("LearningPlan", LearningPlanSchema);
