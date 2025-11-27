import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Brain,
  Settings,
  LogOut,
  Phone,
  PhoneCall,
  Bot,
  TrendingUp,
  Clock,
  Users,
  Zap,
  BarChart3,
  Webhook,
  Globe,
  CreditCard,
  Radio,
  Crown,
  Building,
} from "lucide-react";
import { NotificationsPanel } from "./NotificationsPanel";
import { AgentBuilder } from "./AgentBuilder";
import { AgentBuilderAdvanced } from "./AgentBuilderAdvanced";
import { AgentList } from "./AgentList";
import { FeaturedAgents } from "./FeaturedAgents";
import { CallLogs } from "./CallLogs";
import { Analytics } from "./Analytics";
import { Integrations } from "./Integrations";
import { Billing } from "./Billing";
import { UserMenu } from "./UserMenu";
import { ProfilePage } from "./ProfilePage";
import { SettingsPage } from "./SettingsPage";
import { NotificationsPage } from "./NotificationsPage";
import { SecurityPage } from "./SecurityPage";
import { HelpPage } from "./HelpPage";
import { ApiDocsPage } from "./ApiDocsPage";
import { WorkspaceManagement } from "./WorkspaceManagement";
import { RealTimeMonitoring } from "./RealTimeMonitoring";
import { WhiteLabelSettings } from "./WhiteLabelSettings";
import { toast } from "sonner";
import { getMe, listWorkspaces, listNotifications, getUnreadNotificationsCount, markAllNotificationsRead, markNotificationRead } from "../lib/api";
import type { AppUser } from "../types/user";

interface DashboardProps {
  user: AppUser;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activePage, setActivePage] = useState<
    | "dashboard"
    | "agents"
    | "featured"
    | "calls"
    | "analytics"
    | "integrations"
    | "billing"
    | "profile"
    | "settings"
    | "notifications"
    | "security"
    | "help"
    | "api-docs"
    | "workspaces"
    | "monitoring"
    | "whitelabel"
  >("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAgentBuilder, setShowAgentBuilder] = useState(false);
  const [useAdvancedBuilder, setUseAdvancedBuilder] = useState(true); // CallFluent mode
  const [currentUser, setCurrentUser] = useState<AppUser>(user);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMe();
        if (!mounted || !me) return;
        setCurrentUser((prev) => ({
          ...prev,
          name: me.name ?? prev.name,
          email: me.email ?? prev.email,
          avatar_url: me.avatar_url ?? prev.avatar_url,
          phone: me.phone ?? prev.phone,
          company: me.company ?? prev.company,
          job_title: me.job_title ?? prev.job_title ?? me.role ?? prev.job_title,
          location: me.location ?? prev.location,
          bio: me.bio ?? prev.bio,
          language: me.language ?? prev.language,
          timezone: me.timezone ?? prev.timezone,
          date_format: me.date_format ?? prev.date_format,
        }));
      } catch (error) {
        console.error("Failed to refresh user profile", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Resolve workspace id for shared UI (notifications, etc.)
  useEffect(() => {
    (async () => {
      try {
        const workspaces = await listWorkspaces();
        const activeWorkspace = workspaces?.find((w: any) => w.is_active) ?? workspaces?.[0];
        const wsId = activeWorkspace?.id ?? activeWorkspace?.workspace_id;
        if (wsId) setWorkspaceId(wsId);
      } catch (err) {
        console.error("Failed to load workspaces for notifications", err);
      }
    })();
  }, []);

  const loadNotifications = async (wsId: number) => {
    setNotificationsLoading(true);
    try {
      const [items, unread] = await Promise.all([
        listNotifications(wsId),
        getUnreadNotificationsCount(wsId),
      ]);
      setNotifications(items || []);
      setUnreadCount(unread?.unread_count ?? 0);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleOpenNotifications = () => {
    setShowNotifications((prev) => {
      const next = !prev;
      if (next && workspaceId) {
        loadNotifications(workspaceId);
      }
      return next;
    });
  };

  const handleMarkAllNotifications = async () => {
    if (!workspaceId) return;
    try {
      await markAllNotificationsRead(workspaceId);
      await loadNotifications(workspaceId);
    } catch (err) {
      console.error("Failed to mark all notifications read", err);
    }
  };

  const handleNotificationClick = async (id: number) => {
    try {
      await markNotificationRead(id);
      if (workspaceId) await loadNotifications(workspaceId);
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const handleUserUpdate = (updates: Partial<AppUser>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    onLogout();
  };

  if (showAgentBuilder) {
    const BuilderComponent = useAdvancedBuilder ? AgentBuilderAdvanced : AgentBuilder;
    return (
      <BuilderComponent
        onClose={() => setShowAgentBuilder(false)}
        onSave={() => {
          setShowAgentBuilder(false);
          toast.success("Agent created successfully!");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Top Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                  <Brain className="size-6 text-white" />
                </div>
                <span className="text-slate-900">VoiceAI</span>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant={activePage === "dashboard" ? "default" : "ghost"}
                  onClick={() => setActivePage("dashboard")}
                >
                  Dashboard
                </Button>
                <Button
                  variant={activePage === "agents" ? "default" : "ghost"}
                  onClick={() => setActivePage("agents")}
                >
                  <Bot className="size-4 mr-2" />
                  Agents
                </Button>
                <Button
                  variant={activePage === "featured" ? "default" : "ghost"}
                  onClick={() => setActivePage("featured")}
                >
                  <Bot className="size-4 mr-2" />
                  Featured Agents
                </Button>
                <Button
                  variant={activePage === "calls" ? "default" : "ghost"}
                  onClick={() => setActivePage("calls")}
                >
                  <Phone className="size-4 mr-2" />
                  Call Logs
                </Button>
                <Button
                  variant={activePage === "analytics" ? "default" : "ghost"}
                  onClick={() => setActivePage("analytics")}
                >
                  <BarChart3 className="size-4 mr-2" />
                  Analytics
                </Button>
                <Button
                  variant={activePage === "integrations" ? "default" : "ghost"}
                  onClick={() => setActivePage("integrations")}
                >
                  <Zap className="size-4 mr-2" />
                  Integrations
                </Button>
                <Button
                  variant={activePage === "billing" ? "default" : "ghost"}
                  onClick={() => setActivePage("billing")}
                >
                  <CreditCard className="size-4 mr-2" />
                  Billing
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={handleOpenNotifications}
                >
                  <div className="relative">
                    <Phone className="size-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4 px-1 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                </Button>
                {showNotifications && (
                  <NotificationsPanel
                    notifications={notifications}
                    loading={notificationsLoading}
                    onClose={() => setShowNotifications(false)}
                    onMarkAllRead={handleMarkAllNotifications}
                    onMarkOne={handleNotificationClick}
                  />
                )}
              </div>
              <Button variant="ghost" onClick={() => setActivePage("settings")}>
                <Settings className="size-5" />
              </Button>
              <UserMenu
                user={currentUser}
                onNavigate={(page) => setActivePage(page as any)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activePage === "dashboard" && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-slate-900 mb-2">Welcome back, {currentUser.name}!</h1>
                <p className="text-slate-600">Here's your AI voice agent overview</p>
              </div>
              <Button
                size="lg"
                onClick={() => setShowAgentBuilder(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Bot className="size-4 mr-2" />
                Create New Agent
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Active Agents",
                  value: "8",
                  change: "+2 this month",
                  icon: Bot,
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  label: "Total Calls",
                  value: "1,247",
                  change: "+156 this week",
                  icon: Phone,
                  color: "from-green-500 to-emerald-500",
                },
                {
                  label: "Minutes Used",
                  value: "3,842",
                  change: "62% of plan",
                  icon: Clock,
                  color: "from-purple-500 to-pink-500",
                },
                {
                  label: "Avg Response Time",
                  value: "0.5s",
                  change: "24% faster",
                  icon: TrendingUp,
                  color: "from-orange-500 to-red-500",
                },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="bg-white border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                        <stat.icon className="size-5 text-white" />
                      </div>
                      <TrendingUp className="size-4 text-green-500" />
                    </div>
                    <div className="text-3xl text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-slate-600 mb-1">{stat.label}</div>
                    <div className="text-slate-500">{stat.change}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 border-0 text-white hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <PhoneCall className="size-12 text-white mb-4" />
                  <h3 className="text-white mb-2">Inbound Calls</h3>
                  <p className="text-blue-100 mb-4">
                    Receive calls 24/7 with AI agents
                  </p>
                  <Button
                    onClick={() => setShowAgentBuilder(true)}
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    Setup Agent
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0 text-white hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <Phone className="size-12 text-white mb-4" />
                  <h3 className="text-white mb-2">Outbound Calls</h3>
                  <p className="text-purple-100 mb-4">
                    Make automated calls to prospects
                  </p>
                  <Button
                    onClick={() => setActivePage("agents")}
                    className="bg-white text-purple-600 hover:bg-purple-50"
                  >
                    Start Campaign
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-600 to-red-600 border-0 text-white hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <Globe className="size-12 text-white mb-4" />
                  <h3 className="text-white mb-2">Web Widget</h3>
                  <p className="text-orange-100 mb-4">
                    Embed voice AI on your website
                  </p>
                  <Button
                    onClick={() => setActivePage("agents")}
                    className="bg-white text-orange-600 hover:bg-orange-50"
                  >
                    Get Code
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white border-slate-200">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Calls</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivePage("calls")}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {[
                      {
                        caller: "John Smith",
                        agent: "Sales Agent",
                        duration: "3:24",
                        status: "completed",
                        sentiment: "positive",
                      },
                      {
                        caller: "Sarah Johnson",
                        agent: "Support Agent",
                        duration: "5:12",
                        status: "completed",
                        sentiment: "neutral",
                      },
                      {
                        caller: "+1 555 0123",
                        agent: "Lead Agent",
                        duration: "1:45",
                        status: "voicemail",
                        sentiment: "neutral",
                      },
                    ].map((call, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                            <Phone className="size-5" />
                          </div>
                          <div>
                            <p className="text-slate-900">{call.caller}</p>
                            <p className="text-slate-600 text-sm">
                              {call.agent} • {call.duration}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              call.sentiment === "positive"
                                ? "default"
                                : call.sentiment === "neutral"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {call.sentiment}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardHeader className="border-b">
                  <CardTitle>Active Agents</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {[
                      {
                        name: "Sales Agent",
                        calls: 234,
                        status: "active",
                        language: "English (US)",
                      },
                      {
                        name: "Support Agent",
                        calls: 189,
                        status: "active",
                        language: "English (UK)",
                      },
                      {
                        name: "Lead Qualifier",
                        calls: 156,
                        status: "active",
                        language: "Spanish",
                      },
                    ].map((agent) => (
                      <div
                        key={agent.name}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setActivePage("agents")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                            <Bot className="size-5" />
                          </div>
                          <div>
                            <p className="text-slate-900">{agent.name}</p>
                            <p className="text-slate-600 text-sm">
                              {agent.calls} calls • {agent.language}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-500">
                          {agent.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activePage === "agents" && <AgentList onCreateNew={() => setShowAgentBuilder(true)} />}
        {activePage === "featured" && (
          <FeaturedAgents
            onDeploy={() => {
              setActivePage("agents");
            }}
          />
        )}
        {activePage === "calls" && <CallLogs />}
        {activePage === "analytics" && <Analytics />}
        {activePage === "integrations" && <Integrations />}
        {activePage === "billing" && <Billing />}
        {activePage === "profile" && (
          <ProfilePage user={currentUser} onUserUpdate={handleUserUpdate} />
        )}
        {activePage === "settings" && (
          <SettingsPage user={currentUser} onUserUpdate={handleUserUpdate} />
        )}
        {activePage === "notifications" && <NotificationsPage />}
        {activePage === "security" && <SecurityPage />}
        {activePage === "help" && <HelpPage />}
        {activePage === "api-docs" && <ApiDocsPage />}
        {activePage === "workspaces" && <WorkspaceManagement />}
        {activePage === "monitoring" && <RealTimeMonitoring />}
        {activePage === "whitelabel" && <WhiteLabelSettings />}
      </main>
    </div>
  );
}
