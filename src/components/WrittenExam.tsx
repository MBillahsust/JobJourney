import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Clock, 
  FileText, 
  Play, 
  Target, 
  CheckCircle2,
  AlertCircle,
  Code,
  Database,
  Settings,
  Users,
  Trophy,
  Download
} from 'lucide-react';

export function WrittenExam() {
  const [examMode, setExamMode] = useState<'select' | 'taking' | 'results'>('select');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds

  const examTypes = [
    {
      id: 'quick',
      name: 'Quick Check',
      duration: '15-20 min',
      questions: '8-12 questions',
      description: 'Fast MCQ-only assessment of core skills',
      sections: ['Core CS', 'Role Skills', 'Coding Basics']
    },
    {
      id: 'standard',
      name: 'Standard Assessment',
      duration: '35-45 min',
      questions: '18-25 questions',
      description: 'Comprehensive evaluation (MCQ + written + code/system design as needed)',
      sections: ['Core CS', 'Role Skills', 'SQL', 'Coding', 'System Design']
    }
  ];

  const questionBank = [
    { id: 1, type: 'mcq', section: 'Core CS', question: 'Time complexity of inserting at beginning of dynamic array?', options: ['O(1)','O(log n)','O(n)','O(n^2)'], correct: 'O(n)' },
    { id: 2, type: 'mcq', section: 'Core CS', question: 'Which data structure gives O(1) average lookup?', options: ['Array','Linked List','Hash Map','Binary Tree'], correct: 'Hash Map' },
    { id: 3, type: 'mcq', section: 'SQL', question: 'Which SQL clause filters groups?', options: ['WHERE','GROUP BY','HAVING','ORDER BY'], correct: 'HAVING' },
    { id: 4, type: 'short', section: 'System Design', question: 'Explain difference between horizontal and vertical scaling with one advantage each.', placeholder: 'Your answer here...' },
    { id: 5, type: 'code', section: 'Coding', question: 'Return second largest element in an array.', placeholder: 'function secondLargest(arr){\n  // your code\n}', language: 'javascript' },
    { id: 6, type: 'short', section: 'SQL', question: 'Describe an index and when NOT to use one.', placeholder: 'Your answer...' },
    { id: 7, type: 'mcq', section: 'System Design', question: 'CAP theorem: which can be traded off in network partition?', options: ['Consistency','Availability','Partition Tolerance','Latency'], correct: 'Consistency' },
    { id: 8, type: 'mcq', section: 'Coding', question: 'Output of sorting algorithm stability refers to?', options: ['Time complexity','Keeps equal keys order','Uses less memory','Parallelizable'], correct: 'Keeps equal keys order' }
  ];

  // Sections list for checklist selection
  const allSections = ['Core CS','Role Skills','SQL','Coding','System Design'];
  const [selectedSections, setSelectedSections] = useState<string[]>(['Core CS','Coding']);

  // Determine allowed types based on exam selection
  const allowedTypes = useMemo(() => {
    if (selectedExam === 'quick') return ['mcq'];
    if (selectedExam === 'standard') return ['mcq','short','code'];
    return ['mcq'];
  }, [selectedExam]);

  // Generate questions filtered by sections and type; mimic random selection
  const generatedQuestions = useMemo(() => {
    const pool = questionBank.filter(q => selectedSections.includes(q.section) && allowedTypes.includes(q.type));
    // Simple shuffle
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    // Limit count depending on mode
    const limit = selectedExam === 'quick' ? Math.min(10, shuffled.length) : Math.min(20, shuffled.length);
    return shuffled.slice(0, limit);
  }, [questionBank, selectedSections, allowedTypes, selectedExam]);

  const mockResults = {
    overallScore: 82,
    sections: [
      { name: 'Core CS', score: 85, max: 100, questions: 4 },
      { name: 'System Design', score: 75, max: 100, questions: 3 },
      { name: 'SQL', score: 90, max: 100, questions: 3 },
      { name: 'Coding', score: 80, max: 100, questions: 2 },
    ],
    weakAreas: [
      { area: 'Concurrency', score: 60, recommendation: 'Review threading and synchronization concepts' },
      { area: 'Database Optimization', score: 65, recommendation: 'Practice query optimization and indexing' }
    ],
    strengths: [
      { area: 'Data Structures', score: 95 },
      { area: 'Algorithm Complexity', score: 90 }
    ]
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (examMode === 'results') {
    return (
      <div className="h-full overflow-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Exam Results</h1>
            <p className="text-muted-foreground">Standard Assessment - Google SWE Role</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
            <Button onClick={() => setExamMode('select')}>
              Take Another
            </Button>
          </div>
        </div>

        {/* Overall Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
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
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - mockResults.overallScore / 100)}`}
                      className="text-primary transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{mockResults.overallScore}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Overall Score</p>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Strong Performance</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You performed well above average. Your strongest areas are data structures and algorithm analysis. 
                  Focus on concurrency and database optimization for improvement.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="gap-2">
                    <Target className="h-4 w-4" />
                    Add Gaps to Plan
                  </Button>
                  <Button size="sm" variant="outline">
                    View Resources
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Section Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockResults.sections.map((section, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{section.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{section.questions} questions</span>
                    <Badge variant={section.score >= 80 ? 'default' : section.score >= 70 ? 'secondary' : 'destructive'}>
                      {section.score}%
                    </Badge>
                  </div>
                </div>
                <Progress value={section.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Weak Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockResults.weakAreas.map((area, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{area.area}</span>
                    <Badge variant="destructive">{area.score}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{area.recommendation}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Strong Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockResults.strengths.map((strength, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{strength.area}</span>
                    <Badge variant="default">{strength.score}%</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (examMode === 'taking') {
    const question = generatedQuestions[currentQuestion];
    
    return (
      <div className="h-full overflow-auto p-6 space-y-6">
        {/* Exam Header */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <h2 className="font-semibold">Standard Assessment</h2>
            <p className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {generatedQuestions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
            </div>
            <Button variant="outline" size="sm">
              Pause
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{currentQuestion + 1} / {generatedQuestions.length}</span>
          </div>
          <Progress value={generatedQuestions.length ? ((currentQuestion + 1) / generatedQuestions.length) * 100 : 0} />
        </div>

        {/* Question */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{question.section}</Badge>
              <Badge variant="outline">{question.type.toUpperCase()}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-medium">{question.question}</h3>
            
            {question.type === 'mcq' && question.options && (
              <RadioGroup 
                value={answers[question.id] || ''} 
                onValueChange={(value: string) => setAnswers({...answers, [question.id]: value})}
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {(question.type === 'short' || question.type === 'code') && (
              <Textarea
                placeholder={question.placeholder}
                value={answers[question.id] || ''}
                onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
                className={question.type === 'code' ? 'font-mono text-sm min-h-[200px]' : 'min-h-[100px]'}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline">
              Save & Skip
            </Button>
            {currentQuestion === generatedQuestions.length - 1 ? (
              <Button onClick={() => setExamMode('results')} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Submit Exam
              </Button>
            ) : (
              <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mock Exam</h1>
          <p className="text-muted-foreground">Test your skills with JD-aligned assessments</p>
        </div>
      </div>

      {/* Exam Type Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {examTypes.map((exam) => (
          <Card 
            key={exam.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedExam === exam.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedExam(exam.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{exam.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{exam.duration}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{exam.description}</p>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{exam.questions}</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">SECTIONS:</p>
                <div className="flex flex-wrap gap-1">
                  {exam.sections.map((section, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {section}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role-Specific Options */}
      {selectedExam && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Your Exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Target Role</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="radio" name="role" value="swe" defaultChecked />
                    <Label>Software Engineer (Full Stack)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="role" value="backend" />
                    <Label>Backend Engineer</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="role" value="sre" />
                    <Label>SRE/DevOps</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Experience Level</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="radio" name="level" value="junior" />
                    <Label>Junior (0-2 years)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="level" value="mid" defaultChecked />
                    <Label>Mid (3-5 years)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="level" value="senior" />
                    <Label>Senior (5+ years)</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sections Selection (always shown) */}
            <div>
              <Label className="text-sm font-medium">Select Sections</Label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {allSections.map(section => (
                  <label key={section} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section)}
                      onChange={() => {
                        setSelectedSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
                      }}
                    />
                    <span className="text-sm">{section}</span>
                  </label>
                ))}
              </div>
              {selectedSections.length === 0 && (
                <p className="text-xs text-red-600 mt-1">Select at least one section.</p>
              )}
            </div>

            {/* Question Type Info */}
            <div className="p-3 rounded-md bg-muted/50 text-xs space-y-1 border">
              <p><strong>Mode:</strong> {selectedExam === 'quick' ? 'MCQ Only' : 'Mixed (MCQ + Short + Code)'}</p>
              <p className="text-muted-foreground">Questions will be pulled only from the sections you select above.</p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Estimated time: {examTypes.find(e => e.id === selectedExam)?.duration}
              </div>
              <Button
                disabled={selectedSections.length === 0}
                onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers({});
                  setTimeRemaining(selectedExam === 'quick' ? 20 * 60 : 40 * 60);
                  setExamMode('taking');
                }}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Start Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exam History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: 'Oct 20, 2024', type: 'Standard', role: 'Google SWE', score: 82 },
              { date: 'Oct 18, 2024', type: 'Quick Check', role: 'Meta Backend', score: 76 },
              { date: 'Oct 15, 2024', type: 'Custom', role: 'Netflix SRE', score: 89 }
            ].map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{result.type} - {result.role}</p>
                  <p className="text-sm text-muted-foreground">{result.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={result.score >= 80 ? 'default' : result.score >= 70 ? 'secondary' : 'destructive'}>
                    {result.score}%
                  </Badge>
                  <Button size="sm" variant="outline">
                    View Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}