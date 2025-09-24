import { Router, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAuth, AuthRequest } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { Job } from "../jobs/job.model";
import { JobAlert } from "./jobAlert.model";

const router = Router();

const remoteEnum = z.enum(["on_site", "remote", "hybrid"]);
const employmentEnum = z.enum(["full_time", "part_time", "contract", "internship"]);
const seniorityEnum = z.enum(["intern", "junior", "mid", "senior", "lead"]);
const frequencyEnum = z.enum(["instant", "daily", "weekly"]);
const statusEnum = z.enum(["active", "paused"]);

const filterShape = z.object({
  q: z.string().trim().optional(),
  location: z.string().trim().optional(),
  remote: remoteEnum.optional(),
  employmentType: employmentEnum.optional(),
  seniority: seniorityEnum.optional(),
  skills: z.union([z.string().min(1), z.array(z.string().min(1))]).optional()
});

function toArray(val?: string | string[]): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

function buildJobQuery(filters: z.infer<typeof filterShape>) {
  const query: any = {};
  if (filters.q) query.$text = { $search: filters.q };
  if (filters.location) query.location = new RegExp(String(filters.location), "i");
  if (filters.remote) query.remote = filters.remote;
  if (filters.employmentType) query.employmentType = filters.employmentType;
  if (filters.seniority) query.seniority = filters.seniority;

  const skillsArr = toArray(filters.skills as any);
  if (skillsArr.length) query.skillsRequired = { $all: skillsArr };
  return query;
}

/**
 * POST /job-alerts
 */
const createSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(120),
    ...filterShape.shape,
    frequency: frequencyEnum.optional(),
    status: statusEnum.optional()
  })
});

router.post("/job-alerts", requireAuth, validate(createSchema), async (req: AuthRequest, res: Response) => {
  const { name, frequency, status, ...filters } = req.body as any;
  const skills = toArray((filters as any).skills);
  const doc = await JobAlert.create({
    userId: req.user!.id,
    name,
    filters: { ...filters, skills },
    frequency: frequency || "daily",
    status: status || "active"
  });
  res.status(201).json({ id: doc.id });
});

/**
 * GET /job-alerts?status=&limit=
 */
const listSchema = z.object({
  query: z.object({
    status: statusEnum.optional(),
    limit: z.coerce.number().min(1).max(100).optional()
  })
});

router.get("/job-alerts", requireAuth, validate(listSchema), async (req: AuthRequest, res: Response) => {
  const limit = Number(req.query.limit) || 50;
  const q: any = { userId: req.user!.id };
  if (req.query.status) q.status = req.query.status;

  const items = await JobAlert.find(q).sort({ createdAt: -1 }).limit(limit).lean();
  res.json({
    items: items.map((a) => ({
      id: a._id,
      name: a.name,
      filters: a.filters,
      frequency: a.frequency,
      status: a.status,
      lastRunAt: a.lastRunAt
    }))
  });
});

/**
 * GET /job-alerts/:id
 */
router.get("/job-alerts/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
  const alert = await JobAlert.findById(id).lean();
  if (!alert || String(alert.userId) !== String(req.user!.id))
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Alert not found" } });
  res.json(alert);
});

/**
 * PATCH /job-alerts/:id
 */
const patchSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(120).optional(),
    ...filterShape.partial().shape,
    frequency: frequencyEnum.optional(),
    status: statusEnum.optional()
  })
});

router.patch("/job-alerts/:id", requireAuth, validate(patchSchema), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });

  const alert = await JobAlert.findById(id);
  if (!alert || String(alert.userId) !== String(req.user!.id))
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Alert not found" } });

  if (req.body.name !== undefined) alert.name = req.body.name;
  if (req.body.frequency !== undefined) alert.frequency = req.body.frequency;
  if (req.body.status !== undefined) alert.status = req.body.status;

  // Filters (merge)
  const f = alert.filters || {};
  if (req.body.q !== undefined) f.q = req.body.q || undefined;
  if (req.body.location !== undefined) f.location = req.body.location || undefined;
  if (req.body.remote !== undefined) f.remote = req.body.remote;
  if (req.body.employmentType !== undefined) f.employmentType = req.body.employmentType;
  if (req.body.seniority !== undefined) f.seniority = req.body.seniority;
  if (req.body.skills !== undefined) f.skills = toArray(req.body.skills);

  alert.filters = f;
  await alert.save();

  res.json({
    id: alert.id,
    name: alert.name,
    filters: alert.filters,
    frequency: alert.frequency,
    status: alert.status
  });
});

/**
 * DELETE /job-alerts/:id
 */
router.delete("/job-alerts/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
  const alert = await JobAlert.findById(id);
  if (!alert || String(alert.userId) !== String(req.user!.id))
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Alert not found" } });
  await alert.deleteOne();
  return res.status(204).send();
});

/**
 * POST /job-alerts/preview  -> run filters once without saving
 */
const previewSchema = z.object({
  body: z.object({
    ...filterShape.shape,
    limit: z.coerce.number().min(1).max(50).optional()
  })
});

router.post("/job-alerts/preview", requireAuth, validate(previewSchema), async (req: AuthRequest, res: Response) => {
  const { limit = 20, ...filters } = req.body as any;
  const query = buildJobQuery(filters);
  const items = await Job.find(query).sort({ postedAt: -1, _id: -1 }).limit(limit).lean();
  res.json({
    items: items.map((j) => ({
      id: j._id,
      title: j.title,
      company: j.company,
      location: j.location,
      remote: j.remote,
      postedAt: j.postedAt,
      skillsRequired: j.skillsRequired
    }))
  });
});

/**
 * POST /job-alerts/:id/run-now  -> execute this alert immediately
 */
const runNowSchema = z.object({
  body: z.object({
    limit: z.coerce.number().min(1).max(50).optional()
  })
});

router.post("/job-alerts/:id/run-now", requireAuth, validate(runNowSchema), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });

  const alert = await JobAlert.findById(id);
  if (!alert || String(alert.userId) !== String(req.user!.id))
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Alert not found" } });

  const limit = Number(req.body.limit) || 20;
  const query = buildJobQuery(alert.filters || {});
  const items = await Job.find(query).sort({ postedAt: -1, _id: -1 }).limit(limit).lean();

  alert.lastRunAt = new Date();
  await alert.save();

  return res.json({
    alert: {
      id: alert.id,
      name: alert.name,
      filters: alert.filters,
      frequency: alert.frequency,
      status: alert.status,
      lastRunAt: alert.lastRunAt
    },
    items: items.map((j) => ({
      id: j._id,
      title: j.title,
      company: j.company,
      location: j.location,
      remote: j.remote,
      postedAt: j.postedAt,
      skillsRequired: j.skillsRequired
    }))
  });
});

/**
 * Convenience: pause/resume
 */
router.post("/job-alerts/:id/pause", requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
  const alert = await JobAlert.findById(id);
  if (!alert || String(alert.userId) !== String(req.user!.id))
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Alert not found" } });
  if (alert.status !== "paused") {
    alert.status = "paused";
    await alert.save();
  }
  res.json({ id: alert.id, status: alert.status });
});

router.post("/job-alerts/:id/resume", requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
  const alert = await JobAlert.findById(id);
  if (!alert || String(alert.userId) !== String(req.user!.id))
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Alert not found" } });
  if (alert.status !== "active") {
    alert.status = "active";
    await alert.save();
  }
  res.json({ id: alert.id, status: alert.status });
});

export default router;
