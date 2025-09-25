import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Calendar, Clock, CheckCircle2, Circle, Code, BookOpen, Target, Play,
  Search, Plus, Bot, Sparkles, Users, Building
} from "lucide-react";

/* ---------- Types ---------- */
type PlanStatus =
  | "In Progress" | "Active" | "On Track" | "New" | "Started"
  | "Almost Complete" | "Completed" | "Not Started";

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
  dailyPlan?: string; // array-root string
  weeklyMilestones?: string | null;
  resources?: string | null;
  progressTracking?: string | null;
  // we also receive "sup" (array) but UI doesn't need it
};

/* ---------- Demo seed plans ---------- */
const INITIAL_PLANS: UIPlan[] = [
  { id: "google-swe-plan", name: "Google Software Engineer Plan", company: "Google", role: "Senior Software Engineer", duration: "14 days", progress: 45, status: "In Progress", created: "2024-10-15", targetInterview: "2024-11-05", skillsCount: 8, totalHours: 32 },
  { id: "meta-backend-plan", name: "Meta Backend Engineer Plan", company: "Meta", role: "Backend Engineer", duration: "12 days", progress: 70, status: "Active", created: "2024-10-10", targetInterview: "2024-10-28", skillsCount: 6, totalHours: 28 },
  { id: "netflix-fullstack-plan", name: "Netflix Full Stack Plan", company: "Netflix", role: "Full Stack Engineer", duration: "16 days", progress: 25, status: "New", created: "2024-10-20", targetInterview: "2024-11-10", skillsCount: 10, totalHours: 40 },
  { id: "stripe-frontend-plan", name: "Stripe Frontend Developer Plan", company: "Stripe", role: "Senior Frontend Developer", duration: "10 days", progress: 90, status: "Almost Complete", created: "2024-10-05", targetInterview: "2024-10-25", skillsCount: 5, totalHours: 24 },
  { id: "amazon-sde-plan", name: "Amazon SDE Plan", company: "Amazon", role: "Software Development Engineer", duration: "18 days", progress: 15, status: "Started", created: "2024-10-22", targetInterview: "2024-11-15", skillsCount: 12, totalHours: 45 },
  { id: "microsoft-cloud-plan", name: "Microsoft Cloud Engineer Plan", company: "Microsoft", role: "Cloud Solutions Engineer", duration: "14 days", progress: 60, status: "On Track", created: "2024-10-12", targetInterview: "2024-11-02", skillsCount: 9, totalHours: 36 },
  { id: "tesla-swe-plan", name: "Tesla Software Engineer Plan", company: "Tesla", role: "Software Engineer", duration: "15 days", progress: 35, status: "In Progress", created: "2024-10-18", targetInterview: "2024-11-08", skillsCount: 7, totalHours: 30 },
  { id: "spotify-data-plan", name: "Spotify Data Engineer Plan", company: "Spotify", role: "Senior Data Engineer", duration: "20 days", progress: 0, status: "Not Started", created: "2024-10-23", targetInterview: "2024-11-20", skillsCount: 11, totalHours: 50 },
];

/* ---------- Helpers: token & URLs ---------- */
function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}
function getToken(): string | null {
  const fromLS =
    (typeof localStorage !== "undefined" &&
      (localStorage.getItem("token") ||
       localStorage.getItem("accessToken") ||
       localStorage.getItem("access_token") ||
       localStorage.getItem("jwt") ||
       localStorage.getItem("idToken"))) ||
    null;
  const fromCookie =
    readCookie("token") ||
    readCookie("accessToken") ||
    readCookie("access_token") ||
    readCookie("jwt") ||
    readCookie("idToken");
  return (fromLS || fromCookie || "").trim() || null;
}
function computeApiRoot(raw?: string): string {
  const base = (raw || "").replace(/\/+$/, "");
  if (!base) return "/v1";
  if (base.endsWith("/v1")) return base;
  return `${base}/v1`;
}
function apiJoin(root: string, path: string) {
  return `${root.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

/* ---------- Parser (array-root only) ---------- */
function parseDailyPlanToGeneratedPlan(dailyPlanText?: string): GeneratedPlan {
  if (dailyPlanText) {
    try {
      const arr = JSON.parse(dailyPlanText);
      if (Array.isArray(arr)) {
        const days: DayPlan[] = arr.map((d: any, i: number) => ({
          day: Number(d.day ?? i + 1),
          completed: false,
          current: i === 0,
          tasks: (d.tasks || []).slice(0, 3).map((t: any, j: number): DayTask => ({
            id: `${i + 1}-${j + 1}`,
            type: String(t.type ?? "review"),
            title: String(t.title ?? `Task ${j + 1}`),
            duration: Number(t.duration ?? 30),
            completed: false,
            gap: String(t.gap ?? "General"),
            resources: t.resources ? String(t.resources) : undefined,
          })),
        }));
        return { durationDays: days.length, days };
      }
    } catch {
      // fall through
    }
  }
  return { durationDays: 0, days: [] };
}

/* ---------- Component ---------- */
export function PrepPlan() {
  const [prepPlans, setPrepPlans] = useState<UIPlan[]>(INITIAL_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<string>("google-swe-plan");

  // Generated plan data per plan id
  const [generatedPlans, setGeneratedPlans] = useState<Record<string, GeneratedPlan>>({});
  const [dayIndexByPlan, setDayIndexByPlan] = useState<Record<string, number>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [aiAgentOpen, setAiAgentOpen] = useState(false);

  // exact backend fields (all strings)
  const [newPlanForm, setNewPlanForm] = useState({
    job_title: "",
    company_name: "",
    plan_duration: "",       // e.g. "14 days"
    experience_level: "",    // e.g. "Experienced"
    focus_areas: "",
    skill_gaps: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const API_ROOT = useMemo(
    () => computeApiRoot((import.meta as any)?.env?.VITE_API_BASE_URL),
    []
  );

  const weeklyStats = { totalHours: 10, completedHours: 7.5, tasksCompleted: 12, totalTasks: 18 };

  const filteredPlans = prepPlans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      case "Not Started":
      default:
        return "bg-gray-100 text-gray-800";
    }
  }
  function getProgressColor(progress: number) {
    if (progress >= 80) return "text-green-600";
    if (progress >= 50) return "text-blue-600";
    if (progress >= 25) return "text-yellow-600";
    return "text-red-600";
  }

  // toggle manual completion
  function toggleTaskCompletion(planId: string, dayIdx: number, taskId: string) {
    setGeneratedPlans((prev) => {
      const plan = prev[planId];
      if (!plan) return prev;
      const newDays = plan.days.map((d, i) =>
        i === dayIdx ? { ...d, tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)) } : d
      );
      return { ...prev, [planId]: { ...plan, days: newDays } };
    });
  }

  /* ------ Create Plan ------ */
  const onGeneratePlan = async () => {
    setFormError(null);

    if (!newPlanForm.job_title.trim()) return setFormError("Please enter a job title.");
    if (!newPlanForm.company_name.trim()) return setFormError("Please enter a company.");
    if (!newPlanForm.plan_duration.trim()) return setFormError('Please enter plan duration like "14 days".');
    if (!newPlanForm.experience_level.trim()) return setFormError("Please enter experience level.");

    const payload = {
      job_title: newPlanForm.job_title.trim(),
      company_name: newPlanForm.company_name.trim(),
      plan_duration: newPlanForm.plan_duration.trim(),     // "14 days" etc.
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
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const maybeErr = !resp.ok ? await resp.json().catch(() => null) : null;
      if (!resp.ok) {
        throw new Error(maybeErr?.error?.message || `Request failed: ${resp.status}`);
      }

      const data = (await resp.json()) as ManualPlanResponse & { sup?: any[] };

      // build UI card
      const newId = data.id || `plan-${Date.now()}`;
      const niceName = `${payload.company_name} ${payload.job_title} Plan`;

      const newUiPlan: UIPlan = {
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

      // parse dailyPlan (array-root string) — guaranteed N days × 3 tasks by backend
      const parsed = parseDailyPlanToGeneratedPlan(data.dailyPlan);
      const normalized: GeneratedPlan = {
        durationDays: parsed.durationDays,
        days: parsed.days.map((d, i) => ({
          ...d,
          current: i === 0,
          completed: false,
          tasks: d.tasks.map((t) => ({ ...t, completed: false })),
        })),
      };

      setPrepPlans((prev) => [newUiPlan, ...prev]);
      setGeneratedPlans((prev) => ({ ...prev, [newId]: normalized }));
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
  };

  // Icons/colors
  const taskIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("coding")) return <Code className="h-4 w-4" />;
    if (t.includes("system")) return <Target className="h-4 w-4" />;
    if (t.includes("behavior")) return <Users className="h-4 w-4" />;
    if (t.includes("practice")) return <Play className="h-4 w-4" />;
    return <BookOpen className="h-4 w-4" />;
  };
  const taskColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("coding")) return "bg-blue-100 text-blue-600";
    if (t.includes("system")) return "bg-purple-100 text-purple-600";
    if (t.includes("behavior")) return "bg-orange-100 text-orange-600";
    if (t.includes("practice")) return "bg-green-100 text-green-600";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Plans</h1>
          <p className="text-muted-foreground">Personalized learning schedules to close your skill gaps</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={aiAgentOpen} onOpenChange={setAiAgentOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Add New Plan</Button>
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
                    I&apos;ll create a personalized plan. Exactly N days & 3 tasks/day.
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
                      placeholder='e.g., 14 days'
                      value={newPlanForm.plan_duration}
                      onChange={(e) => setNewPlanForm({ ...newPlanForm, plan_duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Input
                      placeholder='e.g., Experienced'
                      value={newPlanForm.experience_level}
                      onChange={(e) => setNewPlanForm({ ...newPlanForm, experience_level: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority / Focus Areas</Label>
                    <Input
                      placeholder='e.g., software engineer'
                      value={newPlanForm.focus_areas}
                      onChange={(e) => setNewPlanForm({ ...newPlanForm, focus_areas: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Known Skill Gaps</Label>
                    <Textarea
                      placeholder='e.g., CSS'
                      value={newPlanForm.skill_gaps}
                      onChange={(e) => setNewPlanForm({ ...newPlanForm, skill_gaps: e.target.value })}
                      className="min-h-[40px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormError(null);
                    setAiAgentOpen(false);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button onClick={onGeneratePlan} className="gap-2" disabled={submitting}>
                  <Sparkles className="h-4 w-4" />
                  {submitting ? "Generating..." : "Generate Plan"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredPlans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const gen = generatedPlans[plan.id];
          const days = gen?.days || [];
          const dayIdx = dayIndexByPlan[plan.id] ?? 0;
          const currentDay = days.length ? days[Math.min(Math.max(dayIdx, 0), days.length - 1)] : undefined;
          const dayProgress = currentDay
            ? Math.round((currentDay.tasks.filter((t) => t.completed).length / currentDay.tasks.length) * 100)
            : 0;

          return (
            <div key={plan.id}>
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-primary bg-primary/5" : ""}`}
                onClick={() => setSelectedPlan(isSelected ? "" : plan.id)}
              >
                <CardContent className="flex flex-wrap items-center gap-6 py-4">
                  <div className="min-w-[240px]">
                    <p className="font-medium leading-tight">{plan.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-3 w-3" /><span>{plan.company}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{plan.role}</p>
                  </div>

                  <div className="flex-1 max-w-[260px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span className={`font-medium ${getProgressColor(plan.progress)}`}>{plan.progress}%</span>
                    </div>
                    <Progress value={plan.progress} className="h-2" />
                  </div>

                  <div className="flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Duration</p>
                      <p className="font-medium">{plan.duration}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Skills</p>
                      <p className="font-medium">{plan.skillsCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Hours</p>
                      <p className="font-medium">{plan.totalHours}h</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Interview</p>
                      <p className="font-medium">{plan.targetInterview ? new Date(plan.targetInterview).toLocaleDateString() : "-"}</p>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-3">
                    <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                    <Button variant="ghost" size="sm">{isSelected ? "Hide" : "View"}</Button>
                  </div>
                </CardContent>
              </Card>

              {isSelected && gen && (
                <div className="mt-3 mb-10">
                  <Card className="mb-4">
                    <CardHeader className="py-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {plan.role} at {plan.company}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Target Interview</p>
                            <p className="font-medium text-sm">{plan.targetInterview ? new Date(plan.targetInterview).toLocaleDateString() : "-"}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg"><Clock className="h-4 w-4 text-blue-600" /></div>
                          <div>
                            <p className="text-xs text-muted-foreground">Weekly Progress</p>
                            <p className="text-lg font-semibold">{weeklyStats.completedHours}/{weeklyStats.totalHours}h</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 className="h-4 w-4 text-green-600" /></div>
                          <div>
                            <p className="text-xs text-muted-foreground">Tasks Done</p>
                            <p className="text-lg font-semibold">{weeklyStats.tasksCompleted}/{weeklyStats.totalTasks}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg"><Target className="h-4 w-4 text-purple-600" /></div>
                          <div>
                            <p className="text-xs text-muted-foreground">Completion</p>
                            <p className="text-lg font-semibold">{Math.round((weeklyStats.tasksCompleted / weeklyStats.totalTasks) * 100)}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Tabs defaultValue="daily" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="daily">Daily Plan</TabsTrigger>
                      <TabsTrigger value="gaps">Gap Progress</TabsTrigger>
                      <TabsTrigger value="resources">Resources</TabsTrigger>
                    </TabsList>

                    <TabsContent value="daily" className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Days list */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="h-5 w-5" />
                              Days
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {gen.days.map((d, idx) => (
                              <button
                                key={d.day ?? idx + 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDayIndexByPlan((prev) => ({ ...prev, [plan.id]: idx }));
                                }}
                                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                                  idx === (dayIndexByPlan[plan.id] ?? 0)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "hover:bg-muted"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">Day {d.day ?? idx + 1}</span>
                                  {d.completed && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                  {d.current && !d.completed && <div className="h-2 w-2 bg-orange-500 rounded-full" />}
                                </div>
                                <p className="text-xs opacity-70">{d.date || ""}</p>
                              </button>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Day detail */}
                        <Card className="lg:col-span-3">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>
                                Day {currentDay?.day ?? (dayIndexByPlan[plan.id] ?? 0) + 1}
                                {currentDay?.date ? ` - ${currentDay.date}` : ""}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                {currentDay?.current && <Badge variant="secondary">Today</Badge>}
                                {currentDay && currentDay.tasks.every((t) => t.completed) && (
                                  <Badge variant="default" className="bg-green-600">Completed</Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {currentDay?.tasks.map((task) => (
                              <div key={task.id} className="p-4 border rounded-lg space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${taskColor(task.type)}`}>{taskIcon(task.type)}</div>
                                  <div className="flex-1">
                                    <h4 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                                      {task.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {task.duration} minutes • Closes "{task.gap || "General"}" gap
                                      {task.resources ? <> • <a className="underline" href={task.resources} target="_blank" rel="noreferrer">Resource</a></> : null}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {task.completed ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-600 cursor-pointer"
                                        onClick={() => toggleTaskCompletion(plan.id, dayIndexByPlan[plan.id] ?? 0, task.id)} />
                                    ) : (
                                      <Circle className="h-5 w-5 text-muted-foreground cursor-pointer"
                                        onClick={() => toggleTaskCompletion(plan.id, dayIndexByPlan[plan.id] ?? 0, task.id)} />
                                    )}
                                  </div>
                                </div>
                                {!task.completed && (
                                  <div className="flex gap-2">
                                    <Button size="sm" className="gap-2"><Play className="h-4 w-4" />Start Task</Button>
                                    {task.resources && (
                                      <Button size="sm" variant="outline" asChild>
                                        <a href={task.resources} target="_blank" rel="noreferrer">View Resource</a>
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}

                            <div className="pt-4 border-t">
                              <div className="flex items-center justify-between text-sm">
                                <span>Daily Progress</span>
                                <span>{currentDay?.tasks.filter((t) => t.completed).length ?? 0}/{currentDay?.tasks.length ?? 0} tasks</span>
                              </div>
                              <Progress value={dayProgress} className="mt-2" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="gaps" className="space-y-4">
                      <Card>
                        <CardHeader><CardTitle>Skill Gap Progress</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">CSS</h4>
                                <p className="text-sm text-muted-foreground">Target: Week 1–3</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="destructive">High</Badge>
                                <span className="text-sm font-medium">0%</span>
                              </div>
                            </div>
                            <Progress value={0} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="resources" className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader><CardTitle>Coding Practice</CardTitle></CardHeader>
                          <CardContent className="space-y-3">
                            <div className="p-3 border rounded-lg">
                              <h4 className="font-medium">LeetCode Patterns</h4>
                              <p className="text-sm text-muted-foreground">Curated problems by pattern</p>
                              <Button size="sm" variant="outline" className="mt-2">Open Resource</Button>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <h4 className="font-medium">System Design Primer</h4>
                              <p className="text-sm text-muted-foreground">Comprehensive guide</p>
                              <Button size="sm" variant="outline" className="mt-2">Open Resource</Button>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader><CardTitle>Learning Materials</CardTitle></CardHeader>
                          <CardContent className="space-y-3">
                            <div className="p-3 border rounded-lg">
                              <h4 className="font-medium">Kubernetes Documentation</h4>
                              <p className="text-sm text-muted-foreground">Official K8s docs</p>
                              <Button size="sm" variant="outline" className="mt-2">Open Resource</Button>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <h4 className="font-medium">GraphQL Best Practices</h4>
                              <p className="text-sm text-muted-foreground">Implementation guide</p>
                              <Button size="sm" variant="outline" className="mt-2">Open Resource</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
