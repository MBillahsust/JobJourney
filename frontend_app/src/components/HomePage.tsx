import React, { useEffect, useMemo, useRef, useState } from 'react';
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

interface NavUser {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  id?: string;
}

interface HomePageProps {
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  user: NavUser | null; // parent may pass a fresher user object
  onNavigateToFeature: (featureId: string) => void;
}

/**
 * API base (CRA / Vite / window override)
 */
const API_BASE =
  (typeof process !== 'undefined' &&
    (process as any).env &&
    (process as any).env.REACT_APP_API_BASE) ||
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_BASE) ||
  (typeof window !== 'undefined' && (window as any).__API_BASE__) ||
  'http://localhost:4000';

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
};

export function HomePage({
  onLogin,
  onRegister,
  onLogout,
  user,
  onNavigateToFeature,
}: HomePageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [storedUser, setStoredUser] = useState<NavUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // NEW: authReady gates the navbar so we don't flash "Login"
  const [authReady, setAuthReady] = useState(false);

  const refreshTimerRef = useRef<number | null>(null);

  // ---------- localStorage helpers ----------
  const readStoredUser = () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as NavUser;
      return parsed || null;
    } catch {
      return null;
    }
  };

  const persistTokens = (tokens: RefreshResponse) => {
    try {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      const expiresAt = Date.now() + Math.max(tokens.expiresIn - 60, 60) * 1000; // refresh 1 min early
      localStorage.setItem('accessTokenExpiresAt', String(expiresAt));
    } catch {
      // ignore storage issues
    }
  };

  const getAccessExpiry = () => {
    const raw = localStorage.getItem('accessTokenExpiresAt');
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const clearTokens = () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessTokenExpiresAt');
    } catch {}
  };

  const performLocalLogout = () => {
    clearTokens();
    try {
      localStorage.removeItem('user');
    } catch {}
    setStoredUser(null);
    onLogout(); // notify parent
  };

  // ---------- REFRESH TOKEN LOGIC ----------
  const scheduleNextRefresh = (expiresInSeconds?: number) => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    const seconds =
      typeof expiresInSeconds === 'number' && expiresInSeconds > 0
        ? expiresInSeconds
        : 3600;
    const delay = Math.max((seconds - 60) * 1000, 60 * 1000);
    refreshTimerRef.current = window.setTimeout(() => {
      void tryRefresh({ onBoot: false });
    }, delay);
  };

  /**
   * tryRefresh
   * - onBoot=true: be lenient with network errors (do NOT logout on network failure).
   * - Only logout when server definitively rejects (401/expired).
   */
  const tryRefresh = async ({ onBoot }: { onBoot: boolean }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        if (onBoot) setAuthReady(true);
        return;
      }

      const res = await fetch(`${API_BASE}/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        // Server said "no" -> clear session
        performLocalLogout();
        if (onBoot) setAuthReady(true);
        return;
      }

      const data = (await res.json()) as RefreshResponse;
      persistTokens(data);
      scheduleNextRefresh(data.expiresIn);

      // Success -> we are authenticated
      if (onBoot) setAuthReady(true);
    } catch {
      // Network error:
      // On boot, DON'T log out — keep current session optimistic and retry later.
      if (onBoot) setAuthReady(true);
      // optional: schedule a quick retry (e.g., 30s)
      if (!refreshTimerRef.current) {
        refreshTimerRef.current = window.setTimeout(() => {
          void tryRefresh({ onBoot: false });
        }, 30_000);
      }
    }
  };

  // On mount: bootstrap user and decide whether to refresh now or later
  useEffect(() => {
    const u = readStoredUser();
    setStoredUser(u);

    // If we still have a valid or not-near-expiry access token, render immediately
    const expiresAt = getAccessExpiry();
    const msLeft = expiresAt - Date.now();
    const haveAccess = !!localStorage.getItem('accessToken');
    const haveRefresh = !!localStorage.getItem('refreshToken');

    // Consider "near expiry" if < 90s left
    const nearExpiry = msLeft <= 90_000;

    if (haveAccess && !nearExpiry) {
      // Show UI immediately, refresh later as needed
      setAuthReady(true);
      // still schedule next refresh relative to stored expiry if available
      const secondsLeft = Math.max(Math.floor(msLeft / 1000), 60);
      scheduleNextRefresh(secondsLeft);
    } else if (haveRefresh) {
      // Need a refresh now; gate the navbar until this finishes
      void tryRefresh({ onBoot: true });
    } else {
      // No tokens -> unauth
      setAuthReady(true);
    }

    return () => {
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep in sync across tabs/windows
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user') setStoredUser(readStoredUser());
      if (e.key === 'refreshToken' && !e.newValue) performLocalLogout();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefer props.user, then localStorage
  const currentUser = useMemo<NavUser | null>(() => {
    if (user && (user.firstName || user.email || user.name)) return user;
    return storedUser;
  }, [user, storedUser]);

  const displayName = useMemo(() => {
    return currentUser?.firstName || currentUser?.name || currentUser?.email || '';
  }, [currentUser]);

  // ---------- Logout ----------
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch(`${API_BASE}/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      /* ignore */
    } finally {
      performLocalLogout();
      setLoggingOut(false);
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }
  };

  // ---------- UI Data ----------
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

  // Animations
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
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-gray-100 border-r border-gray-300 flex flex-col`}>
        {/* Header: Logo + Toggle */}
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
        {(currentUser) && (
          <div className="p-2 border-t border-gray-300">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="
                w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm
                !bg-red-600 !text-white hover:!bg-red-700 disabled:opacity-70
                focus:outline-none focus-visible:ring-2 focus-visible:!ring-red-500
              "
            >
              <LogOut className="h-4 w-4" />
              {sidebarOpen && <span>{loggingOut ? 'Logging out…' : 'Log out'}</span>}
            </button>
          </div>
        )}
      </div>

      {/* Main column */}
      <div className="flex-1 overflow-auto">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-gray-300 bg-gray-100 w-full">
          <div className="w-full px-8 2xl:px-12">
            <div className="flex h-20 items-center justify-between">
              <div className="flex flex-col leading-tight">
                <span className="text-2xl font-semibold text-gray-900">JobJourney</span>
                <span className="text-sm text-gray-600 -mt-0.5">Your Career Assistant</span>
              </div>

              <div>
                {!authReady ? (
                  /* Tiny placeholder to prevent layout shift / flash */
                  <span className="inline-block h-5 w-20 rounded bg-gray-300 animate-pulse" aria-hidden="true" />
                ) : currentUser ? (
                  <span className="text-sm font-medium text-gray-900">
                    {displayName}
                  </span>
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

              {!currentUser && authReady && (
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

        {/* Everything You Need */}
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
              {[
                {
                  id: 'dashboard',
                  icon: BarChart3,
                  title: 'Smart Dashboard',
                  description:
                    'Track your job search progress with comprehensive analytics, success rates, and personalized insights.',
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
                  color: 'bg-pink-100 text-pink-600',
                  stats: 'Unlimited tracking',
                  demoSample: 'Sample application pipeline',
                  benefits: ['Automated follow-ups', 'Interview scheduling', 'Progress visualization'],
                },
                {
                  id: 'profile',
                  icon: User,
                  title: 'Profile Builder',
                  description:
                    'Create and optimize your professional profile with AI suggestions and industry best practices.',
                  color: 'bg-indigo-100 text-indigo-600',
                  stats: '90% match rate',
                  demoSample: 'AI-optimized profile example',
                  benefits: ['AI-powered suggestions', 'Industry best practices', 'Recruiter-friendly format'],
                },
                {
                  id: 'resources',
                  icon: BookOpen,
                  title: 'Resource Hub',
                  description:
                    'Access curated learning materials, video tutorials, coding practice, and comprehensive courses.',
                  color: 'bg-teal-100 text-teal-600',
                  stats: '1000+ resources',
                  demoSample: 'Featured course: System Design Mastery',
                  benefits: ['Video tutorials & courses', 'Coding practice platforms', 'Expert-curated content'],
                },
                {
                  id: 'documents',
                  icon: Edit3,
                  title: 'Document Tailoring',
                  description:
                    'AI-powered resume and cover letter optimization for each specific job application.',
                  color: 'bg-red-100 text-red-600',
                  stats: 'Auto-optimize',
                  demoSample: 'Before/after resume examples',
                  benefits: ['ATS-optimized formatting', 'Job-specific tailoring', 'Recruiter-tested templates'],
                },
              ].map((feature, index) => {
                const Icon = feature.icon;
                const variants = index % 2 === 0 ? fromLeft : fromRight;
                return (
                  <motion.div
                    key={feature.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.8 }}
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
                          <p className="text-xs text-gray-600"></p>
                        </div>

                        <div className="space-y-2">
                          {feature.benefits.map((benefit: string, i: number) => (
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
