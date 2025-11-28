import { useEffect, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { getMe, updateMe, uploadAvatar, resolveAssetUrl } from "../lib/api";
import type { AppUser } from "../types/user";

interface SettingsPageProps {
  user: AppUser;
  onUserUpdate?: (user: Partial<AppUser>) => void;
}

export function SettingsPage({ user, onUserUpdate }: SettingsPageProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    timezone: user.timezone ?? "UTC",
    language: user.language ?? "en-US",
    date_format: user.date_format ?? "YYYY-MM-DD",
    avatar_url: user.avatar_url ?? "",
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    callNotifications: true,
    marketingEmails: true,
    weeklyReports: true,
    autoSave: true,
    soundEffects: true,
    compactMode: false,
  });

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: user.name,
      email: user.email,
      phone: user.phone ?? prev.phone,
      timezone: user.timezone ?? prev.timezone,
      language: user.language ?? prev.language,
      date_format: user.date_format ?? prev.date_format,
      avatar_url: user.avatar_url ?? prev.avatar_url,
    }));
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setProfile((p) => ({
          ...p,
          name: me.name ?? p.name,
          email: me.email ?? p.email,
          phone: me.phone ?? p.phone,
          timezone: me.timezone ?? p.timezone,
          language: me.language ?? p.language,
          date_format: me.date_format ?? p.date_format,
          avatar_url: me.avatar_url ?? p.avatar_url,
        }));
      } catch {}
    })();
  }, []);

  const updateSetting = (key: string, value: boolean) => {
    setSettings({ ...settings, [key]: value });
    toast.success("Settings updated");
  };

  const saveProfile = async () => {
    try {
      const payload: any = {
        name: profile.name,
        phone: profile.phone,
        timezone: profile.timezone,
        language: profile.language,
        date_format: profile.date_format,
      };
      await updateMe(payload);
      toast.success("Profile saved");
      onUserUpdate?.({
        name: profile.name,
        phone: profile.phone,
        timezone: profile.timezone,
        language: profile.language,
        date_format: profile.date_format,
      });
    } catch (e: any) {
      toast.error(e?.message || "Failed to save profile");
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-slate-900 mb-2">Account Settings</h1>
        <p className="text-slate-600">Manage your account preferences and settings</p>
      </div>

      {/* Appearance */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-5 text-purple-600" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how VoiceAI looks on your device</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label className="mb-3 block">Theme</Label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setTheme("light");
                    toast.success("Theme changed to Light");
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    theme === "light"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Sun className="size-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-slate-900 text-sm">Light</p>
                </button>
                <button
                  onClick={() => {
                    setTheme("dark");
                    toast.success("Theme changed to Dark");
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    theme === "dark"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Moon className="size-6 mx-auto mb-2 text-indigo-500" />
                  <p className="text-slate-900 text-sm">Dark</p>
                </button>
                <button
                  onClick={() => {
                    setTheme("system");
                    toast.success("Theme changed to System");
                  }}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    theme === "system"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Monitor className="size-6 mx-auto mb-2 text-slate-500" />
                  <p className="text-slate-900 text-sm">System</p>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-slate-900">Compact Mode</p>
                <p className="text-slate-600 text-sm">Use a more condensed layout</p>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSetting("compactMode", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-5 text-orange-600" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-blue-600" />
                <div>
                  <p className="text-slate-900">Email Notifications</p>
                  <p className="text-slate-600 text-sm">Get notified via email</p>
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="size-5 text-green-600" />
                <div>
                  <p className="text-slate-900">SMS Notifications</p>
                  <p className="text-slate-600 text-sm">Receive text message alerts</p>
                </div>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => updateSetting("smsNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="size-5 text-purple-600" />
                <div>
                  <p className="text-slate-900">Call Notifications</p>
                  <p className="text-slate-600 text-sm">Alerts for new calls</p>
                </div>
              </div>
              <Switch
                checked={settings.callNotifications}
                onCheckedChange={(checked) => updateSetting("callNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-orange-600" />
                <div>
                  <p className="text-slate-900">Marketing Emails</p>
                  <p className="text-slate-600 text-sm">Product updates and promotions</p>
                </div>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => updateSetting("marketingEmails", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="size-5 text-cyan-600" />
                <div>
                  <p className="text-slate-900">Weekly Reports</p>
                  <p className="text-slate-600 text-sm">Summary of your activity</p>
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

      {/* Profile & Region */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Globe className="size-5 text-blue-600" />
            Profile & Region
          </CardTitle>
          <CardDescription>Update your profile and preferences (saves to DB)</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Profile Image</Label>
              <div className="flex items-center gap-4">
                <img
                  src={
                    resolveAssetUrl(profile.avatar_url) ||
                    "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(profile.name || profile.email)
                  }
                  alt="Avatar"
                  className="w-16 h-16 rounded-full border object-cover"
                />
                <Input
                  type="file"
                  accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const updated = await uploadAvatar(file);
                    const newAvatar = updated.avatar_url || updated?.avatar_url || "";
                    setProfile((p) => ({ ...p, avatar_url: newAvatar }));
                    onUserUpdate?.({ avatar_url: newAvatar });
                    toast.success("Profile image updated");
                  } catch (err: any) {
                    toast.error(err?.message || "Failed to upload avatar");
                    }
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Display Language</Label>
              <select
                id="language"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={profile.language}
                onChange={(e) => setProfile({ ...profile, language: e.target.value })}
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="zh-CN">Chinese (Simplified)</option>
                <option value="ja-JP">Japanese</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
              >
                <option value="UTC">UTC</option>
                <option value="America/Los_Angeles">America/Los_Angeles (Pacific)</option>
                <option value="America/New_York">America/New_York (Eastern)</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Berlin">Europe/Berlin</option>
                <option value="Asia/Shanghai">Asia/Shanghai</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_format">Date Format</Label>
              <select
                id="date_format"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={profile.date_format}
                onChange={(e) => setProfile({ ...profile, date_format: e.target.value })}
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={saveProfile} className="bg-blue-600 hover:bg-blue-700">Save Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5 text-yellow-600" />
            Advanced Settings
          </CardTitle>
          <CardDescription>Advanced features and preferences</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-slate-900">Auto-save Changes</p>
                <p className="text-slate-600 text-sm">Automatically save your work</p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting("autoSave", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-slate-900">Sound Effects</p>
                <p className="text-slate-600 text-sm">Play sounds for actions</p>
              </div>
              <Switch
                checked={settings.soundEffects}
                onCheckedChange={(checked) => updateSetting("soundEffects", checked)}
              />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="mb-4">
                <p className="text-slate-900 mb-1">Default Call Recording</p>
                <p className="text-slate-600 text-sm">
                  Automatically record all calls for quality assurance
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">Always Record</Button>
                <Button variant="outline">Ask Each Time</Button>
                <Button variant="outline">Never Record</Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="mb-4">
                <p className="text-slate-900 mb-1">Data Retention</p>
                <p className="text-slate-600 text-sm">How long to keep call recordings</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">30 Days</Button>
                <Button variant="outline">90 Days</Button>
                <Button variant="outline">1 Year</Button>
                <Button variant="outline">Forever</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Email */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b">
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
