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
const application_model_1 = require("./application.model");
const job_model_1 = require("../jobs/job.model");
const router = (0, express_1.Router)();
const statusEnum = zod_1.z.enum([
    "wishlist",
    "applied",
    "phone_screen",
    "interview",
    "offer",
    "rejected",
    "withdrawn",
    "accepted"
]);
/**
 * POST /applications
 * body: { jobId, status?, appliedAt?, appliedVia?, resumeFileId?, coverLetterText? }
 */
const createSchema = zod_1.z.object({
    body: zod_1.z.object({
        jobId: zod_1.z.string().min(8),
        status: statusEnum.optional(),
        appliedAt: zod_1.z.string().datetime().optional(),
        appliedVia: zod_1.z.string().max(120).optional(),
        resumeFileId: zod_1.z.string().min(8).optional(),
        coverLetterText: zod_1.z.string().max(20000).optional()
    })
});
router.post("/applications", auth_1.requireAuth, (0, validate_1.validate)(createSchema), async (req, res) => {
    const { jobId, status, appliedAt, appliedVia, resumeFileId, coverLetterText } = req.body;
    if (!mongoose_1.default.isValidObjectId(jobId)) {
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid job id" } });
    }
    // Fetch job for snapshot
    const job = await job_model_1.Job.findById(jobId).lean();
    if (!job)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Job not found" } });
    const doc = await application_model_1.Application.create({
        userId: req.user.id,
        jobId,
        jobSnapshot: {
            title: job.title,
            company: { name: job.company?.name },
            location: job.location
        },
        status: status || "applied",
        appliedAt: appliedAt ? new Date(appliedAt) : new Date(),
        appliedVia,
        resumeFileId: resumeFileId && mongoose_1.default.isValidObjectId(resumeFileId) ? resumeFileId : undefined,
        coverLetterText,
        timeline: [
            { type: "created", at: new Date(), text: "Application created" },
            { type: "status", at: new Date(), fromStatus: "wishlist", toStatus: status || "applied" }
        ]
    });
    return res.status(201).json({ id: doc.id });
});
/**
 * GET /applications?status=&limit=
 */
const listSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.union([statusEnum, zod_1.z.array(statusEnum)]).optional(),
        limit: zod_1.z.coerce.number().min(1).max(50).optional()
    })
});
router.get("/applications", auth_1.requireAuth, (0, validate_1.validate)(listSchema), async (req, res) => {
    const { status } = req.query;
    const limit = Number(req.query.limit) || 20;
    const q = { userId: req.user.id };
    if (status) {
        const statuses = Array.isArray(status) ? status : [status];
        q.status = { $in: statuses };
    }
    const items = await application_model_1.Application.find(q)
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean();
    res.json({
        items: items.map((a) => ({
            id: a._id,
            job: a.jobSnapshot || null,
            status: a.status,
            appliedAt: a.appliedAt,
            updatedAt: a.updatedAt,
            tasksOpen: (a.tasks || []).filter((t) => !t.done).length
        }))
    });
});
/**
 * GET /applications/:id
 */
router.get("/applications/:id", auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    }
    const app = await application_model_1.Application.findById(id).lean();
    if (!app || String(app.userId) !== String(req.user.id)) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Application not found" } });
    }
    res.json(app);
});
/**
 * PATCH /applications/:id
 * body: { status?, appliedAt?, appliedVia?, resumeFileId?, coverLetterText? }
 * Adds timeline entry when status changes
 */
const patchSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: statusEnum.optional(),
        appliedAt: zod_1.z.string().datetime().optional(),
        appliedVia: zod_1.z.string().max(120).optional(),
        resumeFileId: zod_1.z.string().min(8).optional(),
        coverLetterText: zod_1.z.string().max(20000).optional()
    })
});
router.patch("/applications/:id", auth_1.requireAuth, (0, validate_1.validate)(patchSchema), async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    }
    const appDoc = await application_model_1.Application.findById(id);
    if (!appDoc || String(appDoc.userId) !== String(req.user.id)) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Application not found" } });
    }
    const prevStatus = appDoc.status;
    const updates = {};
    if (req.body.status)
        updates.status = req.body.status;
    if (req.body.appliedAt)
        updates.appliedAt = new Date(req.body.appliedAt);
    if (req.body.appliedVia !== undefined)
        updates.appliedVia = req.body.appliedVia;
    if (req.body.resumeFileId && mongoose_1.default.isValidObjectId(req.body.resumeFileId))
        updates.resumeFileId = req.body.resumeFileId;
    if (req.body.coverLetterText !== undefined)
        updates.coverLetterText = req.body.coverLetterText;
    // Apply updates
    Object.assign(appDoc, updates);
    // Timeline on status change
    if (req.body.status && req.body.status !== prevStatus) {
        appDoc.timeline.push({
            type: "status",
            at: new Date(),
            fromStatus: prevStatus,
            toStatus: req.body.status,
            _id: new mongoose_1.default.Types.ObjectId()
        });
    }
    await appDoc.save();
    res.json({
        id: appDoc.id,
        status: appDoc.status,
        appliedAt: appDoc.appliedAt,
        updatedAt: appDoc.updatedAt
    });
});
/**
 * POST /applications/:id/notes { text }
 */
const noteCreateSchema = zod_1.z.object({ body: zod_1.z.object({ text: zod_1.z.string().min(1).max(5000) }) });
router.post("/applications/:id/notes", auth_1.requireAuth, (0, validate_1.validate)(noteCreateSchema), async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id))
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    const appDoc = await application_model_1.Application.findById(id);
    if (!appDoc || String(appDoc.userId) !== String(req.user.id))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Application not found" } });
    const note = { _id: new mongoose_1.default.Types.ObjectId(), text: req.body.text, createdAt: new Date() };
    appDoc.notes.unshift(note);
    appDoc.timeline.push({
        type: "note", at: new Date(), text: req.body.text,
        _id: new mongoose_1.default.Types.ObjectId()
    });
    await appDoc.save();
    res.status(201).json({ noteId: note._id, createdAt: note.createdAt });
});
/**
 * DELETE /applications/:id/notes/:noteId
 */
router.delete("/applications/:id/notes/:noteId", auth_1.requireAuth, async (req, res) => {
    const { id, noteId } = req.params;
    if (!mongoose_1.default.isValidObjectId(id) || !mongoose_1.default.isValidObjectId(noteId))
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    const appDoc = await application_model_1.Application.findById(id);
    if (!appDoc || String(appDoc.userId) !== String(req.user.id))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Application not found" } });
    appDoc.notes = appDoc.notes.filter((n) => String(n._id) !== String(noteId));
    await appDoc.save();
    return res.status(204).send();
});
/**
 * POST /applications/:id/tasks { title, dueAt? }
 */
const taskCreateSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).max(300),
        dueAt: zod_1.z.string().datetime().optional()
    })
});
router.post("/applications/:id/tasks", auth_1.requireAuth, (0, validate_1.validate)(taskCreateSchema), async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id))
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    const appDoc = await application_model_1.Application.findById(id);
    if (!appDoc || String(appDoc.userId) !== String(req.user.id))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Application not found" } });
    const task = {
        _id: new mongoose_1.default.Types.ObjectId(),
        title: req.body.title,
        dueAt: req.body.dueAt ? new Date(req.body.dueAt) : undefined,
        done: false,
        createdAt: new Date()
    };
    appDoc.tasks.unshift(task);
    await appDoc.save();
    res.status(201).json({ taskId: task._id, createdAt: task.createdAt, done: task.done });
});
/**
 * PATCH /applications/:id/tasks/:taskId { title?, dueAt?, done? }
 */
const taskPatchSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).max(300).optional(),
        dueAt: zod_1.z.string().datetime().optional(),
        done: zod_1.z.boolean().optional()
    })
});
router.patch("/applications/:id/tasks/:taskId", auth_1.requireAuth, (0, validate_1.validate)(taskPatchSchema), async (req, res) => {
    const { id, taskId } = req.params;
    if (!mongoose_1.default.isValidObjectId(id) || !mongoose_1.default.isValidObjectId(taskId))
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    const appDoc = await application_model_1.Application.findById(id);
    if (!appDoc || String(appDoc.userId) !== String(req.user.id))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Application not found" } });
    const t = appDoc.tasks.find((x) => String(x._id) === String(taskId));
    if (!t)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Task not found" } });
    if (req.body.title !== undefined)
        t.title = req.body.title;
    if (req.body.dueAt !== undefined)
        t.dueAt = new Date(req.body.dueAt);
    if (req.body.done !== undefined)
        t.done = req.body.done;
    await appDoc.save();
    res.json({ taskId: t._id, title: t.title, dueAt: t.dueAt, done: t.done });
});
/**
 * DELETE /applications/:id/tasks/:taskId
 */
router.delete("/applications/:id/tasks/:taskId", auth_1.requireAuth, async (req, res) => {
    const { id, taskId } = req.params;
    if (!mongoose_1.default.isValidObjectId(id) || !mongoose_1.default.isValidObjectId(taskId))
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    const appDoc = await application_model_1.Application.findById(id);
    if (!appDoc || String(appDoc.userId) !== String(req.user.id))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Application not found" } });
    appDoc.tasks = appDoc.tasks.filter((t) => String(t._id) !== String(taskId));
    await appDoc.save();
    return res.status(204).send();
});
/**
 * POST /applications/:id/contacts { name, email?, phone?, role? }
 */
const contactCreateSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(200),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().max(50).optional(),
        role: zod_1.z.string().max(120).optional()
    })
});
router.post("/applications/:id/contacts", auth_1.requireAuth, (0, validate_1.validate)(contactCreateSchema), async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id))
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    const appDoc = await application_model_1.Application.findById(id);
    if (!appDoc || String(appDoc.userId) !== String(req.user.id))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Application not found" } });
    const c = {
        _id: new mongoose_1.default.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        role: req.body.role
    };
    appDoc.contacts.unshift(c);
    await appDoc.save();
    res.status(201).json({ contactId: c._id });
});
/**
 * PATCH /applications/:id/contacts/:contactId { name?, email?, phone?, role? }
 */
const contactPatchSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(200).optional(),
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z.string().max(50).optional(),
        role: zod_1.z.string().max(120).optional()
    })
});
router.patch("/applications/:id/contacts/:contactId", auth_1.requireAuth, (0, validate_1.validate)(contactPatchSchema), async (req, res) => {
    const { id, contactId } = req.params;
    if (!mongoose_1.default.isValidObjectId(id) || !mongoose_1.default.isValidObjectId(contactId))
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    const appDoc = await application_model_1.Application.findById(id);
    if (!appDoc || String(appDoc.userId) !== String(req.user.id))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Application not found" } });
    const c = appDoc.contacts.find((x) => String(x._id) === String(contactId));
    if (!c)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Contact not found" } });
    if (req.body.name !== undefined)
        c.name = req.body.name;
    if (req.body.email !== undefined)
        c.email = req.body.email;
    if (req.body.phone !== undefined)
        c.phone = req.body.phone;
    if (req.body.role !== undefined)
        c.role = req.body.role;
    await appDoc.save();
    res.json({ contactId: c._id });
});
/**
 * DELETE /applications/:id/contacts/:contactId
 */
router.delete("/applications/:id/contacts/:contactId", auth_1.requireAuth, async (req, res) => {
    const { id, contactId } = req.params;
    if (!mongoose_1.default.isValidObjectId(id) || !mongoose_1.default.isValidObjectId(contactId))
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    const appDoc = await application_model_1.Application.findById(id);
    if (!appDoc || String(appDoc.userId) !== String(req.user.id))
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Application not found" } });
    appDoc.contacts = appDoc.contacts.filter((c) => String(c._id) !== String(contactId));
    await appDoc.save();
    return res.status(204).send();
});
exports.default = router;
