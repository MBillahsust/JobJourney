"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../../middlewares/auth");
const validate_1 = require("../../middlewares/validate");
const user_model_1 = require("../auth/user.model");
const router = (0, express_1.Router)();
const seniorityEnum = zod_1.z.enum(["intern", "junior", "mid", "senior", "lead"]);
router.get("/me", auth_1.requireAuth, async (req, res) => {
    const user = await user_model_1.User.findById(req.user.id).lean();
    if (!user)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
    res.json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt
    });
});
const patchMeSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1).optional(),
        lastName: zod_1.z.string().min(1).optional()
    })
});
router.patch("/me", auth_1.requireAuth, (0, validate_1.validate)(patchMeSchema), async (req, res) => {
    const updated = await user_model_1.User.findByIdAndUpdate(req.user.id, { $set: req.body }, { new: true }).lean();
    if (!updated)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
    res.json({
        id: updated._id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email
    });
});
router.get("/me/profile", auth_1.requireAuth, async (req, res) => {
    const user = await user_model_1.User.findById(req.user.id).lean();
    if (!user)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
    res.json(user.profile || {});
});
const patchProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        phone: zod_1.z.string().trim().optional(),
        location: zod_1.z.string().trim().optional(),
        targets: zod_1.z
            .object({
            roles: zod_1.z.array(zod_1.z.string().min(1)).optional(),
            seniority: seniorityEnum.optional()
        })
            .optional(),
        preferredLocations: zod_1.z.array(zod_1.z.string().min(1)).optional()
    })
});
router.patch("/me/profile", auth_1.requireAuth, (0, validate_1.validate)(patchProfileSchema), async (req, res) => {
    const user = await user_model_1.User.findById(req.user.id).lean();
    if (!user)
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
    const nextProfile = {
        ...(user.profile || {}),
        ...(req.body || {}),
        targets: {
            ...((user.profile && user.profile.targets) || {}),
            ...(req.body?.targets || {})
        }
    };
    const updated = await user_model_1.User.findByIdAndUpdate(req.user.id, { $set: { profile: nextProfile } }, { new: true }).lean();
    res.json(updated.profile || {});
});
exports.default = router;
