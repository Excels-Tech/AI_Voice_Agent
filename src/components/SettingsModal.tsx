import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { X, User, Bell, Lock, Zap } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import type { AppUser } from "../types/user";

interface SettingsModalProps {
  user: AppUser;
  onClose: () => void;
}

export function SettingsModal({ user, onClose }: SettingsModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative border-b">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="size-4 text-slate-600" />
          </button>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your account and preferences</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">
                <User className="size-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="size-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="integrations">
                <Zap className="size-4 mr-2" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="size-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  >
                    <option>UTC-5 (EST)</option>
                    <option>UTC-8 (PST)</option>
                    <option>UTC+0 (GMT)</option>
                  </select>
                </div>
                <Button onClick={handleSaveProfile} className="w-full">
                  Save Profile
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-slate-900">Email Notifications</p>
                    <p className="text-slate-600 text-sm">Receive meeting summaries via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-slate-900">Slack Notifications</p>
                    <p className="text-slate-600 text-sm">Get alerts in your Slack workspace</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={slackNotifications}
                    onChange={(e) => setSlackNotifications(e.target.checked)}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-slate-900">Desktop Notifications</p>
                    <p className="text-slate-600 text-sm">Browser notifications for live meetings</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <Button onClick={handleSaveNotifications} className="w-full">
                  Save Preferences
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <div className="space-y-4">
                {[
                  {
                    name: "Google Calendar",
                    description: "Sync your meetings automatically",
                    connected: true,
                  },
                  {
                    name: "Slack",
                    description: "Send summaries to your channels",
                    connected: false,
                  },
                  {
                    name: "Jira",
                    description: "Create issues from action items",
                    connected: true,
                  },
                  {
                    name: "Notion",
                    description: "Save meeting notes to Notion",
                    connected: false,
                  },
                ].map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="text-slate-900">{integration.name}</p>
                      <p className="text-slate-600 text-sm">{integration.description}</p>
                    </div>
                    {integration.connected ? (
                      <Button
                        variant="outline"
                        onClick={() => toast.success(`Disconnected from ${integration.name}`)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        onClick={() => toast.success(`Connected to ${integration.name}`)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" placeholder="Confirm new password" />
                </div>
                <Button
                  onClick={() => toast.success("Password updated successfully")}
                  className="w-full"
                >
                  Update Password
                </Button>

                <div className="border-t pt-4 mt-6">
                  <h4 className="text-slate-900 mb-2">Two-Factor Authentication</h4>
                  <p className="text-slate-600 mb-4 text-sm">
                    Add an extra layer of security to your account
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => toast.success("2FA enabled successfully")}
                  >
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
