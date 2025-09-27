import { Router } from "express";
import { requireAuth, AuthRequest } from "../../middlewares/auth";
import { getOAuthClient, calendarScopes, signState, verifyState } from "../../libs/googleAuth";
import { User } from "../auth/user.model";
import { LearningPlan } from "../learning/learningPlan.model";
import { parseDailyPlanJSON } from "../../libs/planParser";
import { google } from "googleapis";

const router = Router();

/* OAuth URL */
router.get("/calendar/oauth/url", requireAuth, async (req: AuthRequest, res) => {
  const oAuth2Client = getOAuthClient();
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: calendarScopes(),
    state: signState(String(req.user!.id)),
  });
  res.json({ url });
});

/* OAuth callback */
router.get("/calendar/oauth/callback", async (req, res) => {
  try {
    const code = String(req.query.code || "");
    const state = String(req.query.state || "");
    const verified = verifyState(state);
    if (!code || !verified) return res.status(400).send("Invalid OAuth state/code");

    const oAuth2Client = getOAuthClient();
    const { tokens } = await oAuth2Client.getToken(code);

    const user = await User.findById(verified.uid);
    if (!user) return res.status(404).send("User not found");

    const g = (user.google ??= {} as any);
    if (tokens.access_token) g.accessToken = tokens.access_token;
    if (tokens.refresh_token) g.refreshToken = tokens.refresh_token!;
    if (tokens.expiry_date) g.expiryDate = tokens.expiry_date!;
    oAuth2Client.setCredentials(tokens);

    // Fetch primary profile to store email
    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    try {
      const me = await oauth2.userinfo.get();
      if (me.data.email) g.email = me.data.email;
    } catch {}

    await user.save();

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!doctype html><html><body style="font-family:system-ui;padding:24px">
      <h2>Google Calendar connected ✅</h2>
      <p>You can close this tab and return to JobJourney.</p>
      <script>try{window.opener && window.opener.postMessage({type:"jj:google-connected"}, "*");}catch(e){};</script>
    </body></html>`);
  } catch (err: any) {
    console.error("OAuth callback error", err?.response?.data || err);
    res.status(500).send("OAuth error");
  }
});

/* Connection status */
router.get("/calendar/status", requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id);
  const connected = !!(user?.google?.refreshToken || user?.google?.accessToken);
  res.json({ connected, email: user?.google?.email });
});

/* Optional hard reset: Disconnect */
router.post("/calendar/disconnect", requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id);
  if (!user || !user.google) return res.json({ ok: true });

  try {
    const oAuth2Client = getOAuthClient();
    if (user.google.accessToken) {
      await oAuth2Client.revokeToken(user.google.accessToken).catch(() => {});
    }
    if (user.google.refreshToken) {
      await oAuth2Client.revokeToken(user.google.refreshToken).catch(() => {});
    }
  } catch {}
  user.google = {} as any;
  await user.save();
  res.json({ ok: true });
});

/** Helper: get an OAuth client for this user and keep tokens fresh in DB */
async function getAuthedCalendarForUser(userId: string) {
  const user = await User.findById(userId);
  if (!user || !user.google || !(user.google.refreshToken || user.google.accessToken)) {
    throw Object.assign(new Error("Connect Google Calendar first."), { status: 400, code: "NOT_CONNECTED" });
  }

  const oAuth2Client = getOAuthClient();
  oAuth2Client.setCredentials({
    access_token: user.google.accessToken || undefined,
    refresh_token: user.google.refreshToken || undefined,
    expiry_date: user.google.expiryDate || undefined,
  });

  // Persist refreshed tokens automatically
  oAuth2Client.on("tokens", async (tokens) => {
    try {
      const u = await User.findById(userId);
      if (!u) return;
      const g = (u.google ??= {} as any);
      if (tokens.access_token) g.accessToken = tokens.access_token;
      if (tokens.refresh_token) g.refreshToken = tokens.refresh_token;
      if (tokens.expiry_date) g.expiryDate = tokens.expiry_date;
      await u.save();
    } catch {}
  });

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
  return { calendar, oAuth2Client };
}

/* Push plan to Google Calendar */
router.post("/calendar/push", requireAuth, async (req: AuthRequest, res) => {
  const body = req.body || {};
  const planId = String(body.planId || "");
  const timezone = String(body.timezone || "Asia/Dhaka");
  const eventDurationMinutes = Math.max(15, Math.min(240, Number(body.eventDurationMinutes || 60)));
  const startDateStr = String(body.startDate || new Date().toISOString().slice(0, 10));
  const startHours: number[] =
    Array.isArray(body.startHours) && body.startHours.length === 3
      ? body.startHours.map((n: any) => Number(n))
      : [10, 13, 16];

  let daysArr: any[] = [];
  try {
    if (planId) {
      const doc = await LearningPlan.findOne({ _id: planId, userId: req.user!.id });
      if (!doc) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Plan not found." } });
      daysArr = parseDailyPlanJSON(doc.dailyPlan);
    } else if (body.plan) {
      daysArr = parseDailyPlanJSON(body.plan);
    } else if (body.planText) {
      daysArr = parseDailyPlanJSON(body.planText);
    } else {
      return res.status(400).json({ error: { code: "INVALID", message: "Provide planId or plan/planText." } });
    }
  } catch (e: any) {
    return res.status(400).json({ error: { code: "INVALID_PLAN", message: e?.message || "Bad plan format" } });
  }

  let calendar, oAuth2Client;
  try {
    ({ calendar, oAuth2Client } = await getAuthedCalendarForUser(req.user!.id));
  } catch (e: any) {
    const status = e?.status || 400;
    return res.status(status).json({ error: { code: e?.code || "NOT_CONNECTED", message: e?.message || "Not connected" } });
  }

  const created: any[] = [];
  const startDate = new Date(startDateStr + "T00:00:00");

  try {
    for (const d of daysArr) {
      const dayIndex = d.day ? Number(d.day) - 1 : created.length / 3; // 3 tasks per day
      const baseDate = new Date(startDate);
      baseDate.setDate(startDate.getDate() + Number(dayIndex || 0));

      const tasks = Array.isArray(d.tasks) ? d.tasks.slice(0, 3) : [];
      for (let i = 0; i < tasks.length; i++) {
        const t = tasks[i];
        const start = new Date(baseDate);
        start.setHours(startHours[i] || (9 + i * 2), 0, 0, 0);
        const end = new Date(start.getTime() + eventDurationMinutes * 60000);

        const summary = t.title || `Day ${d.day || Number(dayIndex) + 1} • Task #${i + 1}`;
        const description = [
          t.type ? `Type: ${t.type}` : "",
          t.gap ? `Gap: ${t.gap}` : "",
          t.resources ? `Resources: ${t.resources}` : "",
          `Auto-created by JobJourney`,
        ]
          .filter(Boolean)
          .join("\n");

        const event = {
          summary,
          description,
          start: { dateTime: start.toISOString(), timeZone: timezone },
          end: { dateTime: end.toISOString(), timeZone: timezone },
        } as any;

        const resp = await calendar.events.insert({
          calendarId: "primary",
          requestBody: event,
        });
        created.push({
          id: resp.data.id,
          htmlLink: resp.data.htmlLink,
          summary: resp.data.summary,
          start: resp.data.start,
        });
      }
    }

    return res.status(201).json({ createdCount: created.length, events: created });
  } catch (err: any) {
    const code = Number(err?.code || err?.response?.status || 500);
    const msg =
      err?.message ||
      err?.response?.data?.error?.message ||
      (Array.isArray(err?.errors) && err.errors[0]?.message) ||
      "Google Calendar error";

    const insufficient =
      code === 403 &&
      /insufficient|permission/i.test(msg); // "Request had insufficient authentication scopes." / "Insufficient Permission"

    const invalidGrant = code === 401 || /invalid_grant|unauthorized/i.test(msg);

    if (insufficient || invalidGrant) {
      // Build a fresh consent URL so the client can auto-open and reconsent
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        include_granted_scopes: true,
        scope: calendarScopes(),
        state: signState(String(req.user!.id)),
      });
      return res.status(403).json({
        error: {
          code: "NEEDS_SCOPES",
          message: "Google Calendar needs re-consent to add events.",
          authUrl,
        },
      });
    }

    console.error("Calendar push error:", err?.response?.data || err);
    return res.status(code || 500).json({ error: { code: "GOOGLE_ERROR", message: msg } });
  }
});

export default router;
