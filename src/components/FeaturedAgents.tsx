import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Bot,
  Sparkles,
  Crown,
  Zap,
  Phone,
  Video,
  MessageSquare,
  CheckCircle,
  Star,
  Users,
  Calendar,
  ShoppingCart,
  GraduationCap,
  Plus,
  Eye,
  X,
  HeadphonesIcon,
} from "lucide-react";
import { toast } from "sonner";
import { createAgent, listWorkspaces, updateAgent } from "../lib/api";

interface FeaturedAgentsProps {
  onDeploy?: (template: FeaturedAgent, createdAgent?: any) => void;
}

type AgentTemplateConfig = {
  agent_type: string;
  voice: string;
  language: string;
  model: string;
  script_summary: string;
  goal: string;
  deployment_channels: string[];
  voice_settings: Record<string, any>;
  llm_settings: Record<string, any>;
  capabilities: Record<string, any>;
  personality: Record<string, any>;
  status?: string;
};

type FeaturedAgent = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tier: "platinum" | "gold";
  icon: any;
  color: string;
  rating: number;
  deployments: number;
  features: string[];
  capabilities: {
    phone: boolean;
    video: boolean;
    chat: boolean;
    meetings: boolean;
  };
  metrics: Record<string, string>;
  price: string;
  template: AgentTemplateConfig;
};

const FEATURED_AGENTS: FeaturedAgent[] = [
  {
    id: "apex-sales-pro",
    name: "Apex Sales Pro",
    tagline: "Elite sales conversion specialist",
    description:
      "Our flagship sales agent with 95% conversion rate. Trained on millions of successful sales calls with advanced objection handling and closing techniques.",
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
    template: {
      agent_type: "sales",
      voice: "Nova",
      language: "en-US",
      model: "gpt-4",
      script_summary:
        "Confident enterprise sales specialist focused on needs discovery, ROI storytelling, and next-step commitments.",
      goal: "Convert qualified leads into booked demos or signed contracts with premium positioning.",
      deployment_channels: ["phone", "video", "chat"],
      voice_settings: { tone: "confident", pace: "dynamic", energy: "high" },
      llm_settings: { temperature: 0.3, top_p: 0.9, memory_window: 12 },
      capabilities: {
        objectionHandling: true,
        pricingNegotiation: true,
        crmSync: true,
        meetingIntegration: true,
      },
      personality: {
        traits: ["consultative", "strategic", "data-backed"],
        closingStyle: "assumptive-close",
      },
      status: "active",
    },
  },
  {
    id: "zenith-support",
    name: "Zenith Support Agent",
    tagline: "24/7 customer support excellence",
    description:
      "World-class support agent providing instant, accurate assistance. Handles complex queries, escalations, and maintains 98% customer satisfaction.",
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
    template: {
      agent_type: "support",
      voice: "Alloy",
      language: "en-US",
      model: "gpt-4",
      script_summary:
        "Empathetic tier-2 support agent that triages, troubleshoots, and resolves complex product cases.",
      goal: "Deliver instant, accurate answers while reducing escalations and maintaining CSAT > 4.8.",
      deployment_channels: ["phone", "video", "chat"],
      voice_settings: { tone: "calm", pace: "steady", empathy: "enhanced" },
      llm_settings: { temperature: 0.25, top_p: 0.85, memory_window: 20 },
      capabilities: {
        knowledgeBase: true,
        ticketing: true,
        escalationRouting: true,
        multilingual: true,
      },
      personality: {
        traits: ["reassuring", "patient", "solution-focused"],
        fallbackStrategy: "summarize-and-escalate",
      },
      status: "active",
    },
  },
  {
    id: "quantum-scheduler",
    name: "Quantum Scheduler",
    tagline: "Smart appointment & meeting coordinator",
    description:
      "AI-powered scheduling agent that integrates with all major calendar platforms. Handles complex scheduling, rescheduling, and meeting coordination seamlessly.",
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
      video: false,
      chat: true,
      meetings: true,
    },
    metrics: {
      calendarAccuracy: "99%",
      avgBookingTime: "1.8 min",
      noShowReduction: "85%",
      autoReschedule: "92%",
    },
    price: "Premium",
    template: {
      agent_type: "operations",
      voice: "Fable",
      language: "en-US",
      model: "gpt-4",
      script_summary:
        "Logistics-focused meeting concierge that owns scheduling, reminders, and conflict resolution.",
      goal: "Maximize attendance and eliminate scheduling friction for busy teams.",
      deployment_channels: ["phone", "chat"],
      voice_settings: { tone: "polished", pace: "efficient" },
      llm_settings: { temperature: 0.35, top_p: 0.9, memory_window: 8 },
      capabilities: {
        calendarSync: true,
        meetingPlatforms: ["Zoom", "Teams", "Meet"],
        timezoneAwareness: true,
        reminderSequences: true,
      },
      personality: {
        traits: ["organized", "concise", "helpful"],
      },
      status: "active",
    },
  },
  {
    id: "summit-onboarding",
    name: "Summit Onboarding Coach",
    tagline: "Guided onboarding & implementation specialist",
    description:
      "White-glove onboarding agent that walks customers through setup, training, and adoption milestones with human-quality coaching.",
    tier: "gold",
    icon: GraduationCap,
    color: "from-green-400 to-teal-500",
    rating: 4.8,
    deployments: 6543,
    features: [
      "Guided implementations",
      "Interactive walkthroughs",
      "Progress tracking",
      "Risk alerts",
      "Stakeholder updates",
      "Certification pathways",
      "Knowledge reinforcement",
      "Meeting follow-ups",
    ],
    capabilities: {
      phone: true,
      video: true,
      chat: true,
      meetings: true,
    },
    metrics: {
      onboardingCompletion: "93%",
      timeToValue: "14 days",
      adoptionScore: "4.7/5",
      retentionBoost: "+18%",
    },
    price: "Premium",
    template: {
      agent_type: "success",
      voice: "Shimmer",
      language: "en-US",
      model: "gpt-4",
      script_summary:
        "Implementation coach that tracks milestones, educates users, and drives adoption with accountability.",
      goal: "Accelerate customer time-to-value and ensure successful rollout.",
      deployment_channels: ["phone", "video", "chat"],
      voice_settings: { tone: "supportive", pace: "measured" },
      llm_settings: { temperature: 0.4, top_p: 0.9, memory_window: 14 },
      capabilities: {
        milestoneTracking: true,
        recapEmails: true,
        sentimentAlerts: true,
      },
      personality: {
        traits: ["coach-like", "structured", "motivational"],
      },
      status: "active",
    },
  },
  {
    id: "commerce-concierge",
    name: "Commerce Concierge",
    tagline: "E-commerce sales & support specialist",
    description:
      "Sophisticated shopping assistant that guides customers through purchase decisions, handles cart recovery, and provides post-purchase support.",
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
    template: {
      agent_type: "sales",
      voice: "Onyx",
      language: "en-US",
      model: "gpt-4",
      script_summary:
        "Retail-focused specialist that guides buyers, recovers carts, and handles post-purchase care.",
      goal: "Increase average order value and reduce abandonment for commerce teams.",
      deployment_channels: ["phone", "chat"],
      voice_settings: { tone: "friendly", pace: "moderate" },
      llm_settings: { temperature: 0.4, top_p: 0.9, memory_window: 10 },
      capabilities: {
        productDiscovery: true,
        orderTracking: true,
        returnsHandling: true,
        promoDelivery: true,
      },
      personality: {
        traits: ["approachable", "solution-oriented"],
      },
      status: "active",
    },
  },
];

export function FeaturedAgents({ onDeploy }: FeaturedAgentsProps) {
  const [selectedAgent, setSelectedAgent] = useState<FeaturedAgent | null>(null);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [deployingAgentId, setDeployingAgentId] = useState<string | null>(null);

  const resolveWorkspaceId = async () => {
    if (workspaceId) return workspaceId;
    const workspaces = await listWorkspaces();
    if (!Array.isArray(workspaces) || workspaces.length === 0) {
      throw new Error("No workspace found. Please create a workspace first.");
    }
    setWorkspaceId(workspaces[0].id);
    return workspaces[0].id;
  };

  const handleDeploy = async (agent: FeaturedAgent) => {
    try {
      setDeployingAgentId(agent.id);
      const wsId = await resolveWorkspaceId();
      const payload = {
        workspace_id: wsId,
        name: agent.name,
        description: agent.description,
        agent_type: agent.template.agent_type,
        voice: agent.template.voice,
        language: agent.template.language,
        model: agent.template.model,
        script_summary: agent.template.script_summary,
        goal: agent.template.goal,
        deployment_channels: agent.template.deployment_channels,
        voice_settings: agent.template.voice_settings,
        llm_settings: agent.template.llm_settings,
        capabilities: agent.template.capabilities,
        personality: agent.template.personality,
      };

      const created = await createAgent(payload);
      if (agent.template.status) {
        await updateAgent(created.id, { status: agent.template.status });
        created.status = agent.template.status;
      }

      window.dispatchEvent(new CustomEvent("agent:created", { detail: created }));
      toast.success(`${agent.name} deployed to your workspace!`);
      onDeploy?.(agent, created);
    } catch (error: any) {
      toast.error(error?.message || "Failed to deploy agent");
    } finally {
      setDeployingAgentId(null);
    }
  };

  const getTierBadge = (tier: string) => {
    if (tier === "platinum") {
      return (
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <Crown className="size-3 mr-1" />
          PLATINUM
        </Badge>
      );
    }
    if (tier === "gold") {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
          <Star className="size-3 mr-1" />
          GOLD
        </Badge>
      );
    }
    return null;
  };

  const agents = useMemo(() => FEATURED_AGENTS, []);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="size-8" />
            <h1 className="text-white">Featured AI Voice Agents</h1>
          </div>
          <p className="text-indigo-100 max-w-2xl">
            Deploy our world-class, pre-trained AI voice agents with advanced capabilities. Each agent
            is optimized for specific use cases and comes with meeting integration, multilingual
            support, and premium features.
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const IconComponent = agent.icon;
          const isDeploying = deployingAgentId === agent.id;
          return (
            <Card
              key={agent.id}
              className="border-2 border-slate-200 hover:border-blue-400 hover:shadow-2xl transition-all group"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`size-14 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white shadow-lg`}
                  >
                    <IconComponent className="size-7" />
                  </div>
                  {getTierBadge(agent.tier)}
                </div>
                <CardTitle className="mb-2">{agent.name}</CardTitle>
                <CardDescription className="text-slate-900">{agent.tagline}</CardDescription>
                <p className="text-slate-600 text-sm mt-2 line-clamp-3">{agent.description}</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-slate-900">{agent.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Users className="size-4" />
                    <span>{agent.deployments.toLocaleString()} deployments</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  {agent.capabilities.phone && (
                    <Badge variant="outline" className="text-xs">
                      <Phone className="size-3 mr-1" />
                      Phone
                    </Badge>
                  )}
                  {agent.capabilities.video && (
                    <Badge variant="outline" className="text-xs">
                      <Video className="size-3 mr-1" />
                      Video
                    </Badge>
                  )}
                  {agent.capabilities.chat && (
                    <Badge variant="outline" className="text-xs">
                      <MessageSquare className="size-3 mr-1" />
                      Chat
                    </Badge>
                  )}
                  {agent.capabilities.meetings && (
                    <Badge variant="outline" className="text-xs bg-green-50 border-green-300">
                      <Zap className="size-3 mr-1 text-green-600" />
                      Meetings
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-50 rounded-lg">
                  {Object.entries(agent.metrics)
                    .slice(0, 4)
                    .map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-slate-600 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <p className="text-slate-900">{value}</p>
                      </div>
                    ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedAgent(agent)}>
                    <Eye className="size-4 mr-2" />
                    Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => handleDeploy(agent)}
                    disabled={isDeploying}
                  >
                    {isDeploying ? "Deploying..." : (<><Plus className="size-4 mr-2" />Deploy</>)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedAgent && (
        <AgentDetailsModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} onDeploy={handleDeploy} />
      )}
    </div>
  );
}

function AgentDetailsModal({
  agent,
  onClose,
  onDeploy,
}: {
  agent: FeaturedAgent;
  onClose: () => void;
  onDeploy: (agent: FeaturedAgent) => void;
}) {
  const IconComponent = agent.icon;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="size-4" />
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

        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-slate-900 mb-2">About This Agent</h3>
            <p className="text-slate-600">{agent.description}</p>
          </div>

          <div>
            <h3 className="text-slate-900 mb-4">Performance Metrics</h3>
            <div className="grid md:grid-cols-4 gap-4">
              {Object.entries(agent.metrics).map(([key, value]) => (
                <Card key={key} className="border-slate-200">
                  <CardContent className="p-4">
                    <p className="text-slate-600 text-sm mb-1 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                    <p className="text-slate-900 text-2xl">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-slate-900 mb-4">Supported Channels</h3>
            <div className="flex items-center gap-3 flex-wrap">
              {agent.capabilities.phone && (
                <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Phone className="size-5 text-blue-600" />
                  <span className="text-slate-900">Phone Calls</span>
                </div>
              )}
              {agent.capabilities.video && (
                <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <Video className="size-5 text-purple-600" />
                  <span className="text-slate-900">Video Calls</span>
                </div>
              )}
              {agent.capabilities.chat && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                  <MessageSquare className="size-5 text-green-600" />
                  <span className="text-slate-900">Chat</span>
                </div>
              )}
              {agent.capabilities.meetings && (
                <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <Zap className="size-5 text-orange-600" />
                  <span className="text-slate-900">Meetings</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-slate-900 mb-4">Premium Features</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {agent.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Video className="size-6" />
                </div>
                <div>
                  <h4 className="text-slate-900 mb-2">Meeting Integration Ready</h4>
                  <p className="text-slate-600 mb-3">
                    This agent can seamlessly join Zoom, Google Meet, Microsoft Teams, and Webex meetings to
                    participate in discussions, answer questions, and provide real-time assistance to your clients.
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="bg-white">
                      Zoom
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      Google Meet
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      Teams
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      Webex
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => onDeploy(agent)}
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
