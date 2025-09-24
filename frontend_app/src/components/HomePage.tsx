import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { JobJourneyLogo, JobJourneyLogoCompact } from './JobJourneyLogo';
import { Footer } from './ui/footer';
import {
  Target,
  Calendar,
  FileText,
  Briefcase,
  User,
  BookOpen,
  Edit3,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Brain,
  Clock,
  PlayCircle,
  Code,
  BookOpenCheck,
  Home as HomeIcon,
  LayoutDashboard,
  Pencil,
  LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HomePageProps {
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  user: { name?: string; email?: string } | null;
  onNavigateToFeature: (featureId: string) => void;
}

export function HomePage({
  onLogin,
  onRegister,
  onLogout,
  user,
  onNavigateToFeature,
}: HomePageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sideMenu = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jd-analysis', label: 'Job Analysis', icon: Target },
    { id: 'prep-plan', label: 'My Plans', icon: Calendar },
    { id: 'written-exam', label: 'Mock Exam', icon: FileText },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'documents', label: 'Documents', icon: Pencil },
  ] as const;

  // Home in sidebar: never redirects to login; just scroll to top
  const handleSideClick = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onNavigateToFeature(id);
  };

  const features = [
    {
      id: 'dashboard',
      icon: BarChart3,
      title: 'Smart Dashboard',
      description:
        'Track your job search progress with comprehensive analytics, success rates, and personalized insights.',
      detailedDescription:
        'Get real-time analytics on your application performance, interview success rates, and personalized recommendations to optimize your job search strategy.',
      color: 'bg-blue-100 text-blue-600',
      stats: '95% accuracy',
      demoSample: 'Interactive dashboard with live metrics',
      benefits: ['Real-time application tracking', 'Success rate analytics', 'Personalized recommendations'],
    },
    {
      id: 'jd-analysis',
      icon: Target,
      title: 'Job Analysis',
      description:
        'AI-powered job description analysis with match scores, gap identification, and skill recommendations.',
      detailedDescription:
        'Upload any job description and get instant AI analysis showing your compatibility score, skill gaps, and specific recommendations to improve your candidacy.',
      color: 'bg-purple-100 text-purple-600',
      stats: '10k+ jobs analyzed',
      demoSample: 'Try with sample Software Engineer JD',
      benefits: ['Instant compatibility scores', 'Skill gap analysis', 'Improvement recommendations'],
    },
    {
      id: 'prep-plan',
      icon: Calendar,
      title: 'Prep Plans',
      description:
        'Personalized preparation schedules (7, 14, 30 days) tailored to your target role and experience level.',
      detailedDescription:
        'Choose from flexible preparation timelines with daily tasks, coding challenges, system design practice, and behavioral interview coaching using the STAR methodology.',
      color: 'bg-green-100 text-green-600',
      stats: 'Flexible timelines',
      demoSample: 'Sample 14-day FAANG prep plan',
      benefits: ['Flexible durations (7/14/30 days)', 'Daily structured tasks', 'STAR methodology coaching'],
    },
    {
      id: 'written-exam',
      icon: FileText,
      title: 'Mock Exams',
      description: 'Practice with JD-aligned written tests, coding challenges, and technical assessments.',
      detailedDescription:
        'Take realistic mock exams tailored to your target job description, including coding problems, system design questions, and behavioral scenarios.',
      color: 'bg-orange-100 text-orange-600',
      stats: '500+ questions',
      demoSample: 'Try sample coding assessment',
      benefits: ['JD-specific questions', 'Real-time feedback', 'Performance analytics'],
    },
    {
      id: 'applications',
      icon: Briefcase,
      title: 'Application Tracker',
      description:
        'Comprehensive application management with status tracking, follow-up reminders, and interview scheduling.',
      detailedDescription:
        'Never lose track of an application again. Manage multiple job applications with automated follow-ups, interview scheduling, and progress tracking.',
      color: 'bg-pink-100 text-pink-600',
      stats: 'Unlimited tracking',
      demoSample: 'Sample application pipeline',
      benefits: ['Automated follow-ups', 'Interview scheduling', 'Progress visualization'],
    },
    {
      id: 'profile',
      icon: User,
      title: 'Profile Builder',
      description: 'Create and optimize your professional profile with AI suggestions and industry best practices.',
      detailedDescription:
        'Build a compelling professional profile with AI-powered suggestions for skills, experience descriptions, and achievements that resonate with recruiters.',
      color: 'bg-indigo-100 text-indigo-600',
      stats: '90% match rate',
      demoSample: 'AI-optimized profile example',
      benefits: ['AI-powered suggestions', 'Industry best practices', 'Recruiter-friendly format'],
    },
    {
      id: 'resources',
      icon: BookOpen,
      title: 'Resource Hub',
      description: 'Access curated learning materials, video tutorials, coding practice, and comprehensive courses.',
      detailedDescription:
        'Comprehensive learning hub with video courses, coding practice platforms, system design resources, and curated content from top industry experts.',
      color: 'bg-teal-100 text-teal-600',
      stats: '1000+ resources',
      demoSample: 'Featured course: System Design Mastery',
      benefits: ['Video tutorials & courses', 'Coding practice platforms', 'Expert-curated content'],
    },
    {
      id: 'documents',
      icon: Edit3,
      title: 'Document Tailoring',
      description: 'AI-powered resume and cover letter optimization for each specific job application.',
      detailedDescription:
        'Automatically tailor your resume and cover letter for each job application using AI that understands ATS systems and recruiter preferences.',
      color: 'bg-red-100 text-red-600',
      stats: 'Auto-optimize',
      demoSample: 'Before/after resume examples',
      benefits: ['ATS-optimized formatting', 'Job-specific tailoring', 'Recruiter-tested templates'],
    },
  ];

  const stats = [
    { number: '50K+', label: 'Users Placed' },
    { number: '95%', label: 'Success Rate' },
    { number: '500+', label: 'Partner Companies' },
    { number: '24/7', label: 'AI Support' },
  ];

  // Per-card animation (no parent stagger) — ensures vertical, one-by-one feel
  const fromLeft = {
    hidden: { opacity: 0, x: -32, scale: 0.98 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 320, damping: 28 },
    },
  };
  const fromRight = {
    hidden: { opacity: 0, x: 32, scale: 0.98 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 320, damping: 28 },
    },
  };

  return (
    <div className="flex h-screen bg-background text-gray-900">
      {/* Sidebar (gray) */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-gray-100 border-r border-gray-300 flex flex-col`}>
        {/* Header: Logo + JobJourney (toggle) */}
        <div
          className="p-4 border-b border-gray-300 cursor-pointer select-none"
          onClick={() => setSidebarOpen((s) => !s)}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <div className="flex items-center gap-3">
            {sidebarOpen ? <JobJourneyLogo size="md" showText={false} /> : <JobJourneyLogoCompact />}
            {sidebarOpen && <span className="text-lg font-semibold">JobJourney</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {sideMenu.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSideClick(item.id)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-200 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Log out (only when logged in) */}
        {user && (
          <div className="p-2 border-t border-gray-300">
            <button
              onClick={() => {
                onLogout();
              }}
              className="
                w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm
                !bg-red-600 !text-white hover:!bg-red-700
                focus:outline-none focus-visible:ring-2 focus-visible:!ring-red-500
              "
            >
              <LogOut className="h-4 w-4" />
              {sidebarOpen && <span>Log out</span>}
            </button>
          </div>
        )}
      </div>

      {/* Main column */}
      <div className="flex-1 overflow-auto">
        {/* Navbar (gray) with subtitle; shows user name OR Login */}
        <nav className="sticky top-0 z-50 border-b border-gray-300 bg-gray-100 w-full">
          <div className="w-full px-8 2xl:px-12">
            <div className="flex h-20 items-center justify-between">
              <div className="flex flex-col leading-tight">
                <span className="text-2xl font-semibold text-gray-900">JobJourney</span>
                <span className="text-sm text-gray-600 -mt-0.5">Your Career Assistant</span>
              </div>

              <div>
                {user ? (
                  <span className="text-sm font-medium text-gray-900">{user.name || user.email}</span>
                ) : (
                  <Button onClick={onLogin} className="bg-gray-900 text-white hover:bg-black px-4 py-2 rounded-md">
                    Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="space-y-8 text-center">
              <div className="space-y-4">
                <Badge className="border border-gray-900 bg-gray-900 px-4 py-2 text-white">
                  <Zap className="mr-2 h-4 w-4" />
                  AI-Powered Career Assistant
                </Badge>
                <h1 className="text-4xl font-bold text-gray-900 md:text-6xl">
                  Your Journey to
                  <br />
                  Dream Job Starts Here
                </h1>
                <p className="mx-auto max-w-3xl text-xl text-gray-600">
                  Land your next role with AI-powered job analysis, personalized prep plans, mock interviews, and
                  comprehensive application tracking. Join 50,000+ professionals who&apos;ve accelerated their careers with
                  JobJourney.
                </p>
              </div>

              {!user && (
                <div className="flex justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={onRegister}
                    aria-label="Join JobJourney"
                    className="group !bg-gradient-to-r !from-gray-900 !via-gray-900 !to-gray-900 text-white font-semibold px-8 rounded-lg ring-2 ring-gray-800/40 hover:ring-black/50 shadow-lg transform-gpu transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.015] hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.55)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-300/50"
                  >
                    Join JobJourney
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Button>
                </div>
              )}

              <div className="mt-16 grid grid-cols-2 gap-8 border-t border-gray-200 pt-16 md:grid-cols-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Everything You Need (vertical one-by-one reveal) */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 space-y-4 text-center">
              <Badge variant="outline" className="px-4 py-2">
                <Brain className="mr-2 h-4 w-4" />
                Complete Platform
              </Badge>
              <h2 className="text-3xl font-bold md:text-4xl">Everything You Need to Land Your Dream Job</h2>
              <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
                From job analysis to interview prep, our comprehensive platform guides you through every step of your job
                search journey.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const variants = index % 2 === 0 ? fromLeft : fromRight;

                return (
                  <motion.div
                    key={feature.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.8 }} // 80% of card must be visible => vertical, one-by-one feeling
                    variants={variants}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  >
                    <Card
                      className="group cursor-pointer border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                      onClick={() => onNavigateToFeature(feature.id)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className={`rounded-xl p-3 ${feature.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {feature.stats}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg transition-colors group-hover:text-primary">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>

                        <div className="rounded-lg border-l-4 border-blue-500 bg-gray-50 p-3">
                          <p className="mb-1 text-xs font-medium text-blue-700">Try it:</p>
                          <p className="text-xs text-gray-600">{feature.demoSample}</p>
                        </div>

                        <div className="space-y-2">
                          {feature.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>

                        {feature.id === 'resources' && (
                          <div className="border-t pt-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                              <PlayCircle className="h-3 w-3" />
                              <span>50+ Video Tutorials</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs font-medium text-green-600">
                              <Code className="h-3 w-3" />
                              <span>LeetCode Premium Access</span>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs font-medium text-purple-600">
                              <BookOpenCheck className="h-3 w-3" />
                              <span>System Design Course</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 space-y-4 text-center">
              <Badge variant="outline" className="px-4 py-2">
                <Clock className="mr-2 h-4 w-4" />
                Simple Process
              </Badge>
              <h2 className="text-3xl font-bold md:text-4xl">Get Started in 3 Simple Steps</h2>
              <p className="text-xl text-muted-foreground">
                Our streamlined process gets you from signup to job offers in record time.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Analyze Job Descriptions',
                  description:
                    'Upload target job descriptions and get AI-powered analysis with match scores and skill gap identification.',
                  icon: Target,
                },
                {
                  step: '02',
                  title: 'Follow Personalized Plans',
                  description:
                    'Choose from 7, 14, or 30-day preparation schedules with daily tasks, coding practice, and interview coaching.',
                  icon: Calendar,
                },
                {
                  step: '03',
                  title: 'Track & Apply',
                  description:
                    'Monitor your applications, take mock exams, and get real-time feedback until you land the job.',
                  icon: TrendingUp,
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="space-y-6 text-center">
                    <div className="relative">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-xl font-bold text-white">
                        {item.step}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-gray-100 bg-white">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

export default HomePage;
