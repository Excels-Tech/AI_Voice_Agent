import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useState } from "react";
import { NotificationsPanel } from "./NotificationsPanel";
import { FeaturedAgents } from "./FeaturedAgents";
import { NotificationCenter, Notification } from "./NotificationCenter";
import { NotificationToast } from "./NotificationToast";
import { Button } from "./ui/button";
import { 
  Brain, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Plus,
  Shield,
  CreditCard,
  HelpCircle,
  Code,
  Users,
  Activity,
  Palette,
  Bot,
  Phone,
  Clock,
  TrendingUp,
  PhoneCall,
  Globe,
  BarChart3,
  Zap
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import { AgentBuilder } from "./AgentBuilder";
import { AgentBuilderAdvanced } from "./AgentBuilderAdvanced";
import { AgentList } from "./AgentList";
import { CallLogs } from "./CallLogs";
import { Analytics } from "./Analytics";
import { IntegrationsPage } from "./pages/IntegrationsPage";
import BillingPage from "./BillingPage";
import { PaymentMethodPage } from "./PaymentMethodPage";
import { ProfilePage } from "./ProfilePage";
import { SettingsPage } from "./SettingsPage";
import { SecurityPage } from "./SecurityPage";
import { ApiDocsPage } from "./ApiDocsPage";
import { WorkspaceManagement } from "./WorkspaceManagement";
import { MonitoringPage } from "./MonitoringPage";
import { WhiteLabelPage } from "./WhiteLabelPage";
import { UserMenu } from "./UserMenu";
import { HelpCenterPage } from "./pages/HelpCenterPage";
import { CommunityPage } from "./pages/CommunityPage";
import { APIReferencePage } from "./pages/APIReferencePage";
import { CallSchedulerService } from "./services/CallSchedulerService";
import { ActiveCallInterface } from "./ActiveCallInterface";
import { UpcomingCallsWidget } from "./UpcomingCallsWidget";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useMemo } from "react";

interface DashboardProps {
  user: { name: string; email: string };
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
    | "payment-method"
    | "profile"
    | "settings"
    | "notifications"
    | "security"
    | "help"
    | "api-docs"
    | "api-reference"
    | "community"
    | "workspaces"
    | "monitoring"
    | "whitelabel"
  >("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAgentBuilder, setShowAgentBuilder] = useState(false);
  const [useAdvancedBuilder, setUseAdvancedBuilder] = useState(true); // CallFluent mode
  const [activeCall, setActiveCall] = useState<any>(null);
  const [creatingCall, setCreatingCall] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "call",
      title: "New inbound call received",
      description: "Sales Agent handled call from John Smith - 3:24 duration",
      timestamp: "2 min ago",
      isNew: true,
      icon: "call",
    },
    {
      id: "2",
      type: "agent",
      title: "Agent deployed successfully",
      description: "Support Agent is now live and handling calls",
      timestamp: "15 min ago",
      isNew: true,
      icon: "success",
    },
    {
      id: "3",
      type: "alert",
      title: "Usage alert: 80% of minutes used",
      description: "You've used 4,000 of 5,000 minutes this month",
      timestamp: "1 hour ago",
      isNew: true,
      icon: "warning",
    },
    {
      id: "4",
      type: "recording",
      title: "Call recording available",
      description: "Recording from Sarah Johnson call ready to review",
      timestamp: "2 hours ago",
      isNew: false,
      icon: "recording",
    },
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isNew: false } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isNew: false })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Add new notification when agent is created
  const handleAgentCreated = () => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: "agent",
      title: "Agent deployed successfully",
      description: "Your new agent is now live and handling calls",
      timestamp: "Just now",
      isNew: true,
      icon: "success",
    };
    setNotifications((prev) => [newNotification, ...prev]);
    setShowAgentBuilder(false);
    toast.success("Agent created successfully!");
  };

  // Utility function to add notifications
  const addNotification = (
    type: "call" | "agent" | "alert" | "recording" | "info",
    title: string,
    description: string,
    icon: "call" | "success" | "warning" | "recording"
  ) => {
    const newNotification: Notification = {
      id: Date.now().toString() + Math.random(),
      type,
      title,
      description,
      timestamp: "Just now",
      isNew: true,
      icon,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Test notification button handler
  const handleTestNotification = () => {
    const testNotifications = [
      {
        type: "call" as const,
        title: "New inbound call received",
        description: "Sales Agent handled call from customer - 2:15 duration",
        icon: "call" as const,
      },
      {
        type: "recording" as const,
        title: "Call recording ready",
        description: "New recording available for review",
        icon: "recording" as const,
      },
      {
        type: "alert" as const,
        title: "Usage alert",
        description: "You've used 85% of your monthly minutes",
        icon: "warning" as const,
      },
    ];

    const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];
    addNotification(
      randomNotification.type,
      randomNotification.title,
      randomNotification.description,
      randomNotification.icon
    );
    toast.success("New notification added!");
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    onLogout();
  };

  const startLiveCall = async () => {
    try {
      setCreatingCall(true);
      const base = (import.meta.env.VITE_API_BASE as string | undefined) || "";
      const normalized = base.replace(/\/+$/, "");
      const res = await fetch(`${normalized}/api/calls/sessions/live/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: 1, // default to first agent; backend picks latest if null
          caller_name: user.name,
          caller_number: "N/A",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setActiveCall({
        id: data.call_id,
        name: user.name || "Caller",
        company: "",
        phone: "",
        assignedAgent: { id: data.agent_id, name: "AI Voice Agent", type: "voice" },
        topic: "Live demo call",
        session: data,
      });
    } catch (err: any) {
      console.error("start live call error", err);
      toast.error("Unable to start call", {
        description: err?.message || "Check backend connection",
      });
    } finally {
      setCreatingCall(false);
    }
  };

  if (showAgentBuilder) {
    const BuilderComponent = useAdvancedBuilder ? AgentBuilderAdvanced : AgentBuilder;
    return (
      <BuilderComponent
        onClose={() => setShowAgentBuilder(false)}
        onSave={handleAgentCreated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Call Scheduler Service - Monitors and triggers scheduled calls */}
      <CallSchedulerService
        onCallTriggered={(call) => {
          // Show active call interface
          setActiveCall(call);
          
          // Add notification when call is triggered
          addNotification(
            "call",
            `Scheduled Call Started`,
            `${call.assignedAgent?.name || 'Agent'} is now calling ${call.name}`,
            "call"
          );
        }}
      />

      {/* Active Call Interface */}
      {activeCall && (
        <ActiveCallInterface
          call={activeCall}
          onEndCall={() => {
            setActiveCall(null);
            toast.success('Call ended successfully');
          }}
        />
      )}

      {/* Top Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                  <Brain className="size-6 text-white" />
                </div>
                <span className="text-slate-900 dark:text-white">VoiceAI</span>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant={activePage === "dashboard" ? "default" : "ghost"}
                  onClick={() => setActivePage("dashboard")}
                  className={activePage !== "dashboard" ? "dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800" : ""}
                >
                  Dashboard
                </Button>
                <Button
                  variant={activePage === "agents" ? "default" : "ghost"}
                  onClick={() => setActivePage("agents")}
                  className={activePage !== "agents" ? "dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800" : ""}
                >
                  <Bot className="size-4 mr-2" />
                  Agents
                </Button>
                <Button
                  variant={activePage === "featured" ? "default" : "ghost"}
                  onClick={() => setActivePage("featured")}
                  className={activePage !== "featured" ? "dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800" : ""}
                >
                  <Bot className="size-4 mr-2" />
                  Featured Agents
                </Button>
                <Button
                  variant={activePage === "calls" ? "default" : "ghost"}
                  onClick={() => setActivePage("calls")}
                  className={activePage !== "calls" ? "dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800" : ""}
                >
                  <Phone className="size-4 mr-2" />
                  Call Logs
                </Button>
                <Button
                  variant={activePage === "analytics" ? "default" : "ghost"}
                  onClick={() => setActivePage("analytics")}
                  className={activePage !== "analytics" ? "dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800" : ""}
                >
                  <BarChart3 className="size-4 mr-2" />
                  Analytics
                </Button>
                <Button
                  variant={activePage === "integrations" ? "default" : "ghost"}
                  onClick={() => setActivePage("integrations")}
                  className={activePage !== "integrations" ? "dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800" : ""}
                >
                  <Zap className="size-4 mr-2" />
                  Integrations
                </Button>
                <Button
                  variant={activePage === "billing" ? "default" : "ghost"}
                  onClick={() => setActivePage("billing")}
                  className={activePage !== "billing" ? "dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800" : ""}
                >
                  <CreditCard className="size-4 mr-2" />
                  Billing
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDismiss={handleDismissNotification}
              />
              <ThemeSwitcher />
              <UserMenu
                user={user}
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
                <h1 className="text-slate-900 dark:text-white mb-2">Welcome back, {user.name}!</h1>
                <p className="text-slate-600 dark:text-slate-400">Here's your AI voice agent overview</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="lg"
                  onClick={startLiveCall}
                  disabled={creatingCall}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <PhoneCall className="size-4 mr-2" />
                  {creatingCall ? "Starting..." : "Start Live Call"}
                </Button>
                <Button
                  size="lg"
                  onClick={() => setShowAgentBuilder(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Bot className="size-4 mr-2" />
                  Create New Agent
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Active Agents",
                  value: "8",
                  change: "+2 this month",
                  icon: Bot,
                  bgClass: "bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600",
                },
                {
                  label: "Total Calls",
                  value: "1,247",
                  change: "+156 this week",
                  icon: Phone,
                  bgClass: "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600",
                },
                {
                  label: "Minutes Used",
                  value: "3,842",
                  change: "62% of plan",
                  icon: Clock,
                  bgClass: "bg-gradient-to-br from-fuchsia-500 via-purple-500 to-violet-600",
                },
                {
                  label: "Avg Response Time",
                  value: "0.5s",
                  change: "24% faster",
                  icon: TrendingUp,
                  bgClass: "bg-gradient-to-br from-orange-400 via-orange-500 to-red-500",
                },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className={`${stat.bgClass} border-0 text-white hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 transition-all cursor-pointer`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm`}>
                        <stat.icon className="size-6 text-white" />
                      </div>
                      <TrendingUp className="size-5 text-white/80" />
                    </div>
                    <div className="text-3xl text-white mb-1">{stat.value}</div>
                    <div className="text-white/90 mb-1">{stat.label}</div>
                    <div className="text-white/70 text-sm">{stat.change}</div>
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

            {/* Upcoming Calls Widget */}
            <UpcomingCallsWidget />

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-300 dark:border-slate-700">
                <CardHeader className="border-b border-slate-300 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-900 dark:text-white">Recent Calls</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivePage("calls")}
                      className="border-slate-400 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
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
                        className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                            <Phone className="size-5" />
                          </div>
                          <div>
                            <p className="text-slate-900 dark:text-white">{call.caller}</p>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">
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
                            className={
                              call.sentiment === "positive"
                                ? "bg-green-500"
                                : "bg-slate-500"
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

              <Card className="bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-300 dark:border-slate-700">
                <CardHeader className="border-b border-slate-300 dark:border-slate-700">
                  <CardTitle className="text-slate-900 dark:text-white">Active Agents</CardTitle>
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
                        className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        onClick={() => setActivePage("agents")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                            <Bot className="size-5" />
                          </div>
                          <div>
                            <p className="text-slate-900 dark:text-white">{agent.name}</p>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">
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
            onDeploy={(agent) => {
              toast.success(`${agent.name} deployed to your workspace!`);
              setActivePage("agents");
            }}
          />
        )}
        {activePage === "calls" && <CallLogs />}
        {activePage === "analytics" && <Analytics />}
        {activePage === "integrations" && <IntegrationsPage onBack={() => setActivePage("dashboard")} />}
        {activePage === "billing" && <BillingPage onNavigateToPaymentMethod={() => setActivePage("payment-method")} />}
        {activePage === "payment-method" && <PaymentMethodPage onBack={() => setActivePage("billing")} />}
        {activePage === "profile" && <ProfilePage user={user} />}
        {activePage === "settings" && <SettingsPage user={user} />}
        {activePage === "notifications" && <NotificationsPanel onClose={() => setActivePage("dashboard")} />}
        {activePage === "security" && <SecurityPage />}
        {activePage === "help" && <HelpCenterPage onBack={() => setActivePage("dashboard")} />}
        {activePage === "api-docs" && <ApiDocsPage />}
        {activePage === "api-reference" && <APIReferencePage onBack={() => setActivePage("dashboard")} />}
        {activePage === "community" && <CommunityPage onBack={() => setActivePage("dashboard")} isLoggedIn={true} />}
        {activePage === "workspaces" && <WorkspaceManagement />}
        {activePage === "monitoring" && <MonitoringPage />}
        {activePage === "whitelabel" && <WhiteLabelPage />}
      </main>
    </div>
  );
}
