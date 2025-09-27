// App.tsx
import React, { useEffect, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { JDAnalysis } from "./components/JDAnalysis";
import PrepPlan from "./components/PrepPlan";
import { WrittenExam } from "./components/WrittenExam";
import { ApplicationTracker } from "./components/ApplicationTracker";
import { ProfileSetup } from "./components/ProfileSetup";
import { ResourceHub } from "./components/ResourceHub";
import { DocumentTailoring } from "./components/DocumentTailoring";
import { Settings } from "./components/Settings";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { JobJourneyLogo, JobJourneyLogoCompact } from "./components/JobJourneyLogo";
import {
  Target,
  Calendar,
  FileText,
  Briefcase,
  User,
  BookOpen,
  Edit3,
  LogOut,
  Settings as SettingsIcon,
  ChevronDown,
  House,
  LayoutDashboard,
} from "lucide-react";

type NavUser = {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
};

type View = "home" | "login" | "register" | "app";

const screens = [
  { id: "home", name: "Home", icon: House, component: null },
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, component: Dashboard },
  { id: "jd-analysis", name: "Job Analysis", icon: Target, component: JDAnalysis },
  { id: "prep-plan", name: "My Plans", icon: Calendar, component: PrepPlan },
  { id: "written-exam", name: "Mock Exam", icon: FileText, component: WrittenExam },
  { id: "applications", name: "Applications", icon: Briefcase, component: ApplicationTracker },
  { id: "profile", name: "Profile", icon: User, component: ProfileSetup },
  { id: "resources", name: "Resources", icon: BookOpen, component: ResourceHub },
  { id: "documents", name: "Documents", icon: Edit3, component: DocumentTailoring },
] as const;

const LS_KEYS = {
  USER: "user",
  VIEW: "app.currentView",
  SCREEN: "app.currentScreen",
  SIDEBAR: "app.sidebarOpen",
} as const;

const isAuthenticated = () =>
  !!localStorage.getItem("accessToken") || !!localStorage.getItem("refreshToken");

const readUser = (): NavUser | null => {
  try {
    const raw = localStorage.getItem(LS_KEYS.USER);
    return raw ? (JSON.parse(raw) as NavUser) : null;
  } catch {
    return null;
  }
};

const validScreenOrDefault = (id: string | null): string => {
  if (!id) return "dashboard";
  return screens.some((s) => s.id === id) ? id : "dashboard";
};

// Synchronous bootstrap to avoid any “home” flash
const getInitialState = () => {
  const savedView = (localStorage.getItem(LS_KEYS.VIEW) as View | null) || "home";
  const savedScreen = validScreenOrDefault(localStorage.getItem(LS_KEYS.SCREEN));
  const savedSidebar = localStorage.getItem(LS_KEYS.SIDEBAR);
  const sidebarOpen = savedSidebar === null ? true : savedSidebar === "true";
  const user = readUser();

  // If last view was "app" but no tokens, show "home"
  const view: View = savedView === "app" && !isAuthenticated() ? "home" : savedView;

  // If we render app initially, ensure a valid screen
  const screen = savedScreen;

  return { view, screen, sidebarOpen, user };
};

export default function App() {
  // Initialize directly from localStorage to prevent flicker
  const [{ view, screen, sidebarOpen, user: bootUser }] = useState(getInitialState);

  const [currentView, setCurrentView] = useState<View>(view);
  const [currentScreen, setCurrentScreen] = useState<string>(screen);
  const [sidebarOpenState, setSidebarOpenState] = useState<boolean>(sidebarOpen);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [user, setUser] = useState<NavUser | null>(bootUser);

  const CurrentComponent =
    screens.find((s) => s.id === currentScreen)?.component || Dashboard;

  // Persist changes
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.VIEW, currentView);
    } catch {}
  }, [currentView]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.SCREEN, currentScreen);
    } catch {}
  }, [currentScreen]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.SIDEBAR, String(sidebarOpenState));
    } catch {}
  }, [sidebarOpenState]);

  // Auth handlers
  const handleLogin = (_email: string, _password: string) => {
    setUser(readUser());
    setCurrentView("home");
    setCurrentScreen("dashboard");
  };

  const handleRegister = (_payload: any) => {
    // Ensure registration lands on the Login page.
    // Also clear any tokens/user localStorage that your register flow may have set.
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessTokenExpiresAt");
      localStorage.removeItem(LS_KEYS.USER);
    } catch {}
    setUser(null);
    setCurrentView("login");
    setCurrentScreen("dashboard");
  };

  const handleLogout = () => {
    // Clear auth tokens and user so UI switches to unauthenticated state
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessTokenExpiresAt");
      localStorage.removeItem(LS_KEYS.USER);
      // Proactively set view/screen so Home renders immediately without relying on effects
      localStorage.setItem(LS_KEYS.VIEW, "home");
      localStorage.setItem(LS_KEYS.SCREEN, "dashboard");
    } catch {}

    setUser(null);
    setCurrentView("home");
    setCurrentScreen("dashboard");
  };

  const handleGoToHomePage = () => setCurrentView("home");

  // -------- Views --------
  if (currentView === "home") {
    return (
      <HomePage
        onLogin={() => setCurrentView("login")}
        onRegister={() => setCurrentView("register")}
        onLogout={handleLogout}
        user={user}
        onNavigateToFeature={(featureId: string) => {
          if (user || isAuthenticated()) {
            setCurrentView("app");
            setCurrentScreen(featureId);
          } else {
            setCurrentView("login");
          }
        }}
      />
    );
  }

  if (currentView === "login") {
    return (
      <LoginPage
        onBack={() => setCurrentView("home")}
        onLogin={handleLogin}
        onRegister={() => setCurrentView("register")}
      />
    );
  }

  if (currentView === "register") {
    return (
      <RegisterPage
        onBack={() => setCurrentView("home")}
        onRegister={handleRegister} // <- after success goes to Login
        onLogin={() => setCurrentView("login")}
      />
    );
  }

  // -------- App (feature screens) --------
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpenState ? "w-64" : "w-16"
        } transition-all duration-300 bg-sidebar border-r border-sidebar-border flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-center">
            {sidebarOpenState ? (
              <JobJourneyLogo
                size="md"
                showText={true}
                onClick={() => setSidebarOpenState((s) => !s)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            ) : (
              <JobJourneyLogoCompact
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSidebarOpenState((s) => !s)}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {screens.map((s) => {
              const Icon = s.icon;
              const isActive = currentScreen === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    if (s.id === "home") {
                      handleGoToHomePage();
                    } else {
                      setCurrentView("app"); // ensure mode
                      setCurrentScreen(s.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {sidebarOpenState && <span>{s.name}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Profile (no subtitle) */}
        {sidebarOpenState && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex w-full items-center gap-3 group rounded-md px-2 py-2 hover:bg-sidebar-accent/50 transition-colors"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                title="Open profile menu"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs text-primary-foreground font-medium">
                    {(user?.firstName || user?.name || user?.email || "U")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.firstName || user?.name || user?.email || "User"}
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-sidebar-foreground/60 transition-transform ml-auto ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {profileOpen && (
                <div
                  className="mt-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 backdrop-blur p-1 shadow-lg animate-in fade-in slide-in-from-bottom-1"
                  role="menu"
                  aria-label="Profile menu"
                >
                  <button
                    onClick={() => {
                      setCurrentScreen("settings");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
                  >
                    <SettingsIcon className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {currentScreen === "settings" ? <Settings /> : <CurrentComponent />}
      </div>
    </div>
  );
}
