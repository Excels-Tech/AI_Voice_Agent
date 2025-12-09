import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import {
  Settings,
  Bell,
  Globe,
  Palette,
  Zap,
  Database,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  Lock,
  Shield,
  Key,
  CreditCard,
  Trash2,
  Download,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useTheme } from "./ThemeProvider";

interface SettingsPageProps {
  user: { name: string; email: string };
}

export function SettingsPage({ user }: SettingsPageProps) {
  // Use theme from context instead of local state
  const { theme, setTheme, compactMode, setCompactMode } = useTheme();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    callNotifications: true,
    marketingEmails: true,
    weeklyReports: true,
    autoSave: true,
    soundEffects: true,
    twoFactorAuth: false,
    sessionTimeout: true,
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [callRecording, setCallRecording] = useState("ask");
  const [dataRetention, setDataRetention] = useState("90");

  const updateSetting = (key: string, value: boolean) => {
    setSettings({ ...settings, [key]: value });
    toast.success("Settings updated");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 dark:text-slate-100 mb-2">Account Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your account preferences and settings</p>
      </div>

      {/* Notifications */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b dark:border-slate-700">
          <CardTitle className="flex items-center gap-2 dark:text-slate-100">
            <Bell className="size-5 text-orange-600 dark:text-orange-400" />
            Notification Preferences
          </CardTitle>
          <CardDescription className="dark:text-slate-400">Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-slate-900 dark:text-slate-100">Email Notifications</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Get notified via email</p>
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Smartphone className="size-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-slate-900 dark:text-slate-100">SMS Notifications</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Receive text message alerts</p>
                </div>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => updateSetting("smsNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Bell className="size-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-slate-900 dark:text-slate-100">Call Notifications</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Alerts for new calls</p>
                </div>
              </div>
              <Switch
                checked={settings.callNotifications}
                onCheckedChange={(checked) => updateSetting("callNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-slate-900 dark:text-slate-100">Marketing Emails</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Product updates and promotions</p>
                </div>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => updateSetting("marketingEmails", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Database className="size-5 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <p className="text-slate-900 dark:text-slate-100">Weekly Reports</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Summary of your activity</p>
                </div>
              </div>
              <Switch
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => updateSetting("weeklyReports", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b dark:border-slate-700">
          <CardTitle className="flex items-center gap-2 dark:text-slate-100">
            <Globe className="size-5 text-blue-600 dark:text-blue-400" />
            Language & Region
          </CardTitle>
          <CardDescription className="dark:text-slate-400">Set your language and regional preferences</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language" className="dark:text-slate-100">Display Language</Label>
              <select
                id="language"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                onChange={() => toast.success("Language updated")}
              >
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Chinese</option>
                <option>Japanese</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="dark:text-slate-100">Timezone</Label>
              <select
                id="timezone"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                onChange={() => toast.success("Timezone updated")}
              >
                <option>UTC-8 (Pacific Time)</option>
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC+0 (GMT)</option>
                <option>UTC+1 (CET)</option>
                <option>UTC+8 (CST)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format" className="dark:text-slate-100">Date Format</Label>
              <select
                id="date-format"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                onChange={() => toast.success("Date format updated")}
              >
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-format" className="dark:text-slate-100">Time Format</Label>
              <select
                id="time-format"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                onChange={() => toast.success("Time format updated")}
              >
                <option>12-hour (AM/PM)</option>
                <option>24-hour</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b dark:border-slate-700">
          <CardTitle className="flex items-center gap-2 dark:text-slate-100">
            <Zap className="size-5 text-yellow-600 dark:text-yellow-400" />
            Advanced Settings
          </CardTitle>
          <CardDescription className="dark:text-slate-400">Advanced features and preferences</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700">
              <div>
                <p className="text-slate-900 dark:text-slate-100">Auto-save Changes</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Automatically save your work</p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting("autoSave", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700">
              <div>
                <p className="text-slate-900 dark:text-slate-100">Sound Effects</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Play sounds for actions</p>
              </div>
              <Switch
                checked={settings.soundEffects}
                onCheckedChange={(checked) => updateSetting("soundEffects", checked)}
              />
            </div>

            <div className="p-4 border rounded-lg dark:border-slate-700">
              <div className="mb-4">
                <p className="text-slate-900 dark:text-slate-100 mb-1">Default Call Recording</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Automatically record all calls for quality assurance
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCallRecording("always");
                    toast.success("Call recording set to Always Record");
                  }}
                >
                  Always Record
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCallRecording("ask");
                    toast.success("Call recording set to Ask Each Time");
                  }}
                >
                  Ask Each Time
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCallRecording("never");
                    toast.success("Call recording set to Never Record");
                  }}
                >
                  Never Record
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg dark:border-slate-700">
              <div className="mb-4">
                <p className="text-slate-900 dark:text-slate-100 mb-1">Data Retention</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">How long to keep call recordings</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDataRetention("30");
                    toast.success("Data retention set to 30 Days");
                  }}
                >
                  30 Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDataRetention("90");
                    toast.success("Data retention set to 90 Days");
                  }}
                >
                  90 Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDataRetention("365");
                    toast.success("Data retention set to 1 Year");
                  }}
                >
                  1 Year
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDataRetention("forever");
                    toast.success("Data retention set to Forever");
                  }}
                >
                  Forever
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Privacy */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b dark:border-slate-700">
          <CardTitle className="flex items-center gap-2 dark:text-slate-100">
            <Shield className="size-5 text-green-600 dark:text-green-400" />
            Security & Privacy
          </CardTitle>
          <CardDescription className="dark:text-slate-400">Manage your security settings and privacy options</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Change Password */}
            <div className="p-4 border rounded-lg dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="size-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-slate-900 dark:text-slate-100 mb-1">Change Password</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Update your password regularly for security</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button
                  onClick={() => {
                    if (newPassword === confirmPassword) {
                      toast.success("Password updated successfully");
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    } else {
                      toast.error("Passwords don't match");
                    }
                  }}
                >
                  Update Password
                </Button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Key className="size-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-slate-900 dark:text-slate-100">Two-Factor Authentication</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Add an extra layer of security</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {settings.twoFactorAuth && (
                  <Badge className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
                )}
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => {
                    updateSetting("twoFactorAuth", checked);
                    if (checked) {
                      toast.success("Two-factor authentication enabled");
                    } else {
                      toast.success("Two-factor authentication disabled");
                    }
                  }}
                />
              </div>
            </div>

            {/* Session Timeout */}
            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-slate-900 dark:text-slate-100">Automatic Session Timeout</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Log out after 30 minutes of inactivity</p>
                </div>
              </div>
              <Switch
                checked={settings.sessionTimeout}
                onCheckedChange={(checked) => updateSetting("sessionTimeout", checked)}
              />
            </div>

            {/* Active Sessions */}
            <div className="p-4 border rounded-lg dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-900 dark:text-slate-100 mb-1">Active Sessions</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Manage devices logged into your account</p>
                </div>
                <Button variant="outline" onClick={() => toast.success("All sessions logged out")}>
                  Log Out All Devices
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg dark:bg-slate-700/50">
                  <div className="flex items-center gap-3">
                    <Monitor className="size-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 text-sm">MacBook Pro - Chrome</p>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">New York, US • Last active: Now</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Current
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg dark:bg-slate-700/50">
                  <div className="flex items-center gap-3">
                    <Smartphone className="size-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 text-sm">iPhone 14 - Safari</p>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">New York, US • Last active: 2 hours ago</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Revoke
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Email */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b dark:border-slate-700">
          <CardTitle>Email Address</CardTitle>
          <CardDescription>Update your email address</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4 max-w-2xl">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email} />
            </div>
            <div className="flex items-end">
              <Button onClick={() => toast.success("Email updated successfully")}>
                Update Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="border-b border-red-200">
          <CardTitle className="text-red-900">Danger Zone</CardTitle>
          <CardDescription className="text-red-700">
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white border border-red-200 rounded-lg">
              <div>
                <p className="text-slate-900">Export Account Data</p>
                <p className="text-slate-600 text-sm">
                  Download all your data in JSON format
                </p>
              </div>
              <Button variant="outline" onClick={() => toast.success("Export started...")}>
                Export Data
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white border border-red-200 rounded-lg">
              <div>
                <p className="text-red-900">Delete Account</p>
                <p className="text-red-700 text-sm">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => toast.error("Please contact support to delete your account")}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}