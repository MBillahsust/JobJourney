import crypto from "crypto";
import { google } from "googleapis";
import dotenv from "dotenv";
import { Request } from "express";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:4000/v1/calendar/oauth/callback";
const JWT_SECRET = (process.env.JWT_SECRET || "dev-secret").slice(0, 64);

export function getOAuthClient() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET env vars");
  }
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

export function calendarScopes() {
  return [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar",
    "openid", "email", "profile",
  ];
}

/* --------------------- Stateless signed state --------------------- */
function hmac(data: string) {
  return crypto.createHmac("sha256", JWT_SECRET).update(data).digest("hex");
}

export function signState(userId: string) {
  const payload = JSON.stringify({ uid: userId, ts: Date.now() });
  const b64 = Buffer.from(payload).toString("base64url");
  const sig = hmac(b64);
  return b64 + "." + sig;
}

export function verifyState(state: string) {
  const [b64, sig] = String(state || "").split(".");
  if (!b64 || !sig) return null;
  if (hmac(b64) !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
    if (payload && payload.uid) return payload as { uid: string; ts: number };
  } catch {}
  return null;
}

export function getBearerToken(req: Request) {
  const auth = String(req.headers.authorization || "");
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}
