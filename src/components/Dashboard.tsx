import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Trophy,
  Play
} from 'lucide-react';

export function Dashboard() {
  const todaysTasks = [
    { id: 1, type: 'coding', title: '2-Pointer Technique Practice', time: '30 min', completed: false },
    { id: 2, type: 'system', title: 'Rate Limiter Design', time: '20 min', completed: true },
    { id: 3, type: 'review', title: 'Binary Tree Traversals', time: '15 min', completed: false },
  ];

  const recentMatches = [
    { company: 'Google', role: 'Senior SWE', match: 87, status: 'analyzing' },
    { company: 'Meta', role: 'Backend Engineer', match: 92, status: 'applied' },
    { company: 'Netflix', role: 'Full Stack', match: 78, status: 'saved' },
  ];

  const upcomingDeadlines = [
    { company: 'Google', task: 'Complete Application', date: 'Today', urgent: true },
    { company: 'Stripe', task: 'Phone Interview', date: 'Tomorrow', urgent: false },
    { company: 'Airbnb', task: 'Take Home Test', date: 'Oct 25', urgent: false },
  ];

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Good morning, Alex!</h1>
          <p className="text-muted-foreground">Let's continue your job search journey</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-xl font-semibold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Match Score</p>
                <p className="text-xl font-semibold">84%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Study Hours</p>
                <p className="text-xl font-semibold">47h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Trophy className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Skill Level</p>
                <p className="text-xl font-semibold">Senior</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaysTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`p-1 rounded ${task.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <CheckCircle2 className={`h-4 w-4 ${task.completed ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{task.time}</p>
                </div>
                <Badge variant={task.type === 'coding' ? 'default' : task.type === 'system' ? 'secondary' : 'outline'}>
                  {task.type}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View Full Plan
            </Button>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Coding Practice</span>
                <span>6/7 days</span>
              </div>
              <Progress value={86} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>System Design</span>
                <span>4/5 sessions</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Behavioral Prep</span>
                <span>3/3 stories</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Zap className="h-4 w-4" />
                <span>Great progress this week!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Job Matches */}
        <Card>
          <CardHeader>
            <CardTitle>Top Job Matches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMatches.map((match, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{match.company}</p>
                  <p className="text-sm text-muted-foreground">{match.role}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Badge variant={match.match >= 85 ? 'default' : match.match >= 75 ? 'secondary' : 'outline'}>
                      {match.match}% match
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">{match.status}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Browse More Jobs
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.map((deadline, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={`p-1 rounded ${deadline.urgent ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <AlertCircle className={`h-4 w-4 ${deadline.urgent ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{deadline.company}</p>
                  <p className="text-sm text-muted-foreground">{deadline.task}</p>
                </div>
                <Badge variant={deadline.urgent ? 'destructive' : 'secondary'}>
                  {deadline.date}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Applications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}