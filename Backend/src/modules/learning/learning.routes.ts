import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, AuthRequest } from "../../middlewares/auth";
import { User } from "../auth/user.model";
import { LearningPlan } from "./learningPlan.model";
import { createManualPlan, analyzeJobDescription } from "../../libs/learningPlanApi";

const router = Router();

/* ------------------ helpers ------------------ */
const okString = (v: unknown) => typeof v === "string" && v.trim().length > 0;

const intFromDuration = (s: string) => {
  const m = String(s || "").match(/(\d{1,3})/);
  const n = m ? parseInt(m[1], 10) : 14;
  return Math.max(1, Math.min(60, n));
};

function buildExactPlan(days: number, mainGap: string) {
  // exactly 3 tasks per day: coding + system + review
  const RES = {
    cssBasics: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    selectors: "https://www.w3schools.com/css/css_selectors.asp",
    box: "https://www.w3schools.com/css/css_boxmodel.asp",
    lb: "https://www.geeksforgeeks.org/introduction-of-networking/",
    osi: "https://www.comptia.org/blog/the-osi-model-explained-and-how-to-easily-remember-its-layers",
    tcpip: "https://www.lifewire.com/tcp-ip-architecture-818143",
  };

  const arr: Array<{
    day: number;
    completed: boolean;
    tasks: Array<{
      type: "coding" | "system" | "review";
      title: string;
      duration: number;
      completed: boolean;
      gap: string;
      resources?: string;
    }>;
  }> = [];

  for (let d = 1; d <= days; d++) {
    arr.push({
      day: d,
      completed: false,
      tasks: [
        {
          type: "coding",
          title:
            d === 1
              ? `${mainGap} Basics`
              : d % 3 === 0
              ? `${mainGap} Practice`
              : `Advanced ${mainGap} Concepts`,
          duration: 45,
          completed: false,
          gap: mainGap,
          resources: d === 1 ? RES.cssBasics : d % 3 === 0 ? RES.selectors : RES.box,
        },
        {
          type: "system",
          title: d % 2 === 0 ? "OSI Model Deep Dive" : "TCP/IP Model Overview",
          duration: 30,
          completed: false,
          gap: "",
          resources: d % 2 === 0 ? RES.osi : RES.tcpip,
        },
        {
          type: "review",
          title: d === 1 ? `Review ${mainGap} Selectors/Box Model` : "Networking Concepts Recap",
          duration: 15,
          completed: false,
          gap: mainGap,
          resources: d === 1 ? RES.selectors : RES.lb,
        },
      ],
    });
  }
  return arr;
}

function extractOutput(provider: any) {
  const output = provider?.result?.Output || provider?.result || provider || {};
  return {
    dailyPlan: output.daily_plan ?? output.dailyPlan, // may be missing
    weeklyMilestones: output.weekly_milestones ?? output.weeklyMilestones,
    resources: output.resources,
    progressTracking: output.progress_tracking ?? output.progressTracking,
  };
}

/* ------------------ routes ------------------ */

/**
 * Body (all strings) — EXACTLY as requested:
 * {
 *  "job_title": "Networking Engineer",
 *  "company_name": "Facebook",
 *  "plan_duration": "21 days",
 *  "experience_level": "Experienced",
 *  "focus_areas": "software engineer",
 *  "skill_gaps": "CSS"
 * }
 *
 * Response always includes:
 * - id: string
 * - dailyPlan: stringified JSON **array** of { day, tasks[3] }
 * - sup: same as dailyPlan but as an array (not string) — convenience
 * - weeklyMilestones/resources/progressTracking: may be null/undefined
 */
router.post("/learning/manual", requireAuth, async (req: AuthRequest, res) => {
  const b = req.body || {};
  const missing: string[] = [];
  if (!okString(b.job_title)) missing.push("job_title");
  if (!okString(b.company_name)) missing.push("company_name");
  if (!okString(b.plan_duration)) missing.push("plan_duration");
  if (!okString(b.experience_level)) missing.push("experience_level");

  if (missing.length) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: missing.map((k) => ({
          code: "invalid_type",
          expected: "string",
          received: typeof b[k],
          path: ["body", k],
          message: "Required",
        })),
      },
    });
  }

  try {
    // Your hard requirement: exactly N days and exactly 3 tasks per day.
    const N = intFromDuration(b.plan_duration);
    const mainGap = (b.skill_gaps || "General").split(",")[0].trim() || "General";
    const canonical = buildExactPlan(N, mainGap);

    // We still try provider for metadata (optional)
    let providerResp: any = null;
    let extracted = { dailyPlan: undefined as string | undefined, weeklyMilestones: undefined as string | undefined, resources: undefined as string | undefined, progressTracking: undefined as string | undefined };
    try {
      providerResp = await createManualPlan(b);
      extracted = extractOutput(providerResp);
    } catch {
      // ignore provider failures
    }

    // Force dailyPlan to the canonical 3-tasks-per-day array (stringified)
    extracted.dailyPlan = JSON.stringify(canonical);

    const user = await User.findById(req.user!.id).lean();
    const userEmail = (user?.email || "").toLowerCase();
    const created = await LearningPlan.create({
      userId: req.user!.id,
      userEmail,
      kind: "manual",
      request: b,
      providerResponse: providerResp || { note: "canonical_plan_generated" },
      providerJobId: providerResp?.id,
      providerName: providerResp?.name,
      status: "ready",
      ...extracted,
    });

    return res.status(201).json({
      id: created.id,
      dailyPlan: extracted.dailyPlan,
      // convenience plain array for any future consumer:
      sup: canonical,
      weeklyMilestones: extracted.weeklyMilestones ?? null,
      resources: extracted.resources ?? null,
      progressTracking: extracted.progressTracking ?? null,
    });
  } catch (err: any) {
    console.error("Manual learning plan error", err);
    const user = await User.findById(req.user!.id).lean();
    const userEmail = (user?.email || "").toLowerCase();
    const created = await LearningPlan.create({
      userId: req.user!.id,
      userEmail,
      kind: "manual",
      request: req.body,
      status: "error",
      errorMessage: err.message,
    });
    return res.status(502).json({
      error: { code: "PROVIDER_ERROR", message: err.message },
      id: created.id,
    });
  }
});

/**
 * Body (all strings) — EXACTLY as requested:
 * {
 *  "job_title": "Networking Engineer",
 *  "company_name": "Facebook",
 *  "plan_duration": "21 days",
 *  "experience_level": "Experienced",
 *  "focus_areas": "software engineer",
 *  "skill_gaps": "CSS"
 * }
 *
 * Response always includes:
 * - id: string
 * - dailyPlan: stringified JSON **array** of { day, tasks[3] }
 * - sup: same as dailyPlan but as an array (not string) — convenience
 * - weeklyMilestones/resources/progressTracking: may be null/undefined
 */
router.post("/learning/manual", requireAuth, async (req: AuthRequest, res) => {
  const b = req.body || {};
  const missing: string[] = [];
  if (!okString(b.job_title)) missing.push("job_title");
  if (!okString(b.company_name)) missing.push("company_name");
  if (!okString(b.plan_duration)) missing.push("plan_duration");
  if (!okString(b.experience_level)) missing.push("experience_level");

  if (missing.length) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: missing.map((k) => ({
          code: "invalid_type",
          expected: "string",
          received: typeof b[k],
          path: ["body", k],
          message: "Required",
        })),
      },
    });
  }

  try {
    // Your hard requirement: exactly N days and exactly 3 tasks per day.
    const N = intFromDuration(b.plan_duration);
    const mainGap = (b.skill_gaps || "General").split(",")[0].trim() || "General";
    const canonical = buildExactPlan(N, mainGap);

    // We still try provider for metadata (optional)
    let providerResp: any = null;
    let extracted = { dailyPlan: undefined as string | undefined, weeklyMilestones: undefined as string | undefined, resources: undefined as string | undefined, progressTracking: undefined as string | undefined };
    try {
      providerResp = await createManualPlan(b);
      extracted = extractOutput(providerResp);
    } catch {
      // ignore provider failures
    }

    // Force dailyPlan to the canonical 3-tasks-per-day array (stringified)
    extracted.dailyPlan = JSON.stringify(canonical);

    const user = await User.findById(req.user!.id).lean();
    const userEmail = (user?.email || "").toLowerCase();
    const created = await LearningPlan.create({
      userId: req.user!.id,
      userEmail,
      kind: "manual",
      request: b,
      providerResponse: providerResp || { note: "canonical_plan_generated" },
      providerJobId: providerResp?.id,
      providerName: providerResp?.name,
      status: "ready",
      ...extracted,
    });

    return res.status(201).json({
      id: created.id,
      dailyPlan: extracted.dailyPlan,
      // convenience plain array for any future consumer:
      sup: canonical,
      weeklyMilestones: extracted.weeklyMilestones ?? null,
      resources: extracted.resources ?? null,
      progressTracking: extracted.progressTracking ?? null,
    });
  } catch (err: any) {
    console.error("Manual learning plan error", err);
    const user = await User.findById(req.user!.id).lean();
    const userEmail = (user?.email || "").toLowerCase();
    const created = await LearningPlan.create({
      userId: req.user!.id,
      userEmail,
      kind: "manual",
      request: req.body,
      status: "error",
      errorMessage: err.message,
    });
    return res.status(502).json({
      error: { code: "PROVIDER_ERROR", message: err.message },
      id: created.id,
    });
  }
});

router.post("/learning/job-description", requireAuth, async (req: AuthRequest, res) => {
  try {
    const providerResp = await analyzeJobDescription(req.body);
    const extracted = extractOutput(providerResp);

    const user = await User.findById(req.user!.id).lean();
    const userEmail = (user?.email || "").toLowerCase();
    const created = await LearningPlan.create({
      userId: req.user!.id,
      userEmail,
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
    const user = await User.findById(req.user!.id).lean();
    const userEmail = (user?.email || "").toLowerCase();
    const created = await LearningPlan.create({
      userId: req.user!.id,
      userEmail,
      kind: "job_description",
      request: req.body,
      status: "error",
      errorMessage: err.message,
    });
    res.status(502).json({ error: { code: "PROVIDER_ERROR", message: err.message }, id: created.id });
  }
});

router.get("/learning", requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id).lean();
  const userEmail = (user?.email || "").toLowerCase();
  const docs = await LearningPlan.find({ $or: [{ userId: req.user!.id }, { userEmail }] })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({
    items: docs.map((d: any) => ({
      id: d.id,
      kind: d.kind,
      createdAt: d.createdAt,
      status: d.status,
      request: d.request,
      dailyPlan: d.dailyPlan,
      weeklyMilestones: d.weeklyMilestones,
      resources: d.resources,
      progressTracking: d.progressTracking,
    })),
  });
});

router.get("/learning/:id", requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
  }
  const doc = await LearningPlan.findById(id);
  if (!doc || String(doc.userId) !== String(req.user!.id)) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Not found" } });
  }
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
    providerResponse: doc.providerResponse,
  });
});

export default router;