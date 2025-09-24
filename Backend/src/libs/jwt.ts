import jwt from "jsonwebtoken";

/**
 * Access token: short-lived, bearer auth
 */
export function signAccessToken(sub: string) {
  return jwt.sign({}, process.env.JWT_SECRET!, { subject: sub, expiresIn: "1h" });
}

/**
 * Refresh token: longer-lived, includes tokenVersion (tv) to allow revocation
 */
export function signRefreshToken(sub: string, tokenVersion: number) {
  return jwt.sign({ tv: tokenVersion }, process.env.JWT_SECRET!, {
    subject: sub,
    expiresIn: "7d"
  });
}

/**
 * Generic verify helper
 */
export function verifyJwt<T = any>(token: string): T {
  return jwt.verify(token, process.env.JWT_SECRET!) as T;
}
