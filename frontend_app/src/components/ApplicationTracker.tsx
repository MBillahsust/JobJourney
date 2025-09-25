import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  Edit,
} from "lucide-react";

type ApplicationStatus =
  | "saved"
  | "applied"
  | "phone-screen"
  | "technical"
  | "onsite"
  | "offer"
  | "rejected";

interface Application {
  id: string;
  company: string;
  role: string;
  location: string;
  status: ApplicationStatus;
  appliedDate: string;
  nextDeadline?: string;
  matchScore: number;
  notes: string;
  salary?: string;
}

export function ApplicationTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // --- Add Application Dialog state ---
  const [addOpen, setAddOpen] = useState(false);
  const [addTab, setAddTab] = useState<"paste" | "url">("paste");
  const [form, setForm] = useState({
    company: "",
    role: "",
    location: "",
    status: "saved" as ApplicationStatus,
    appliedDate: "",
    nextDeadline: "",
    salary: "",
    notes: "",
    specText: "",
    specUrl: "",
  });
  const [fetchingSpec, setFetchingSpec] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // --- Local-only list of applications (no DB yet) ---
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "1",
      company: "Google",
      role: "Senior Software Engineer",
      location: "Mountain View, CA",
      status: "technical",
      appliedDate: "2024-10-15",
      nextDeadline: "2024-10-25",
      matchScore: 87,
      notes: "Technical interview scheduled for next week. Focus on system design.",
      salary: "$180k - $220k",
    },
    {
      id: "2",
      company: "Meta",
      role: "Backend Engineer",
      location: "Menlo Park, CA",
      status: "phone-screen",
      appliedDate: "2024-10-18",
      nextDeadline: "2024-10-23",
      matchScore: 92,
      notes: "Phone screen went well. Discussed React and GraphQL experience.",
      salary: "$170k - $210k",
    },
    {
      id: "3",
      company: "Netflix",
      role: "Full Stack Engineer",
      location: "Los Gatos, CA",
      status: "applied",
      appliedDate: "2024-10-20",
      matchScore: 78,
      notes: "Application submitted. Waiting for response.",
      salary: "$160k - $200k",
    },
    {
      id: "4",
      company: "Stripe",
      role: "Software Engineer",
      location: "San Francisco, CA",
      status: "offer",
      appliedDate: "2024-10-01",
      nextDeadline: "2024-10-26",
      matchScore: 85,
      notes: "Offer received! Need to respond by end of week.",
      salary: "$175k - $215k",
    },
    {
      id: "5",
      company: "Airbnb",
      role: "Senior Engineer",
      location: "San Francisco, CA",
      status: "rejected",
      appliedDate: "2024-10-12",
      matchScore: 74,
      notes: "Rejected after technical interview. Work on system design skills.",
    },
  ]);

  // --- Status config (labels/colors + counts) ---
  const statusConfig = useMemo(() => {
    const base: Record<ApplicationStatus, { label: string; color: string; count: number }> = {
      saved: { label: "Saved", color: "bg-gray-100 text-gray-800", count: 0 },
      applied: { label: "Applied", color: "bg-blue-100 text-blue-800", count: 0 },
      "phone-screen": { label: "Phone Screen", color: "bg-yellow-100 text-yellow-800", count: 0 },
      technical: { label: "Technical", color: "bg-purple-100 text-purple-800", count: 0 },
      onsite: { label: "Onsite", color: "bg-orange-100 text-orange-800", count: 0 },
      offer: { label: "Offer", color: "bg-green-100 text-green-800", count: 0 },
      rejected: { label: "Rejected", color: "bg-red-100 text-red-800", count: 0 },
    };
    applications.forEach((app) => {
      base[app.status].count++;
    });
    return base;
  }, [applications]);

  // --- Helpers: naive JD parsing for a match score ---
  const parseJobSpec = (text: string) => {
    const lowered = text.toLowerCase();
    const keywords = ["react", "typescript", "node", "aws", "graphql", "python", "kubernetes", "docker"];
    const hits = keywords.filter((k) => lowered.includes(k));
    const matchScore = hits.length ? Math.min(95, 50 + hits.length * 6) : 50;
    return {
      matchScore,
      extractedNotes: hits.length ? `Keywords detected: ${hits.join(", ")}` : "No key tech keywords detected.",
    };
  };

  const handleImportUrl = async () => {
    if (!form.specUrl) return;
    setFetchingSpec(true);
    setFetchError(null);
    try {
      const res = await fetch(form.specUrl);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const html = await res.text();
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      setForm((f) => ({ ...f, specText: text.slice(0, 8000) }));
    } catch (_e) {
      setFetchError("Unable to fetch spec (CORS or invalid URL). You can paste manually.");
    } finally {
      setFetchingSpec(false);
    }
  };

  // --- Save new application locally and show it on the board/list ---
  const handleSubmitApplication = () => {
    if (!form.company || !form.role || !form.specText) return;
    const { matchScore, extractedNotes } = parseJobSpec(form.specText);

    const newApp: Application = {
      id: Date.now().toString(),
      company: form.company.trim(),
      role: form.role.trim(),
      location: form.location.trim() || "N/A",
      status: form.status,
      appliedDate: form.appliedDate || new Date().toISOString().slice(0, 10),
      nextDeadline: form.nextDeadline || undefined,
      matchScore,
      notes: form.notes ? form.notes + "\n" + extractedNotes : extractedNotes,
      salary: form.salary || undefined,
    };

    setApplications((prev) => [newApp, ...prev]);
    setAddOpen(false);

    // reset form (keep tab selection)
    setForm({
      company: "",
      role: "",
      location: "",
      status: "saved",
      appliedDate: "",
      nextDeadline: "",
      salary: "",
      notes: "",
      specText: "",
      specUrl: "",
    });
    setFetchError(null);
  };

  // --- Filtering and derived views ---
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === (statusFilter as ApplicationStatus);
    return matchesSearch && matchesStatus;
  });

  const upcomingDeadlines = applications
    .filter((app) => app.nextDeadline)
    .sort((a, b) => new Date(a.nextDeadline!).getTime() - new Date(b.nextDeadline!).getTime())
    .slice(0, 3);

  const ApplicationCard = ({ app }: { app: Application }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{app.company}</h3>
              <p className="text-sm text-muted-foreground">{app.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{app.matchScore}%</Badge>
              <Button size="sm" variant="ghost" title="Edit (coming soon)">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{app.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
            </div>
          </div>

          {app.salary && (
            <div className="text-sm">
              <span className="font-medium">Salary:</span> {app.salary}
            </div>
          )}

          {app.nextDeadline && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded text-sm">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span>Next: {new Date(app.nextDeadline).toLocaleDateString()}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.notes}</p>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled>
              Update Status
            </Button>
            <Button size="sm" variant="outline" disabled>
              Add Note
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Application Tracker</h1>
          <p className="text-muted-foreground">Manage your job applications and deadlines</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add New Application</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Paste vs URL */}
                <div className="border-b pb-2 flex gap-4 text-sm">
                  <button
                    className={`pb-1 border-b-2 ${
                      addTab === "paste" ? "border-primary font-medium" : "border-transparent text-muted-foreground"
                    }`}
                    onClick={() => setAddTab("paste")}
                  >
                    Paste Spec
                  </button>
                  <button
                    className={`pb-1 border-b-2 ${
                      addTab === "url" ? "border-primary font-medium" : "border-transparent text-muted-foreground"
                    }`}
                    onClick={() => setAddTab("url")}
                  >
                    Import URL
                  </button>
                </div>

                {addTab === "url" && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Job Spec URL</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://..."
                        value={form.specUrl}
                        onChange={(e) => setForm({ ...form, specUrl: e.target.value })}
                      />
                      <Button type="button" variant="outline" disabled={!form.specUrl || fetchingSpec} onClick={handleImportUrl}>
                        {fetchingSpec ? "Fetching..." : "Fetch"}
                      </Button>
                    </div>
                    {fetchError && <p className="text-xs text-red-600">{fetchError}</p>}
                    {form.specText && (
                      <p className="text-xs text-green-600">Imported text length: {form.specText.length}</p>
                    )}
                  </div>
                )}

                {addTab === "paste" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Job Description Text</label>
                    <Textarea
                      placeholder="Paste full job description here..."
                      className="min-h-[160px]"
                      value={form.specText}
                      onChange={(e) => setForm({ ...form, specText: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Used to auto-estimate match score & extract keywords.</p>
                  </div>
                )}

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company *</label>
                    <Input
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role / Title *</label>
                    <Input
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="City, Country / Remote"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={form.status}
                      onValueChange={(v: string) => setForm({ ...form, status: v as ApplicationStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([s, cfg]) => (
                          <SelectItem key={s} value={s}>
                            {cfg.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Applied Date</label>
                    <Input
                      type="date"
                      value={form.appliedDate}
                      onChange={(e) => setForm({ ...form, appliedDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Next Deadline</label>
                    <Input
                      type="date"
                      value={form.nextDeadline}
                      onChange={(e) => setForm({ ...form, nextDeadline: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Salary Range</label>
                    <Input
                      value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })}
                      placeholder="$140k - $180k"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Any thoughts, recruiter info, follow-up actions..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Fields marked * required. Spec text required for match score.
                  </p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={!form.company || !form.role || !form.specText}
                      onClick={handleSubmitApplication}
                    >
                      Save Application
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(statusConfig).map(([status, config]) => (
          <Card key={status} className="text-center">
            <CardContent className="p-3">
              <p className="text-2xl font-bold">{config.count}</p>
              <p className="text-xs text-muted-foreground">{config.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies or roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(statusConfig).map(([status, config]) => (
              <SelectItem key={status} value={status}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border rounded-lg">
          <Button variant={viewMode === "kanban" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("kanban")}>
            Kanban
          </Button>
          <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
            List
          </Button>
        </div>
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          {viewMode === "kanban" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(statusConfig).map(([status, config]) => {
                const statusApps = filteredApplications.filter((app) => app.status === status);
                return (
                  <div key={status} className="space-y-3">
                    <div className={`p-3 rounded-lg ${config.color}`}>
                      <h3 className="font-medium">{config.label}</h3>
                      <p className="text-sm opacity-80">{statusApps.length} applications</p>
                    </div>
                    <div className="space-y-2">
                      {statusApps.map((app) => (
                        <ApplicationCard key={app.id} app={app} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold">{app.company}</h3>
                          <p className="text-sm text-muted-foreground">{app.role}</p>
                        </div>
                        <Badge className={statusConfig[app.status].color}>{statusConfig[app.status].label}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="font-medium">{app.matchScore}% match</p>
                          <p className="text-muted-foreground">
                            Applied {new Date(app.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" title="Edit (coming soon)">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDeadlines.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{app.company}</h4>
                    <p className="text-sm text-muted-foreground">{app.role}</p>
                    <Badge className={statusConfig[app.status].color}>{statusConfig[app.status].label}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{new Date(app.nextDeadline!).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.ceil(
                        (new Date(app.nextDeadline!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Funnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const percentage = applications.length > 0 ? (config.count / applications.length) * 100 : 0;
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{config.label}</span>
                        <span>
                          {config.count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">84%</p>
                    <p className="text-sm text-muted-foreground">Avg Match Score</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">2.3</p>
                    <p className="text-sm text-muted-foreground">Avg Days to Response</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">12%</p>
                    <p className="text-sm text-muted-foreground">Offer Rate</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">$185k</p>
                    <p className="text-sm text-muted-foreground">Avg Salary</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
