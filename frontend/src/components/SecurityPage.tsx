import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Shield, Lock, Smartphone, Key, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const sessions = [
    {
      id: 1,
      device: "MacBook Pro",
      location: "San Francisco, CA",
      ip: "192.168.1.100",
      lastActive: "Active now",
      current: true,
    },
    {
      id: 2,
      device: "iPhone 14 Pro",
      location: "San Francisco, CA",
      ip: "192.168.1.101",
      lastActive: "2 hours ago",
      current: false,
    },
    {
      id: 3,
      device: "Chrome on Windows",
      location: "New York, NY",
      ip: "74.125.224.72",
      lastActive: "Yesterday",
      current: false,
    },
  ];

  const loginHistory = [
    { date: "Nov 12, 2025 2:30 PM", location: "San Francisco, CA", status: "success" },
    { date: "Nov 11, 2025 9:15 AM", location: "San Francisco, CA", status: "success" },
    { date: "Nov 10, 2025 3:45 PM", location: "San Francisco, CA", status: "success" },
    { date: "Nov 9, 2025 10:20 AM", location: "New York, NY", status: "success" },
    { date: "Nov 8, 2025 8:30 PM", location: "Unknown", status: "failed" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white mb-2">Privacy & Security</h1>
        <p className="text-slate-400">Manage your account security and privacy settings</p>
      </div>

      {/* Security Status */}
      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500 rounded-full shadow-lg shadow-green-500/30">
              <Shield className="size-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-green-400 mb-2">Your account is secure</h3>
              <p className="text-slate-300 mb-4">
                {twoFactorEnabled
                  ? "Two-factor authentication is enabled and your password is strong."
                  : "Enable two-factor authentication for enhanced security."}
              </p>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600 shadow-lg shadow-green-600/30">Strong Password</Badge>
                {twoFactorEnabled ? (
                  <Badge className="bg-blue-600 shadow-lg shadow-blue-600/30">2FA Enabled</Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-800/50 border-slate-700 text-slate-300">2FA Disabled</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="flex items-center gap-2 text-white">
            <Lock className="size-5 text-blue-400" />
            Change Password
          </CardTitle>
          <CardDescription className="text-slate-400">Update your password regularly for better security</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-slate-300">Current Password</Label>
              <Input id="current-password" type="password" placeholder="Enter current password" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-300">New Password</Label>
              <Input id="new-password" type="password" placeholder="Enter new password" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
              <p className="text-slate-500 text-sm">
                Must be at least 8 characters with letters, numbers, and symbols
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-300">Confirm New Password</Label>
              <Input id="confirm-password" type="password" placeholder="Confirm new password" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
            </div>
            <Button
              onClick={() => toast.success("Password updated successfully")}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:shadow-blue-500/30"
            >
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="flex items-center gap-2 text-white">
            <Smartphone className="size-5 text-purple-400" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-slate-400">
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-white mb-2">
                {twoFactorEnabled ? "Two-factor authentication is enabled" : "Enable 2FA"}
              </p>
              <p className="text-slate-400 mb-4">
                {twoFactorEnabled
                  ? "Your account is protected with an additional security layer using your mobile device."
                  : "Protect your account by requiring a verification code in addition to your password."}
              </p>
              {twoFactorEnabled ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setTwoFactorEnabled(false);
                    toast.success("2FA disabled");
                  }}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Disable 2FA
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setTwoFactorEnabled(true);
                    toast.success("2FA enabled successfully");
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  Enable 2FA
                </Button>
              )}
            </div>
            {twoFactorEnabled && (
              <Badge className="bg-green-500 flex items-center gap-1 shadow-lg shadow-green-500/30">
                <CheckCircle2 className="size-3" />
                Active
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="flex items-center gap-2 text-white">
            <Key className="size-5 text-orange-400" />
            API Keys
          </CardTitle>
          <CardDescription className="text-slate-400">Manage your API access keys</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white">Production API Key</p>
                <Badge className="bg-green-500 shadow-lg shadow-green-500/30">Active</Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-slate-400 text-sm">
                  sk_live_••••••••••••••••••••1234
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("API key copied to clipboard")}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Copy
                </Button>
              </div>
              <p className="text-slate-500 text-sm mt-2">Created on Nov 1, 2025</p>
            </div>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
              Generate New API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white">Active Sessions</CardTitle>
          <CardDescription className="text-slate-400">Manage devices where you're currently logged in</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 border border-slate-800 rounded-lg flex items-start justify-between bg-slate-800/50 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-white">{session.device}</p>
                    {session.current && (
                      <Badge className="bg-green-500 shadow-lg shadow-green-500/30">Current Session</Badge>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mb-1">
                    {session.location} • {session.ip}
                  </p>
                  <p className="text-slate-500 text-sm">{session.lastActive}</p>
                </div>
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success("Session terminated")}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white">Login History</CardTitle>
          <CardDescription className="text-slate-400">Recent login activity on your account</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {loginHistory.map((login, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border-b border-slate-800 last:border-b-0">
                <div className="flex items-center gap-3">
                  {login.status === "success" ? (
                    <CheckCircle2 className="size-5 text-green-400" />
                  ) : (
                    <AlertCircle className="size-5 text-red-400" />
                  )}
                  <div>
                    <p className="text-white">{login.date}</p>
                    <p className="text-slate-400 text-sm">{login.location}</p>
                  </div>
                </div>
                <Badge
                  variant={login.status === "success" ? "default" : "destructive"}
                  className={login.status === "success" ? "bg-green-500 shadow-lg shadow-green-500/30" : "bg-red-500 shadow-lg shadow-red-500/30"}
                >
                  {login.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white">Privacy Settings</CardTitle>
          <CardDescription className="text-slate-400">Control your data and privacy preferences</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[
              {
                label: "Data Collection",
                description: "Allow us to collect usage data to improve the service",
              },
              {
                label: "Marketing Emails",
                description: "Receive updates about new features and promotions",
              },
              {
                label: "Third-party Sharing",
                description: "Share data with integrated third-party services",
              },
            ].map((setting) => (
              <label
                key={setting.label}
                className="flex items-center justify-between p-4 border border-slate-800 rounded-lg cursor-pointer bg-slate-800/50 hover:border-slate-700 hover:bg-slate-800 transition-colors"
              >
                <div>
                  <p className="text-white">{setting.label}</p>
                  <p className="text-slate-400 text-sm">{setting.description}</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded accent-blue-500" />
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}