"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../../middlewares/auth");
const validate_1 = require("../../middlewares/validate");
const job_model_1 = require("../jobs/job.model");
const jobAlert_model_1 = require("./jobAlert.model");
const router = (0, express_1.Router)();
const remoteEnum = zod_1.z.enum(["on_site", "remote", "hybrid"]);
const employmentEnum = zod_1.z.enum(["full_time", "part_time", "contract", "internship"]);
const seniorityEnum = zod_1.z.enum(["intern", "junior", "mid", "senior", "lead"]);
const frequencyEnum = zod_1.z.enum(["instant", "daily", "weekly"]);
const statusEnum = zod_1.z.enum(["active", "paused"]);
const filterShape = zod_1.z.object({
    q: zod_1.z.string().trim().optional(),
    location: zod_1.z.string().trim().optional(),
    remote: remoteEnum.optional(),
    employmentType: employmentEnum.optional(),
    seniority: seniorityEnum.optional(),
    skills: zod_1.z.union([zod_1.z.string().min(1), zod_1.z.array(zod_1.z.string().min(1))]).optional()
});
function toArray(val) {
    if (!val)
        return [];
    return Array.isArray(val) ? val : [val];
}
function buildJobQuery(filters) {
    const query = {};
    if (filters.q)
        query.$text = { $search: filters.q };
    if (filters.location)
        query.location = new RegExp(String(filters.location), "i");
    if (filters.remote)
        query.remote = filters.remote;
    if (filters.employmentType)
        query.employmentType = filters.employmentType;
    if (filters.seniority)
        query.seniority = filters.seniority;
    const skillsArr = toArray(filters.skills);
    if (skillsArr.length)
        query.skillsRequired = { $all: skillsArr };
    return query;
}
/**
 * POST /job-alerts
 */
const createSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(120),
        ...filterShape.shape,
        frequency: frequencyEnum.optional(),
        status: statusEnum.optional()
    })
});
router.post("/job-alerts", auth_1.requireAuth, (0, validate_1.validate)(createSchema), async (req, res) => {
    const { name, frequency, status, ...filters } = req.body;
    const skills = toArray(filters.skills);
    const doc = await jobAlert_model_1.JobAlert.create({
        userId: req.user.id,
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
const listSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: statusEnum.optional(),
        limit: zod_1.z.coerce.number().min(1).max(100).optional()
    })
});
router.get("/job-alerts", auth_1.requireAuth, (0, validate_1.validate)(listSchema), async (req, res) => {
    const limit = Number(req.query.limit) || 50;
    const q = { userId: req.user.id };
    if (req.query.status)
        q.status = req.query.status;
    const items = await jobAlert_model_1.JobAlert.find(q).sort({ createdAt: -1 }).limit(limit).lean();
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
router.get("/job-alerts/:id", auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id))
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    const alert = await jobAlert_model_1.JobAlert.findById(id).lean();
    if (!alert || String(alert.userId) !== String(req.user.id))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Alert not found" } });
    res.json(alert);
});
/**
 * PATCH /job-alerts/:id
 */
const patchSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(120).optional(),
        ...filterShape.partial().shape,
        frequency: frequencyEnum.optional(),
        status: statusEnum.optional()
    })
});
router.patch("/job-alerts/:id", auth_1.requireAuth, (0, validate_1.validate)(patchSchema), async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id))
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    const alert = await jobAlert_model_1.JobAlert.findById(id);
    if (!alert || String(alert.userId) !== String(req.user.id))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Alert not found" } });
    if (req.body.name !== undefined)
        alert.name = req.body.name;
    if (req.body.frequency !== undefined)
        alert.frequency = req.body.frequency;
    if (req.body.status !== undefined)
        alert.status = req.body.status;
    // Filters (merge)
    const f = alert.filters || {};
    if (req.body.q !== undefined)
        f.q = req.body.q || undefined;
    if (req.body.location !== undefined)
        f.location = req.body.location || undefined;
    if (req.body.remote !== undefined)
        f.remote = req.body.remote;
    if (req.body.employmentType !== undefined)
        f.employmentType = req.body.employmentType;
    if (req.body.seniority !== undefined)
        f.seniority = req.body.seniority;
    if (req.body.skills !== undefined)
        f.skills = toArray(req.body.skills);
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
router.delete("/job-alerts/:id", auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id))
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    const alert = await jobAlert_model_1.JobAlert.findById(id);
    if (!alert || String(alert.userId) !== String(req.user.id))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Alert not found" } });
    await alert.deleteOne();
    return res.status(204).send();
});
/**
 * POST /job-alerts/preview  -> run filters once without saving
 */
const previewSchema = zod_1.z.object({
    body: zod_1.z.object({
        ...filterShape.shape,
        limit: zod_1.z.coerce.number().min(1).max(50).optional()
    })
});
router.post("/job-alerts/preview", auth_1.requireAuth, (0, validate_1.validate)(previewSchema), async (req, res) => {
    const { limit = 20, ...filters } = req.body;
    const query = buildJobQuery(filters);
    const items = await job_model_1.Job.find(query).sort({ postedAt: -1, _id: -1 }).limit(limit).lean();
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
const runNowSchema = zod_1.z.object({
    body: zod_1.z.object({
        limit: zod_1.z.coerce.number().min(1).max(50).optional()
    })
});
router.post("/job-alerts/:id/run-now", auth_1.requireAuth, (0, validate_1.validate)(runNowSchema), async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id))
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    const alert = await jobAlert_model_1.JobAlert.findById(id);
    if (!alert || String(alert.userId) !== String(req.user.id))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Alert not found" } });
    const limit = Number(req.body.limit) || 20;
    const query = buildJobQuery(alert.filters || {});
    const items = await job_model_1.Job.find(query).sort({ postedAt: -1, _id: -1 }).limit(limit).lean();
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
router.post("/job-alerts/:id/pause", auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id))
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    const alert = await jobAlert_model_1.JobAlert.findById(id);
    if (!alert || String(alert.userId) !== String(req.user.id))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Alert not found" } });
    if (alert.status !== "paused") {
        alert.status = "paused";
        await alert.save();
    }
    res.json({ id: alert.id, status: alert.status });
});
router.post("/job-alerts/:id/resume", auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id))
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    const alert = await jobAlert_model_1.JobAlert.findById(id);
    if (!alert || String(alert.userId) !== String(req.user.id))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Alert not found" } });
    if (alert.status !== "active") {
        alert.status = "active";
        await alert.save();
    }
    res.json({ id: alert.id, status: alert.status });
});
exports.default = router;
