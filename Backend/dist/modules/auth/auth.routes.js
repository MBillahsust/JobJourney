"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validate_1 = require("../../middlewares/validate");
const user_model_1 = require("./user.model");
const jwt_1 = require("../../libs/jwt");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
/**
 * REQUIRED: firstName, lastName, email, password
 * OPTIONAL: phone, location, targetRoles, seniorityLevel, preferredLocations
 */
const seniorityEnum = zod_1.z.enum(["intern", "junior", "mid", "senior", "lead"]);
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        phone: zod_1.z.string().trim().optional(),
        location: zod_1.z.string().trim().optional(),
        targetRoles: zod_1.z.array(zod_1.z.string().min(1)).optional(),
        seniorityLevel: seniorityEnum.optional(),
        preferredLocations: zod_1.z.array(zod_1.z.string().min(1)).optional()
    })
});
// POST /auth/register  -> auto-login (returns access + refresh)
router.post("/register", (0, validate_1.validate)(registerSchema), async (req, res) => {
    const { firstName, lastName, email, password, phone, location, targetRoles, seniorityLevel, preferredLocations } = req.body;
    const emailLc = email.toLowerCase().trim();
    const existing = await user_model_1.User.findOne({ email: emailLc });
    if (existing) {
        return res.status(409).json({ error: { code: "CONFLICT", message: "Email already used" } });
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await user_model_1.User.create({
        firstName,
        lastName,
        email: emailLc,
        passwordHash,
        profile: {
            phone,
            location,
            targets: {
                roles: targetRoles,
                seniority: seniorityLevel
            },
            preferredLocations
        }
    });
    const accessToken = (0, jwt_1.signAccessToken)(user.id);
    const refreshToken = (0, jwt_1.signRefreshToken)(user.id, user.tokenVersion);
    return res.status(201).json({
        accessToken,
        refreshToken,
        expiresIn: 3600,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        },
        profile: user.profile || {}
    });
});
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8)
    })
});
// POST /auth/login  -> returns access + refresh
router.post("/login", (0, validate_1.validate)(loginSchema), async (req, res) => {
    const { email, password } = req.body;
    const emailLc = email.toLowerCase().trim();
    const user = await user_model_1.User.findOne({ email: emailLc });
    if (!user) {
        return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid credentials" } });
    }
    const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid credentials" } });
    }
    const accessToken = (0, jwt_1.signAccessToken)(user.id);
    const refreshToken = (0, jwt_1.signRefreshToken)(user.id, user.tokenVersion);
    return res.json({
        accessToken,
        refreshToken,
        expiresIn: 3600,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        }
    });
});
// POST /auth/refresh  -> accepts refreshToken, returns NEW access + refresh (rotation)
const refreshSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(10)
    })
});
router.post("/refresh", (0, validate_1.validate)(refreshSchema), async (req, res) => {
    const { refreshToken } = req.body;
    try {
        const decoded = (0, jwt_1.verifyJwt)(refreshToken);
        const user = await user_model_1.User.findById(decoded.sub);
        if (!user) {
            return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid refresh" } });
        }
        // tokenVersion check: if mismatched, the refresh token is invalid
        if (user.tokenVersion !== decoded.tv) {
            return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Expired refresh" } });
        }
        // Rotate both tokens
        const newAccess = (0, jwt_1.signAccessToken)(user.id);
        const newRefresh = (0, jwt_1.signRefreshToken)(user.id, user.tokenVersion);
        return res.json({ accessToken: newAccess, refreshToken: newRefresh, expiresIn: 3600 });
    }
    catch {
        return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid refresh" } });
    }
});
// POST /auth/logout  -> bumps tokenVersion (invalidates all existing refresh tokens)
router.post("/logout", auth_1.requireAuth, async (req, res) => {
    await user_model_1.User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
    return res.status(204).send();
});
exports.default = router;
