import mongoose, { Schema, Document, Types } from "mongoose";

export interface Breakdown {
  skills: number;
  keywords: number;
}

export interface ATSEvaluationDoc extends Document {
  userId: Types.ObjectId;
  jobId: Types.ObjectId;

  // snapshot text to keep history reproducible (trim to prevent huge docs)
  resumeText: string;

  score: number;             // 0..100
  breakdown: Breakdown;

  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];

  createdAt: Date;
  updatedAt: Date;
}

const ATSEvaluationSchema = new Schema<ATSEvaluationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },

    resumeText: { type: String, required: true },

    score: { type: Number, required: true },
    breakdown: {
      skills: { type: Number, required: true },
      keywords: { type: Number, required: true }
    },

    matchedSkills: [String],
    missingSkills: [String],
    matchedKeywords: [String],
    missingKeywords: [String]
  },
  { timestamps: true }
);

ATSEvaluationSchema.index({ userId: 1, jobId: 1, createdAt: -1 });

export const ATSEvaluation = mongoose.model<ATSEvaluationDoc>("ATSEvaluation", ATSEvaluationSchema);
