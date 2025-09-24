import mongoose, { Schema, Document, Types } from "mongoose";

export interface JobSaveDoc extends Document {
  userId: Types.ObjectId;
  jobId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSaveSchema = new Schema<JobSaveDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true }
  },
  { timestamps: true }
);

// prevent duplicates per user+job
JobSaveSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const JobSave = mongoose.model<JobSaveDoc>("JobSave", JobSaveSchema);
