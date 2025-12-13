import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Bot,
  Phone,
  Globe,
  Edit,
  Trash2,
  MoreVertical,
  Play,
  Pause,
  Search,
  Plus,
  Copy,
  PhoneCall,
  Download,
  BarChart3,
  Settings,
  Archive,
  FileText,
  ExternalLink,
  Code,
  Video,
} from "lucide-react";
import { TestCallModal } from "./TestCallModal";
import { AgentEditor } from "./AgentEditor";
import { AgentAnalytics } from "./AgentAnalytics";
import { AgentCallLogs } from "./AgentCallLogs";
import { AgentAPIDoc } from "./AgentAPIDoc";
import { AgentAdvancedSettings } from "./AgentAdvancedSettings";
import { AgentIntegrations } from "./AgentIntegrations";
import { toast } from "sonner";

interface AgentListProps {
  onCreateNew: () => void;
}

export function AgentList({ onCreateNew }: AgentListProps) {
  const demoAgents = [
    {
      id: 1,
      name: "Sales Agent",
      type: "sales",
      status: "active",
      calls: 234,
      deployment: "phone",
      phoneNumber: "+1 (555) 123-4567",
      language: "English (US)",
      voice: "Nova",
    },
    {
      id: 2,
      name: "Support Agent",
      type: "support",
      status: "active",
      calls: 189,
      deployment: "both",
      phoneNumber: "+1 (555) 234-5678",
      language: "English (UK)",
      voice: "Alloy",
    },
    {
      id: 3,
      name: "Lead Qualifier",
      type: "lead",
      status: "paused",
      calls: 156,
      deployment: "widget",
      phoneNumber: "N/A",
      language: "Spanish",
      voice: "Echo",
    },
    {
      id: 4,
      name: "Appointment Setter",
      type: "appointment",
      status: "active",
      calls: 98,
      deployment: "phone",
      phoneNumber: "+1 (555) 345-6789",
      language: "French",
      voice: "Onyx",
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [testAgent, setTestAgent] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [editingAgent, setEditingAgent] = useState<any | null>(null);
  const [analyticsAgent, setAnalyticsAgent] = useState<any | null>(null);
  const [logsAgent, setLogsAgent] = useState<any | null>(null);
  const [apiAgent, setApiAgent] = useState<any | null>(null);
  const [advancedAgent, setAdvancedAgent] = useState<any | null>(null);
  const [integrationsAgent, setIntegrationsAgent] = useState<any | null>(null);
  const [agents, setAgents] = useState<any[]>(demoAgents);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const apiBase =
      (import.meta.env.VITE_API_BASE as string | undefined) || window.location.origin;
    const apiToken = import.meta.env.VITE_API_TOKEN as string | undefined;
    const workspaceId = Number(import.meta.env.VITE_WORKSPACE_ID || 1);

    if (!apiToken) {
      // No token configured; stay in demo mode.
      return;
    }

    const base = apiBase.replace(/\/+$/, "");

    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${base}/api/agents?workspace_id=${workspaceId}`,
          {
            headers: {
              Authorization: `Bearer ${apiToken}`,
            },
          },
        );

        if (!response.ok) {
          let message = `Failed to load agents (HTTP ${response.status})`;
          try {
            const body = await response.json();
            if (body?.detail) {
              message = Array.isArray(body.detail)
                ? body.detail.map((d: any) => d.msg || d).join(", ")
                : body.detail;
            }
          } catch {
            // keep default message
          }
          toast.error(message);
          return;
        }

        const data = await response.json();
        const mapped = (data || []).map((agent: any) => {
          const channels = agent.deployment_channels || [];
          let deployment = "phone";
          if (channels.includes("phone") && channels.includes("web-widget")) {
            deployment = "both";
          } else if (channels.includes("web-widget")) {
            deployment = "widget";
          } else if (channels.includes("phone")) {
            deployment = "phone";
          } else if (channels.length) {
            deployment = channels[0];
          }

          return {
            id: agent.id,
            name: agent.name,
            type: agent.agent_type,
            status: agent.status,
            calls: agent.total_calls ?? 0,
            deployment,
            phoneNumber: agent.phone_number || "N/A",
            language: agent.language,
            voice: agent.voice,
          };
        });

        setAgents(mapped);
      } catch (error: any) {
        toast.error(
          error?.message || "Unexpected error loading agents from API; using demo data.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleToggleStatus = (id: number) => {
    setAgents(agents.map(agent =>
      agent.id === id
        ? { ...agent, status: agent.status === "active" ? "paused" : "active" }
        : agent
    ));
    const agent = agents.find(a => a.id === id);
    toast.success(`${agent?.name} ${agent?.status === "active" ? "paused" : "activated"}`);
  };

  const handleDuplicate = (agent: any) => {
    const newAgent = {
      ...agent,
      id: agents.length + 1,
      name: `${agent.name} (Copy)`,
      calls: 0,
    };
    setAgents([...agents, newAgent]);
    toast.success(`${agent.name} duplicated successfully`);
  };

  const handleDelete = (id: number) => {
    const agent = agents.find(a => a.id === id);
    if (confirm(`Are you sure you want to delete ${agent?.name}?`)) {
      setAgents(agents.filter(a => a.id !== id));
      toast.success(`${agent?.name} deleted`);
    }
  };

  const handleEdit = (agent: any) => {
    setEditingAgent(agent);
    toast.success(`Opening editor for ${agent.name}`);
  };

  const handleViewAnalytics = (agent: any) => {
    setAnalyticsAgent(agent);
    toast.success(`Opening analytics for ${agent.name}`);
    setActiveDropdown(null);
  };

  const handleExportConfig = (agent: any) => {
    const config = {
      agent_id: `agent_${agent.id}`,
      name: agent.name,
      type: agent.type,
      deployment: agent.deployment,
      phoneNumber: agent.phoneNumber,
      language: agent.language,
      voice: agent.voice,
      status: agent.status,
      created_at: new Date().toISOString(),
      configuration: {
        welcome_message: "Hello! Thanks for calling. How can I help you today?",
        instructions: "Be professional and helpful.",
        model: "gpt-4",
        temperature: 0.7,
      },
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agent.name.toLowerCase().replace(/\s+/g, "-")}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Configuration exported for ${agent.name}`);
    setActiveDropdown(null);
  };

  const handleViewAPI = (agent: any) => {
    setApiAgent(agent);
    toast.success(`Opening API documentation for ${agent.name}`);
    setActiveDropdown(null);
  };

  const handleArchive = (agent: any) => {
    if (confirm(`Archive ${agent.name}? You can restore it later.`)) {
      toast.success(`${agent.name} archived successfully`);
      setActiveDropdown(null);
    }
  };

  const handleAdvancedSettings = (agent: any) => {
    setAdvancedAgent(agent);
    toast.success(`Opening advanced settings for ${agent.name}`);
    setActiveDropdown(null);
  };

  const handleViewLogs = (agent: any) => {
    setLogsAgent(agent);
    toast.success(`Opening call logs for ${agent.name}`);
    setActiveDropdown(null);
  };

  const handleViewIntegrations = (agent: any) => {
    setIntegrationsAgent(agent);
    toast.success(`Opening integrations for ${agent.name}`);
    setActiveDropdown(null);
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2">AI Agents</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your voice agents</p>
        </div>
        <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="size-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
            <CardHeader className="border-b dark:border-slate-800">
              <div className="flex items-start justify-between relative">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                    <Bot className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="dark:text-white mb-1">{agent.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={agent.status === "active" ? "default" : "secondary"}
                        className={agent.status === "active" ? "bg-green-500" : ""}
                      >
                        {agent.status}
                      </Badge>
                      <Badge variant="outline" className="capitalize dark:border-slate-700 dark:text-slate-300">
                        {agent.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveDropdown(activeDropdown === agent.id ? null : agent.id)}
                    className="dark:hover:bg-slate-800"
                  >
                    <MoreVertical className="size-4" />
                  </Button>

                  {/* Dropdown Menu */}
                  {activeDropdown === agent.id && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 z-50">
                      <div className="py-2">
                        <button
                          onClick={() => handleViewAnalytics(agent)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          <BarChart3 className="size-4 text-blue-600" />
                          <span>View Analytics</span>
                        </button>
                        <button
                          onClick={() => handleViewLogs(agent)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          <FileText className="size-4 text-purple-600" />
                          <span>View Call Logs</span>
                        </button>
                        <button
                          onClick={() => handleAdvancedSettings(agent)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          <Settings className="size-4 text-slate-600" />
                          <span>Advanced Settings</span>
                        </button>
                        <button
                          onClick={() => handleViewIntegrations(agent)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          <Video className="size-4 text-teal-600" />
                          <span>Meeting Integrations</span>
                        </button>
                        <div className="border-t border-slate-200 dark:border-slate-800 my-2" />
                        <button
                          onClick={() => handleViewAPI(agent)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          <Code className="size-4 text-green-600" />
                          <span>API Documentation</span>
                        </button>
                        <button
                          onClick={() => handleExportConfig(agent)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          <Download className="size-4 text-indigo-600" />
                          <span>Export Configuration</span>
                        </button>
                        <div className="border-t border-slate-200 dark:border-slate-800 my-2" />
                        <button
                          onClick={() => handleArchive(agent)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          <Archive className="size-4 text-orange-600" />
                          <span>Archive Agent</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(agent.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-600 flex items-center gap-3 text-red-600 hover:text-red-700 dark:hover:text-white"
                        >
                          <Trash2 className="size-4" />
                          <span>Delete Agent</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Total Calls</p>
                    <p className="text-slate-900 dark:text-white text-2xl">{agent.calls}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Deployment</p>
                    <div className="flex items-center gap-1">
                      {agent.deployment === "phone" && <Phone className="size-4 text-blue-600" />}
                      {agent.deployment === "widget" && <Globe className="size-4 text-purple-600" />}
                      {agent.deployment === "both" && (
                        <>
                          <Phone className="size-4 text-blue-600" />
                          <Globe className="size-4 text-purple-600" />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 pt-4 border-t dark:border-slate-800">
                  {agent.phoneNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400 text-sm">Phone</span>
                      <span className="text-slate-900 dark:text-white">{agent.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Language</span>
                    <span className="text-slate-900 dark:text-white">{agent.language}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Voice</span>
                    <span className="text-slate-900 dark:text-white">{agent.voice}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    onClick={() => handleToggleStatus(agent.id)}
                  >
                    {agent.status === "active" ? (
                      <>
                        <Pause className="size-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="size-4 mr-2" />
                        Activate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(agent)}
                    className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(agent)}
                    className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(agent.id)}
                    className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTestAgent(agent.name)}
                    className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <PhoneCall className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <Card className="bg-white border-slate-200 dark:border-slate-800">
          <CardContent className="p-12 text-center">
            <Bot className="size-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-slate-900 dark:text-white mb-2">No agents found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchQuery ? "Try a different search term" : "Create your first agent to get started"}
            </p>
            <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="size-4 mr-2" />
              Create Agent
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test Call Modal */}
      {testAgent && (
        <TestCallModal agentName={testAgent} onClose={() => setTestAgent(null)} />
      )}

      {/* Agent Editor */}
      {editingAgent && (
        <AgentEditor
          agent={editingAgent}
          onClose={() => setEditingAgent(null)}
          onSave={(updatedAgent) => {
            setAgents(
              agents.map((a) => (a.id === updatedAgent.id ? updatedAgent : a))
            );
            setEditingAgent(null);
          }}
        />
      )}

      {/* Agent Analytics */}
      {analyticsAgent && (
        <AgentAnalytics
          agent={analyticsAgent}
          onClose={() => setAnalyticsAgent(null)}
        />
      )}

      {/* Agent Call Logs */}
      {logsAgent && (
        <AgentCallLogs
          agent={logsAgent}
          onClose={() => setLogsAgent(null)}
        />
      )}

      {/* Agent API Documentation */}
      {apiAgent && (
        <AgentAPIDoc
          agent={apiAgent}
          onClose={() => setApiAgent(null)}
        />
      )}

      {/* Agent Advanced Settings */}
      {advancedAgent && (
        <AgentAdvancedSettings
          agent={advancedAgent}
          onClose={() => setAdvancedAgent(null)}
          onSave={(settings) => {
            // Store advanced settings for the agent
            toast.success("Advanced settings saved!");
            setAdvancedAgent(null);
          }}
        />
      )}

      {/* Agent Integrations */}
      {integrationsAgent && (
        <AgentIntegrations
          agent={integrationsAgent}
          onClose={() => setIntegrationsAgent(null)}
        />
      )}
    </div>
  );
}
