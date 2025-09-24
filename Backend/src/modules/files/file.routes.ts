import { Router, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../../middlewares/auth";
import { FileModel, FileKind } from "./file.model";

/**
 * Config
 */
const BASE_DIR = path.resolve(process.env.LOCAL_UPLOAD_DIR || "./uploads");
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

function sanitizeBase(name: string) {
  // remove path separators and weird chars; keep letters, numbers, dot, dash, underscore
  const base = path.basename(name);
  return base.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Multer storage configured per-user and per-kind
 */
const storage = multer.diskStorage({
  destination: (req: AuthRequest, _file, cb) => {
    try {
      const kind = ((req.body?.kind as FileKind) || "attachment") as FileKind;
      const userDir = path.join(BASE_DIR, String(req.user!.id), kind);
      ensureDir(userDir);
      cb(null, userDir);
    } catch (e) {
      cb(e as any, "");
    }
  },
  filename: (_req: AuthRequest, file, cb) => {
    const rand = crypto.randomBytes(8).toString("hex");
    const safeBase = sanitizeBase(file.originalname || "upload");
    const name = `${Date.now()}_${rand}_${safeBase}`;
    cb(null, name);
  }
});

function fileFilter(_req: AuthRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWLIST.includes(file.mimetype)) {
    return cb(
      new Error(
        `Unsupported file type. Allowed: ${ALLOWLIST.join(", ")}`
      )
    );
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_BYTES }
});

const router = Router();

/**
 * POST /files/upload
 * multipart/form-data with fields:
 * - kind: "resume" | "attachment" | "avatar" (optional, default "attachment")
 * - file: binary file
 */
const kindSchema = z.object({
  body: z.object({
    kind: z.enum(["resume", "attachment", "avatar"]).optional()
  })
});

router.post(
  "/files/upload",
  requireAuth,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    // quick body validation before multer (kind must be valid if provided)
    const parsed = kindSchema.safeParse({ body: req.body });
    if (!parsed.success) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Invalid kind", details: parsed.error.errors }
      });
    }
    return next();
  },
  upload.single("file"),
  async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: { code: "BAD_REQUEST", message: "No file uploaded" } });
    }

    const kind = ((req.body?.kind as FileKind) || "attachment") as FileKind;

    const absPath = req.file.path;
    const relPath = path.relative(BASE_DIR, absPath);

    // Create DB record
    const doc = await FileModel.create({
      userId: req.user!.id,
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
    await FileModel.findByIdAndUpdate(doc.id, { $set: { url } });

    return res.status(201).json({
      id: doc.id,
      kind: doc.kind,
      status: "ready",
      mime: doc.mime,
      size: doc.size,
      originalFilename: doc.originalFilename,
      url
    });
  }
);

/**
 * GET /files/:id  -> metadata (owner only)
 */
router.get("/files/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const doc = await FileModel.findById(req.params.id).lean();
  if (!doc || String(doc.userId) !== String(req.user!.id)) {
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
router.get("/files/:id/download", requireAuth, async (req: AuthRequest, res: Response) => {
  const doc = await FileModel.findById(req.params.id).lean();
  if (!doc || String(doc.userId) !== String(req.user!.id) || doc.status !== "ready") {
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
  return res.sendFile(path.resolve(abs), (err) => {
    if (err) {
      return res.status(500).json({ error: { code: "INTERNAL", message: "File read error" } });
    }
  });
});

/**
 * DELETE /files/:id  -> delete from disk, mark deleted (owner only)
 */
router.delete("/files/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const doc = await FileModel.findById(req.params.id);
  if (!doc || String(doc.userId) !== String(req.user!.id)) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "File not found" } });
  }
  if (doc.status === "deleted") return res.status(204).send();

  // Remove from disk (best effort)
  try {
    if (fs.existsSync(doc.local.absPath)) fs.unlinkSync(doc.local.absPath);
  } catch {
    // ignore
  }

  doc.status = "deleted";
  await doc.save();

  return res.status(204).send();
});

export default router;
