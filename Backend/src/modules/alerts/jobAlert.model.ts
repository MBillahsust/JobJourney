import mongoose, { Schema, Document, Types } from "mongoose";

export type AlertFrequency = "instant" | "daily" | "weekly";
export type AlertStatus = "active" | "paused";

export interface JobAlertFilters {
  q?: string;
  location?: string;
  remote?: "on_site" | "remote" | "hybrid";
  employmentType?: "full_time" | "part_time" | "contract" | "internship";
  seniority?: "intern" | "junior" | "mid" | "senior" | "lead";
  skills?: string[];
}

export interface JobAlertDoc extends Document {
  userId: Types.ObjectId;
  name: string;
  filters: JobAlertFilters;
  frequency: AlertFrequency;
  status: AlertStatus;
  lastRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FiltersSchema = new Schema<JobAlertFilters>(
  {
    q: String,
    location: String,
    remote: { type: String, enum: ["on_site", "remote", "hybrid"] },
    employmentType: { type: String, enum: ["full_time", "part_time", "contract", "internship"] },
    seniority: { type: String, enum: ["intern", "junior", "mid", "senior", "lead"] },
    skills: [String]
  },
  { _id: false }
);

const JobAlertSchema = new Schema<JobAlertDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    filters: { type: FiltersSchema, default: {} },
    frequency: { type: String, enum: ["instant", "daily", "weekly"], default: "daily" },
    status: { type: String, enum: ["active", "paused"], default: "active", index: true },
    lastRunAt: Date
  },
  { timestamps: true }
);

JobAlertSchema.index({ userId: 1, createdAt: -1 });

export const JobAlert = mongoose.model<JobAlertDoc>("JobAlert", JobAlertSchema);
