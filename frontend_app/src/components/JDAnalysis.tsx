import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import {
  Upload,
  Target,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileText,
  Sparkles,
  Clock,
  Users,
  Search,
  MapPin,
  Plus,
  Filter,
  Bot,
} from "lucide-react";

/** ---------- Helpers (shared with PrepPlan): read token ---------- */
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

export function JDAnalysis() {
  const [jdText, setJdText] = useState("");
  const [selectedJob, setSelectedJob] = useState<string | null>("google-swe");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [smartSearchOpen, setSmartSearchOpen] = useState(false);

  // ---- AI Plan Generator (SAME UX/VALIDATION/ENDPOINT AS PrepPlan.tsx) ----
  const [aiAgentOpen, setAiAgentOpen] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    jobTitle: "",
    company: "",
    selectedDays: "", // "7" | "14" | "21" | "30" | "60"
    skillGaps: "",
    experience: "",
    priority: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const API_BASE = useMemo(
    () => (import.meta as any)?.env?.VITE_API_BASE_URL?.replace(/\/+$/, "") || "",
    []
  );

  const onGeneratePlan = async () => {
    setFormError(null);

    if (!newPlanForm.jobTitle.trim()) return setFormError("Please enter a job title.");
    if (!newPlanForm.company.trim()) return setFormError("Please enter a company.");
    if (!newPlanForm.experience) return setFormError("Please choose an experience level.");
    if (!newPlanForm.selectedDays) return setFormError("Please select the number of days.");

    const durationDays = Number(newPlanForm.selectedDays);

    const targetISO = (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + durationDays);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    })();

    const payload = {
      job_title: newPlanForm.jobTitle.trim(),
      company_name: newPlanForm.company.trim(),
      target_date: targetISO,
      experience_level: newPlanForm.experience,
      focus_areas: newPlanForm.priority || undefined,
      skill_gaps: newPlanForm.skillGaps || undefined,
      duration_days: durationDays,
    };

    const token = getToken();
    setSubmitting(true);
    try {
      const resp = await fetch(`${API_BASE}/v1/learning/manual`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const errJson = !resp.ok ? await resp.json().catch(() => null) : null;
      if (!resp.ok) {
        if (resp.status === 401) throw new Error(errJson?.error?.message || "Unauthorized: missing or invalid token");
        throw new Error(errJson?.error?.message || `Request failed: ${resp.status}`);
      }

      // We don’t own the PrepPlan state here; this flow mirrors creation UX,
      // submits successfully, and closes. Parent screens that list plans can refetch.
      await resp.json();

      setAiAgentOpen(false);
      setNewPlanForm({
        jobTitle: "",
        company: "",
        selectedDays: "",
        skillGaps: "",
        experience: "",
        priority: "",
      });
    } catch (e: any) {
      setFormError(e?.message || "Failed to generate plan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Smart Search Filter States
  const [filters, setFilters] = useState({
    role: "",
    location: "",
    type: "",
    experienceLevel: "",
    salaryRange: [50, 250] as [number, number],
  });

  // Sample job data with analysis
  const jobMatches = [
    {
      id: "google-swe",
      company: "Google",
      role: "Senior Software Engineer",
      location: "Mountain View, CA",
      matchScore: 87,
      status: "Active",
      postedDate: "2 days ago",
      salary: "$180k - $220k",
    },
    {
      id: "meta-backend",
      company: "Meta",
      role: "Backend Engineer",
      location: "Menlo Park, CA",
      matchScore: 92,
      status: "Active",
      postedDate: "1 day ago",
      salary: "$170k - $210k",
    },
    {
      id: "netflix-fullstack",
      company: "Netflix",
      role: "Full Stack Engineer",
      location: "Los Gatos, CA",
      matchScore: 78,
      status: "New",
      postedDate: "3 hours ago",
      salary: "$160k - $200k",
    },
    {
      id: "stripe-swe",
      company: "Stripe",
      role: "Software Engineer",
      location: "San Francisco, CA",
      matchScore: 85,
      status: "Active",
      postedDate: "1 week ago",
      salary: "$175k - $215k",
    },
    {
      id: "airbnb-senior",
      company: "Airbnb",
      role: "Senior Engineer",
      location: "San Francisco, CA",
      matchScore: 74,
      status: "Active",
      postedDate: "4 days ago",
      salary: "$165k - $205k",
    },
    {
      id: "uber-platform",
      company: "Uber",
      role: "Platform Engineer",
      location: "San Francisco, CA",
      matchScore: 81,
      status: "New",
      postedDate: "6 hours ago",
      salary: "$155k - $195k",
    },
  ] as const;

  // Sample analysis data for each job
  const jobAnalysisData = {
    "google-swe": {
      matchScore: 87,
      role: "Senior Software Engineer",
      company: "Google",
      matches: [
        { skill: "Python", level: "Expert", confidence: 95 },
        { skill: "React", level: "Advanced", confidence: 90 },
        { skill: "System Design", level: "Advanced", confidence: 85 },
        { skill: "AWS", level: "Intermediate", confidence: 80 },
        { skill: "Docker", level: "Intermediate", confidence: 75 },
      ],
      gaps: [
        { skill: "Kubernetes", priority: "High", effort: "2-3 weeks" },
        { skill: "GraphQL", priority: "Medium", effort: "1-2 weeks" },
        { skill: "Microservices Architecture", priority: "High", effort: "3-4 weeks" },
      ],
      requirements: {
        mustHave: [
          "Bachelor's degree in Computer Science or equivalent",
          "5+ years of software development experience",
          "Proficiency in Python and JavaScript",
          "Experience with cloud platforms (AWS/GCP)",
          "Strong system design skills",
        ],
        niceToHave: [
          "Experience with Kubernetes",
          "GraphQL knowledge",
          "Machine learning background",
          "Leadership experience",
        ],
      },
    },
    "meta-backend": {
      matchScore: 92,
      role: "Backend Engineer",
      company: "Meta",
      matches: [
        { skill: "Node.js", level: "Expert", confidence: 98 },
        { skill: "GraphQL", level: "Advanced", confidence: 95 },
        { skill: "System Design", level: "Advanced", confidence: 90 },
        { skill: "PostgreSQL", level: "Advanced", confidence: 88 },
        { skill: "Redis", level: "Intermediate", confidence: 82 },
      ],
      gaps: [
        { skill: "React Native", priority: "Medium", effort: "2-3 weeks" },
        { skill: "Machine Learning", priority: "Low", effort: "4-6 weeks" },
      ],
      requirements: {
        mustHave: [
          "4+ years of backend development experience",
          "Strong proficiency in Node.js and JavaScript",
          "Experience with GraphQL and REST APIs",
          "Database design and optimization skills",
          "Experience with distributed systems",
        ],
        niceToHave: [
          "React Native experience",
          "Machine learning knowledge",
          "Open source contributions",
          "Technical leadership experience",
        ],
      },
    },
    "netflix-fullstack": {
      matchScore: 78,
      role: "Full Stack Engineer",
      company: "Netflix",
      matches: [
        { skill: "React", level: "Advanced", confidence: 90 },
        { skill: "JavaScript", level: "Expert", confidence: 95 },
        { skill: "Node.js", level: "Advanced", confidence: 85 },
        { skill: "AWS", level: "Intermediate", confidence: 75 },
      ],
      gaps: [
        { skill: "Spring Boot", priority: "High", effort: "3-4 weeks" },
        { skill: "Kafka", priority: "High", effort: "2-3 weeks" },
        { skill: "Scala", priority: "Medium", effort: "4-6 weeks" },
      ],
      requirements: {
        mustHave: [
          "3+ years of full-stack development experience",
          "Proficiency in React and modern JavaScript",
          "Experience with Java/Spring Boot",
          "Understanding of microservices architecture",
          "Experience with streaming technologies",
        ],
        niceToHave: [
          "Scala programming experience",
          "Apache Kafka knowledge",
          "Video streaming technology experience",
          "Performance optimization skills",
        ],
      },
    },
  } as const;

  const filteredJobs = jobMatches.filter(
    (job) =>
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedJobData = selectedJob ? jobAnalysisData[selectedJob as keyof typeof jobAnalysisData] : null;

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 65) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    if (status === "New") return "bg-green-100 text-green-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Job Analysis</h1>
          <p className="text-muted-foreground">Get AI-powered insights on job fit and preparation gaps</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import from URL
          </Button>
          <Button onClick={() => setShowNewJobForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Job Description
          </Button>
        </div>
      </div>

      {/* Add New Job Form */}
      {showNewJobForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add New Job Description</CardTitle>
              <Button variant="outline" onClick={() => setShowNewJobForm(false)}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Company name" />
              <Input placeholder="Job title" />
            </div>
            <Input placeholder="Location" />
            <Textarea
              placeholder="Paste the full job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex gap-2">
              <Button disabled={!jdText.trim()} className="gap-2" onClick={() => setShowNewJobForm(false)}>
                <Sparkles className="h-4 w-4" />
                Analyze Job Fit
              </Button>
              <Button variant="outline">Choose from Library</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Search Button */}
      <div className="flex justify-center">
        <Dialog open={smartSearchOpen} onOpenChange={setSmartSearchOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Smart Search
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Smart Job Search Filters</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Role Filter */}
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior Developer</SelectItem>
                    <SelectItem value="mid">Mid-Level Developer</SelectItem>
                    <SelectItem value="senior">Senior Developer</SelectItem>
                    <SelectItem value="lead">Lead Developer</SelectItem>
                    <SelectItem value="principal">Principal Engineer</SelectItem>
                    <SelectItem value="staff">Staff Engineer</SelectItem>
                    <SelectItem value="architect">Solution Architect</SelectItem>
                    <SelectItem value="manager">Engineering Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dhaka">Dhaka, Bangladesh</SelectItem>
                    <SelectItem value="sylhet">Sylhet, Bangladesh</SelectItem>
                    <SelectItem value="chittagong">Chittagong, Bangladesh</SelectItem>
                    <SelectItem value="california">California, USA</SelectItem>
                    <SelectItem value="newyork">New York, USA</SelectItem>
                    <SelectItem value="texas">Texas, USA</SelectItem>
                    <SelectItem value="washington">Washington, USA</SelectItem>
                    <SelectItem value="london">London, UK</SelectItem>
                    <SelectItem value="toronto">Toronto, Canada</SelectItem>
                    <SelectItem value="sydney">Sydney, Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Work Type Filter */}
              <div className="space-y-2">
                <Label>Work Type</Label>
                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level Filter */}
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  value={filters.experienceLevel}
                  onValueChange={(value) => setFilters({ ...filters, experienceLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-8">5-8 years</SelectItem>
                    <SelectItem value="8-12">8-12 years</SelectItem>
                    <SelectItem value="12+">12+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Range Filter */}
              <div className="space-y-3">
                <Label>Salary Range (USD)</Label>
                <div className="px-2">
                  <Slider
                    value={filters.salaryRange}
                    onValueChange={(value) => setFilters({ ...filters, salaryRange: value as [number, number] })}
                    max={500}
                    min={30}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>${filters.salaryRange[0]}k</span>
                    <span>${filters.salaryRange[1]}k</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    role: "",
                    location: "",
                    type: "",
                    experienceLevel: "",
                    salaryRange: [50, 250],
                  });
                }}
              >
                Clear Filters
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSmartSearchOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Apply filters logic here
                    setSmartSearchOpen(false);
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Top Job Matches */}
      <Card>
        <CardHeader>
          <CardTitle>Top Job Matches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredJobs.map((job) => {
            const jobAnalysis = jobAnalysisData[job.id as keyof typeof jobAnalysisData];
            const isSelected = selectedJob === job.id;

            return (
              <div key={job.id}>
                {/* Job Card */}
                <div
                  onClick={() => setSelectedJob(isSelected ? null : job.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{job.company}</h3>
                        <Badge className={getStatusBadge(job.status)}>{job.status}</Badge>
                        {isSelected && (
                          <Badge variant="outline" className="text-primary border-primary">
                            Analyzing
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{job.role}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{job.postedDate}</span>
                        </div>
                        <span>{job.salary}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getMatchScoreColor(job.matchScore)}`}>{job.matchScore}%</div>
                      <p className="text-xs text-muted-foreground">Match</p>
                    </div>
                  </div>
                </div>

                {/* Inline Job Analysis */}
                {isSelected && jobAnalysis && (
                  <div className="mt-4 ml-4 space-y-4 border-l-2 border-primary pl-6">
                    {/* Match Score Header */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h2 className="text-xl font-semibold">{jobAnalysis.role}</h2>
                            <p className="text-muted-foreground">{jobAnalysis.company}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJob(null);
                            }}
                          >
                            Close Analysis
                          </Button>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="relative w-16 h-16">
                              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="transparent"
                                  className="text-muted"
                                />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="transparent"
                                  strokeDasharray={`${2 * Math.PI * 40}`}
                                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - jobAnalysis.matchScore / 100)}`}
                                  className="text-primary transition-all duration-1000"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold">{jobAnalysis.matchScore}%</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Match Score</p>
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span>Strong technical alignment</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              <span>{jobAnalysis.gaps.length} skill gaps identified</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span>4-6 weeks prep recommended</span>
                            </div>
                          </div>

                          <div className="text-right space-y-2">
                            {/* === Create Prep Plan now opens SAME AI Plan Generator === */}
                            <Button
                              size="sm"
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewPlanForm((prev) => ({
                                  ...prev,
                                  jobTitle: job.role,
                                  company: job.company,
                                  // sensible defaults
                                  selectedDays: "14",
                                  experience: "",
                                  priority: "comprehensive",
                                }));
                                setAiAgentOpen(true);
                              }}
                            >
                              <Target className="h-4 w-4" />
                              Create Prep Plan
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                              <FileText className="h-4 w-4" />
                              Tailor Resume
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Analysis Tabs */}
                    <Tabs defaultValue="analysis" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="analysis">Analysis</TabsTrigger>
                        <TabsTrigger value="evidence">Evidence</TabsTrigger>
                        <TabsTrigger value="gaps">Gaps</TabsTrigger>
                        <TabsTrigger value="requirements">Requirements</TabsTrigger>
                      </TabsList>

                      {/* Analysis Tab */}
                      <TabsContent value="analysis" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                Skill Matches
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {jobAnalysis.matches.map((match, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium">{match.skill}</span>
                                    <Badge variant="secondary">{match.level}</Badge>
                                  </div>
                                  <Progress value={match.confidence} className="h-2" />
                                  <p className="text-xs text-muted-foreground">{match.confidence}% confidence</p>
                                </div>
                              ))}
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                Priority Gaps
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {jobAnalysis.gaps.map((gap, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div>
                                    <p className="font-medium">{gap.skill}</p>
                                    <p className="text-sm text-muted-foreground">Est. {gap.effort}</p>
                                  </div>
                                  <Badge variant={gap.priority === "High" ? "destructive" : "secondary"}>{gap.priority}</Badge>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* Evidence Tab */}
                      <TabsContent value="evidence" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Match Evidence</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-3">
                              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">Technical Expertise</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Found in your resume:</p>
                                <p className="text-sm italic">
                                  "Led development of scalable microservices handling 10M+ requests/day"
                                </p>
                              </div>

                              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">System Design Experience</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Found in your resume:</p>
                                <p className="text-sm italic">
                                  "Designed and implemented distributed caching system reducing latency by 40%"
                                </p>
                              </div>

                              {jobAnalysis.gaps.length > 0 && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <span className="font-medium">{jobAnalysis.gaps[0].skill} Gap</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">JD requirement not found in resume:</p>
                                  <p className="text-sm italic">
                                    "Experience with {jobAnalysis.gaps[0].skill.toLowerCase()} in production environments"
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Gaps Tab */}
                      <TabsContent value="gaps" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Skill Gaps & Learning Plan</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {jobAnalysis.gaps.map((gap, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{gap.skill}</h4>
                                    <Badge variant={gap.priority === "High" ? "destructive" : "secondary"}>
                                      {gap.priority} Priority
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">Estimated learning time: {gap.effort}</p>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setNewPlanForm((prev) => ({
                                          ...prev,
                                          jobTitle: job.role,
                                          company: job.company,
                                          selectedDays: "14",
                                          experience: "",
                                          priority: "technical-skills",
                                          skillGaps: [prev.skillGaps, gap.skill].filter(Boolean).join(", "),
                                        }));
                                        setAiAgentOpen(true);
                                      }}
                                    >
                                      Add to Plan
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      Find Resources
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Requirements Tab */}
                      <TabsContent value="requirements" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-red-600" />
                                Must-Have Requirements
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {jobAnalysis.requirements.mustHave.map((req, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                                Nice-to-Have
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {jobAnalysis.requirements.niceToHave.map((req, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <div className="h-4 w-4 border border-muted-foreground/40 rounded-full mt-0.5 flex-shrink-0" />
                                    <span>{req}</span>
                                  </li>
                                ))}
                              </ul>
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
        </CardContent>
      </Card>

      {/* === AI Plan Generator Dialog (identical UX to PrepPlan.tsx) === */}
      <Dialog open={aiAgentOpen} onOpenChange={setAiAgentOpen}>
        {/* Triggerless dialog: opened from "Create Prep Plan" button */}
        <DialogContent className="sm:max-w-[600px]">
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
                I&apos;ll create a personalized {newPlanForm.selectedDays || "—"}-day preparation plan based on your target job and current skills.
              </p>
            </div>

            {formError && (
              <div className="text-sm text-red-600 border border-red-200 rounded-md p-2 bg-red-50">{formError}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  placeholder="e.g., Senior Software Engineer"
                  value={newPlanForm.jobTitle}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, jobTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  placeholder="e.g., Google"
                  value={newPlanForm.company}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, company: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select value={newPlanForm.experience} onValueChange={(v: string) => setNewPlanForm({ ...newPlanForm, experience: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid-level (2-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (5-8 years)</SelectItem>
                    <SelectItem value="lead">Lead (8+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Days</Label>
                <Select
                  value={newPlanForm.selectedDays}
                  onValueChange={(v: string) => setNewPlanForm({ ...newPlanForm, selectedDays: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="21">21 days</SelectItem>
                    <SelectItem value="30">1 month</SelectItem>
                    <SelectItem value="60">2 month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Priority Focus Area</Label>
              <Select value={newPlanForm.priority} onValueChange={(v: string) => setNewPlanForm({ ...newPlanForm, priority: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="What do you want to focus on most?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coding">Coding & Algorithms</SelectItem>
                  <SelectItem value="system-design">System Design</SelectItem>
                  <SelectItem value="behavioral">Behavioral Interviews</SelectItem>
                  <SelectItem value="technical-skills">Technical Skills</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive Prep</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Known Skill Gaps</Label>
              <Textarea
                placeholder="Describe areas you want to improve (e.g., Kubernetes, System Design, GraphQL, etc.)"
                value={newPlanForm.skillGaps}
                onChange={(e) => setNewPlanForm({ ...newPlanForm, skillGaps: e.target.value })}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-4">
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
  );
}
