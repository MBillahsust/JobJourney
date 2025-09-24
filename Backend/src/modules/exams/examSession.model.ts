import mongoose, { Schema, Document, Types } from "mongoose";
import { QuestionType } from "./exam.model";

export type SessionStatus = "active" | "completed" | "expired";

export interface Answer {
  _id: Types.ObjectId;
  questionId: Types.ObjectId;
  type: QuestionType;
  selectedIndex?: number;     // mcq
  text?: string;              // short/code
  isCorrect?: boolean;        // mcq auto, open may be set later
  pointsAwarded?: number;     // computed on finish; for mcq set immediately
  timeSpentSec?: number;      // optional client-provided
  feedback?: string;          // LLM or grader feedback
}

export interface ExamSessionDoc extends Document {
  userId: Types.ObjectId;
  examId: Types.ObjectId;
  status: SessionStatus;
  startedAt: Date;
  expiresAt?: Date;
  finishedAt?: Date;

  // snapshot for immutability
  settings: { timeLimitMin?: number };
  questions: Array<{
    _id: Types.ObjectId;
    type: QuestionType;
    prompt: string;
    options?: string[];
    // NOTE: we DO NOT store correctIndex in session snapshot to avoid leaking
    points?: number;
  }>;

  answers: Answer[];
  totalPoints?: number;
  totalAwarded?: number;

  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<Answer>(
  {
    questionId: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ["mcq", "short", "code"], required: true },
    selectedIndex: Number,
    text: String,
    isCorrect: Boolean,
    pointsAwarded: Number,
    timeSpentSec: Number,
    feedback: String
  },
  { _id: true }
);

const SessionQuestionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ["mcq", "short", "code"], required: true },
    prompt: { type: String, required: true },
    options: [String],
    points: Number
  },
  { _id: false }
);

const ExamSessionSchema = new Schema<ExamSessionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true, index: true },
    status: { type: String, enum: ["active", "completed", "expired"], default: "active", index: true },
    startedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    finishedAt: Date,

    settings: {
      timeLimitMin: Number
    },
    questions: { type: [SessionQuestionSchema], default: [] },
    answers: { type: [AnswerSchema], default: [] },

    totalPoints: Number,
    totalAwarded: Number
  },
  { timestamps: true }
);

ExamSessionSchema.index({ userId: 1, status: 1, startedAt: -1 });

export const ExamSession = mongoose.model<ExamSessionDoc>("ExamSession", ExamSessionSchema);
