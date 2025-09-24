import { Router, Request, Response } from "express";
import { z } from "zod";
import { validate } from "../../middlewares/validate";
import { requireAuth, AuthRequest } from "../../middlewares/auth";
import { Job } from "./job.model";
import { JobSave } from "./jobSave.model";
import mongoose from "mongoose";

const router = Router();

const remoteEnum = z.enum(["on_site", "remote", "hybrid"]);
const employmentEnum = z.enum(["full_time", "part_time", "contract", "internship"]);
const seniorityEnum = z.enum(["intern", "junior", "mid", "senior", "lead"]);

/**
 * GET /jobs/search
 * q (text), location, remote, seniority, employmentType, skills[], limit
 */
const searchSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    location: z.string().optional(),
    remote: remoteEnum.optional(),
    seniority: seniorityEnum.optional(),
    employmentType: employmentEnum.optional(),
    skills: z.union([z.string(), z.array(z.string())]).optional(),
    limit: z.coerce.number().min(1).max(50).optional()
  })
});

router.get("/jobs/search", validate(searchSchema), async (req: Request, res: Response) => {
  const { q, location, remote, seniority, employmentType } = req.query as Record<string, any>;
  const skills = req.query.skills as string | string[] | undefined;
  const limit = Number(req.query.limit) || 20;

  const query: any = {};
  if (q) query.$text = { $search: q };
  if (location) query.location = new RegExp(String(location), "i");
  if (remote) query.remote = remote;
  if (seniority) query.seniority = seniority;
  if (employmentType) query.employmentType = employmentType;

  const skillsArr = Array.isArray(skills) ? skills : skills ? [skills] : [];
  if (skillsArr.length) query.skillsRequired = { $all: skillsArr };

  const items = await Job.find(query).sort({ postedAt: -1, _id: -1 }).limit(limit).lean();
  res.json({ items, nextCursor: null });
});

/**
 * POST /jobs/import  (raw job payload)
 * Requires auth (for now). Ingests a normalized job.
 */
const importSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    company: z.object({
      name: z.string().min(1),
      site: z.string().url().optional()
    }),
    location: z.string().optional(),
    remote: remoteEnum.optional(),
    employmentType: employmentEnum.optional(),
    seniority: seniorityEnum.optional(),
    postedAt: z.string().datetime().optional(),
    salary: z
      .object({
        currency: z.string().optional(),
        min: z.number().optional(),
        max: z.number().optional()
      })
      .optional(),
    skillsRequired: z.array(z.string().min(1)).optional(),
    descriptionHtml: z.string().optional(),
    source: z
      .object({
        provider: z.string().optional(),
        url: z.string().url().optional()
      })
      .optional()
  })
});

router.post("/jobs/import", requireAuth, validate(importSchema), async (req: AuthRequest, res: Response) => {
  const payload = { ...req.body };
  if (payload.postedAt) payload.postedAt = new Date(payload.postedAt);

  const job = await Job.create(payload);
  res.status(201).json({ jobId: job.id, normalized: true });
});

/**
 * GET /jobs/:id  (job detail)
 */
router.get("/jobs/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid job id" } });
  }
  const job = await Job.findById(id).lean();
  if (!job) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Job not found" } });
  res.json(job);
});

/**
 * POST /jobs/:id/save  (save a job for current user; idempotent)
 */
router.post("/jobs/:id/save", requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid job id" } });
  }
  // ensure job exists (optional but nice)
  const jobExists = await Job.exists({ _id: id });
  if (!jobExists) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Job not found" } });

  try {
    await JobSave.updateOne(
      { userId: req.user!.id, jobId: id },
      { $setOnInsert: { userId: req.user!.id, jobId: id } },
      { upsert: true }
    );
    return res.status(201).json({ savedAt: new Date().toISOString() });
  } catch (e: any) {
    // Unique index will protect; any other errors bubble
    return res.status(500).json({ error: { code: "INTERNAL", message: "Save failed" } });
  }
});

/**
 * DELETE /jobs/:id/save  (unsave)
 */
router.delete("/jobs/:id/save", requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid job id" } });
  }
  await JobSave.deleteOne({ userId: req.user!.id, jobId: id });
  return res.status(204).send();
});

/**
 * GET /me/saved-jobs  (list saved jobs with details)
 */
const savedSchema = z.object({
  query: z.object({
    limit: z.coerce.number().min(1).max(50).optional()
  })
});

router.get("/me/saved-jobs", requireAuth, validate(savedSchema), async (req: AuthRequest, res: Response) => {
  const limit = Number(req.query.limit) || 20;

  const saves = await JobSave.find({ userId: req.user!.id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("jobId")
    .lean();

  const items = saves
    .filter((s) => s.jobId) // in case a job was deleted
    .map((s: any) => ({
      savedAt: s.createdAt,
      job: {
        id: s.jobId._id,
        title: s.jobId.title,
        company: s.jobId.company,
        location: s.jobId.location,
        remote: s.jobId.remote,
        postedAt: s.jobId.postedAt,
        skillsRequired: s.jobId.skillsRequired
      }
    }));

  res.json({ items });
});

export default router;
