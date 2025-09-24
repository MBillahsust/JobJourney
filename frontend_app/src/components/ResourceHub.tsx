import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  BookOpen,
  Code,
  Target,
  Brain,
  Search,
  Star,
  Clock,
  Users,
  Play,
  CheckCircle2,
  Filter,
  ArrowRight,
} from "lucide-react";

export function ResourceHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const categories = [
    {
      id: "all",
      name: "All Resources",
      icon: BookOpen,
      count: 156,
    },
    {
      id: "cs",
      name: "CS Fundamentals",
      icon: Brain,
      count: 42,
    },
    {
      id: "coding",
      name: "Coding Practice",
      icon: Code,
      count: 68,
    },
    {
      id: "system",
      name: "System Design",
      icon: Target,
      count: 23,
    },
    { id: "ml", name: "ML/AI", icon: Brain, count: 15 },
    {
      id: "behavioral",
      name: "Behavioral",
      icon: Users,
      count: 8,
    },
  ];

  const featuredResources = [
    {
      id: 1,
      title: "LeetCode Patterns Masterclass",
      description:
        "Master the most common coding interview patterns with 50+ practice problems.",
      category: "coding",
      type: "Course",
      duration: "8 hours",
      difficulty: "Intermediate",
      rating: 4.8,
      students: 12500,
      progress: 45,
      image:
        "https://images.unsplash.com/photo-1719400471588-575b23e27bd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b3Jrc3BhY2UlMjBjb2Rpbmd8ZW58MXx8fHwxNzU4NTI2MDAzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 2,
      title: "System Design Interview Guide",
      description:
        "Complete guide to acing system design interviews at top tech companies.",
      category: "system",
      type: "Guide",
      duration: "12 hours",
      difficulty: "Advanced",
      rating: 4.9,
      students: 8300,
      progress: 0,
      image:
        "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbnxlbnwxfHx8fDE3NTg1MDQ5OTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 3,
      title: "Data Structures Deep Dive",
      description:
        "Comprehensive coverage of arrays, trees, graphs, and advanced data structures.",
      category: "cs",
      type: "Course",
      duration: "15 hours",
      difficulty: "Beginner",
      rating: 4.7,
      students: 15200,
      progress: 78,
      image:
        "https://images.unsplash.com/photo-1698047681432-006d2449c631?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyZXN1bWUlMjBkb2N1bWVudHN8ZW58MXx8fHwxNzU4NTY2MDM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  const practiceProblems = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      pattern: "Hash Table",
      completion: true,
      attempts: 2,
      topics: ["Array", "Hash Table"],
    },
    {
      id: 2,
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      pattern: "Sliding Window",
      completion: false,
      attempts: 1,
      topics: ["String", "Sliding Window"],
    },
    {
      id: 3,
      title: "Merge k Sorted Lists",
      difficulty: "Hard",
      pattern: "Divide and Conquer",
      completion: false,
      attempts: 0,
      topics: ["Linked List", "Heap", "Divide and Conquer"],
    },
  ];

  // Learning paths removed

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
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
            Learning Resources
          </h1>
          <p className="text-muted-foreground">
            Curated materials to boost your interview
            preparation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <Play className="h-4 w-4" />
            Continue Learning
          </Button>
        </div>
      </div>

      {/* Search and Categories */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      <Tabs defaultValue="featured" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
        </TabsList>

        {/* Featured Resources */}
        <TabsContent value="featured" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredResources.map((resource) => (
              <Card
                key={resource.id}
                className="overflow-hidden"
              >
                <div className="aspect-video bg-muted relative">
                  <img
                    src={resource.image}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                  {resource.progress > 0 && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <Progress
                        value={resource.progress}
                        className="h-1"
                      />
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {resource.type}
                    </Badge>
                    <Badge
                      className={getDifficultyColor(
                        resource.difficulty,
                      )}
                    >
                      {resource.difficulty}
                    </Badge>
                  </div>

                  <h3 className="font-semibold">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {resource.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{resource.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{resource.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>
                        {resource.students.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full gap-2">
                    {resource.progress > 0 ? (
                      <>
                        <Play className="h-4 w-4" />
                        Continue ({resource.progress}%)
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Start Learning
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* All Resources Grid */}
          <Card>
            <CardHeader>
              <CardTitle>All Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    title: "Binary Trees Complete Guide",
                    type: "Tutorial",
                    duration: "2h",
                    difficulty: "Medium",
                  },
                  {
                    title: "Dynamic Programming Patterns",
                    type: "Course",
                    duration: "6h",
                    difficulty: "Hard",
                  },
                  {
                    title: "REST API Design Best Practices",
                    type: "Article",
                    duration: "30m",
                    difficulty: "Easy",
                  },
                  {
                    title: "Kubernetes for Beginners",
                    type: "Course",
                    duration: "4h",
                    difficulty: "Beginner",
                  },
                  {
                    title: "React Performance Optimization",
                    type: "Tutorial",
                    duration: "1.5h",
                    difficulty: "Advanced",
                  },
                  {
                    title: "Database Indexing Strategies",
                    type: "Guide",
                    duration: "45m",
                    difficulty: "Medium",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{item.type}</span>
                        <span>•</span>
                        <span>{item.duration}</span>
                        <Badge
                          variant="outline"
                          className="ml-2"
                        >
                          {item.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Problems */}
        <TabsContent value="practice" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Coding Challenge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h3 className="font-semibold mb-2">
                    Today's Problem
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Implement a function to find the longest
                    palindromic substring in a given string.
                  </p>
                  <div className="flex gap-2">
                    <Badge
                      className={getDifficultyColor("Medium")}
                    >
                      Medium
                    </Badge>
                    <Badge variant="outline">String</Badge>
                    <Badge variant="outline">
                      Dynamic Programming
                    </Badge>
                  </div>
                  <Button className="w-full mt-3 gap-2">
                    <Code className="h-4 w-4" />
                    Start Solving
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      47
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Solved
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      12
                    </p>
                    <p className="text-sm text-muted-foreground">
                      In Progress
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      7
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Day Streak
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Easy Problems</span>
                    <span>25/50</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Medium Problems</span>
                    <span>18/40</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Hard Problems</span>
                    <span>4/20</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Practice Problems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {practiceProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1 rounded ${problem.completion ? "bg-green-100" : "bg-gray-100"}`}
                      >
                        <CheckCircle2
                          className={`h-4 w-4 ${problem.completion ? "text-green-600" : "text-gray-400"}`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {problem.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getDifficultyColor(
                              problem.difficulty,
                            )}
                          >
                            {problem.difficulty}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {problem.pattern}
                          </span>
                          {problem.attempts > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {problem.attempts} attempt
                              {problem.attempts > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={
                        problem.completion
                          ? "outline"
                          : "default"
                      }
                    >
                      {problem.completion ? "Review" : "Solve"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Removed Learning Paths and Quick Quiz sections */}
      </Tabs>
    </div>
  );
}