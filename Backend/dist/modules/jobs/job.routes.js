"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const validate_1 = require("../../middlewares/validate");
const auth_1 = require("../../middlewares/auth");
const job_model_1 = require("./job.model");
const jobSave_model_1 = require("./jobSave.model");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
const remoteEnum = zod_1.z.enum(["on_site", "remote", "hybrid"]);
const employmentEnum = zod_1.z.enum(["full_time", "part_time", "contract", "internship"]);
const seniorityEnum = zod_1.z.enum(["intern", "junior", "mid", "senior", "lead"]);
/**
 * GET /jobs/search
 * q (text), location, remote, seniority, employmentType, skills[], limit
 */
const searchSchema = zod_1.z.object({
    query: zod_1.z.object({
        q: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        remote: remoteEnum.optional(),
        seniority: seniorityEnum.optional(),
        employmentType: employmentEnum.optional(),
        skills: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
        limit: zod_1.z.coerce.number().min(1).max(50).optional()
    })
});
router.get("/jobs/search", (0, validate_1.validate)(searchSchema), async (req, res) => {
    const { q, location, remote, seniority, employmentType } = req.query;
    const skills = req.query.skills;
    const limit = Number(req.query.limit) || 20;
    const query = {};
    if (q)
        query.$text = { $search: q };
    if (location)
        query.location = new RegExp(String(location), "i");
    if (remote)
        query.remote = remote;
    if (seniority)
        query.seniority = seniority;
    if (employmentType)
        query.employmentType = employmentType;
    const skillsArr = Array.isArray(skills) ? skills : skills ? [skills] : [];
    if (skillsArr.length)
        query.skillsRequired = { $all: skillsArr };
    const items = await job_model_1.Job.find(query).sort({ postedAt: -1, _id: -1 }).limit(limit).lean();
    res.json({ items, nextCursor: null });
});
/**
 * POST /jobs/import  (raw job payload)
 * Requires auth (for now). Ingests a normalized job.
 */
const importSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(2),
        company: zod_1.z.object({
            name: zod_1.z.string().min(1),
            site: zod_1.z.string().url().optional()
        }),
        location: zod_1.z.string().optional(),
        remote: remoteEnum.optional(),
        employmentType: employmentEnum.optional(),
        seniority: seniorityEnum.optional(),
        postedAt: zod_1.z.string().datetime().optional(),
        salary: zod_1.z
            .object({
            currency: zod_1.z.string().optional(),
            min: zod_1.z.number().optional(),
            max: zod_1.z.number().optional()
        })
            .optional(),
        skillsRequired: zod_1.z.array(zod_1.z.string().min(1)).optional(),
        descriptionHtml: zod_1.z.string().optional(),
        source: zod_1.z
            .object({
            provider: zod_1.z.string().optional(),
            url: zod_1.z.string().url().optional()
        })
            .optional()
    })
});
router.post("/jobs/import", auth_1.requireAuth, (0, validate_1.validate)(importSchema), async (req, res) => {
    const payload = { ...req.body };
    if (payload.postedAt)
        payload.postedAt = new Date(payload.postedAt);
    const job = await job_model_1.Job.create(payload);
    res.status(201).json({ jobId: job.id, normalized: true });
});
/**
 * GET /jobs/:id  (job detail)
 */
router.get("/jobs/:id", async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid job id" } });
    }
    const job = await job_model_1.Job.findById(id).lean();
    if (!job)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Job not found" } });
    res.json(job);
});
/**
 * POST /jobs/:id/save  (save a job for current user; idempotent)
 */
router.post("/jobs/:id/save", auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid job id" } });
    }
    // ensure job exists (optional but nice)
    const jobExists = await job_model_1.Job.exists({ _id: id });
    if (!jobExists)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Job not found" } });
    try {
        await jobSave_model_1.JobSave.updateOne({ userId: req.user.id, jobId: id }, { $setOnInsert: { userId: req.user.id, jobId: id } }, { upsert: true });
        return res.status(201).json({ savedAt: new Date().toISOString() });
    }
    catch (e) {
        // Unique index will protect; any other errors bubble
        return res.status(500).json({ error: { code: "INTERNAL", message: "Save failed" } });
    }
});
/**
 * DELETE /jobs/:id/save  (unsave)
 */
router.delete("/jobs/:id/save", auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid job id" } });
    }
    await jobSave_model_1.JobSave.deleteOne({ userId: req.user.id, jobId: id });
    return res.status(204).send();
});
/**
 * GET /me/saved-jobs  (list saved jobs with details)
 */
const savedSchema = zod_1.z.object({
    query: zod_1.z.object({
        limit: zod_1.z.coerce.number().min(1).max(50).optional()
    })
});
router.get("/me/saved-jobs", auth_1.requireAuth, (0, validate_1.validate)(savedSchema), async (req, res) => {
    const limit = Number(req.query.limit) || 20;
    const saves = await jobSave_model_1.JobSave.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("jobId")
        .lean();
    const items = saves
        .filter((s) => s.jobId) // in case a job was deleted
        .map((s) => ({
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
exports.default = router;
