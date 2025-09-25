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
    days: z.string().min(1),
    experience_level: z.string().min(1),
    focus_areas: z.string().optional(),
    skill_gaps: z.string().optional()
  })
});

const jobDescSchema = z.object({
  body: z.object({
    job_content: z.string().min(10),
    skill_analysis_text: z.string().optional(),
    plan_duration: z.string().optional()
  })
});

/** Normalize provider response */
function extractOutput(provider: any) {
  const output = provider?.result?.Output || provider?.result || {};
  return {
    dailyPlan: output.daily_plan || output.dailyPlan,
    weeklyMilestones: output.weekly_milestones || output.weeklyMilestones,
    resources: output.resources,
    progressTracking: output.progress_tracking || output.progressTracking
  };
}

router.post("/learning/manual", requireAuth, validate(manualSchema), async (req: AuthRequest, res) => {
  try {
    const providerResp = await createManualPlan(req.body);
    const extracted = extractOutput(providerResp);

    const created = await LearningPlan.create({
      userId: req.user!.id,
      kind: "manual",
      request: req.body,
      providerResponse: providerResp,
      providerJobId: providerResp.id,
      providerName: providerResp.name,
      status: "ready",
      ...extracted
    });

    res.status(201).json({ id: created.id, ...extracted });
  } catch (err: any) {
    console.error("Manual learning plan error", err);
    const created = await LearningPlan.create({
      userId: req.user!.id,
      kind: "manual",
      request: req.body,
      status: "error",
      errorMessage: err.message
    });
    res.status(502).json({ error: { code: "PROVIDER_ERROR", message: err.message }, id: created.id });
  }
});

router.post("/learning/job-description", requireAuth, validate(jobDescSchema), async (req: AuthRequest, res) => {
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
      ...extracted
    });

    res.status(201).json({ id: created.id, ...extracted });
  } catch (err: any) {
    console.error("Job description plan error", err);
    const created = await LearningPlan.create({
      userId: req.user!.id,
      kind: "job_description",
      request: req.body,
      status: "error",
      errorMessage: err.message
    });
    res.status(502).json({ error: { code: "PROVIDER_ERROR", message: err.message }, id: created.id });
  }
});

/** List plans */
router.get("/learning", requireAuth, async (req: AuthRequest, res) => {
  const docs = await LearningPlan.find({ userId: req.user!.id }).sort({ createdAt: -1 }).limit(100);
  res.json({ items: docs.map(d => ({
    id: d.id,
    kind: d.kind,
    createdAt: d.createdAt,
    status: d.status,
    dailyPlan: d.dailyPlan,
    weeklyMilestones: d.weeklyMilestones,
    resources: d.resources,
    progressTracking: d.progressTracking
  })) });
});

/** Get detail */
router.get("/learning/:id", requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
  const doc = await LearningPlan.findById(id);
  if (!doc || String(doc.userId) !== String(req.user!.id)) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Not found" } });
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
    providerResponse: doc.providerResponse
  });
});

export default router;