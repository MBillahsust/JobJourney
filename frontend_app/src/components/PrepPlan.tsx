import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
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
import { Label } from "./ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Code,
  BookOpen,
  Target,
  Play,
  Search,
  Plus,
  Bot,
  Sparkles,
  Users,
  Building,
} from "lucide-react";

export function PrepPlan() {
  const [selectedPlan, setSelectedPlan] = useState(
    "google-swe-plan",
  );
  const [selectedDay, setSelectedDay] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [aiAgentOpen, setAiAgentOpen] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    jobTitle: "",
    company: "",
    targetDate: "",
    skillGaps: "",
    experience: "",
    priority: "",
  });

  const prepPlans = [
    {
      id: "google-swe-plan",
      name: "Google Software Engineer Plan",
      company: "Google",
      role: "Senior Software Engineer",
      duration: "14 days",
      progress: 45,
      status: "In Progress",
      created: "2024-10-15",
      targetInterview: "2024-11-05",
      skillsCount: 8,
      totalHours: 32,
    },
    {
      id: "meta-backend-plan",
      name: "Meta Backend Engineer Plan",
      company: "Meta",
      role: "Backend Engineer",
      duration: "12 days",
      progress: 70,
      status: "Active",
      created: "2024-10-10",
      targetInterview: "2024-10-28",
      skillsCount: 6,
      totalHours: 28,
    },
    {
      id: "netflix-fullstack-plan",
      name: "Netflix Full Stack Plan",
      company: "Netflix",
      role: "Full Stack Engineer",
      duration: "16 days",
      progress: 25,
      status: "New",
      created: "2024-10-20",
      targetInterview: "2024-11-10",
      skillsCount: 10,
      totalHours: 40,
    },
    {
      id: "stripe-frontend-plan",
      name: "Stripe Frontend Developer Plan",
      company: "Stripe",
      role: "Senior Frontend Developer",
      duration: "10 days",
      progress: 90,
      status: "Almost Complete",
      created: "2024-10-05",
      targetInterview: "2024-10-25",
      skillsCount: 5,
      totalHours: 24,
    },
    {
      id: "amazon-sde-plan",
      name: "Amazon SDE Plan",
      company: "Amazon",
      role: "Software Development Engineer",
      duration: "18 days",
      progress: 15,
      status: "Started",
      created: "2024-10-22",
      targetInterview: "2024-11-15",
      skillsCount: 12,
      totalHours: 45,
    },
    {
      id: "microsoft-cloud-plan",
      name: "Microsoft Cloud Engineer Plan",
      company: "Microsoft",
      role: "Cloud Solutions Engineer",
      duration: "14 days",
      progress: 60,
      status: "On Track",
      created: "2024-10-12",
      targetInterview: "2024-11-02",
      skillsCount: 9,
      totalHours: 36,
    },
    {
      id: "tesla-swe-plan",
      name: "Tesla Software Engineer Plan",
      company: "Tesla",
      role: "Software Engineer",
      duration: "15 days",
      progress: 35,
      status: "In Progress",
      created: "2024-10-18",
      targetInterview: "2024-11-08",
      skillsCount: 7,
      totalHours: 30,
    },
    {
      id: "spotify-data-plan",
      name: "Spotify Data Engineer Plan",
      company: "Spotify",
      role: "Senior Data Engineer",
      duration: "20 days",
      progress: 0,
      status: "Not Started",
      created: "2024-10-23",
      targetInterview: "2024-11-20",
      skillsCount: 11,
      totalHours: 50,
    },
  ];

  const weeklyStats = {
    totalHours: 10,
    completedHours: 7.5,
    tasksCompleted: 12,
    totalTasks: 18,
  };

  const dailyPlans = [
    {
      day: 1,
      date: "Mon, Oct 21",
      completed: true,
      tasks: [
        {
          id: 1,
          type: "coding",
          title: "Two Pointers - Easy Problems",
          duration: 45,
          completed: true,
          gap: "Array Manipulation",
        },
        {
          id: 2,
          type: "system",
          title: "Load Balancer Basics",
          duration: 30,
          completed: true,
          gap: "System Design",
        },
        {
          id: 3,
          type: "review",
          title: "Big O Notation Review",
          duration: 15,
          completed: true,
          gap: "CS Fundamentals",
        },
      ],
    },
    {
      day: 2,
      date: "Tue, Oct 22",
      completed: false,
      current: true,
      tasks: [
        {
          id: 4,
          type: "coding",
          title: "Binary Search Practice",
          duration: 45,
          completed: false,
          gap: "Search Algorithms",
        },
        {
          id: 5,
          type: "system",
          title: "Database Sharding",
          duration: 30,
          completed: false,
          gap: "System Design",
        },
        {
          id: 6,
          type: "review",
          title: "Kubernetes Fundamentals",
          duration: 20,
          completed: false,
          gap: "Container Orchestration",
        },
      ],
    },
    {
      day: 3,
      date: "Wed, Oct 23",
      completed: false,
      tasks: [
        {
          id: 7,
          type: "coding",
          title: "Tree Traversal Problems",
          duration: 50,
          completed: false,
          gap: "Data Structures",
        },
        {
          id: 8,
          type: "behavioral",
          title: "STAR Method Practice",
          duration: 25,
          completed: false,
          gap: "Interview Skills",
        },
        {
          id: 9,
          type: "review",
          title: "GraphQL Query Optimization",
          duration: 20,
          completed: false,
          gap: "API Design",
        },
      ],
    },
  ];

  const gapProgress = [
    {
      gap: "Kubernetes",
      progress: 35,
      target: "Week 2",
      priority: "High",
    },
    {
      gap: "GraphQL",
      progress: 60,
      target: "Week 1",
      priority: "Medium",
    },
    {
      gap: "System Design",
      progress: 75,
      target: "Ongoing",
      priority: "High",
    },
    {
      gap: "Microservices",
      progress: 20,
      target: "Week 3",
      priority: "Medium",
    },
  ];

  const filteredPlans = prepPlans.filter(
    (plan) =>
      plan.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      plan.company
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      plan.role
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const currentPlan = dailyPlans[selectedDay - 1];

  const getStatusColor = (status: string) => {
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
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 50) return "text-blue-600";
    if (progress >= 25) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Plans</h1>
          <p className="text-muted-foreground">
            Personalized learning schedules to close your skill
            gaps
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={aiAgentOpen}
            onOpenChange={setAiAgentOpen}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Plan
              </Button>
            </DialogTrigger>
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
                    <span className="font-medium text-primary">
                      AI Assistant
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    I'll create a personalized 14-day
                    preparation plan based on your target job
                    and current skills. Let me gather some
                    information about your goals.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                      placeholder="e.g., Senior Software Engineer"
                      value={newPlanForm.jobTitle}
                      onChange={(e) =>
                        setNewPlanForm({
                          ...newPlanForm,
                          jobTitle: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      placeholder="e.g., Google"
                      value={newPlanForm.company}
                      onChange={(e) =>
                        setNewPlanForm({
                          ...newPlanForm,
                          company: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Interview Date</Label>
                    <Input
                      type="date"
                      value={newPlanForm.targetDate}
                      onChange={(e) =>
                        setNewPlanForm({
                          ...newPlanForm,
                          targetDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select
                      value={newPlanForm.experience}
                      onValueChange={(value: string) =>
                        setNewPlanForm({
                          ...newPlanForm,
                          experience: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">
                          Junior (0-2 years)
                        </SelectItem>
                        <SelectItem value="mid">
                          Mid-level (2-5 years)
                        </SelectItem>
                        <SelectItem value="senior">
                          Senior (5-8 years)
                        </SelectItem>
                        <SelectItem value="lead">
                          Lead (8+ years)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Priority Focus Area</Label>
                  <Select
                    value={newPlanForm.priority}
                    onValueChange={(value: string) =>
                      setNewPlanForm({
                        ...newPlanForm,
                        priority: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="What do you want to focus on most?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coding">
                        Coding & Algorithms
                      </SelectItem>
                      <SelectItem value="system-design">
                        System Design
                      </SelectItem>
                      <SelectItem value="behavioral">
                        Behavioral Interviews
                      </SelectItem>
                      <SelectItem value="technical-skills">
                        Technical Skills
                      </SelectItem>
                      <SelectItem value="comprehensive">
                        Comprehensive Prep
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Known Skill Gaps</Label>
                  <Textarea
                    placeholder="Describe areas you want to improve (e.g., Kubernetes, System Design, GraphQL, etc.)"
                    value={newPlanForm.skillGaps}
                    onChange={(e) =>
                      setNewPlanForm({
                        ...newPlanForm,
                        skillGaps: e.target.value,
                      })
                    }
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setAiAgentOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Placeholder for AI generation
                    setAiAgentOpen(false);
                  }}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Plan
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
          return (
            <div key={plan.id}>
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
                onClick={() =>
                  setSelectedPlan(isSelected ? "" : plan.id)
                }
              >
                <CardContent className="flex flex-wrap items-center gap-6 py-4">
                  <div className="min-w-[240px]">
                    <p className="font-medium leading-tight">
                      {plan.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-3 w-3" />
                      <span>{plan.company}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.role}
                    </p>
                  </div>

                  <div className="flex-1 max-w-[260px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span
                        className={`font-medium ${getProgressColor(plan.progress)}`}
                      >
                        {plan.progress}%
                      </span>
                    </div>
                    <Progress
                      value={plan.progress}
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">
                        Duration
                      </p>
                      <p className="font-medium">
                        {plan.duration}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">
                        Skills
                      </p>
                      <p className="font-medium">
                        {plan.skillsCount}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">
                        Hours
                      </p>
                      <p className="font-medium">
                        {plan.totalHours}h
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">
                        Interview
                      </p>
                      <p className="font-medium">
                        {new Date(
                          plan.targetInterview,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-3">
                    <Badge
                      className={getStatusColor(plan.status)}
                    >
                      {plan.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      {isSelected ? "Hide" : "View"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {isSelected && (
                <div className="mt-3 mb-10">
                  <Card className="mb-4">
                    <CardHeader className="py-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {plan.name}
                          </CardTitle>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {plan.role} at {plan.company}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            className={getStatusColor(
                              plan.status,
                            )}
                          >
                            {plan.status}
                          </Badge>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              Target Interview
                            </p>
                            <p className="font-medium text-sm">
                              {new Date(
                                plan.targetInterview,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Weekly Progress
                            </p>
                            <p className="text-lg font-semibold">
                              {weeklyStats.completedHours}/
                              {weeklyStats.totalHours}h
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Tasks Done
                            </p>
                            <p className="text-lg font-semibold">
                              {weeklyStats.tasksCompleted}/
                              {weeklyStats.totalTasks}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Target className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Completion
                            </p>
                            <p className="text-lg font-semibold">
                              {Math.round(
                                (weeklyStats.tasksCompleted /
                                  weeklyStats.totalTasks) *
                                  100,
                              )}
                              %
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Tabs
                    defaultValue="daily"
                    className="space-y-4"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="daily">
                        Daily Plan
                      </TabsTrigger>
                      <TabsTrigger value="gaps">
                        Gap Progress
                      </TabsTrigger>
                      <TabsTrigger value="resources">
                        Resources
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="daily"
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="h-5 w-5" />
                              Days
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {dailyPlans.map((d) => (
                              <button
                                key={d.day}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDay(d.day);
                                }}
                                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                                  selectedDay === d.day
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "hover:bg-muted"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">
                                    Day {d.day}
                                  </span>
                                  {d.completed && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  )}
                                  {d.current && (
                                    <div className="h-2 w-2 bg-orange-500 rounded-full" />
                                  )}
                                </div>
                                <p className="text-xs opacity-70">
                                  {d.date}
                                </p>
                              </button>
                            ))}
                          </CardContent>
                        </Card>

                        <Card className="lg:col-span-3">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>
                                Day {currentPlan.day} -{" "}
                                {currentPlan.date}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                {currentPlan.current && (
                                  <Badge variant="secondary">
                                    Today
                                  </Badge>
                                )}
                                {currentPlan.completed && (
                                  <Badge
                                    variant="default"
                                    className="bg-green-600"
                                  >
                                    Completed
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {currentPlan.tasks.map((task) => {
                              const getTaskIcon = (
                                type: string,
                              ) => {
                                switch (type) {
                                  case "coding":
                                    return (
                                      <Code className="h-4 w-4" />
                                    );
                                  case "system":
                                    return (
                                      <Target className="h-4 w-4" />
                                    );
                                  case "behavioral":
                                    return (
                                      <Users className="h-4 w-4" />
                                    );
                                  default:
                                    return (
                                      <BookOpen className="h-4 w-4" />
                                    );
                                }
                              };
                              const getTaskColor = (
                                type: string,
                              ) => {
                                switch (type) {
                                  case "coding":
                                    return "bg-blue-100 text-blue-600";
                                  case "system":
                                    return "bg-purple-100 text-purple-600";
                                  case "behavioral":
                                    return "bg-orange-100 text-orange-600";
                                  default:
                                    return "bg-gray-100 text-gray-600";
                                }
                              };
                              return (
                                <div
                                  key={task.id}
                                  className="p-4 border rounded-lg space-y-3"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`p-2 rounded-lg ${getTaskColor(task.type)}`}
                                    >
                                      {getTaskIcon(task.type)}
                                    </div>
                                    <div className="flex-1">
                                      <h4
                                        className={`font-medium ${
                                          task.completed
                                            ? "line-through text-muted-foreground"
                                            : ""
                                        }`}
                                      >
                                        {task.title}
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        {task.duration} minutes
                                        • Closes "{task.gap}"
                                        gap
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {task.completed ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                  {!task.completed && (
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        className="gap-2"
                                      >
                                        <Play className="h-4 w-4" />
                                        Start Task
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                      >
                                        View Resources
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            <div className="pt-4 border-t">
                              <div className="flex items-center justify-between text-sm">
                                <span>Daily Progress</span>
                                <span>
                                  {
                                    currentPlan.tasks.filter(
                                      (t) => t.completed,
                                    ).length
                                  }
                                  /{currentPlan.tasks.length}{" "}
                                  tasks
                                </span>
                              </div>
                              <Progress
                                value={
                                  (currentPlan.tasks.filter(
                                    (t) => t.completed,
                                  ).length /
                                    currentPlan.tasks.length) *
                                  100
                                }
                                className="mt-2"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="gaps"
                      className="space-y-4"
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            Skill Gap Progress
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {gapProgress.map((g, idx) => (
                            <div
                              key={idx}
                              className="space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">
                                    {g.gap}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Target: {g.target}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant={
                                      g.priority === "High"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {g.priority}
                                  </Badge>
                                  <span className="text-sm font-medium">
                                    {g.progress}%
                                  </span>
                                </div>
                              </div>
                              <Progress
                                value={g.progress}
                                className="h-2"
                              />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent
                      value="resources"
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>
                              Coding Practice
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="p-3 border rounded-lg">
                              <h4 className="font-medium">
                                LeetCode Patterns
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Curated problems by pattern
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                              >
                                Open Resource
                              </Button>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <h4 className="font-medium">
                                System Design Primer
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Comprehensive guide
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                              >
                                Open Resource
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle>
                              Learning Materials
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="p-3 border rounded-lg">
                              <h4 className="font-medium">
                                Kubernetes Documentation
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Official K8s docs
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                              >
                                Open Resource
                              </Button>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <h4 className="font-medium">
                                GraphQL Best Practices
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Implementation guide
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                              >
                                Open Resource
                              </Button>
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