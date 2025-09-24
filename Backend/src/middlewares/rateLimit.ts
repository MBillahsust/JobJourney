import rateLimit from "express-rate-limit";

const windowMinutes = Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 15);
const max = Number(process.env.RATE_LIMIT_MAX || 100);
const authMax = Number(process.env.AUTH_RATE_LIMIT_MAX || 30);

export const globalLimiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false
});

export const authLimiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false
});
