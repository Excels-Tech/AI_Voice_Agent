import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Bot,
  Sparkles,
  Crown,
  Zap,
  Phone,
  Video,
  Globe,
  MessageSquare,
  Brain,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Briefcase,
  HeadphonesIcon,
  Calendar,
  ShoppingCart,
  GraduationCap,
  Plus,
  Eye,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface FeaturedAgentsProps {
  onDeploy: (agent: any) => void;
}

export function FeaturedAgents({ onDeploy }: FeaturedAgentsProps) {
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [deployingId, setDeployingId] = useState<string | null>(null);

  const featuredAgents = [
    {
      id: "apex-sales-pro",
      name: "Apex Sales Pro",
      tagline: "Elite sales conversion specialist",
      description: "Our flagship sales agent with 95% conversion rate. Trained on millions of successful sales calls with advanced objection handling and closing techniques.",
      tier: "platinum",
      icon: Crown,
      color: "from-yellow-400 to-orange-500",
      rating: 4.9,
      deployments: 12847,
      features: [
        "Advanced objection handling",
        "Multi-language support (40+ languages)",
        "Real-time sentiment analysis",
        "CRM auto-sync",
        "Meeting integration (Zoom, Meet, Teams)",
        "Intelligent lead scoring",
        "A/B testing capability",
        "Custom pricing negotiation",
      ],
      capabilities: {
        phone: true,
        video: true,
        chat: true,
        meetings: true,
      },
      metrics: {
        avgConversion: "95%",
        avgCallDuration: "6:32",
        customerSatisfaction: "4.9/5",
        responseTime: "0.3s",
      },
      price: "Premium",
    },
    {
      id: "zenith-support",
      name: "Zenith Support Agent",
      tagline: "24/7 customer support excellence",
      description: "World-class support agent providing instant, accurate assistance. Handles complex queries, escalations, and maintains 98% customer satisfaction.",
      tier: "platinum",
      icon: HeadphonesIcon,
      color: "from-blue-400 to-indigo-500",
      rating: 4.8,
      deployments: 18293,
      features: [
        "24/7 availability",
        "Knowledge base integration",
        "Ticket auto-creation",
        "Escalation management",
        "Meeting integration (Zoom, Meet, Teams)",
        "Screen sharing support",
        "Multilingual support (45+ languages)",
        "Emotion detection & empathy",
      ],
      capabilities: {
        phone: true,
        video: true,
        chat: true,
        meetings: true,
      },
      metrics: {
        avgResolution: "92%",
        avgResponseTime: "0.2s",
        customerSatisfaction: "4.8/5",
        escalationRate: "3%",
      },
      price: "Premium",
    },
    {
      id: "quantum-scheduler",
      name: "Quantum Scheduler",
      tagline: "Smart appointment & meeting coordinator",
      description: "AI-powered scheduling agent that integrates with all major calendar platforms. Handles complex scheduling, rescheduling, and meeting coordination seamlessly.",
      tier: "gold",
      icon: Calendar,
      color: "from-purple-400 to-pink-500",
      rating: 4.9,
      deployments: 9432,
      features: [
        "Calendar integration (Google, Outlook, Apple)",
        "Meeting platform integration (Zoom, Meet, Teams, Webex)",
        "Timezone intelligence",
        "Conflict resolution",
        "Automated reminders",
        "No-show reduction (85%)",
        "Group meeting coordination",
        "Video conferencing setup",
      ],
      capabilities: {
        phone: true,
        video: true,
        chat: true,
        meetings: true,
      },
      metrics: {
        bookingSuccess: "97%",
        avgScheduleTime: "45s",
        noShowReduction: "85%",
        customerSatisfaction: "4.9/5",
      },
      price: "Standard",
    },
    {
      id: "nexus-lead-qualifier",
      name: "Nexus Lead Qualifier",
      tagline: "Intelligent lead qualification & routing",
      description: "Advanced AI that qualifies leads with precision, scores them accurately, and routes to the right team member. Increases sales team efficiency by 300%.",
      tier: "gold",
      icon: TrendingUp,
      color: "from-green-400 to-teal-500",
      rating: 4.7,
      deployments: 7821,
      features: [
        "BANT qualification",
        "Lead scoring algorithm",
        "Smart routing",
        "CRM integration",
        "Meeting scheduling",
        "Follow-up automation",
        "Conversation intelligence",
        "Data enrichment",
      ],
      capabilities: {
        phone: true,
        video: false,
        chat: true,
        meetings: true,
      },
      metrics: {
        qualificationAccuracy: "94%",
        timeToQualify: "2:15",
        leadScoreAccuracy: "91%",
        handoffSuccess: "96%",
      },
      price: "Standard",
    },
    {
      id: "maestro-presenter",
      name: "Maestro Presenter",
      tagline: "Professional presentation & demo specialist",
      description: "Elite presentation agent for product demos, webinars, and virtual events. Engages audiences with dynamic content delivery and interactive Q&A.",
      tier: "platinum",
      icon: Users,
      color: "from-red-400 to-pink-500",
      rating: 4.8,
      deployments: 5234,
      features: [
        "Screen sharing capability",
        "Interactive presentations",
        "Real-time Q&A handling",
        "Audience engagement tracking",
        "Meeting integration (Zoom, Meet, Teams, Webex)",
        "Slide synchronization",
        "Poll & survey integration",
        "Multi-presenter coordination",
      ],
      capabilities: {
        phone: true,
        video: true,
        chat: true,
        meetings: true,
      },
      metrics: {
        audienceEngagement: "89%",
        avgPresentationTime: "28min",
        questionHandling: "96%",
        attendeeSatisfaction: "4.8/5",
      },
      price: "Premium",
    },
    {
      id: "commerce-concierge",
      name: "Commerce Concierge",
      tagline: "E-commerce sales & support specialist",
      description: "Sophisticated shopping assistant that guides customers through purchase decisions, handles cart recovery, and provides post-purchase support.",
      tier: "gold",
      icon: ShoppingCart,
      color: "from-orange-400 to-red-500",
      rating: 4.7,
      deployments: 11234,
      features: [
        "Product recommendations",
        "Cart abandonment recovery",
        "Order tracking",
        "Returns & refunds handling",
        "Upsell & cross-sell",
        "Payment assistance",
        "Inventory checking",
        "Promotional campaigns",
      ],
      capabilities: {
        phone: true,
        video: true,
        chat: true,
        meetings: false,
      },
      metrics: {
        cartRecovery: "68%",
        avgOrderValue: "+42%",
        conversionRate: "23%",
        customerSatisfaction: "4.7/5",
      },
      price: "Standard",
    },
    {
      id: "campaign-dialer",
      name: "Campaign Dialer",
      tagline: "CSV-powered outbound call campaigns",
      description: "Specialized outbound dialer that works through CSV contact lists and lets your AI agent handle live conversations at scale.",
      tier: "gold",
      icon: Phone,
      color: "from-emerald-400 to-teal-500",
      rating: 4.8,
      deployments: 4312,
      features: [
        "CSV contact list ingestion",
        "Bulk outbound call queuing",
        "Per-contact call logging",
        "Agent-led conversations",
        "Supports international numbers",
        "Works with your telephony provider",
      ],
      capabilities: {
        phone: true,
        video: false,
        chat: false,
        meetings: false,
      },
      metrics: {
        avgContactsPerCampaign: "250",
        avgConnectionRate: "37%",
        avgHandleTime: "4:15",
        followUpRate: "62%",
      },
      price: "Standard",
    },
  ];

  const deployFeaturedAgent = async (agent: any) => {
    const apiBase =
      (import.meta.env.VITE_API_BASE as string | undefined) || window.location.origin;
    const apiToken = import.meta.env.VITE_API_TOKEN as string | undefined;
    const workspaceId = Number(import.meta.env.VITE_WORKSPACE_ID || 1);

    const base = apiBase.replace(/\/+$/, "");

    try {
      setDeployingId(agent.id);
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (apiToken) {
        headers["Authorization"] = `Bearer ${apiToken}`;
      }

      const response = await fetch(`${base}/api/featured-agents/${agent.id}/deploy`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          workspace_id: workspaceId,
        }),
      });

      if (!response.ok) {
        let message = `Failed to deploy ${agent.name} (HTTP ${response.status})`;
        try {
          const body = await response.json();
          if (body?.detail) {
            message = Array.isArray(body.detail)
              ? body.detail.map((d: any) => d.msg || d).join(", ")
              : body.detail;
          }
        } catch {
          // ignore JSON parse errors; keep default message
        }
        toast.error(message);
        return;
      }

      const createdAgent = await response.json();
      onDeploy(createdAgent);
      toast.success(`${createdAgent.name} deployed to workspace ${createdAgent.workspace_id}`);
    } catch (error: any) {
      toast.error(
        error?.message || `Unexpected error deploying ${agent.name}. Check API base/token.`,
      );
    } finally {
      setDeployingId(null);
    }
  };

  const handleDeploy = (agent: any) => {
    onDeploy(agent);
    toast.success(`${agent.name} deployed successfully! 🚀`);
  };

  const handlePreview = (agent: any) => {
    setSelectedAgent(agent);
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "platinum":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Crown className="size-3 mr-1" />
            PLATINUM
          </Badge>
        );
      case "gold":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            <Star className="size-3 mr-1" />
            GOLD
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="size-8" />
            <h1 className="text-white">Featured AI Voice Agents</h1>
          </div>
          <p className="text-indigo-100 max-w-2xl">
            Deploy our world-class, pre-trained AI voice agents with advanced capabilities.
            Each agent is optimized for specific use cases and comes with meeting integration,
            multilingual support, and premium features.
          </p>
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-5 text-green-300" />
              <span className="text-sm">Meeting Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-5 text-green-300" />
              <span className="text-sm">40+ Languages</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-5 text-green-300" />
              <span className="text-sm">99.9% Uptime</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 opacity-10">
          <Bot className="size-64" />
        </div>
      </div>

      {/* Featured Agents Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredAgents.map((agent) => {
          const IconComponent = agent.icon;
          return (
            <Card
              key={agent.id}
              className="border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-2xl transition-all group flex flex-col"
            >
              <CardHeader className="flex-none">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`size-14 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white shadow-lg shrink-0`}
                  >
                    <IconComponent className="size-7" />
                  </div>
                  <div className="shrink-0">
                    {getTierBadge(agent.tier)}
                  </div>
                </div>
                <CardTitle className="mb-2 dark:text-white min-h-[2rem]">{agent.name}</CardTitle>
                <CardDescription className="text-slate-900 dark:text-slate-300 min-h-[2.5rem]">
                  {agent.tagline}
                </CardDescription>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 line-clamp-3 min-h-[3.75rem]">
                  {agent.description}
                </p>

                {/* Rating & Deployments */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t dark:border-slate-700">
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-yellow-400 text-yellow-400 shrink-0" />
                    <span className="text-sm text-slate-900 dark:text-white">{agent.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <Users className="size-4 shrink-0" />
                    <span className="whitespace-nowrap">{agent.deployments.toLocaleString()} deployments</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Capabilities */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {agent.capabilities.phone && (
                    <Badge variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-300 shrink-0">
                      <Phone className="size-3 mr-1" />
                      Phone
                    </Badge>
                  )}
                  {agent.capabilities.video && (
                    <Badge variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-300 shrink-0">
                      <Video className="size-3 mr-1" />
                      Video
                    </Badge>
                  )}
                  {agent.capabilities.chat && (
                    <Badge variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-300 shrink-0">
                      <MessageSquare className="size-3 mr-1" />
                      Chat
                    </Badge>
                  )}
                  {agent.capabilities.meetings && (
                    <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700 dark:text-green-400 shrink-0">
                      <Zap className="size-3 mr-1 text-green-600 dark:text-green-400" />
                      Meetings
                    </Badge>
                  )}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {Object.entries(agent.metrics).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="min-w-0">
                      <p className="text-xs text-slate-600 dark:text-slate-400 capitalize truncate">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-slate-900 dark:text-white truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePreview(agent)}
                  >
                    <Eye className="size-4 mr-1 shrink-0" />
                    <span>Details</span>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => deployFeaturedAgent(agent)}
                    disabled={deployingId === agent.id}
                  >
                    <Plus className="size-4 mr-1 shrink-0" />
                    <span>Deploy</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <AgentDetailsModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onDeploy={deployFeaturedAgent}
        />
      )}
    </div>
  );
}

function AgentDetailsModal({ agent, onClose, onDeploy }: any) {
  const IconComponent = agent.icon;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-br ${agent.color} p-8 text-white relative overflow-hidden`}>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <IconComponent className="size-9 text-white" />
                </div>
                <div>
                  <h2 className="text-white mb-2">{agent.name}</h2>
                  <p className="text-white/90 text-lg">{agent.tagline}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                ✕
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Star className="size-4 fill-yellow-300 text-yellow-300" />
                <span className="text-sm">{agent.rating} Rating</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Users className="size-4" />
                <span className="text-sm">{agent.deployments.toLocaleString()} Deployments</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-sm">{agent.price}</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 opacity-10">
            <IconComponent className="size-80" />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-slate-900 dark:text-white mb-2">About This Agent</h3>
            <p className="text-slate-600 dark:text-slate-400">{agent.description}</p>
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 className="text-slate-900 dark:text-white mb-4">Performance Metrics</h3>
            <div className="grid md:grid-cols-4 gap-4">
              {Object.entries(agent.metrics).map(([key, value]) => (
                <Card key={key} className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                  <CardContent className="p-4">
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-1 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-slate-900 dark:text-white text-2xl">{value as string}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h3 className="text-slate-900 dark:text-white mb-4">Supported Channels</h3>
            <div className="flex items-center gap-3">
              {agent.capabilities.phone && (
                <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Phone className="size-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-900 dark:text-white">Phone Calls</span>
                </div>
              )}
              {agent.capabilities.video && (
                <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <Video className="size-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-slate-900 dark:text-white">Video Calls</span>
                </div>
              )}
              {agent.capabilities.chat && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <MessageSquare className="size-5 text-green-600 dark:text-green-400" />
                  <span className="text-slate-900 dark:text-white">Chat</span>
                </div>
              )}
              {agent.capabilities.meetings && (
                <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <Zap className="size-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-slate-900 dark:text-white">Meetings</span>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-slate-900 dark:text-white mb-4">Premium Features</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {agent.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Highlight */}
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Video className="size-6" />
                </div>
                <div>
                  <h4 className="text-slate-900 dark:text-white mb-2">Meeting Integration Ready</h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    This agent can seamlessly join Zoom, Google Meet, Microsoft Teams, and Webex
                    meetings to participate in discussions, answer questions, and provide real-time
                    assistance to your clients.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300">Zoom</Badge>
                    <Badge variant="outline" className="bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300">Google Meet</Badge>
                    <Badge variant="outline" className="bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300">Teams</Badge>
                    <Badge variant="outline" className="bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300">Webex</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => {
                onDeploy(agent);
                onClose();
              }}
            >
              <Plus className="size-4 mr-2" />
              Deploy This Agent
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
