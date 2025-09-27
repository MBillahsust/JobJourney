import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Calendar, Clock, CheckCircle2, Circle, Code, BookOpen, Target, Play, Search, Plus, Bot, Sparkles, Users } from "lucide-react";

// ---------- Types ----------
type PlanStatus =
  | "In Progress"
  | "Active"
  | "On Track"
  | "New"
  | "Started"
  | "Almost Complete"
  | "Completed"
  | "Not Started";

type UIPlan = {
  id: string;
  name: string;
  company: string;
  role: string;
  duration: string;
  progress: number;
  status: PlanStatus;
  created: string;
  targetInterview: string;
  skillsCount: number;
  totalHours: number;
};

type DayTask = {
  id: string;
  type: string;
  title: string;
  duration: number;
  completed: boolean;
  gap: string;
  resources?: string;
};

type DayPlan = {
  day: number;
  date?: string;
  completed?: boolean;
  current?: boolean;
  tasks: DayTask[];
};

type GeneratedPlan = {
  durationDays: number;
  days: DayPlan[];
};

type ManualPlanResponse = {
  id: string;
  dailyPlan: string;
  createdAt?: string;
  request?: any;
};

// ---------- Helpers ----------
const API_ROOT = "/v1";

function apiJoin(root: string, path: string) {
  return `${root.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

// Local persistence for task completion per plan
const COMPLETIONS_KEY = "jj:taskCompletions:v1";
function readCompletionStore(): Record<string, string[]> {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(COMPLETIONS_KEY) : null;
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function writeCompletionStore(store: Record<string, string[]>) {
  try {
    if (typeof window !== "undefined") localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(store));
  } catch {}
}
function getCompletedIdsForPlan(planId: string): Set<string> {
  const store = readCompletionStore();
  const arr = Array.isArray(store[planId]) ? store[planId] : [];
  return new Set(arr);
}
function applyCompletionsToPlan(planId: string, plan: GeneratedPlan): GeneratedPlan {
  const completed = getCompletedIdsForPlan(planId);
  if (completed.size === 0) return plan;
  return {
    ...plan,
    days: plan.days.map((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (completed.has(t.id) ? { ...t, completed: true } : t)),
    })),
  };
}

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  // Use RegExp constructor to avoid TSX parser quirks with regex literals
  const escaped = name.replace(new RegExp("([.$?*|{}()\\[\\]\\\\/+^])", "g"), "\\$1");
  const pattern = new RegExp("(?:^|; )" + escaped + "=([^;]*)");
  const match = document.cookie.match(pattern);
  return match ? decodeURIComponent(match[1]) : null;
}

function getToken(): string | null {
  const fromLS =
    (typeof window !== "undefined" &&
      (localStorage.getItem("token") || localStorage.getItem("accessToken"))) ||
    "";
  const fromCookie = readCookie("idToken") || "";
  const v = (fromLS || fromCookie).trim();
  return v ? v : null;
}

function parseDailyPlanToGeneratedPlan(dailyPlanText?: string): GeneratedPlan {
  let arr: any[] = [];
  try {
    arr = JSON.parse(dailyPlanText || "[]");
  } catch {
    return { durationDays: 0, days: [] };
  }

  const days: DayPlan[] = arr.map((d: any, i: number) => ({
    day: Number(d.day ?? i + 1),
    completed: false,
    current: i === 0,
    tasks: (d.tasks || [])
      .slice(0, 3)
      .map(
        (t: any, j: number): DayTask => ({
          id: String(t.id ?? `d${i + 1}-t${j + 1}`),
          type: String(t.type ?? "Task"),
          title: String(t.title ?? t.name ?? `Task ${j + 1}`),
          duration: Number(t.duration ?? 0),
          completed: false,
          gap: String(t.gap ?? "General"),
          resources: t.resources ? String(t.resources) : undefined,
        })
      ),
  }));
  return { durationDays: days.length, days };
}

// ---------- Component ----------
function PrepPlan() {
  const [prepPlans, setPrepPlans] = useState<UIPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [generatedPlans, setGeneratedPlans] = useState<Record<string, GeneratedPlan>>({});
  const [dayIndexByPlan, setDayIndexByPlan] = useState<Record<string, number>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [aiAgentOpen, setAiAgentOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeUnit, setTimeUnit] = useState<"min" | "h">("min");

  const [newPlanForm, setNewPlanForm] = useState({
    job_title: "",
    company_name: "",
    plan_duration: "",
    experience_level: "",
    focus_areas: "",
    skill_gaps: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // --- Google Calendar integration state ---
  const [calendarStatus, setCalendarStatus] = useState<{ connected: boolean; email?: string } | null>(null);
  const [calendarStartDate, setCalendarStartDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [pushingToCalendar, setPushingToCalendar] = useState(false);
  const [calendarDateByPlan, setCalendarDateByPlan] = useState<Record<string, string>>({});
  const [pushingPlanId, setPushingPlanId] = useState<string | null>(null);

  async function fetchCalendarStatus() {
    try {
      const token = getToken();
      const url = apiJoin(API_ROOT, "/calendar/status");
      const resp = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (resp.ok) {
        const data = await resp.json();
        setCalendarStatus(data);
      } else {
        setCalendarStatus({ connected: false });
      }
    } catch {
      setCalendarStatus({ connected: false });
    }
  }

  async function connectGoogleCalendar() {
    try {
      const token = getToken();
      const url = apiJoin(API_ROOT, "/calendar/oauth/url");
      const resp = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Failed to init Google OAuth");
      }
      const data = await resp.json();
      const w = window.open(data.url, "_blank", "width=520,height=640");
      // listen for postMessage from callback
      const onMsg = (e: MessageEvent) => {
        if (e?.data?.type === "jj:google-connected") {
          fetchCalendarStatus();
          window.removeEventListener("message", onMsg as any);
          try {
            w && w.close();
          } catch {}
        }
      };
      window.addEventListener("message", onMsg as any);
    } catch (e: any) {
      alert(e?.message || "Could not open Google OAuth");
    }
  }

  async function pushSelectedPlanToCalendar() {
    if (!selectedPlan) return;
    const plan = generatedPlans[selectedPlan];
    if (!plan) return;
    setPushingToCalendar(true);
    try {
      const token = getToken();
      const url = apiJoin(API_ROOT, "/calendar/push");
      // Prefer planId if created on the backend (ids that are not client-only "plan-...")
      const body: any = {
        startDate: calendarStartDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka",
      };
      if (!selectedPlan.startsWith("plan-")) body.planId = selectedPlan;
      else
        body.plan = plan.days.map((d) => ({
          day: d.day,
          tasks: d.tasks.map((t) => ({
            title: t.title,
            type: t.type,
            duration: t.duration,
            gap: t.gap,
            resources: t.resources,
          })),
        }));

      const resp = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        // Auto re-consent if backend signals missing scopes
        if (resp.status === 403 && data?.error?.code === "NEEDS_SCOPES" && data?.error?.authUrl) {
          const w = window.open(data.error.authUrl, "_blank", "width=520,height=640");
          const onMsg = (e: MessageEvent) => {
            if (e?.data?.type === "jj:google-connected") {
              window.removeEventListener("message", onMsg as any);
              try {
                w && w.close();
              } catch {}
              // Refresh status then retry once
              fetchCalendarStatus();
              pushSelectedPlanToCalendar();
            }
          };
          window.addEventListener("message", onMsg as any);
          return;
        }
        throw new Error(data?.error?.message || "Failed to push to Google Calendar");
      }

      alert(`Created ${data.createdCount} calendar events`);
    } catch (e: any) {
      alert(e?.message || "Calendar sync failed");
    } finally {
      setPushingToCalendar(false);
    }
  }

  async function pushPlanToCalendar(planId: string) {
    const date = calendarDateByPlan[planId];
    if (!date) {
      alert("Please select a date first.");
      return;
    }
    setPushingPlanId(planId);
    try {
      const token = getToken();
      const url = apiJoin(API_ROOT, "/calendar/push");
      const body: any = {
        startDate: date,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka",
      };
      if (!planId.startsWith("plan-")) {
        body.planId = planId;
      } else {
        const plan = generatedPlans[planId];
        if (!plan) {
          alert("Open this plan first to load details, then try again.");
          return;
        }
        body.plan = plan.days.map((d) => ({
          day: d.day,
          tasks: d.tasks.map((t) => ({ title: t.title, type: t.type, duration: t.duration, gap: t.gap, resources: t.resources })),
        }));
      }

      const resp = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        if (resp.status === 403 && data?.error?.code === "NEEDS_SCOPES" && data?.error?.authUrl) {
          const w = window.open(data.error.authUrl, "_blank", "width=520,height=640");
          const onMsg = (e: MessageEvent) => {
            if (e?.data?.type === "jj:google-connected") {
              window.removeEventListener("message", onMsg as any);
              try { w && w.close(); } catch {}
              fetchCalendarStatus();
              pushPlanToCalendar(planId);
            }
          };
          window.addEventListener("message", onMsg as any);
          return;
        }
        throw new Error(data?.error?.message || "Failed to push to Google Calendar");
      }

      alert(`Created ${data.createdCount} calendar events`);
    } catch (e: any) {
      alert(e?.message || "Calendar sync failed");
    } finally {
      setPushingPlanId(null);
    }
  }

  // load plans on mount
  useEffect(() => {
    loadPlans();
  }, []);

  // calendar status on mount
  useEffect(() => {
    fetchCalendarStatus();
  }, []);

  // auto-load details when user selects a plan that we don't have yet
  useEffect(() => {
    if (selectedPlan && !generatedPlans[selectedPlan]) loadPlanDetails(selectedPlan);
  }, [selectedPlan]);

  function getPlanStats(planId: string) {
    const gen = generatedPlans[planId];
    if (!gen)
      return {
        totalMinutes: 0,
        completedMinutes: 0,
        totalHours: 0,
        completedHours: 0,
        tasksCompleted: 0,
        totalTasks: 0,
        completion: 0,
      };
    const allTasks = gen.days.flatMap((d) => d.tasks);
    const totalTasks = allTasks.length;
    const tasksCompleted = allTasks.filter((t) => t.completed).length;
    const totalMinutes = allTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
    const completedMinutes = allTasks.filter((t) => t.completed).reduce((sum, t) => sum + (t.duration || 0), 0);
    const totalHours = totalMinutes / 60;
    const completedHours = completedMinutes / 60;
    const completion = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;
    return {
      totalMinutes,
      completedMinutes,
      totalHours,
      completedHours,
      tasksCompleted,
      totalTasks,
      completion,
    };
  }

  async function loadPlans() {
    const token = getToken();
    if (!token) {
      setPrepPlans([]);
      setLoading(false);
      return;
    }
    try {
      // list
      const listUrl = apiJoin(API_ROOT, "/learning");
      const listResp = await fetch(listUrl, {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!listResp.ok) {
        if (listResp.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
        }
        setPrepPlans([]);
        setLoading(false);
        return;
      }
      const listData = await listResp.json();
      const items: Array<{ id: string; createdAt: string; dailyPlan?: string }> = listData.items || [];

      // 2) For each id, fetch details to derive UI fields
      const plans: UIPlan[] = [];
      const genMap: Record<string, GeneratedPlan> = {};
      for (const it of items) {
        try {
          const detailUrl = apiJoin(API_ROOT, `/learning/${it.id}`);
          const detResp = await fetch(detailUrl, {
            method: "GET",
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!detResp.ok) continue;
          const det = await detResp.json();

          // Build UIPlan from request + dailyPlan
          const req = det.request || {};
          const name = `${req.company_name || "Company"} ${req.job_title || "Plan"} Plan`;
          const company = req.company_name || "-";
          const role = req.job_title || "-";
          const duration =
            req.plan_duration ||
            (() => {
              try {
                const arr = JSON.parse(det.dailyPlan || "[]");
                return `${arr.length || 0} days`;
              } catch {
                return "-";
              }
            })();
          // compute total hours
          let totalMinutes = 0;
          try {
            const arr = JSON.parse(det.dailyPlan || "[]");
            for (const d of arr) for (const t of d.tasks || []) totalMinutes += Number(t.duration || 0);
          } catch {}
          const totalHours = Math.round(totalMinutes / 60);

          plans.push({
            id: det.id,
            name,
            company,
            role,
            duration,
            progress: 0,
            status: "New",
            created: (det.createdAt || new Date().toISOString()).slice(0, 10),
            targetInterview: "",
            skillsCount: 0,
            totalHours,
          });

          // Pre-populate generated data so list progress bars can compute correctly
          try {
            genMap[det.id] = parseDailyPlanToGeneratedPlan(det.dailyPlan);
          } catch {}
        } catch (e) {
          // skip on error
        }
      }

      setPrepPlans(plans);
      if (Object.keys(genMap).length) {
        // Apply persisted completions per plan before setting state
        const withApplied: Record<string, GeneratedPlan> = {};
        for (const [pid, g] of Object.entries(genMap)) withApplied[pid] = applyCompletionsToPlan(pid, g);
        setGeneratedPlans((prev) => ({ ...prev, ...withApplied }));
      }
      if (plans.length && !selectedPlan) setSelectedPlan(plans[0].id);
    } catch (err) {
      console.error("Error loading plans:", err);
      setPrepPlans([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadPlanDetails(planId: string) {
    const token = getToken();
    if (!token || generatedPlans[planId]) return;
    try {
      const url = apiJoin(API_ROOT, `/learning/${planId}`);
      const resp = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) return;
      const data = await resp.json();
      const parsed = parseDailyPlanToGeneratedPlan(data.dailyPlan);
      const applied = applyCompletionsToPlan(planId, parsed);
      setGeneratedPlans((prev) => ({ ...prev, [planId]: applied }));
      setDayIndexByPlan((prev) => ({ ...prev, [planId]: 0 }));
    } catch (e) {
      console.error("Error loading plan details", e);
    }
  }

  function toggleTaskCompletion(planId: string, dayIdx: number, taskId: string) {
    // Update React state
    setGeneratedPlans((prev) => {
      const plan = prev[planId];
      if (!plan) return prev;
      const newDays = plan.days.map((d, i) =>
        i === dayIdx ? { ...d, tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)) } : d
      );
      return { ...prev, [planId]: { ...plan, days: newDays } };
    });

    // Update localStorage store
    const store = readCompletionStore();
    const arr = Array.isArray(store[planId]) ? new Set(store[planId]) : new Set<string>();
    if (arr.has(taskId)) arr.delete(taskId);
    else arr.add(taskId);
    store[planId] = Array.from(arr);
    writeCompletionStore(store);
  }

  async function onGeneratePlan() {
    setFormError(null);
    if (!newPlanForm.job_title.trim()) return setFormError("Please enter a job title.");
    if (!newPlanForm.company_name.trim()) return setFormError("Please enter a company.");
    if (!newPlanForm.plan_duration.trim()) return setFormError('Please enter plan duration like "14 days".');
    if (!newPlanForm.experience_level.trim()) return setFormError("Please enter experience level.");

    const payload = {
      job_title: newPlanForm.job_title.trim(),
      company_name: newPlanForm.company_name.trim(),
      plan_duration: newPlanForm.plan_duration.trim(),
      experience_level: newPlanForm.experience_level.trim(),
      focus_areas: newPlanForm.focus_areas.trim() || undefined,
      skill_gaps: newPlanForm.skill_gaps.trim() || undefined,
    };
    const token = getToken();
    setSubmitting(true);
    try {
      const url = apiJoin(API_ROOT, "/learning/manual");
      const resp = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });
      const maybeErr = !resp.ok ? await resp.json().catch(() => null) : null;
      if (!resp.ok) throw new Error(maybeErr?.error?.message || `Request failed: ${resp.status}`);
      const data = (await resp.json()) as ManualPlanResponse;
      const newId = data.id || `plan-${Date.now()}`;
      const niceName = `${payload.company_name} ${payload.job_title} Plan`;
      const ui: UIPlan = {
        id: newId,
        name: niceName,
        company: payload.company_name,
        role: payload.job_title,
        duration: payload.plan_duration,
        progress: 0,
        status: "New",
        created: new Date().toISOString().slice(0, 10),
        targetInterview: "",
        skillsCount: 0,
        totalHours: 0,
      };
      const parsed = parseDailyPlanToGeneratedPlan(data.dailyPlan);
      setPrepPlans((prev) => [ui, ...prev]);
      setGeneratedPlans((prev) => ({ ...prev, [newId]: parsed }));
      setDayIndexByPlan((prev) => ({ ...prev, [newId]: 0 }));
      setSelectedPlan(newId);
      setAiAgentOpen(false);
      setNewPlanForm({
        job_title: "",
        company_name: "",
        plan_duration: "",
        experience_level: "",
        focus_areas: "",
        skill_gaps: "",
      });
    } catch (e: any) {
      setFormError(e?.message || "Failed to generate plan.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePlan(planId: string) {
    const confirmDelete = window.confirm("Delete this plan? This cannot be undone.");
    if (!confirmDelete) return;
    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      const url = apiJoin(API_ROOT, `/learning/${planId}`);
      const resp = await fetch(url, {
        method: "DELETE",
        credentials: "include",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (resp.status !== 204 && resp.status !== 200 && resp.status !== 404) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Delete failed (${resp.status})`);
      }

      // Remove from UI state (even if 404, ensure the UI no longer shows it)
      setPrepPlans((prev) => prev.filter((p) => p.id !== planId));
      setGeneratedPlans((prev) => {
        const { [planId]: _, ...rest } = prev;
        return rest;
      });
      setDayIndexByPlan((prev) => {
        const { [planId]: _, ...rest } = prev;
        return rest;
      });
      if (selectedPlan === planId) {
        const remaining = prepPlans.filter((p) => p.id !== planId);
        setSelectedPlan(remaining.length ? remaining[0].id : null);
      }

      // Clean persisted completions for this plan
      const store = readCompletionStore();
      if (planId in store) {
        delete store[planId];
        writeCompletionStore(store);
      }
    } catch (e: any) {
      alert(e?.message || "Failed to delete plan");
    }
  }

  const filteredPlans = prepPlans.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedStats = selectedPlan
    ? getPlanStats(selectedPlan)
    : {
        totalMinutes: 0,
        completedMinutes: 0,
        totalHours: 0,
        completedHours: 0,
        tasksCompleted: 0,
        totalTasks: 0,
        completion: 0,
      };
  const currentDayIndex = selectedPlan ? dayIndexByPlan[selectedPlan] ?? 0 : 0;
  const currentGenerated = selectedPlan ? generatedPlans[selectedPlan] : undefined;

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Plans</h1>
          <p className="text-muted-foreground">Personalized learning schedules to close your skill gaps</p>
        </div>

        {/* Add New Plan */}
        <div className="flex gap-2 items-center">
          <Dialog open={aiAgentOpen} onOpenChange={setAiAgentOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[640px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  AI Plan Generator
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">AI Assistant</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    I&apos;ll create a personalized plan. Three tasks per day.
                  </p>
                </div>

                {formError && (
                  <div className="text-sm text-red-600 border border-red-200 rounded-md p-2 bg-red-50">{formError}</div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                      placeholder="e.g., Networking Engineer"
                      value={newPlanForm.job_title}
                      onChange={(e) => setNewPlanForm({ ...newPlanForm, job_title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      placeholder="e.g., Facebook"
                      value={newPlanForm.company_name}
                      onChange={(e) => setNewPlanForm({ ...newPlanForm, company_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plan Duration</Label>
                    <Input
                      placeholder="e.g., 14 days"
                      value={newPlanForm.plan_duration}
                      onChange={(e) => setNewPlanForm({ ...newPlanForm, plan_duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Input
                      placeholder="e.g., Experienced"
                      value={newPlanForm.experience_level}
                      onChange={(e) => setNewPlanForm({ ...newPlanForm, experience_level: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Focus Areas (optional)</Label>
                  <Textarea
                    placeholder="e.g., DSA, System Design"
                    value={newPlanForm.focus_areas}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, focus_areas: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Skill Gaps (optional)</Label>
                  <Textarea
                    placeholder="e.g., Graphs, Caching"
                    value={newPlanForm.skill_gaps}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, skill_gaps: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAiAgentOpen(false)}>
                    Cancel
                  </Button>
                  <Button disabled={submitting} onClick={onGeneratePlan}>
                    {submitting ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Top stats for selected plan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
          </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-semibold">{selectedStats.completion}%</span>
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {selectedStats.tasksCompleted}/{selectedStats.totalTasks}
              </Badge>
            </div>
            <Progress value={selectedStats.completion} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {timeUnit === "min" ? "Minutes" : "Hours"}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant={timeUnit === "min" ? "default" : "outline"} onClick={() => setTimeUnit("min")}>
                  Min
                </Button>
                <Button size="sm" variant={timeUnit === "h" ? "default" : "outline"} onClick={() => setTimeUnit("h")}>
                  H
                </Button>
              </div>
            </div>
            {timeUnit === "min" ? (
              <div className="text-2xl font-semibold">
                {selectedStats.completedMinutes}/{selectedStats.totalMinutes} min
              </div>
            ) : (
              <div className="text-2xl font-semibold">
                {formatHours(selectedStats.completedHours)}/{formatHours(selectedStats.totalHours)} h
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" /> Day
            </div>
            <div className="text-2xl font-semibold">
              {(currentGenerated ? currentDayIndex + 1 : 0)}/{currentGenerated?.durationDays || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: plans list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-12"
              style={{ paddingLeft: "3rem" }}
              placeholder="Search plans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading plans...</div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-sm text-muted-foreground">No plans found</div>
          ) : (
            <div className="space-y-3">
              {filteredPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer ${selectedPlan === plan.id ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate" title={plan.name}>{plan.name}</div>
                        <div className="text-sm text-muted-foreground truncate" title={`${plan.company} • ${plan.role}`}>
                          {plan.company} • {plan.role}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(plan.id);
                          }}
                          title="Delete plan"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={getPlanStats(plan.id).completion} />
                    </div>
                    {/* Per-plan calendar controls */}
                    <div className="mt-3 flex items-center gap-2">
                      <Input
                        type="date"
                        value={calendarDateByPlan[plan.id] || ""}
                        onChange={(e) =>
                          setCalendarDateByPlan((prev) => ({ ...prev, [plan.id]: e.target.value }))
                        }
                        className="w-[140px]"
                        placeholder="Select date"
                        disabled={pushingPlanId === plan.id}
                      />
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          pushPlanToCalendar(plan.id);
                        }}
                        disabled={pushingPlanId === plan.id}
                        className="gap-2"
                        variant="default"
                        title="Add this plan to Google Calendar"
                      >
                        <Calendar className="h-4 w-4" /> Add to Calendar
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Created {plan.created}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right: selected plan details */}
        <div className="lg:col-span-2">
          {!selectedPlan ? (
            <div className="text-sm text-muted-foreground">Select a plan to view details</div>
          ) : !currentGenerated ? (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Loading plan details...</div>
              <Button variant="outline" onClick={() => loadPlanDetails(selectedPlan)}>
                Reload
              </Button>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Day {currentDayIndex + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Day navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setDayIndexByPlan((prev) => ({
                        ...prev,
                        [selectedPlan!]: Math.max(0, currentDayIndex - 1),
                      }))
                    }
                    disabled={currentDayIndex === 0}
                  >
                    Prev
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {currentDayIndex + 1} / {currentGenerated.durationDays}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setDayIndexByPlan((prev) => ({
                        ...prev,
                        [selectedPlan!]: Math.min(currentGenerated.durationDays - 1, currentDayIndex + 1),
                      }))
                    }
                    disabled={currentDayIndex >= currentGenerated.durationDays - 1}
                  >
                    Next
                  </Button>
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  {currentGenerated.days[currentDayIndex]?.tasks.map((task) => (
                    <div key={task.id} className="p-4 border rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-5 w-5 rounded-full flex items-center justify-center ${
                            task.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {task.completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        </span>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Badge variant="secondary" className="gap-1">
                              {taskIcon(task.type)}
                              {task.type}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.duration}m
                            </span>
                            <span className="hidden sm:inline">Gap: {task.gap}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={task.completed ? "secondary" : "default"}
                        onClick={() => toggleTaskCompletion(selectedPlan!, currentDayIndex, task.id)}
                      >
                        {task.completed ? "Undo" : "Mark done"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: PlanStatus) {
  switch (status) {
    case "Completed":
    case "Almost Complete":
      return "bg-green-100 text-green-800";
    case "In Progress":
    case "Active":
    case "On Track":
      return "bg-blue-100 text-blue-800";
    case "New":
    case "Started":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function taskIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("coding")) return <Code className="h-4 w-4" />;
  if (t.includes("system")) return <Target className="h-4 w-4" />;
  if (t.includes("behavior")) return <Users className="h-4 w-4" />;
  if (t.includes("practice")) return <Play className="h-4 w-4" />;
  return <BookOpen className="h-4 w-4" />;
}

function formatHours(h: number): string {
  const safe = Number.isFinite(h) ? h : 0;
  const rounded = Math.round(safe * 100) / 100;
  let s = rounded.toFixed(2);
  s = s.replace(/\.00$/, "");
  s = s.replace(/(\.\d*[1-9])0$/, "$1");
  if (s.startsWith("0.")) s = s.slice(1); // show .75 instead of 0.75
  return s;
}

export default PrepPlan;
