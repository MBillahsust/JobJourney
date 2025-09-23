import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Separator } from "./ui/separator";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Globe,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";

export function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    deadlines: true,
    progress: true,
    recommendations: false,
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    shareProgress: true,
    dataCollection: true,
  });

  const [theme, setTheme] = useState("system");

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and privacy settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="preferences">
            Preferences
          </TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
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
                    Email Address
                  </label>
                  <Input
                    defaultValue="alex.smith@email.com"
                    type="email"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input defaultValue="(555) 123-4567" />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Location
                  </label>
                  <Input defaultValue="San Francisco, CA" />
                </div>

                <Button className="w-full">Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="Enter current password"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="Enter new password"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Update Password
                </Button>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your
                    account
                  </p>
                  <Button variant="outline" className="w-full">
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Professional Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Current Role
                  </label>
                  <Input defaultValue="Senior Software Engineer" />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Years of Experience
                  </label>
                  <Select defaultValue="5-7">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">
                        0-1 years
                      </SelectItem>
                      <SelectItem value="2-3">
                        2-3 years
                      </SelectItem>
                      <SelectItem value="4-5">
                        4-5 years
                      </SelectItem>
                      <SelectItem value="5-7">
                        5-7 years
                      </SelectItem>
                      <SelectItem value="8+">
                        8+ years
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Target Roles
                </label>
                <Input
                  defaultValue="Software Engineer, Full Stack Developer, Backend Engineer"
                  placeholder="Comma-separated roles"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Preferred Locations
                </label>
                <Input
                  defaultValue="San Francisco, New York, Remote"
                  placeholder="Comma-separated locations"
                />
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
        </TabsContent>

        {/* Notifications */}
        <TabsContent
          value="notifications"
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      Email Notifications
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      Push Notifications
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        push: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      Application Deadlines
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Reminders for upcoming deadlines
                    </p>
                  </div>
                  <Switch
                    checked={notifications.deadlines}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        deadlines: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      Progress Updates
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Weekly progress summaries
                    </p>
                  </div>
                  <Switch
                    checked={notifications.progress}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        progress: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      Job Recommendations
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      New job matches and suggestions
                    </p>
                  </div>
                  <Switch
                    checked={notifications.recommendations}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        recommendations: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">
                  Notification Schedule
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Quiet Hours Start
                    </label>
                    <Select defaultValue="22:00">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20:00">
                          8:00 PM
                        </SelectItem>
                        <SelectItem value="21:00">
                          9:00 PM
                        </SelectItem>
                        <SelectItem value="22:00">
                          10:00 PM
                        </SelectItem>
                        <SelectItem value="23:00">
                          11:00 PM
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Quiet Hours End
                    </label>
                    <Select defaultValue="08:00">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="06:00">
                          6:00 AM
                        </SelectItem>
                        <SelectItem value="07:00">
                          7:00 AM
                        </SelectItem>
                        <SelectItem value="08:00">
                          8:00 AM
                        </SelectItem>
                        <SelectItem value="09:00">
                          9:00 AM
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      Public Profile
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to recruiters
                    </p>
                  </div>
                  <Switch
                    checked={privacy.publicProfile}
                    onCheckedChange={(checked) =>
                      setPrivacy({
                        ...privacy,
                        publicProfile: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      Share Progress
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Allow anonymous progress data sharing
                    </p>
                  </div>
                  <Switch
                    checked={privacy.shareProgress}
                    onCheckedChange={(checked) =>
                      setPrivacy({
                        ...privacy,
                        shareProgress: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      Data Collection
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Help improve our AI recommendations
                    </p>
                  </div>
                  <Switch
                    checked={privacy.dataCollection}
                    onCheckedChange={(checked) =>
                      setPrivacy({
                        ...privacy,
                        dataCollection: checked,
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Data Management</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download My Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Data Processing Activities
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language & Region
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Language
                  </label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        English
                      </SelectItem>
                      <SelectItem value="bn">
                        বাংলা (Bengali)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Timezone
                  </label>
                  <Select defaultValue="pst">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pst">
                        Pacific Standard Time
                      </SelectItem>
                      <SelectItem value="est">
                        Eastern Standard Time
                      </SelectItem>
                      <SelectItem value="cst">
                        Central Standard Time
                      </SelectItem>
                      <SelectItem value="mst">
                        Mountain Standard Time
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Date Format
                  </label>
                  <Select defaultValue="mdy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mdy">
                        MM/DD/YYYY
                      </SelectItem>
                      <SelectItem value="dmy">
                        DD/MM/YYYY
                      </SelectItem>
                      <SelectItem value="ymd">
                        YYYY-MM-DD
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <button
                      onClick={() => setTheme("light")}
                      className={`p-3 border rounded-lg flex flex-col items-center gap-2 ${
                        theme === "light"
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                      <span className="text-xs">Light</span>
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`p-3 border rounded-lg flex flex-col items-center gap-2 ${
                        theme === "dark"
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                      <span className="text-xs">Dark</span>
                    </button>
                    <button
                      onClick={() => setTheme("system")}
                      className={`p-3 border rounded-lg flex flex-col items-center gap-2 ${
                        theme === "system"
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                    >
                      <Monitor className="h-4 w-4" />
                      <span className="text-xs">System</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Compact Mode
                  </label>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing in interface
                    </p>
                    <Switch />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Animation
                  </label>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-muted-foreground">
                      Enable interface animations
                    </p>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Study Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Default Study Session
                  </label>
                  <Select defaultValue="45">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">
                        25 minutes
                      </SelectItem>
                      <SelectItem value="45">
                        45 minutes
                      </SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">
                        1.5 hours
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Break Duration
                  </label>
                  <Select defaultValue="10">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">
                        5 minutes
                      </SelectItem>
                      <SelectItem value="10">
                        10 minutes
                      </SelectItem>
                      <SelectItem value="15">
                        15 minutes
                      </SelectItem>
                      <SelectItem value="20">
                        20 minutes
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    Auto-start Next Task
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically begin next study task
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    Study Reminders
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Daily study session reminders
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download all your data including progress,
                applications, and generated documents.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">
                      Profile & Progress Data
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Personal info, skills, and learning
                      progress
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">
                      Application Data
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Job applications and tracking information
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">
                      Generated Documents
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Cover letters, emails, and tailored
                      resumes
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <Button className="w-full gap-2">
                <Download className="h-4 w-4" />
                Export All Data
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">
                    Clear Learning Data
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Reset all progress, completed tasks, and
                    study history. This cannot be undone.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                  >
                    Clear Learning Data
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium">
                    Delete Account
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all
                    associated data. This action cannot be
                    reversed.
                  </p>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="mt-2 gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}