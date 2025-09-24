"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const auth_1 = require("../../middlewares/auth");
const file_model_1 = require("./file.model");
/**
 * Config
 */
const BASE_DIR = path_1.default.resolve(process.env.LOCAL_UPLOAD_DIR || "./uploads");
const MAX_FILE_BYTES = Number(process.env.MAX_FILE_BYTES || 10 * 1024 * 1024); // default 10MB
const DEFAULT_ALLOWED = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg"
];
const ALLOWED_MIMES = (process.env.ALLOWED_MIMES || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const ALLOWLIST = ALLOWED_MIMES.length ? ALLOWED_MIMES : DEFAULT_ALLOWED;
function sanitizeBase(name) {
    // remove path separators and weird chars; keep letters, numbers, dot, dash, underscore
    const base = path_1.default.basename(name);
    return base.replace(/[^a-zA-Z0-9._-]/g, "_");
}
function ensureDir(dir) {
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
}
/**
 * Multer storage configured per-user and per-kind
 */
const storage = multer_1.default.diskStorage({
    destination: (req, _file, cb) => {
        try {
            const kind = (req.body?.kind || "attachment");
            const userDir = path_1.default.join(BASE_DIR, String(req.user.id), kind);
            ensureDir(userDir);
            cb(null, userDir);
        }
        catch (e) {
            cb(e, "");
        }
    },
    filename: (_req, file, cb) => {
        const rand = crypto_1.default.randomBytes(8).toString("hex");
        const safeBase = sanitizeBase(file.originalname || "upload");
        const name = `${Date.now()}_${rand}_${safeBase}`;
        cb(null, name);
    }
});
function fileFilter(_req, file, cb) {
    if (!ALLOWLIST.includes(file.mimetype)) {
        return cb(new Error(`Unsupported file type. Allowed: ${ALLOWLIST.join(", ")}`));
    }
    cb(null, true);
}
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_BYTES }
});
const router = (0, express_1.Router)();
/**
 * POST /files/upload
 * multipart/form-data with fields:
 * - kind: "resume" | "attachment" | "avatar" (optional, default "attachment")
 * - file: binary file
 */
const kindSchema = zod_1.z.object({
    body: zod_1.z.object({
        kind: zod_1.z.enum(["resume", "attachment", "avatar"]).optional()
    })
});
router.post("/files/upload", auth_1.requireAuth, (req, res, next) => {
    // quick body validation before multer (kind must be valid if provided)
    const parsed = kindSchema.safeParse({ body: req.body });
    if (!parsed.success) {
        return res.status(400).json({
            error: { code: "VALIDATION_ERROR", message: "Invalid kind", details: parsed.error.errors }
        });
    }
    return next();
}, upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: { code: "BAD_REQUEST", message: "No file uploaded" } });
    }
    const kind = (req.body?.kind || "attachment");
    const absPath = req.file.path;
    const relPath = path_1.default.relative(BASE_DIR, absPath);
    // Create DB record
    const doc = await file_model_1.FileModel.create({
        userId: req.user.id,
        kind,
        status: "ready",
        originalFilename: req.file.originalname,
        storedFilename: req.file.filename,
        mime: req.file.mimetype,
        size: req.file.size,
        provider: "local",
        local: { absPath, relPath },
        url: "" // filled below
    });
    const url = `/v1/files/${doc.id}/download`;
    await file_model_1.FileModel.findByIdAndUpdate(doc.id, { $set: { url } });
    return res.status(201).json({
        id: doc.id,
        kind: doc.kind,
        status: "ready",
        mime: doc.mime,
        size: doc.size,
        originalFilename: doc.originalFilename,
        url
    });
});
/**
 * GET /files/:id  -> metadata (owner only)
 */
router.get("/files/:id", auth_1.requireAuth, async (req, res) => {
    const doc = await file_model_1.FileModel.findById(req.params.id).lean();
    if (!doc || String(doc.userId) !== String(req.user.id)) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "File not found" } });
    }
    res.json({
        id: doc._id,
        kind: doc.kind,
        status: doc.status,
        mime: doc.mime,
        size: doc.size,
        originalFilename: doc.originalFilename,
        url: doc.url,
        createdAt: doc.createdAt
    });
});
/**
 * GET /files/:id/download  -> streams the file (owner only)
 */
router.get("/files/:id/download", auth_1.requireAuth, async (req, res) => {
    const doc = await file_model_1.FileModel.findById(req.params.id).lean();
    if (!doc || String(doc.userId) !== String(req.user.id) || doc.status !== "ready") {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "File not found" } });
    }
    const abs = doc.local.absPath;
    // Basic headers
    res.setHeader("Content-Type", doc.mime);
    // Inline for images/PDF, attachment for others; simple heuristic
    const inlineTypes = ["application/pdf", "image/png", "image/jpeg"];
    const disp = inlineTypes.includes(doc.mime) ? "inline" : "attachment";
    res.setHeader("Content-Disposition", `${disp}; filename="${sanitizeBase(doc.originalFilename)}"`);
    // Stream file
    return res.sendFile(path_1.default.resolve(abs), (err) => {
        if (err) {
            return res.status(500).json({ error: { code: "INTERNAL", message: "File read error" } });
        }
    });
});
/**
 * DELETE /files/:id  -> delete from disk, mark deleted (owner only)
 */
router.delete("/files/:id", auth_1.requireAuth, async (req, res) => {
    const doc = await file_model_1.FileModel.findById(req.params.id);
    if (!doc || String(doc.userId) !== String(req.user.id)) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "File not found" } });
    }
    if (doc.status === "deleted")
        return res.status(204).send();
    // Remove from disk (best effort)
    try {
        if (fs_1.default.existsSync(doc.local.absPath))
            fs_1.default.unlinkSync(doc.local.absPath);
    }
    catch {
        // ignore
    }
    doc.status = "deleted";
    await doc.save();
    return res.status(204).send();
});
exports.default = router;
