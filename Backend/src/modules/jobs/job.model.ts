import mongoose, { Schema, Document } from "mongoose";

export type RemoteKind = "on_site" | "remote" | "hybrid";
export type EmploymentType = "full_time" | "part_time" | "contract" | "internship";
export type Seniority = "intern" | "junior" | "mid" | "senior" | "lead";

export interface JobDoc extends Document {
  title: string;
  company: { name: string; site?: string };
  location?: string;
  remote?: RemoteKind;
  employmentType?: EmploymentType;
  seniority?: Seniority;
  postedAt?: Date;
  salary?: { currency?: string; min?: number; max?: number };
  skillsRequired?: string[];
  descriptionHtml?: string;
  source?: { provider?: string; url?: string };
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<JobDoc>(
  {
    title: { type: String, required: true },
    company: {
      name: { type: String, required: true, index: true },
      site: String
    },
    location: String,
    remote: { type: String, enum: ["on_site", "remote", "hybrid"] },
    employmentType: { type: String, enum: ["full_time", "part_time", "contract", "internship"] },
    seniority: { type: String, enum: ["intern", "junior", "mid", "senior", "lead"] },
    postedAt: Date,
    salary: { currency: String, min: Number, max: Number },
    skillsRequired: [String],
    descriptionHtml: String,
    source: { provider: String, url: String }
  },
  { timestamps: true }
);

// Text search across title, company.name, and location
JobSchema.index({ title: "text", "company.name": "text", location: "text" });
// Useful secondary indexes
JobSchema.index({ postedAt: -1, _id: -1 });
JobSchema.index({ skillsRequired: 1 });

export const Job = mongoose.model<JobDoc>("Job", JobSchema);
