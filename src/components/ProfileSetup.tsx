import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
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
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function ProfileSetup() {
  const [activeTab, setActiveTab] = useState("resume");
  const [resumeScore, setResumeScore] = useState(78);

  const skillCategories = [
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

  const workExperience = [
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

  const resumeIssues = [
    {
      type: "warning",
      message: "Missing quantified metrics in 2 bullets",
      severity: "medium",
    },
    {
      type: "error",
      message: "Skills section needs more relevant keywords",
      severity: "high",
    },
    {
      type: "info",
      message: "Consider adding certification section",
      severity: "low",
    },
  ];

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Expert":
        return "bg-green-100 text-green-800";
      case "Advanced":
        return "bg-blue-100 text-blue-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Beginner":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Profile & Resume
          </h1>
          <p className="text-muted-foreground">
            Manage your professional profile and optimize your
            resume
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

      {/* Profile Completion */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="relative w-20 h-20">
                <svg
                  className="w-20 h-20 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-muted"
                  />
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
                  <span className="text-lg font-bold">
                    {resumeScore}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Mean ATS Score
              </p>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  Resume uploaded and parsed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  Skills mapped and validated
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">
                  3 optimization suggestions available
                </span>
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

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        {/* Resume Tab */}
        <TabsContent value="resume" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resume Preview */}
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
                {/* Header */}
                <div className="text-center pb-4 border-b">
                  <h2 className="text-xl font-semibold">
                    Alex Smith
                  </h2>
                  <p className="text-muted-foreground">
                    Senior Software Engineer
                  </p>
                  <div className="flex justify-center gap-4 text-sm text-muted-foreground mt-2">
                    <span>alex.smith@email.com</span>
                    <span>•</span>
                    <span>(555) 123-4567</span>
                    <span>•</span>
                    <span>San Francisco, CA</span>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Experience
                  </h3>
                  <div className="space-y-4">
                    {workExperience.map((job) => (
                      <div key={job.id} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {job.role}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {job.company} • {job.location}
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {job.duration}
                          </span>
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

                {/* Skills */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillCategories
                      .flatMap((cat) => cat.skills)
                      .map((skill) => (
                        <Badge
                          key={skill.name}
                          variant="secondary"
                        >
                          {skill.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ATS Issues */}
            <Card>
              <CardHeader>
                <CardTitle>ATS Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeIssues.map((issue, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg space-y-2"
                  >
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
                          issue.severity === "high"
                            ? "destructive"
                            : issue.severity === "medium"
                              ? "secondary"
                              : "outline"
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

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {skillCategories.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{category.name}</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Skill
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {category.skills.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {skill.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {skill.years} years experience
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getSkillLevelColor(
                            skill.level,
                          )}
                        >
                          {skill.level}
                        </Badge>
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

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      First Name
                    </label>
                    <Input defaultValue="Alex" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Last Name
                    </label>
                    <Input defaultValue="Smith" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Email
                  </label>
                  <Input defaultValue="alex.smith@email.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Phone
                  </label>
                  <Input defaultValue="(555) 123-4567" />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Location
                  </label>
                  <Input defaultValue="San Francisco, CA" />
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
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Target Roles
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge>Software Engineer</Badge>
                    <Badge>Full Stack Developer</Badge>
                    <Badge>Backend Engineer</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Seniority Level
                  </label>
                  <Select defaultValue="senior">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">
                        Junior (0-2 years)
                      </SelectItem>
                      <SelectItem value="mid">
                        Mid-level (3-5 years)
                      </SelectItem>
                      <SelectItem value="senior">
                        Senior (5+ years)
                      </SelectItem>
                      <SelectItem value="lead">
                        Lead/Principal (8+ years)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Preferred Locations
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge>San Francisco, CA</Badge>
                    <Badge>New York, NY</Badge>
                    <Badge>Remote</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Weekly Study Hours
                  </label>
                  <Select defaultValue="10">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">
                        5 hours/week
                      </SelectItem>
                      <SelectItem value="10">
                        10 hours/week
                      </SelectItem>
                      <SelectItem value="15">
                        15 hours/week
                      </SelectItem>
                      <SelectItem value="20">
                        20+ hours/week
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Portfolio Tab */}
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
                  description:
                    "Full-stack web application built with React and Node.js",
                  tech: [
                    "React",
                    "Node.js",
                    "PostgreSQL",
                    "AWS",
                  ],
                  github: "github.com/alexsmith/ecommerce",
                  demo: "demo.ecommerce.com",
                },
                {
                  name: "Task Management API",
                  description:
                    "RESTful API with authentication and real-time updates",
                  tech: ["Python", "Django", "Redis", "Docker"],
                  github: "github.com/alexsmith/task-api",
                  demo: null,
                },
              ].map((project, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">
                        {project.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
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
                    <a
                      href="#"
                      className="text-blue-600 hover:underline"
                    >
                      GitHub
                    </a>
                    {project.demo && (
                      <>
                        <span>•</span>
                        <a
                          href="#"
                          className="text-blue-600 hover:underline"
                        >
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