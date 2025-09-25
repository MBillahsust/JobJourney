import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAuth, AuthRequest } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { LearningPlan } from "./learningPlan.model";
import { createManualPlan, analyzeJobDescription } from "../../libs/learningPlanApi";

const router = Router();

/** --------- Validation Schemas ---------- */
const manualSchema = z.object({
  body: z.object({
    job_title: z.string().min(2),
    company_name: z.string().min(1),
    target_date: z.string().min(1),
    experience_level: z.string().min(1),
    focus_areas: z.string().optional(),
    skill_gaps: z.string().optional(),
    // optional override for how many days to generate
    duration_days: z.number().int().min(1).max(60).optional(),
  }),
});

const jobDescSchema = z.object({
  body: z.object({
    job_content: z.string().min(10),
    skill_analysis_text: z.string().optional(),
    plan_duration: z.string().optional(),
  }),
});

/** Normalize provider response (legacy) */
function extractOutput(provider: any) {
  const output = provider?.result?.Output || provider?.result || {};
  return {
    dailyPlan: output.daily_plan || output.dailyPlan,
    weeklyMilestones: output.weekly_milestones || output.weeklyMilestones,
    resources: output.resources,
    progressTracking: output.progress_tracking || output.progressTracking,
  };
}

/** Build a structured, user-actionable plan:
 * - durationDays = requested or default
 * - each day has 3 tasks, all completed=false initially
 * - task types rotate across coding/system/review
 */
function buildInitialPlan(opts: {
  durationDays: number;
  startDateISO?: string; // optional: anchor dates if you want
  skillGaps?: string[];
}) {
  const { durationDays, startDateISO, skillGaps } = opts;
  const types = ["coding", "system", "review"] as const;

  const gaps = (skillGaps && skillGaps.length
    ? skillGaps
    : ["Data Structures", "System Design", "CS Fundamentals", "APIs", "Databases", "Kubernetes", "GraphQL"]
  ).map((s) => s.trim()).filter(Boolean);

  const days = Array.from({ length: durationDays }).map((_, idx) => {
    const dayNum = idx + 1;

    // lightweight date label (optional)
    let dateLabel = "";
    if (startDateISO) {
      const d = new Date(startDateISO);
      d.setDate(d.getDate() + idx);
      dateLabel = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    }

    const tasks = Array.from({ length: 3 }).map((__, tIndex) => {
      const type = types[(idx + tIndex) % types.length];
      const gap = gaps[(idx + tIndex) % gaps.length] || "Skill Gap";
      let title = "";
      let duration = 30;

      switch (type) {
        case "coding":
          title = ["Two Pointers Practice", "Binary Search Drills", "Tree Traversals", "Graph Basics"][tIndex % 4];
          duration = 45;
          break;
        case "system":
          title = ["Load Balancer Basics", "Database Sharding", "Caching Strategies", "Message Queues"][tIndex % 4];
          duration = 30;
          break;
        default:
          title = ["Big O Review", "Behavioral: STAR Stories", "API Design Notes", "K8s Fundamentals"][tIndex % 4];
          duration = 20;
          break;
      }

      return {
        id: `${dayNum}-${tIndex + 1}`,
        type,            // "coding" | "system" | "review"
        title,
        duration,        // minutes
        completed: false, // <-- initially all false
        gap,
      };
    });

    return {
      day: dayNum,
      date: dateLabel, // e.g., "Mon, Oct 21"
      completed: false,
      current: dayNum === 1, // you can set true for Day 1
      tasks,
    };
  });

  return {
    durationDays,
    days,
  };
}

router.post(
  "/learning/manual",
  requireAuth,
  validate(manualSchema),
  async (req: AuthRequest, res) => {
    try {
      // (Optional) call your provider to get extra fields (kept for compatibility)
      let providerResp: any = {};
      try {
        providerResp = await createManualPlan(req.body);
      } catch {
        // If provider fails we still deliver a structured local plan;
        // errors are tracked but won't block the user’s flow.
        providerResp = { name: "LocalPlanFallback", id: undefined };
      }
      const extracted = extractOutput(providerResp);

      // duration: from request or env or default 14
      const durationDays =
        typeof req.body.duration_days === "number"
          ? req.body.duration_days
          : Number(process.env.DEFAULT_PLAN_DAYS || 14);

      // derive skill gaps array from free-text
      const skillGaps =
        typeof req.body.skill_gaps === "string"
          ? req.body.skill_gaps.split(/[,\n]/g)
          : [];

      // Build actionable plan (all tasks incomplete)
      const plan = buildInitialPlan({
        durationDays,
        startDateISO: undefined, // or new Date().toISOString()
        skillGaps,
      });

      // Persist
      const created = await LearningPlan.create({
        userId: req.user!.id,
        kind: "manual",
        request: req.body,
        providerResponse: { ...providerResp, plan }, // store the plan
        providerJobId: providerResp.id,
        providerName: providerResp.name,
        status: "ready",
        ...extracted,
      });

      // Return id + plan so the UI can render immediately
      res.status(201).json({
        id: created.id,
        plan,
        ...extracted,
      });
    } catch (err: any) {
      console.error("Manual learning plan error", err);
      const created = await LearningPlan.create({
        userId: req.user!.id,
        kind: "manual",
        request: req.body,
        status: "error",
        errorMessage: err.message,
      });
      res.status(502).json({
        error: { code: "PROVIDER_ERROR", message: err.message },
        id: created.id,
      });
    }
  }
);

router.post(
  "/learning/job-description",
  requireAuth,
  validate(jobDescSchema),
  async (req: AuthRequest, res) => {
    try {
      const providerResp = await analyzeJobDescription(req.body);
      const extracted = extractOutput(providerResp);

      const created = await LearningPlan.create({
        userId: req.user!.id,
        kind: "job_description",
        request: req.body,
        providerResponse: providerResp,
        providerJobId: providerResp.id,
        providerName: providerResp.name,
        status: "ready",
        ...extracted,
      });

      res.status(201).json({ id: created.id, ...extracted });
    } catch (err: any) {
      console.error("Job description plan error", err);
      const created = await LearningPlan.create({
        userId: req.user!.id,
        kind: "job_description",
        request: req.body,
        status: "error",
        errorMessage: err.message,
      });
      res.status(502).json({
        error: { code: "PROVIDER_ERROR", message: err.message },
        id: created.id,
      });
    }
  }
);

/** List plans (unchanged) */
router.get("/learning", requireAuth, async (req: AuthRequest, res) => {
  const docs = await LearningPlan.find({ userId: req.user!.id })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({
    items: docs.map((d) => ({
      id: d.id,
      kind: d.kind,
      createdAt: d.createdAt,
      status: d.status,
      dailyPlan: d.dailyPlan,
      weeklyMilestones: d.weeklyMilestones,
      resources: d.resources,
      progressTracking: d.progressTracking,
    })),
  });
});

/** Get detail (unchanged) */
router.get("/learning/:id", requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res
      .status(400)
      .json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
  const doc = await LearningPlan.findById(id);
  if (!doc || String(doc.userId) !== String(req.user!.id))
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Not found" } });
  res.json({
    id: doc.id,
    kind: doc.kind,
    status: doc.status,
    createdAt: doc.createdAt,
    request: doc.request,
    dailyPlan: doc.dailyPlan,
    weeklyMilestones: doc.weeklyMilestones,
    resources: doc.resources,
    progressTracking: doc.progressTracking,
    providerJobId: doc.providerJobId,
    providerName: doc.providerName,
    errorMessage: doc.errorMessage,
    providerResponse: doc.providerResponse, // includes { plan } now
  });
});

export default router;
