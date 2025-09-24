import { Router, Response } from "express";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { User } from "../auth/user.model";

const router = Router();

const seniorityEnum = z.enum(["intern", "junior", "mid", "senior", "lead"]);

/**
 * GET /v1/me
 * Basic public account info for the authenticated user.
 */
router.get("/me", requireAuth, async (req: any, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) {
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "User not found" } });
  }
  res.json({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,
  });
});

/**
 * PATCH /v1/me
 * Update just first/last name.
 */
const patchMeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
  }),
});

router.patch(
  "/me",
  requireAuth,
  validate(patchMeSchema),
  async (req: any, res) => {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true }
    ).lean();

    if (!updated) {
      return res
        .status(404)
        .json({ error: { code: "NOT_FOUND", message: "User not found" } });
    }

    res.json({
      id: updated._id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
    });
  }
);

/**
 * PATCH /v1/me/account
 * Update broader account/profile fields (email is **NOT** editable here).
 */
const patchAccountSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    // email intentionally omitted (non-editable)
    phone: z.string().trim().optional(),
    location: z.string().trim().optional(),
    targetRoles: z.array(z.string().min(1)).optional(),
    seniorityLevel: seniorityEnum.optional(),
    preferredLocations: z.array(z.string().min(1)).optional(),
  }),
});

router.patch(
  "/me/account",
  requireAuth,
  validate(patchAccountSchema),
  async (req: any, res) => {
    const userId = req.user.id;
    const body = req.body;

    // Load current user
    const user = await User.findById(userId).lean();
    if (!user) {
      return res
        .status(404)
        .json({ error: { code: "NOT_FOUND", message: "User not found" } });
    }

    // Merge profile changes
    const nextProfile = {
      ...(user.profile || {}),
      phone:
        body.phone !== undefined ? body.phone : user.profile && user.profile.phone,
      location:
        body.location !== undefined
          ? body.location
          : user.profile && user.profile.location,
      preferredLocations:
        body.preferredLocations !== undefined
          ? body.preferredLocations
          : user.profile && user.profile.preferredLocations,
      targets: {
        ...(user.profile && user.profile.targets ? user.profile.targets : {}),
        roles:
          body.targetRoles !== undefined
            ? body.targetRoles
            : user.profile &&
              user.profile.targets &&
              user.profile.targets.roles,
        seniority:
          body.seniorityLevel !== undefined
            ? body.seniorityLevel
            : user.profile &&
              user.profile.targets &&
              user.profile.targets.seniority,
      },
    };

    // Prepare allowed top-level field updates
    const updateFields: any = {};
    if (body.firstName !== undefined) updateFields.firstName = body.firstName;
    if (body.lastName !== undefined) updateFields.lastName = body.lastName;
    // email is intentionally NOT updatable here
    updateFields.profile = nextProfile;

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updated) {
      return res
        .status(404)
        .json({ error: { code: "NOT_FOUND", message: "User not found" } });
    }

    res.json({
      id: updated._id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      profile: updated.profile || {},
    });
  }
);

/**
 * GET /v1/me/profile
 * Return only the profile object.
 */
router.get("/me/profile", requireAuth, async (req: any, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) {
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "User not found" } });
  }
  res.json(user.profile || {});
});

/**
 * PATCH /v1/me/profile
 * Update only the profile object (no first/last/email here).
 */
const patchProfileSchema = z.object({
  body: z.object({
    phone: z.string().trim().optional(),
    location: z.string().trim().optional(),
    targets: z
      .object({
        roles: z.array(z.string().min(1)).optional(),
        seniority: seniorityEnum.optional(),
      })
      .optional(),
    preferredLocations: z.array(z.string().min(1)).optional(),
  }),
});

router.patch(
  "/me/profile",
  requireAuth,
  validate(patchProfileSchema),
  async (req: any, res) => {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res
        .status(404)
        .json({ error: { code: "NOT_FOUND", message: "User not found" } });
    }

    const nextProfile = {
      ...(user.profile || {}),
      ...(req.body || {}),
      targets: {
        ...((user.profile && user.profile.targets) || {}),
        ...(req.body?.targets || {}),
      },
    };

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profile: nextProfile } },
      { new: true }
    ).lean();

    res.json(updated?.profile || {});
  }
);

export default router;