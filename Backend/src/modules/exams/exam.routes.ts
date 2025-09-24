import { Router, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAuth, AuthRequest } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { Exam } from "./exam.model";
import { ExamSession } from "./examSession.model";
import { generateExam, gradeOpenAnswer } from "./llm";

const router = Router();

/** Helpers */
function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function redactForCandidate(q: any) {
  const { correctIndex, guidance, ...rest } = q;
  return rest;
}

/** ------------ Generate an exam (LLM or fallback) ------------- */
const genSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120).optional(),
    topics: z.array(z.string().min(2)).optional(),
    sections: z.array(z.union([
      z.string().min(2),
      z.object({ name: z.string().min(2), weight: z.number().optional(), topics: z.array(z.string()).optional() })
    ])).optional(),
  examType: z.enum(["mcq-only", "standard", "timed"]).optional(),
    role: z.string().max(100).optional(),
    experienceLevel: z.enum(["junior", "mid", "senior"]).optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    numMcq: z.number().int().min(0).max(30).optional(),
    numShort: z.number().int().min(0).max(20).optional(),
    numCode: z.number().int().min(0).max(10).optional(),
    timeLimitMin: z.number().int().min(5).max(240).optional(),
    // If true, we store the generated exam under current user
    save: z.boolean().optional(),
    // Optional link to a job we have
    jobId: z.string().optional(),
    request: z.string().max(2000).optional()
  })
});

router.post("/exams/generate", requireAuth, validate(genSchema), async (req: AuthRequest, res: Response) => {
  const { save, jobId, ...opts } = req.body;

  // Normalize sections: accept either string[] or object[] from clients
  function normalizeSections(input: any): any[] | undefined {
    if (!input) return undefined;
    if (!Array.isArray(input)) return undefined;
    return input.map((s: any) => (typeof s === "string" ? { name: s } : s));
  }

  opts.sections = normalizeSections(opts.sections);

  // Normalize examType: accept 'timed' from clients but treat as 'standard' internally
  if (opts.examType === "timed") opts.examType = "standard";

  let exam;
  try {
    exam = await generateExam(opts);
  } catch (err: any) {
    console.error("Exam generation LLM error:", err);
    return res.status(502).json({ error: { code: "LLM_ERROR", message: "Exam generation failed: see server logs" } });
  }

  if (save) {
    let jobRef: any = undefined;
    if (jobId && mongoose.isValidObjectId(jobId)) jobRef = jobId;

    const created = await Exam.create({
      userId: req.user!.id,
      title: exam.title,
      description: exam.description || "",
      examType: opts.examType || "standard",
      role: opts.role,
      experienceLevel: opts.experienceLevel,
      sections: opts.sections,
      source: { jobId: jobRef, provider: process.env.EXAM_LLM_PROVIDER || "none", request: opts.request || "" },
      settings: exam.settings || { timeLimitMin: 30, shuffle: true },
      questions: exam.questions.map((q: any) => ({
        _id: new mongoose.Types.ObjectId(),
        ...q
      }))
    });

    return res.status(201).json({ examId: created.id, title: created.title, questionCount: created.questions.length });
  }

  // Return raw exam JSON (not stored)
  return res.json(exam);
});

/** ------------ Create exam from a provided spec ------------- */
const createSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
  examType: z.enum(["mcq-only", "standard", "timed"]).optional(),
    role: z.string().max(100).optional(),
    experienceLevel: z.enum(["junior", "mid", "senior"]).optional(),
    sections: z.array(z.union([
      z.string().min(2),
      z.object({ name: z.string().min(2), weight: z.number().optional(), topics: z.array(z.string()).optional() })
    ])).optional(),
    description: z.string().max(2000).optional(),
    settings: z.object({ timeLimitMin: z.number().int().min(5).max(240).optional(), shuffle: z.boolean().optional() }).optional(),
    questions: z.array(
      z.object({
        type: z.enum(["mcq", "short", "code"]),
        prompt: z.string().min(5),
        options: z.array(z.string()).optional(),
        correctIndex: z.number().int().min(0).optional(),
        language: z.string().optional(),
        points: z.number().int().min(1).max(20).optional(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        guidance: z.string().max(2000).optional(),
        tags: z.array(z.string()).optional()
      })
    ).min(1)
  })
});

router.post("/exams", requireAuth, validate(createSchema), async (req: AuthRequest, res: Response) => {
  // Normalize sections (strings -> objects)
  const sections = Array.isArray(req.body.sections)
    ? req.body.sections.map((s: any) => (typeof s === "string" ? { name: s } : s))
    : undefined;

  const examType = req.body.examType === "timed" ? "standard" : req.body.examType || "standard";

  const created = await Exam.create({
    userId: req.user!.id,
    title: req.body.title,
    examType,
    role: req.body.role,
    experienceLevel: req.body.experienceLevel,
    sections,
    description: req.body.description || "",
    settings: req.body.settings || { timeLimitMin: 30, shuffle: true },
    questions: req.body.questions.map((q: any) => ({ _id: new mongoose.Types.ObjectId(), ...q }))
  });
  res.status(201).json({ examId: created.id });
});

/** ------------ Get exam definition ------------- */
router.get("/exams/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid exam id" } });
  const doc = await Exam.findById(id).lean();
  if (!doc || String(doc.userId) !== String(req.user!.id)) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Exam not found" } });

  const adminPreview = String(req.query.adminPreview || "") === "true";
  const questions = adminPreview ? doc.questions : doc.questions.map(redactForCandidate);

  res.json({
    id: doc._id,
    title: doc.title,
    description: doc.description,
    settings: doc.settings,
    questions
  });
});

/** ------------ Start a session ------------- */
const startSchema = z.object({
  body: z.object({
    timeLimitMin: z.number().int().min(5).max(240).optional()
  })
});

router.post("/exams/:id/sessions", requireAuth, validate(startSchema), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid exam id" } });

  const exam = await Exam.findById(id).lean();
  if (!exam) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Exam not found" } });

  let qs = exam.questions.map(q => ({
    _id: q._id,
    type: q.type,
    prompt: q.prompt,
    options: q.options,
    points: q.points
  }));

  if (exam.settings.shuffle) {
    qs = shuffle(qs);
  }

  const limit = (req.body.timeLimitMin ?? exam.settings.timeLimitMin ?? 30);
  const now = new Date();
  const expires = new Date(now.getTime() + limit * 60 * 1000);

  const session = await ExamSession.create({
    userId: req.user!.id,
    examId: exam._id,
    status: "active",
    startedAt: now,
    expiresAt: expires,
    settings: { timeLimitMin: limit },
    questions: qs,
    answers: []
  });

  res.status(201).json({ sessionId: session.id, expiresAt: session.expiresAt });
});

async function loadSessionOwned(sessionId: string, userId: any) {
  if (!mongoose.isValidObjectId(sessionId)) return null;
  const s = await ExamSession.findById(sessionId);
  if (!s || String(s.userId) !== String(userId)) return null;
  return s;
}

function checkExpiry(session: any) {
  if (session.status !== "active") return;
  if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
    session.status = "expired";
  }
}

/** ------------ Fetch questions (stripped) ------------- */
router.get("/exams/sessions/:id/questions", requireAuth, async (req: AuthRequest, res: Response) => {
  const s = await loadSessionOwned(req.params.id, req.user!.id);
  if (!s) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Session not found" } });

  checkExpiry(s);
  if (s.isModified("status")) await s.save();

  res.json({ questions: s.questions });
});

/** ------------ Next unanswered ------------- */
router.get("/exams/sessions/:id/next", requireAuth, async (req: AuthRequest, res: Response) => {
  const s = await loadSessionOwned(req.params.id, req.user!.id);
  if (!s) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Session not found" } });

  checkExpiry(s);
  if (s.status !== "active") return res.status(400).json({ error: { code: "SESSION_CLOSED", message: `Session is ${s.status}` } });

  const answered = new Set(s.answers.map(a => String(a.questionId)));
  const next = s.questions.find(q => !answered.has(String(q._id)));
  if (!next) return res.json({ done: true });

  res.json({ question: next });
});

/** ------------ Submit answer ------------- */
const submitSchema = z.object({
  body: z.object({
    questionId: z.string().min(8),
    selectedIndex: z.number().int().min(0).optional(), // mcq
    text: z.string().max(20000).optional(),
    timeSpentSec: z.number().int().min(0).max(60 * 60).optional()
  })
});

router.post("/exams/sessions/:id/answers", requireAuth, validate(submitSchema), async (req: AuthRequest, res: Response) => {
  const s = await loadSessionOwned(req.params.id, req.user!.id);
  if (!s) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Session not found" } });

  checkExpiry(s);
  if (s.status !== "active") return res.status(400).json({ error: { code: "SESSION_CLOSED", message: `Session is ${s.status}` } });

  const q = s.questions.find(q => String(q._id) === String(req.body.questionId));
  if (!q) return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Unknown questionId" } });

  // Prevent duplicate answers (idempotent overwrite)
  let ans: any = s.answers.find((a: any) => String(a.questionId) === String(q._id));
  if (!ans) {
    ans = {
      _id: new mongoose.Types.ObjectId(),
      questionId: q._id as any,
      type: q.type,
      selectedIndex: undefined,
      text: undefined,
      isCorrect: undefined,
      pointsAwarded: undefined,
      timeSpentSec: req.body.timeSpentSec
    } as any;
    s.answers.push(ans);
  }

  if (q.type === "mcq") {
    if (typeof req.body.selectedIndex !== "number") {
      return res.status(400).json({ error: { code: "BAD_REQUEST", message: "selectedIndex required for mcq" } });
    }
    ans.selectedIndex = req.body.selectedIndex;

    // We need the answer key from Exam (not stored in session)
    const exam = await Exam.findById(s.examId).lean();
    const fullQ = exam?.questions.find((x: any) => String(x._id) === String(q._id));
    const correct = typeof fullQ?.correctIndex === "number" ? fullQ!.correctIndex : -1;

    ans.isCorrect = ans.selectedIndex === correct;
    const pts = q.points ?? 1;
    ans.pointsAwarded = ans.isCorrect ? pts : 0;
  } else {
    ans.text = req.body.text || "";
    // open-ended: scoring deferred to finish (or manual)
  }

  await s.save();
  res.json({ saved: true, answerId: ans._id });
});

/** ------------ Finish session ------------- */
const finishSchema = z.object({
  body: z.object({
    gradeOpenWithLLM: z.boolean().optional()
  })
});

router.post("/exams/sessions/:id/finish", requireAuth, validate(finishSchema), async (req: AuthRequest, res: Response) => {
  const s = await loadSessionOwned(req.params.id, req.user!.id);
  if (!s) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Session not found" } });

  checkExpiry(s);
  if (s.status !== "active") return res.status(400).json({ error: { code: "SESSION_CLOSED", message: `Session is ${s.status}` } });

  const exam = await Exam.findById(s.examId).lean();
  if (!exam) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Exam not found" } });

  // Score MCQs (already scored), grade open-ended if requested
  const qMap = new Map<string, any>();
  for (const q of exam.questions) qMap.set(String(q._id), q);

  let totalPoints = 0;
  let totalAwarded = 0;

  for (const q of s.questions) {
    const fullQ = qMap.get(String(q._id));
    const pts = q.points ?? fullQ?.points ?? 1;
    totalPoints += pts;
  }

  // Grade open-ended
  if (req.body.gradeOpenWithLLM) {
    for (const ans of s.answers) {
      if (ans.type === "mcq") continue;
      const q = qMap.get(String(ans.questionId));
      if (!q) continue;
      try {
        const { points, feedback } = await gradeOpenAnswer(
          { prompt: q.prompt, guidance: q.guidance, points: q.points },
          ans.text || ""
        );
        ans.pointsAwarded = points;
        ans.feedback = feedback;
      } catch (err: any) {
        console.error("LLM grading error for answer", ans._id, err);
        return res.status(502).json({ error: { code: "LLM_ERROR", message: "LLM grading failed: see server logs" } });
      }
    }
  } else {
    // default: award 0 for open-ended unless already set
    for (const ans of s.answers) {
      if (ans.type !== "mcq" && typeof ans.pointsAwarded !== "number") {
        ans.pointsAwarded = 0;
      }
    }
  }

  // Tally awarded
  for (const ans of s.answers) {
    totalAwarded += ans.pointsAwarded ?? 0;
  }

  s.totalPoints = totalPoints;
  s.totalAwarded = totalAwarded;
  s.status = "completed";
  s.finishedAt = new Date();

  await s.save();

  res.json({
    sessionId: s.id,
    status: s.status,
    totalAwarded: s.totalAwarded,
    totalPoints: s.totalPoints,
    percent: s.totalPoints ? Math.round((s.totalAwarded! / s.totalPoints!) * 100) : 0
  });
});

/** ------------ Session detail ------------- */
router.get("/exams/sessions/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const s = await loadSessionOwned(req.params.id, req.user!.id);
  if (!s) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Session not found" } });

  res.json({
    id: s.id,
    examId: s.examId,
    status: s.status,
    startedAt: s.startedAt,
    expiresAt: s.expiresAt,
    finishedAt: s.finishedAt,
    settings: s.settings,
    questions: s.questions,
    answers: s.answers,
    totalAwarded: s.totalAwarded,
    totalPoints: s.totalPoints
  });
});

export default router;
