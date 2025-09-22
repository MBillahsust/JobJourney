import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  FileText, 
  Mail, 
  Edit3, 
  Download, 
  Copy, 
  Sparkles, 
  CheckCircle2,
  RefreshCw,
  Clock,
  Target,
  User,
  Building
} from 'lucide-react';

export function DocumentTailoring() {
  const [activeTab, setActiveTab] = useState('cover-letter');
  // Removed standalone company selector; now driven purely by analyzed job selection
  const [selectedJobId, setSelectedJobId] = useState('job-1');
  const [jobSearch, setJobSearch] = useState('');

  interface AnalyzedJob {
    id: string;
    company: string;
    role: string;
    location: string;
    match: number;
    seniority: string;
    type: string;
    appliedDate?: string;
  }

  // Mock of jobs coming from Job Analysis feature
  const analyzedJobs: AnalyzedJob[] = [
    { id: 'job-1', company: 'Google', role: 'Senior Software Engineer', location: 'Mountain View, CA', match: 87, seniority: 'Senior', type: 'Full-time', appliedDate: '2024-10-20' },
    { id: 'job-2', company: 'Meta', role: 'Backend Engineer', location: 'Menlo Park, CA', match: 92, seniority: 'Mid/Senior', type: 'Full-time' },
    { id: 'job-3', company: 'Netflix', role: 'Full Stack Engineer', location: 'Los Gatos, CA', match: 78, seniority: 'Senior', type: 'Full-time' },
    { id: 'job-4', company: 'Stripe', role: 'Infrastructure Engineer', location: 'San Francisco, CA', match: 81, seniority: 'Senior', type: 'Hybrid' }
  ];

  const filteredJobs = useMemo(() => {
    const term = jobSearch.toLowerCase();
    return analyzedJobs.filter(j =>
      j.company.toLowerCase().includes(term) ||
      j.role.toLowerCase().includes(term) ||
      j.location.toLowerCase().includes(term)
    );
  }, [jobSearch, analyzedJobs]);

  const selectedJob = useMemo(() =>
    analyzedJobs.find(j => j.id === selectedJobId) || analyzedJobs[0],
  [selectedJobId, analyzedJobs]);
  
  // Removed legacy companies array (duplicate of analyzed jobs)

  const generatedCoverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Software Engineer position at Google. With over 5 years of experience building scalable web applications and a proven track record of leading high-performance teams, I am excited about the opportunity to contribute to Google's mission of organizing the world's information.

In my current role at TechCorp, I have successfully led the development of microservices architecture serving over 10 million users, directly aligning with Google's scale requirements. My experience with Python and distributed systems, combined with my passion for building products that impact billions of users, makes me well-suited for this role.

I am particularly drawn to Google's commitment to innovation and technical excellence. The opportunity to work on cutting-edge problems while mentoring junior developers resonates with my career goals and values.

Thank you for considering my application. I look forward to discussing how my experience and enthusiasm can contribute to Google's continued success.

Best regards,
Alex Smith`;

  const emailTemplate = `Subject: Application for Senior Software Engineer - Alex Smith

Dear Google Recruiting Team,

I hope this email finds you well. I am writing to submit my application for the Senior Software Engineer position (Job ID: SWE-2024-SF-001) that I found on your careers page.

With 5+ years of experience in full-stack development and a strong background in Python, JavaScript, and distributed systems, I believe I would be a valuable addition to your engineering team. My recent work on microservices architecture serving 10M+ users aligns well with Google's technical requirements.

I have attached my resume and cover letter for your review. I would welcome the opportunity to discuss how my experience and passion for technology can contribute to Google's innovative projects.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
Alex Smith
alex.smith@email.com
(555) 123-4567`;

  const resumeBullets = [
    {
      original: "Worked on backend systems using Python and improved performance",
      tailored: "Led development of Python microservices handling 10M+ requests/day, reducing API response time by 40% through optimization and caching strategies",
      improvements: ["Added quantified metrics", "Specified technology stack", "Included performance impact"]
    },
    {
      original: "Built frontend applications with React",
      tailored: "Architected responsive React applications with modern JavaScript (ES6+), implementing real-time data visualization dashboards used by 50+ internal teams",
      improvements: ["Added technical details", "Quantified user impact", "Specified modern practices"]
    },
    {
      original: "Mentored junior developers",
      tailored: "Mentored 3 junior developers through code reviews and pair programming, resulting in 25% faster onboarding and improved code quality metrics",
      improvements: ["Quantified mentoring impact", "Added specific methods", "Included measurable outcomes"]
    }
  ];

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Document Tailoring</h1>
          <p className="text-muted-foreground">Generate tailored resumes, cover letters, and emails for specific roles</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {selectedJob.match}% match
          </Badge>
        </div>
      </div>

      {/* Job Selection (from Job Analysis) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="h-4 w-4" /> Select Target Job
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Search saved job analyses (role, company, location)..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="pl-3"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-auto rounded-md border divide-y">
            {filteredJobs.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">No jobs found. Run a job analysis first.</div>
            )}
            {filteredJobs.map(job => (
              <button
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`w-full text-left p-3 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-muted/60 transition-colors ${selectedJobId === job.id ? 'bg-primary/5 ring-1 ring-primary' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate max-w-[220px]">{job.company}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{job.match}% match</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{job.role} • {job.location}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{job.seniority}</span>
                  <span>{job.type}</span>
                  {job.appliedDate && <span>Applied {new Date(job.appliedDate).toLocaleDateString()}</span>}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job Context (dynamic based on selection) */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{selectedJob.company} - {selectedJob.role}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {selectedJob.location} • {selectedJob.match}% match{selectedJob.appliedDate ? ` • Applied ${new Date(selectedJob.appliedDate).toLocaleDateString()}` : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
          <TabsTrigger value="email">Application Email</TabsTrigger>
          <TabsTrigger value="resume-bullets">Resume Bullets</TabsTrigger>
          <TabsTrigger value="proof-style">Proof & Style</TabsTrigger>
        </TabsList>

        {/* Cover Letter */}
        <TabsContent value="cover-letter" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generated Cover Letter
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Regenerate
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={generatedCoverLetter}
                  className="min-h-[400px] font-serif leading-relaxed"
                  readOnly
                />
                <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                  <span>Word count: 147 (Target: 120-160)</span>
                  <div className="flex gap-4">
                    <span>Generated 2 minutes ago</span>
                    <Badge variant="outline">Ready to send</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customization Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tone</label>
                  <Select defaultValue="professional">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Length</label>
                  <Select defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise (100-120 words)</SelectItem>
                      <SelectItem value="standard">Standard (120-160 words)</SelectItem>
                      <SelectItem value="detailed">Detailed (160-200 words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Focus Areas</label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <label className="text-sm">Technical Skills</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <label className="text-sm">Leadership Experience</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" />
                      <label className="text-sm">Company Culture Fit</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" />
                      <label className="text-sm">Career Growth</label>
                    </div>
                  </div>
                </div>

                <Button className="w-full gap-2">
                  <Sparkles className="h-4 w-4" />
                  Regenerate with Options
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Word
            </Button>
            <Button variant="outline" className="gap-2">
              <Edit3 className="h-4 w-4" />
              Edit Manually
            </Button>
          </div>
        </TabsContent>

        {/* Application Email */}
        <TabsContent value="email" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Application Email
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Regenerate
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={emailTemplate}
                  className="min-h-[350px] font-mono text-sm"
                  readOnly
                />
                <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                  <span>Character count: 847 (Recommended: 800-1200)</span>
                  <Badge variant="outline">Professional tone</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email Type</label>
                  <Select defaultValue="application">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="application">Application</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="thank-you">Thank You</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Recipient</label>
                  <Select defaultValue="recruiter">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recruiter">Recruiting Team</SelectItem>
                      <SelectItem value="hiring-manager">Hiring Manager</SelectItem>
                      <SelectItem value="specific">Specific Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Include Attachments</label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <label className="text-sm">Resume</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <label className="text-sm">Cover Letter</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" />
                      <label className="text-sm">Portfolio</label>
                    </div>
                  </div>
                </div>

                <Button className="w-full gap-2">
                  <Mail className="h-4 w-4" />
                  Open in Email Client
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resume Bullets */}
        <TabsContent value="resume-bullets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tailored Resume Bullets</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enhanced bullets optimized for Google's job requirements
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeBullets.map((bullet, index) => (
                <div key={index} className="space-y-3 p-4 border rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Original:</h4>
                    <p className="text-sm bg-red-50 p-3 rounded border-l-4 border-red-200">
                      {bullet.original}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Tailored:</h4>
                    <p className="text-sm bg-green-50 p-3 rounded border-l-4 border-green-200">
                      {bullet.tailored}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Improvements:</h4>
                    <div className="flex flex-wrap gap-2">
                      {bullet.improvements.map((improvement, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {improvement}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Use This Version
                    </Button>
                    <Button size="sm" variant="outline">
                      Regenerate
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit Manually
                    </Button>
                  </div>
                </div>
              ))}

              <Button className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                Generate More Bullets
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Proof & Style */}
        <TabsContent value="proof-style" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Grammar & Style Check</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Document to Check</label>
                  <Select defaultValue="cover-letter">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover-letter">Cover Letter</SelectItem>
                      <SelectItem value="email">Application Email</SelectItem>
                      <SelectItem value="resume">Resume</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Style Preference</label>
                  <Select defaultValue="american">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="american">American English</SelectItem>
                      <SelectItem value="british">British English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Run Grammar Check
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Style Issues Found</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { type: 'grammar', text: 'Consider changing "I have successfully led" to "I led"', severity: 'low' },
                  { type: 'style', text: 'Replace "very excited" with "enthusiastic"', severity: 'medium' },
                  { type: 'clarity', text: 'The sentence could be more concise', severity: 'low' }
                ].map((issue, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'secondary' : 'outline'}>
                        {issue.type}
                      </Badge>
                      <Badge variant="outline">{issue.severity}</Badge>
                    </div>
                    <p className="text-sm">{issue.text}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Accept</Button>
                      <Button size="sm" variant="outline">Ignore</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}