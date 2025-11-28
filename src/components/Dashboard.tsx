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
  Bell,
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
import {
  getMe,
  listWorkspaces,
  listNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsRead,
  markNotificationRead,
  getSubscription,
  getUsageStats,
  listInvoices,
  getPaymentMethod,
  getPlans,
  getDashboardOverview,
  type DashboardOverview,
  type NotificationItem,
} from "../lib/api";
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
  const [billingPrefetched, setBillingPrefetched] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [notificationPreview, setNotificationPreview] = useState<NotificationItem | null>(null);

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
        if (wsId) {
          try {
            const unread = await getUnreadNotificationsCount(wsId);
            setUnreadCount(unread?.unread_count ?? 0);
          } catch (err) {
            console.warn("Failed to fetch unread count", err);
          }
        }
      } catch (err) {
        console.error("Failed to load workspaces for notifications", err);
      }
    })();
  }, []);

  // Smooth scrolling to reduce jitter when navigating sections
  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
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
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications read", err);
    }
  };

  const resolveNotificationTarget = (notification: NotificationItem) => {
    if (notification.type === "billing" || notification.message?.toLowerCase().includes("invoice")) {
      return "billing";
    }
    if (notification.type === "call") return "calls";
    if (notification.type === "analytics") return "analytics";
    return null;
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    try {
      await markNotificationRead(notification.id);
      if (workspaceId) await loadNotifications(workspaceId);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotificationPreview(notification);
      const target = resolveNotificationTarget(notification);
      if (target) {
        const shouldNavigate = window.confirm(
          `Open ${target} to view details for "${notification.title}"?`
        );
        if (shouldNavigate) setActivePage(target as any);
      }
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  // Prefetch billing data in the background so the Billing tab opens fast.
  useEffect(() => {
    if (!workspaceId || billingPrefetched) return;
    (async () => {
      try {
        const [subscription, usageStats, invoiceList, pm, planCatalog] = await Promise.all([
          getSubscription(workspaceId),
          getUsageStats(workspaceId).catch(() => []),
          listInvoices(workspaceId).catch(() => []),
          getPaymentMethod(workspaceId).catch(() => null),
          getPlans().catch(() => ({ plans: [] })),
        ]);
        localStorage.setItem(
          "billing_cache",
          JSON.stringify({
            subscription,
            usageStats,
            invoices: invoiceList,
            paymentMethod: pm,
            plans: subscription.available_plans || planCatalog.plans || [],
          })
        );
        setBillingPrefetched(true);
      } catch (err) {
        console.warn("Billing prefetch failed", err);
      }
    })();
  }, [workspaceId, billingPrefetched]);

  useEffect(() => {
    if (!workspaceId || activePage !== "dashboard") return;
    let cancelled = false;
    setDashboardLoading(true);
    setDashboardError(null);
    (async () => {
      try {
        const data = await getDashboardOverview(workspaceId);
        if (!cancelled) setDashboardData(data);
      } catch (err: any) {
        if (!cancelled) setDashboardError(err?.message || "Unable to load dashboard data");
      } finally {
        if (!cancelled) setDashboardLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, activePage]);

  const handleUserUpdate = (updates: Partial<AppUser>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    onLogout();
  };

  const formatNumber = (value?: number | null) => {
    if (value === undefined || value === null) return "--";
    return value.toLocaleString();
  };

  const formatDuration = (seconds?: number | null) => {
    if (seconds === undefined || seconds === null) return "--";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  const sentimentVariant = (sentiment?: string) => {
    if (sentiment === "positive") return "default";
    if (sentiment === "negative") return "destructive";
    return "secondary";
  };

  const stats = dashboardData?.stats;
  const periodLabel = dashboardData ? `Last ${dashboardData.period_days} days` : "Last 30 days";
  const statCards = [
    {
      label: "Active Agents",
      value: formatNumber(stats?.active_agents),
      change: stats ? `${formatNumber(stats.total_calls)} calls ${periodLabel.toLowerCase()}` : "Tracking agents",
      icon: Bot,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Total Calls",
      value: formatNumber(stats?.total_calls),
      change: stats
        ? `${formatNumber(stats.inbound_calls)} inbound / ${formatNumber(stats.outbound_calls)} outbound`
        : periodLabel,
      icon: Phone,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Minutes Used",
      value: stats ? `${Math.round(stats.minutes_used).toLocaleString()} min` : "--",
      change: periodLabel,
      icon: Clock,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Avg Call Duration",
      value: formatDuration(stats?.average_call_duration_seconds),
      change: stats
        ? `Avg handle ${formatDuration(stats.average_handle_time_seconds)}`
        : "Tracking handle time",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
    },
  ];
  const recentCalls = dashboardData?.recent_calls ?? [];
  const activeAgents = dashboardData?.active_agents ?? [];
  const updatedLabel = dashboardData?.updated_at
    ? new Date(dashboardData.updated_at).toLocaleString()
    : null;
  const isStatLoading = dashboardLoading && !dashboardData;

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
                    <Bell className="size-5" />
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
        {notificationPreview && (
          <Card className="mb-4 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-slate-900 font-semibold">{notificationPreview.title}</p>
                  <p className="text-slate-700 text-sm">{notificationPreview.message}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setNotificationPreview(null)}>
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {activePage === "dashboard" && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-slate-900 mb-2">Welcome back, {currentUser.name}!</h1>
                <p className="text-slate-600">
                  {periodLabel} snapshot{updatedLabel ? ` (updated ${updatedLabel})` : ""}
                </p>
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

            {dashboardError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="text-sm text-red-700">
                  {dashboardError}
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat) => (
                <Card
                  key={stat.label}
                  className={`bg-white border-slate-200 hover:shadow-lg transition-shadow cursor-pointer ${
                    isStatLoading ? "animate-pulse" : ""
                  }`}
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
                    <Button variant="outline" size="sm" onClick={() => setActivePage("calls")}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {dashboardLoading && !recentCalls.length && (
                      <p className="text-slate-500 text-sm">Loading recent calls...</p>
                    )}
                    {!dashboardLoading && recentCalls.length === 0 && (
                      <p className="text-slate-500 text-sm">No calls yet. New calls will show here.</p>
                    )}
                    {recentCalls.map((call) => (
                      <div
                        key={call.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                            <Phone className="size-5" />
                          </div>
                          <div>
                            <p className="text-slate-900">
                              {call.caller_name || call.caller_number || "Unknown caller"}
                            </p>
                            <p className="text-slate-600 text-sm">
                              {(call.agent_name || (call.agent_id ? `Agent ${call.agent_id}` : "Unassigned"))} | {formatDuration(call.duration_seconds)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={sentimentVariant(call.sentiment)}>
                            {call.sentiment}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {call.status}
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
                    {dashboardLoading && !activeAgents.length && (
                      <p className="text-slate-500 text-sm">Loading active agents...</p>
                    )}
                    {!dashboardLoading && activeAgents.length === 0 && (
                      <p className="text-slate-500 text-sm">
                        No active agents yet. Launch your first agent to see activity here.
                      </p>
                    )}
                    {activeAgents.map((agent) => (
                      <div
                        key={agent.id}
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
                              {formatNumber(agent.calls)} calls | {agent.language}
                            </p>
                          </div>
                        </div>
                        <Badge className={agent.status === "active" ? "bg-green-500" : "bg-slate-500"}>
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
