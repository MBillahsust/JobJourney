import mongoose, { Schema, Document, Types } from "mongoose";

export type QuestionType = "mcq" | "short" | "code";

export interface Question {
  _id: Types.ObjectId;
  type: QuestionType;
  prompt: string;
  options?: string[];          // for mcq
  correctIndex?: number;       // for mcq (stored on Exam, stripped for clients during session)
  language?: string;           // for code questions (e.g., "javascript")
  points?: number;             // default 1
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  guidance?: string;           // rubric/guidance for graders/LLM
}

export interface ExamDoc extends Document {
  userId: Types.ObjectId;           // who created it
  title: string;
  description?: string;
  source?: { jobId?: Types.ObjectId; provider?: string; request?: string };
  // new fields
  examType?: "mcq-only" | "standard";
  role?: string;
  experienceLevel?: "junior" | "mid" | "senior";
  sections?: ({ name: string; weight?: number; topics?: string[] })[];
  settings: { timeLimitMin?: number; shuffle?: boolean };
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<Question>(
  {
    type: { type: String, enum: ["mcq", "short", "code"], required: true },
    prompt: { type: String, required: true },
    options: [String],
    correctIndex: Number,
    language: String,
    points: { type: Number, default: 1 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    tags: [String],
    guidance: String
  },
  { _id: true }
);

const ExamSchema = new Schema<ExamDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: String,
    examType: { type: String, enum: ["mcq-only", "standard"], default: "standard" },
    role: String,
    experienceLevel: { type: String, enum: ["junior", "mid", "senior"] },
    sections: [
      {
        name: String,
        weight: Number,
        topics: [String]
      }
    ],
    source: {
      jobId: { type: Schema.Types.ObjectId, ref: "Job" },
      provider: String,
      request: String
    },
    settings: {
      timeLimitMin: { type: Number, default: 30 },
      shuffle: { type: Boolean, default: true }
    },
    questions: { type: [QuestionSchema], default: [] }
  },
  { timestamps: true }
);

ExamSchema.index({ userId: 1, createdAt: -1 });

export const Exam = mongoose.model<ExamDoc>("Exam", ExamSchema);
