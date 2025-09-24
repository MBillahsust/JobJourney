import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Upload,
  FileText,
  User as UserIcon,
  Briefcase,
  Code,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Download,
  X as XIcon,
} from "lucide-react";

/** API base
 * With the Vite dev proxy, keep this empty so fetch('/v1/...') is same-origin in dev.
 * You can still override via VITE_API_BASE for staging/prod.
 */
const API_BASE =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_BASE) ||
  "";

/* ----------------------------- Types ----------------------------- */
type Seniority = "intern" | "junior" | "mid" | "senior" | "lead";

type ServerUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: string;
  profile?: ServerProfile;
};

type ServerProfile = {
  phone?: string;
  location?: string;
  targets?: {
    roles?: string[];
    seniority?: Seniority;
  };
  preferredLocations?: string[];
};

type AccountPatchPayload = {
  firstName?: string;
  lastName?: string;
  // email intentionally omitted (non-editable)
  phone?: string;
  location?: string;
  targetRoles?: string[];
  seniorityLevel?: Seniority;
  preferredLocations?: string[];
};

/* ------------------------- Helper functions ---------------------- */
async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("accessToken");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    // no need for credentials in Bearer-token flow
  });

  if (!res.ok) {
    // Try to parse JSON error to get server message
    const text = await res.text().catch(() => "");
    let msg = text || `Request failed: ${res.status}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error?.message) msg = parsed.error.message;
    } catch {}
    throw new Error(`${res.status}:${msg}`);
  }
  return res.json();
}

const getSkillLevelColor = (level: string) => {
  switch (level) {
    case "Expert":
      return "bg-green-100 text-green-800";
    case "Advanced":
      return "bg-blue-100 text-blue-800";
    case "Intermediate":
      return "bg-yellow-100 text-yellow-800";
    case "Beginner":
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/* ---------------------- Demo data (unchanged) --------------------- */
const skillCategoriesDemo = [
  {
    name: "Programming Languages",
    skills: [
      { name: "Python", level: "Expert", years: 5 },
      { name: "JavaScript", level: "Advanced", years: 4 },
      { name: "Java", level: "Intermediate", years: 2 },
      { name: "Go", level: "Beginner", years: 1 },
    ],
  },
  {
    name: "Frameworks & Libraries",
    skills: [
      { name: "React", level: "Advanced", years: 3 },
      { name: "Node.js", level: "Advanced", years: 4 },
      { name: "Django", level: "Intermediate", years: 2 },
      { name: "Express.js", level: "Advanced", years: 3 },
    ],
  },
  {
    name: "Cloud & Infrastructure",
    skills: [
      { name: "AWS", level: "Intermediate", years: 3 },
      { name: "Docker", level: "Intermediate", years: 2 },
      { name: "Kubernetes", level: "Beginner", years: 1 },
      { name: "Terraform", level: "Beginner", years: 1 },
    ],
  },
];

const workExperienceDemo = [
  {
    id: 1,
    company: "TechCorp",
    role: "Senior Software Engineer",
    duration: "2022 - Present",
    location: "San Francisco, CA",
    bullets: [
      "Led development of microservices architecture serving 10M+ users",
      "Reduced API response time by 40% through optimization and caching",
      "Mentored 3 junior developers and conducted code reviews",
      "Implemented CI/CD pipeline reducing deployment time by 60%",
    ],
  },
  {
    id: 2,
    company: "StartupXYZ",
    role: "Full Stack Developer",
    duration: "2020 - 2022",
    location: "Remote",
    bullets: [
      "Built React-based dashboard handling real-time data visualization",
      "Designed RESTful APIs using Node.js and PostgreSQL",
      "Collaborated with product team to define feature requirements",
      "Improved test coverage from 30% to 85%",
    ],
  },
];

const resumeIssuesDemo = [
  { type: "warning", message: "Missing quantified metrics in 2 bullets", severity: "medium" },
  { type: "error", message: "Skills section needs more relevant keywords", severity: "high" },
  { type: "info", message: "Consider adding certification section", severity: "low" },
];

/* -------------------------- Tag editor --------------------------- */
function TagsEditor({
  label,
  values,
  placeholder,
  onAdd,
  onRemove,
}: {
  label: string;
  values: string[];
  placeholder: string;
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2 mt-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (draft.trim()) {
                onAdd(draft.trim());
                setDraft("");
              }
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (!draft.trim()) return;
            onAdd(draft.trim());
            setDraft("");
          }}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {values.length === 0 ? (
          <span className="text-xs text-muted-foreground">No items. Add one above.</span>
        ) : (
          values.map((v) => (
            <Badge key={v} variant="secondary" className="gap-1">
              {v}
              <button
                type="button"
                className="ml-1 hover:opacity-80"
                onClick={() => onRemove(v)}
                title="Remove"
                aria-label={`Remove ${v}`}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------ Main component ------------------------- */
export function ProfileSetup() {
  const [activeTab, setActiveTab] = useState("resume");
  const [resumeScore] = useState(78);

  // loading + saving UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOK, setSavedOK] = useState(false);

  // Form state (Profile tab)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(""); // read-only in UI
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [seniorityLevel, setSeniorityLevel] = useState<Seniority | "">("");
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);

  const tokenMissing = useMemo(() => !localStorage.getItem("accessToken"), []);

  // Prefill from server
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        setSavedOK(false);

        // fetch /v1/me and /v1/me/profile in parallel
        const [me, profile] = await Promise.all([
          authFetch<ServerUser>("/v1/me"),
          authFetch<ServerProfile>("/v1/me/profile"),
        ]);

        if (!mounted) return;

        // Account basics
        setFirstName(me.firstName || "");
        setLastName(me.lastName || "");
        setEmail(me.email || "");

        // Profile details
        setPhone(profile.phone || "");
        setLocation(profile.location || "");
        setTargetRoles(profile.targets?.roles || []);
        setSeniorityLevel(profile.targets?.seniority || "");
        setPreferredLocations(profile.preferredLocations || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load your profile. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const saveViaFallback = async () => {
    // 1) names
    await authFetch<ServerUser>("/v1/me", {
      method: "PATCH",
      body: JSON.stringify({
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
      }),
    });

    // 2) profile fields
    const profilePayload: ServerProfile = {
      phone: phone || undefined,
      location: location || undefined,
      targets: {
        roles: targetRoles || [],
        seniority: (seniorityLevel as Seniority) || undefined,
      },
      preferredLocations: preferredLocations || [],
    };

    await authFetch<ServerProfile>("/v1/me/profile", {
      method: "PATCH",
      body: JSON.stringify(profilePayload),
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSavedOK(false);

      // Try the combined endpoint first
      const combinedPayload: AccountPatchPayload = {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        // email intentionally NOT sent (non-editable)
        phone: phone || undefined,
        location: location || undefined,
        targetRoles: targetRoles.length ? targetRoles : [],
        seniorityLevel: (seniorityLevel as Seniority) || undefined,
        preferredLocations: preferredLocations.length ? preferredLocations : [],
      };

      try {
        await authFetch<ServerUser>("/v1/me/account", {
          method: "PATCH",
          body: JSON.stringify(combinedPayload),
        });
      } catch (err: any) {
        const msg: string = String(err?.message || "");
        if (msg.startsWith("404:") || msg.includes("Route not found")) {
          await saveViaFallback();
        } else {
          throw err;
        }
      }

      setSavedOK(true);

      // optionally sync localStorage "user" (no email change)
      try {
        const raw = localStorage.getItem("user");
        const parsed = raw ? JSON.parse(raw) : {};
        localStorage.setItem("user", JSON.stringify({ ...parsed, firstName, lastName }));
      } catch {}
    } catch (e: any) {
      setError(e?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedOK(false), 2000);
    }
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Profile & Resume</h1>
          <p className="text-muted-foreground">
            Manage your professional profile and optimize your resume
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Resume
          </Button>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Resume
          </Button>
        </div>
      </div>

      {/* Server status */}
      {(loading || error || savedOK) && (
        <Card>
          <CardContent className="p-4">
            {loading && <div className="text-sm text-muted-foreground">Loading your profile…</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            {savedOK && <div className="text-sm text-green-600">Changes saved successfully.</div>}
            {tokenMissing && !loading && !error && (
              <div className="text-sm text-yellow-700">
                You are not logged in. Some actions may be disabled.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profile Completion */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-muted" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - resumeScore / 100)}`}
                    className="text-primary transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{resumeScore}%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Mean ATS Score</p>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">Resume uploaded and parsed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">Skills mapped and validated</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">3 optimization suggestions available</span>
              </div>
            </div>

            <div className="text-right">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Run Mean ATS Check
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        {/* Resume Tab (demo content) */}
        <TabsContent value="resume" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resume Preview</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center pb-4 border-b">
                  <h2 className="text-xl font-semibold">
                    {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Your Name"}
                  </h2>
                  <p className="text-muted-foreground">Senior Software Engineer</p>
                  <div className="flex justify-center gap-4 text-sm text-muted-foreground mt-2">
                    <span>{email || "email@example.com"}</span>
                    <span>•</span>
                    <span>{phone || "(000) 000-0000"}</span>
                    <span>•</span>
                    <span>{location || "City, Country"}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Experience
                  </h3>
                  <div className="space-y-4">
                    {workExperienceDemo.map((job) => (
                      <div key={job.id} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{job.role}</h4>
                            <p className="text-sm text-muted-foreground">
                              {job.company} • {job.location}
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground">{job.duration}</span>
                        </div>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                          {job.bullets.map((bullet, index) => (
                            <li key={index}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillCategoriesDemo.flatMap((cat) => cat.skills).map((skill) => (
                      <Badge key={skill.name} variant="secondary">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ATS Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeIssuesDemo.map((issue, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      {issue.type === "error" ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : issue.type === "warning" ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      )}
                      <Badge
                        variant={
                          issue.severity === "high" ? "destructive" : issue.severity === "medium" ? "secondary" : "outline"
                        }
                      >
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-sm">{issue.message}</p>
                    <Button size="sm" variant="outline">
                      Fix This
                    </Button>
                  </div>
                ))}

                <Button className="w-full gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Apply All Fixes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Skills Tab (demo content) */}
        <TabsContent value="skills" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {skillCategoriesDemo.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{category.name}</CardTitle>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Skill
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{skill.name}</p>
                        <p className="text-sm text-muted-foreground">{skill.years} years experience</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSkillLevelColor(skill.level)}>{skill.level}</Badge>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Profile Tab (real, editable, saved to DB) */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      disabled={loading || saving}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      disabled={loading || saving}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  {/* Non-editable email */}
                  <Input
                    type="email"
                    value={email}
                    readOnly
                    disabled
                    className="opacity-90"
                    title="Email is managed by your account and cannot be edited here"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 123 4567"
                    disabled={loading || saving}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    disabled={loading || saving}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Career Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <TagsEditor
                  label="Target Roles"
                  values={targetRoles}
                  placeholder="e.g., Backend Engineer"
                  onAdd={(v) => setTargetRoles((arr) => (arr.includes(v) ? arr : [...arr, v]))}
                  onRemove={(v) => setTargetRoles((arr) => arr.filter((x) => x !== v))}
                />

                <div>
                  <label className="text-sm font-medium">Seniority Level</label>
                  <Select
                    value={seniorityLevel || ""}
                    onValueChange={(v) => setSeniorityLevel((v as Seniority) || "")}
                    disabled={loading || saving}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intern">Intern</SelectItem>
                      <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                      <SelectItem value="senior">Senior (5+ years)</SelectItem>
                      <SelectItem value="lead">Lead/Principal (8+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <TagsEditor
                  label="Preferred Locations"
                  values={preferredLocations}
                  placeholder="e.g., San Francisco, CA"
                  onAdd={(v) => setPreferredLocations((arr) => (arr.includes(v) ? arr : [...arr, v]))}
                  onRemove={(v) => setPreferredLocations((arr) => arr.filter((x) => x !== v))}
                />

                <div className="pt-2 border-t flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Make changes and click <span className="font-medium">Save</span>.
                  </div>
                  <Button onClick={handleSave} disabled={loading || saving || tokenMissing} className="gap-2">
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Portfolio Tab (demo content) */}
        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Portfolio Projects</CardTitle>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: "E-commerce Platform",
                  description: "Full-stack web application built with React and Node.js",
                  tech: ["React", "Node.js", "PostgreSQL", "AWS"],
                  github: "github.com/you/ecommerce",
                  demo: "demo.ecommerce.com",
                },
                {
                  name: "Task Management API",
                  description: "RESTful API with authentication and real-time updates",
                  tech: ["Python", "Django", "Redis", "Docker"],
                  github: "github.com/you/task-api",
                  demo: null,
                },
              ].map((project, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <Badge key={tech} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 text-sm">
                    <a href="#" className="text-blue-600 hover:underline">
                      GitHub
                    </a>
                    {project.demo && (
                      <>
                        <span>•</span>
                        <a href="#" className="text-blue-600 hover:underline">
                          Live Demo
                        </a>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
