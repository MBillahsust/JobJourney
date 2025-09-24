"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../../middlewares/auth");
const job_model_1 = require("../jobs/job.model");
const ats_model_1 = require("./ats.model");
const text_1 = require("../../utils/text");
const router = (0, express_1.Router)();
const scoreReqSchema = zod_1.z.object({
    body: zod_1.z.object({
        jobId: zod_1.z.string().min(8),
        resumeText: zod_1.z.string().min(20) // keep it simple for now
    })
});
function scoreResumeAgainstJob(job, resumeText) {
    const resumeNorm = " " + (0, text_1.normalizeForMatch)(resumeText) + " ";
    // Skills from job schema (trusted)
    const jobSkills = Array.isArray(job.skillsRequired)
        ? job.skillsRequired
        : [];
    const matchedSkills = [];
    const missingSkills = [];
    for (const skill of jobSkills) {
        if ((0, text_1.containsNormalized)(resumeNorm, skill))
            matchedSkills.push(skill);
        else
            missingSkills.push(skill);
    }
    const skillsScore = jobSkills.length
        ? Math.round((matchedSkills.length / jobSkills.length) * 60) // weight 60
        : 0;
    // Keywords from title + description + company + location
    const corpus = [
        job.title || "",
        job.company?.name || "",
        job.location || "",
        (0, text_1.stripHtml)(job.descriptionHtml || "")
    ].join(" ");
    const jobTopKeywords = (0, text_1.topKeywords)(corpus, 30);
    const matchedKeywords = jobTopKeywords.filter(k => (0, text_1.containsNormalized)(resumeNorm, k));
    const missingKeywords = jobTopKeywords.filter(k => !(0, text_1.containsNormalized)(resumeNorm, k));
    const keywordsScore = jobTopKeywords.length
        ? Math.round((matchedKeywords.length / jobTopKeywords.length) * 40) // weight 40
        : 0;
    const score = Math.max(0, Math.min(100, skillsScore + keywordsScore));
    return {
        score,
        breakdown: { skills: skillsScore, keywords: keywordsScore },
        matchedSkills,
        missingSkills,
        matchedKeywords,
        missingKeywords
    };
}
/**
 * POST /ats/score
 * → compute score (no persistence)
 */
router.post("/ats/score", auth_1.requireAuth, async (req, res) => {
    const parsed = scoreReqSchema.safeParse({ body: req.body });
    if (!parsed.success) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request", details: parsed.error.errors } });
    }
    const { jobId, resumeText } = parsed.data.body;
    if (!mongoose_1.default.isValidObjectId(jobId)) {
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid job id" } });
    }
    const job = await job_model_1.Job.findById(jobId).lean();
    if (!job)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Job not found" } });
    const result = scoreResumeAgainstJob(job, resumeText);
    return res.json({
        jobId,
        score: result.score,
        breakdown: result.breakdown,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        matchedKeywords: result.matchedKeywords.slice(0, 15),
        missingKeywords: result.missingKeywords.slice(0, 15),
        recommendations: [
            ...(result.missingSkills.length ? [`Add or demonstrate: ${result.missingSkills.join(", ")}`] : []),
            ...(result.missingKeywords.length ? [`Mention relevant terms like: ${result.missingKeywords.slice(0, 10).join(", ")}`] : [])
        ]
    });
});
/**
 * POST /ats/evaluate
 * → compute and persist
 */
router.post("/ats/evaluate", auth_1.requireAuth, async (req, res) => {
    const parsed = scoreReqSchema.safeParse({ body: req.body });
    if (!parsed.success) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request", details: parsed.error.errors } });
    }
    const { jobId, resumeText } = parsed.data.body;
    if (!mongoose_1.default.isValidObjectId(jobId)) {
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid job id" } });
    }
    const job = await job_model_1.Job.findById(jobId).lean();
    if (!job)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Job not found" } });
    const result = scoreResumeAgainstJob(job, resumeText);
    // Store trimmed snapshot (limit to ~32KB)
    const snap = resumeText.length > 32000 ? resumeText.slice(0, 32000) : resumeText;
    const doc = await ats_model_1.ATSEvaluation.create({
        userId: req.user.id,
        jobId,
        resumeText: snap,
        score: result.score,
        breakdown: result.breakdown,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        matchedKeywords: result.matchedKeywords.slice(0, 100),
        missingKeywords: result.missingKeywords.slice(0, 100)
    });
    return res.status(201).json({
        atsScoreId: doc.id,
        jobId,
        score: result.score,
        breakdown: result.breakdown,
        missingSkills: result.missingSkills.slice(0, 15)
    });
});
/**
 * GET /ats/scores?jobId=&limit=
 */
const listSchema = zod_1.z.object({
    query: zod_1.z.object({
        jobId: zod_1.z.string().optional(),
        limit: zod_1.z.coerce.number().min(1).max(50).optional()
    })
});
router.get("/ats/scores", auth_1.requireAuth, async (req, res) => {
    const parsed = listSchema.safeParse({ query: req.query });
    if (!parsed.success) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid query", details: parsed.error.errors } });
    }
    const { jobId } = parsed.data.query;
    const limit = Number(parsed.data.query.limit) || 20;
    const q = { userId: req.user.id };
    if (jobId) {
        if (!mongoose_1.default.isValidObjectId(jobId)) {
            return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid job id" } });
        }
        q.jobId = jobId;
    }
    const items = await ats_model_1.ATSEvaluation.find(q).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ items });
});
/**
 * GET /ats/scores/:id
 */
router.get("/ats/scores/:id", auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    }
    const doc = await ats_model_1.ATSEvaluation.findById(id).lean();
    if (!doc || String(doc.userId) !== String(req.user.id)) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Evaluation not found" } });
    }
    res.json(doc);
});
/**
 * DELETE /ats/scores/:id
 */
router.delete("/ats/scores/:id", auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.isValidObjectId(id)) {
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid id" } });
    }
    const doc = await ats_model_1.ATSEvaluation.findById(id);
    if (!doc || String(doc.userId) !== String(req.user.id)) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Evaluation not found" } });
    }
    await doc.deleteOne();
    return res.status(204).send();
});
/**
 * POST /ats/compare
 * { jobId, resumes: [{ label, resumeText }] }
 */
const compareSchema = zod_1.z.object({
    body: zod_1.z.object({
        jobId: zod_1.z.string().min(8),
        resumes: zod_1.z.array(zod_1.z.object({
            label: zod_1.z.string().min(1),
            resumeText: zod_1.z.string().min(20)
        })).min(2).max(10)
    })
});
router.post("/ats/compare", auth_1.requireAuth, async (req, res) => {
    const parsed = compareSchema.safeParse({ body: req.body });
    if (!parsed.success) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request", details: parsed.error.errors } });
    }
    const { jobId, resumes } = parsed.data.body;
    if (!mongoose_1.default.isValidObjectId(jobId)) {
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid job id" } });
    }
    const job = await job_model_1.Job.findById(jobId).lean();
    if (!job)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Job not found" } });
    const results = resumes.map(r => {
        const s = scoreResumeAgainstJob(job, r.resumeText);
        return { label: r.label, score: s.score, breakdown: s.breakdown, missingSkills: s.missingSkills.slice(0, 10) };
    });
    results.sort((a, b) => b.score - a.score);
    res.json({ jobId, results });
});
exports.default = router;
