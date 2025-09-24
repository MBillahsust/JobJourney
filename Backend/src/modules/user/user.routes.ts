import { Router, Response } from "express";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { User } from "../auth/user.model";

const router = Router();

const seniorityEnum = z.enum(["intern", "junior", "mid", "senior", "lead"]);

router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id).lean();
  if (!user) return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
  res.json({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt
  });
});

const patchMeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional()
  })
});
router.patch("/me", requireAuth, validate(patchMeSchema), async (req: AuthRequest, res: Response) => {
  const updated = await User.findByIdAndUpdate(req.user!.id, { $set: req.body }, { new: true }).lean();
  if (!updated) return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
  res.json({
    id: updated._id,
    firstName: updated.firstName,
    lastName: updated.lastName,
    email: updated.email
  });
});

router.get("/me/profile", requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id).lean();
  if (!user) return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
  res.json(user.profile || {});
});

const patchProfileSchema = z.object({
  body: z.object({
    phone: z.string().trim().optional(),
    location: z.string().trim().optional(),
    targets: z
      .object({
        roles: z.array(z.string().min(1)).optional(),
        seniority: seniorityEnum.optional()
      })
      .optional(),
    preferredLocations: z.array(z.string().min(1)).optional()
  })
});

router.patch("/me/profile", requireAuth, validate(patchProfileSchema), async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id).lean();
  if (!user) return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });

  const nextProfile = {
    ...(user.profile || {}),
    ...(req.body || {}),
    targets: {
      ...((user.profile && user.profile.targets) || {}),
      ...((req.body?.targets as any) || {})
    }
  };

  const updated = await User.findByIdAndUpdate(
    req.user!.id,
    { $set: { profile: nextProfile } },
    { new: true }
  ).lean();

  res.json(updated!.profile || {});
});

export default router;
