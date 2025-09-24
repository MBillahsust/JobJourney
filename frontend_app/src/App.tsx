import React, { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { JDAnalysis } from "./components/JDAnalysis";
import { PrepPlan } from "./components/PrepPlan";
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
];

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "login" | "register" | "app">("home");
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const CurrentComponent =
    screens.find((screen) => screen.id === currentScreen)?.component || Dashboard;

  const handleLogin = (email: string, password: string) => {
    setUser({ email, name: "Demo User" });
    setCurrentView("app");
  };

  const handleRegister = (userData: any) => {
    setUser({
      email: userData.email,
      name: `${userData.firstName} ${userData.lastName}`,
      ...userData,
    });
    setCurrentView("app");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("home");
    setCurrentScreen("dashboard");
  };

  const handleGoToHomePage = () => {
    setCurrentView("home");
  };

  // Home view
  if (currentView === "home") {
    return (
      <HomePage
        onLogin={() => setCurrentView("login")}
        onRegister={() => setCurrentView("register")}
        onLogout={handleLogout}
        user={user}
        onNavigateToFeature={(featureId: string) => {
          // Only special-case is handled INSIDE HomePage for 'home'.
          if (user) {
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
        onRegister={handleRegister}
        onLogin={() => setCurrentView("login")}
      />
    );
  }

  // App view
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 bg-sidebar border-r border-sidebar-border flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-center">
            {sidebarOpen ? (
              <JobJourneyLogo
                size="md"
                showText={true}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            ) : (
              <JobJourneyLogoCompact
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {screens.map((screen) => {
              const Icon = screen.icon;
              const isActive = currentScreen === screen.id;

              return (
                <button
                  key={screen.id}
                  onClick={() => {
                    if (screen.id === "home") {
                      handleGoToHomePage();
                    } else {
                      setCurrentScreen(screen.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {sidebarOpen && <span>{screen.name}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        {sidebarOpen && (
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
                  <span className="text-xs text-primary-foreground font-medium">AS</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate group-hover:underline">
                    Alex Smith
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">Software Engineer</p>
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
