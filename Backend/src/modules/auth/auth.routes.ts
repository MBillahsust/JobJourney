import { Router, Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { validate } from "../../middlewares/validate";
import { User } from "./user.model";
import { signAccessToken, signRefreshToken, verifyJwt } from "../../libs/jwt";
import { requireAuth, AuthRequest } from "../../middlewares/auth";

const router = Router();

/**
 * REQUIRED: firstName, lastName, email, password
 * OPTIONAL: phone, location, targetRoles, seniorityLevel, preferredLocations
 */
const seniorityEnum = z.enum(["intern", "junior", "mid", "senior", "lead"]);

const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().trim().optional(),
    location: z.string().trim().optional(),
    targetRoles: z.array(z.string().min(1)).optional(),
    seniorityLevel: seniorityEnum.optional(),
    preferredLocations: z.array(z.string().min(1)).optional()
  })
});

// POST /auth/register  -> auto-login (returns access + refresh)
router.post("/register", validate(registerSchema), async (req: Request, res: Response) => {
  const {
    firstName, lastName, email, password,
    phone, location, targetRoles, seniorityLevel, preferredLocations
  } = req.body;

  const emailLc = email.toLowerCase().trim();
  const existing = await User.findOne({ email: emailLc });
  if (existing) {
    return res.status(409).json({ error: { code: "CONFLICT", message: "Email already used" } });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
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

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id, user.tokenVersion);

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

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

// POST /auth/login  -> returns access + refresh
router.post("/login", validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const emailLc = email.toLowerCase().trim();

  const user = await User.findOne({ email: emailLc });
  if (!user) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid credentials" } });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid credentials" } });
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id, user.tokenVersion);

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
const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10)
  })
});

router.post("/refresh", validate(refreshSchema), async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    const decoded = verifyJwt<{ sub: string; tv: number }>(refreshToken);
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid refresh" } });
    }
    // tokenVersion check: if mismatched, the refresh token is invalid
    if (user.tokenVersion !== decoded.tv) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Expired refresh" } });
    }

    // Rotate both tokens
    const newAccess = signAccessToken(user.id);
    const newRefresh = signRefreshToken(user.id, user.tokenVersion);

    return res.json({ accessToken: newAccess, refreshToken: newRefresh, expiresIn: 3600 });
  } catch {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid refresh" } });
  }
});

// POST /auth/logout  -> bumps tokenVersion (invalidates all existing refresh tokens)
router.post("/logout", requireAuth, async (req: AuthRequest, res: Response) => {
  await User.findByIdAndUpdate(req.user!.id, { $inc: { tokenVersion: 1 } });
  return res.status(204).send();
});

export default router;