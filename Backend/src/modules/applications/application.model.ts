import mongoose, { Schema, Document, Types } from "mongoose";

export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn"
  | "accepted";

export interface TimelineEvent {
  _id: Types.ObjectId;
  at: Date;
  type: "created" | "status" | "note";
  text?: string;
  fromStatus?: ApplicationStatus;
  toStatus?: ApplicationStatus;
}

export interface Note {
  _id: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface Task {
  _id: Types.ObjectId;
  title: string;
  dueAt?: Date;
  done: boolean;
  createdAt: Date;
}

export interface Contact {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  role?: string; // e.g., Recruiter, Hiring Manager
}

export interface ApplicationDoc extends Document {
  userId: Types.ObjectId;
  jobId: Types.ObjectId;

  // denormalized snapshot to show in lists even if the job changes
  jobSnapshot?: {
    title?: string;
    company?: { name?: string };
    location?: string;
  };

  status: ApplicationStatus;
  appliedAt?: Date;
  appliedVia?: string; // e.g., "company_site", "referral", "linkedin", "email", "other"

  resumeFileId?: Types.ObjectId; // optional link to uploaded file
  coverLetterText?: string;

  timeline: TimelineEvent[];
  notes: Note[];
  tasks: Task[];
  contacts: Contact[];

  createdAt: Date;
  updatedAt: Date;
}

const TimelineSchema = new Schema<TimelineEvent>(
  {
    at: { type: Date, default: Date.now },
    type: { type: String, enum: ["created", "status", "note"], required: true },
    text: String,
    fromStatus: { type: String, enum: ["wishlist", "applied", "phone_screen", "interview", "offer", "rejected", "withdrawn", "accepted"] },
    toStatus: { type: String, enum: ["wishlist", "applied", "phone_screen", "interview", "offer", "rejected", "withdrawn", "accepted"] }
  },
  { _id: true }
);

const NoteSchema = new Schema<Note>(
  {
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const TaskSchema = new Schema<Task>(
  {
    title: { type: String, required: true },
    dueAt: Date,
    done: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const ContactSchema = new Schema<Contact>(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    role: String
  },
  { _id: true }
);

const ApplicationSchema = new Schema<ApplicationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },

    jobSnapshot: {
      title: String,
      company: { name: String },
      location: String
    },

    status: {
      type: String,
      enum: ["wishlist", "applied", "phone_screen", "interview", "offer", "rejected", "withdrawn", "accepted"],
      default: "applied",
      index: true
    },
    appliedAt: Date,
    appliedVia: String,

    resumeFileId: { type: Schema.Types.ObjectId, ref: "File" },
    coverLetterText: String,

    timeline: { type: [TimelineSchema], default: [] },
    notes: { type: [NoteSchema], default: [] },
    tasks: { type: [TaskSchema], default: [] },
    contacts: { type: [ContactSchema], default: [] }
  },
  { timestamps: true }
);

ApplicationSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const Application = mongoose.model<ApplicationDoc>("Application", ApplicationSchema);
