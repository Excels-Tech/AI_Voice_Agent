import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Bot,
  Edit,
  Trash2,
  MoreVertical,
  Play,
  Pause,
  Search,
  Plus,
  Copy,
  PhoneCall,
  MessageSquare,
  Download,
  BarChart3,
  Settings,
  Archive,
  FileText,
  Code,
} from "lucide-react";
import { TestCallModal } from "./TestCallModal";
import { AgentChatModal } from "./AgentChatModal";
import { AgentEditor } from "./AgentEditor";
import { AgentAnalytics } from "./AgentAnalytics";
import { AgentCallLogs } from "./AgentCallLogs";
import { AgentAPIDoc } from "./AgentAPIDoc";
import { AgentAdvancedSettings } from "./AgentAdvancedSettings";
import { AgentIntegrations } from "./AgentIntegrations";
import { toast } from "sonner";
import {
  listWorkspaces,
  listAgents as fetchAgentsForWorkspace,
  deployAgent,
  pauseAgent,
  deleteAgent as deleteAgentById,
  cloneAgent,
  updateAgent,
} from "../lib/api";

interface AgentListProps {
  onCreateNew: () => void;
}

type AgentListItem = {
  id: number;
  workspaceId: number;
  name: string;
  type: string;
  status: string;
  calls: number;
  deploymentChannels: string[];
  deployment?: string;
  phoneNumber?: string;
  language: string;
  languageCode: string;
  voice?: string;
  isAvailable: boolean;
};

const LANGUAGE_LABELS: Record<string, string> = {
  "en-US": "English (US)",
  "en-GB": "English (UK)",
  "es-ES": "Spanish (Spain)",
  "es-MX": "Spanish (Mexico)",
  "fr-FR": "French",
  "de-DE": "German",
};

const LABEL_TO_LANGUAGE = Object.entries(LANGUAGE_LABELS).reduce<Record<string, string>>(
  (acc, [code, label]) => {
    acc[label] = code;
    return acc;
  },
  {},
);

const getLanguageLabel = (code?: string | null) => {
  if (!code) return "English (US)";
  return LANGUAGE_LABELS[code] || code;
};

const resolveLanguageCode = (value?: string | null) => {
  if (!value) return "en-US";
  return LABEL_TO_LANGUAGE[value] || value;
};

const normalizeChannels = (channels: unknown): string[] => {
  if (Array.isArray(channels)) return channels;
  if (typeof channels === "string") {
    return channels
      .split(",")
      .map((channel) => channel.trim())
      .filter(Boolean);
  }
  return [];
};

const getChannelLabel = (channel: string) => {
  switch (channel) {
    case "phone":
      return "Phone";
    case "video":
      return "Video";
    case "chat":
      return "Chat";
    case "meetings":
      return "Meetings";
    default:
      return channel;
  }
};

const mapAgentFromApi = (agent: any): AgentListItem => {
  const languageCode = agent.language || "en-US";
  const deploymentChannels = normalizeChannels(agent.deployment_channels);
  return {
    id: agent.id,
    workspaceId: agent.workspace_id,
    name: agent.name,
    type: agent.agent_type || "custom",
    status: agent.status || "draft",
    calls: agent.total_calls ?? 0,
    deploymentChannels,
    deployment: deploymentChannels.join(", "),
    phoneNumber: agent.phone_number || undefined,
    language: getLanguageLabel(languageCode),
    languageCode,
    voice: agent.voice || "Nova",
    isAvailable: (agent.status || "").toLowerCase() === "active",
  };
};

export function AgentList({ onCreateNew }: AgentListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [testAgent, setTestAgent] = useState<AgentListItem | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [editingAgent, setEditingAgent] = useState<any | null>(null);
  const [analyticsAgent, setAnalyticsAgent] = useState<any | null>(null);
  const [logsAgent, setLogsAgent] = useState<any | null>(null);
  const [apiAgent, setApiAgent] = useState<any | null>(null);
  const [advancedAgent, setAdvancedAgent] = useState<any | null>(null);
  const [integrationsAgent, setIntegrationsAgent] = useState<any | null>(null);
  const [chatAgent, setChatAgent] = useState<any | null>(null);
  const [agents, setAgents] = useState<AgentListItem[]>([]);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [busyAgentIds, setBusyAgentIds] = useState<Record<number, boolean>>({});
  const isInitialLoading = isLoadingWorkspaces || (isLoadingAgents && agents.length === 0);
  const isRefreshingAgents = isLoadingAgents && agents.length > 0;

  const refreshAgents = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoadingAgents(true);
    setFetchError(null);
    try {
      const response = await fetchAgentsForWorkspace(workspaceId);
      const mapped = Array.isArray(response) ? response.map(mapAgentFromApi) : [];
      setAgents(mapped);
    } catch (error: any) {
      setFetchError(error?.message || "Failed to load agents");
      setAgents([]);
    } finally {
      setIsLoadingAgents(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    let ignore = false;
    const loadWorkspaces = async () => {
      try {
        setIsLoadingWorkspaces(true);
        setFetchError(null);
        const workspaces = await listWorkspaces();
        if (ignore) return;
        if (!Array.isArray(workspaces) || workspaces.length === 0) {
          setFetchError("No workspace found. Create a workspace before managing agents.");
          setAgents([]);
          return;
        }
        const activeWorkspace = workspaces.find((workspace: any) => workspace.is_active) ?? workspaces[0];
        setWorkspaceId(activeWorkspace.id);
        setWorkspaceName(activeWorkspace.name);
      } catch (error: any) {
        if (!ignore) setFetchError(error?.message || "Failed to load workspaces");
      } finally {
        if (!ignore) setIsLoadingWorkspaces(false);
      }
    };
    loadWorkspaces();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    refreshAgents();
  }, [workspaceId, refreshAgents]);

  useEffect(() => {
    if (!workspaceId) return;
    const handler = () => refreshAgents();
    window.addEventListener("agent:created", handler as EventListener);
    return () => window.removeEventListener("agent:created", handler as EventListener);
  }, [refreshAgents, workspaceId]);

  const markAgentBusy = (agentId: number, busy: boolean) => {
    setBusyAgentIds((prev) => {
      const next = { ...prev };
      if (busy) {
        next[agentId] = true;
      } else {
        delete next[agentId];
      }
      return next;
    });
  };

  const handleToggleStatus = async (agent: AgentListItem) => {
    markAgentBusy(agent.id, true);
    const shouldActivate = agent.status !== "active";
    try {
      if (shouldActivate) {
        await deployAgent(agent.id);
      } else {
        await pauseAgent(agent.id);
      }
      setAgents((prev) =>
        prev.map((item) =>
          item.id === agent.id
            ? { ...item, status: shouldActivate ? "active" : "paused", isAvailable: shouldActivate }
            : item,
        ),
      );
      toast.success(`${agent.name} ${shouldActivate ? "activated" : "paused"}`);
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${shouldActivate ? "activate" : "pause"} agent`);
    } finally {
      markAgentBusy(agent.id, false);
    }
  };

  const handleDuplicate = async (agent: AgentListItem) => {
    markAgentBusy(agent.id, true);
    try {
      const cloned = await cloneAgent(agent.id);
      toast.success(`${agent.name} duplicated successfully`);
      const formatted = mapAgentFromApi(cloned);
      setAgents((prev) => [formatted, ...prev.filter((item) => item.id !== formatted.id)]);
    } catch (error: any) {
      toast.error(error?.message || "Failed to duplicate agent");
    } finally {
      markAgentBusy(agent.id, false);
    }
  };

  const handleDelete = async (id: number) => {
    const agent = agents.find((a) => a.id === id);
    if (!agent) return;
    if (!confirm(`Are you sure you want to delete ${agent.name}?`)) return;
    markAgentBusy(id, true);
    try {
      await deleteAgentById(id);
      toast.success(`${agent.name} deleted`);
      setAgents((prev) => prev.filter((a) => a.id !== id));
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete agent");
    } finally {
      markAgentBusy(id, false);
    }
  };

  const handleEdit = (agent: AgentListItem) => {
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
      deployment: agent.deploymentChannels,
      phoneNumber: agent.phoneNumber,
      language: agent.languageCode,
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

  const filteredAgents = agents.filter((agent) => {
    if (!searchQuery.trim()) return true;
    const haystack = `${agent.name} ${agent.type} ${agent.language} ${agent.voice} ${agent.status}`.toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-slate-900 mb-1">AI Agents</h1>
          <p className="text-slate-600">
            {workspaceName ? `Workspace: ${workspaceName}` : "Manage your voice agents"}
          </p>
          {isRefreshingAgents && (
            <p className="text-xs text-slate-500 mt-1">Refreshing latest agent data…</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {workspaceName && (
            <Badge variant="outline" className="text-slate-700">
              Workspace: {workspaceName}
            </Badge>
          )}
          <Button
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
            disabled={!workspaceId}
          >
            <Plus className="size-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-white border-slate-200">
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

      {fetchError && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-red-700 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">We couldn't load your agents.</p>
              <p className="text-sm opacity-90">{fetchError}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (workspaceId) {
                  refreshAgents();
                } else {
                  setFetchError(null);
                }
              }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {isInitialLoading ? (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-8 text-center text-slate-600">Loading your agents...</CardContent>
        </Card>
      ) : (
        <>
          {/* Agents Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredAgents.map((agent) => {
              const isAgentBusy = !!busyAgentIds[agent.id];
              const deploymentBadges = (agent.deploymentChannels.length ? agent.deploymentChannels : ["phone"]).map(
                (channel) => (
                  <Badge key={`${agent.id}-${channel}`} variant="secondary" className="capitalize">
                    {getChannelLabel(channel)}
                  </Badge>
                ),
              );
              return (
                <Card key={agent.id} className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="border-b">
                    <div className="flex items-start justify-between relative">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                          <Bot className="size-6" />
                        </div>
                        <div>
                          <CardTitle className="mb-1">{agent.name}</CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={agent.isAvailable ? "default" : "secondary"}
                              className={agent.isAvailable ? "bg-green-500" : ""}
                            >
                              {agent.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
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
                        >
                          <MoreVertical className="size-4" />
                        </Button>

                        {/* Dropdown Menu */}
                        {activeDropdown === agent.id && (
                          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                            <div className="py-2">
                              <button
                                onClick={() => handleViewAnalytics(agent)}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700 hover:text-slate-900"
                              >
                                <BarChart3 className="size-4 text-blue-600" />
                                <span>View Analytics</span>
                              </button>
                              <button
                                onClick={() => handleViewLogs(agent)}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700 hover:text-slate-900"
                              >
                                <FileText className="size-4 text-purple-600" />
                                <span>View Call Logs</span>
                              </button>
                              <button
                                onClick={() => handleViewIntegrations(agent)}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700 hover:text-slate-900"
                              >
                                <Settings className="size-4 text-amber-600" />
                                <span>Integrations</span>
                              </button>
                              <button
                                onClick={() => handleViewAPI(agent)}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700 hover:text-slate-900"
                              >
                                <Code className="size-4 text-slate-600" />
                                <span>API Reference</span>
                              </button>
                              <button
                                onClick={() => handleAdvancedSettings(agent)}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700 hover:text-slate-900"
                              >
                                <Settings className="size-4 text-green-600" />
                                <span>Advanced Settings</span>
                              </button>
                              <button
                                onClick={() => handleExportConfig(agent)}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700 hover:text-slate-900"
                              >
                                <Download className="size-4 text-indigo-600" />
                                <span>Export Config</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleDuplicate(agent);
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700 hover:text-slate-900 disabled:opacity-50"
                                disabled={isAgentBusy}
                              >
                                <Copy className="size-4 text-slate-600" />
                                <span>Duplicate</span>
                              </button>
                              <button
                                onClick={() => handleArchive(agent)}
                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700 hover:text-slate-900"
                              >
                                <Archive className="size-4 text-orange-600" />
                                <span>Archive Agent</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleDelete(agent.id);
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 hover:text-red-700 disabled:opacity-50"
                                disabled={isAgentBusy}
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
                          <p className="text-slate-600 text-sm mb-1">Total Calls</p>
                          <p className="text-slate-900 text-2xl">{agent.calls}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 text-sm mb-1">Deployment</p>
                          <div className="flex flex-wrap gap-2">{deploymentBadges}</div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 pt-4 border-t">
                        {agent.phoneNumber && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 text-sm">Phone</span>
                            <span className="text-slate-900">{agent.phoneNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 text-sm">Language</span>
                          <span className="text-slate-900">{agent.language}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 text-sm">Voice</span>
                          <span className="text-slate-900">{agent.voice}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleToggleStatus(agent)}
                          disabled={isAgentBusy}
                        >
                          {agent.isAvailable ? (
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
                        <Button variant="outline" size="sm" onClick={() => handleEdit(agent)} disabled={isAgentBusy}>
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicate(agent)}
                          disabled={isAgentBusy}
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(agent.id)}
                          disabled={isAgentBusy}
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTestAgent(agent)}
                          disabled={!agent.isAvailable || isAgentBusy}
                        >
                          <PhoneCall className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setChatAgent(agent)}
                          disabled={!agent.isAvailable || isAgentBusy}
                        >
                          <MessageSquare className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredAgents.length === 0 && (
            <Card className="bg-white border-slate-200">
              <CardContent className="p-12 text-center">
                <Bot className="size-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-slate-900 mb-2">No agents found</h3>
                <p className="text-slate-600 mb-6">
                  {searchQuery
                    ? "Try a different search term"
                    : workspaceId
                      ? "Your workspace doesn't have any agents yet. Deploy one from the featured gallery or create a custom agent."
                      : "Create your first agent to get started"}
                </p>
                <Button
                  onClick={onCreateNew}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  disabled={!workspaceId}
                >
                  <Plus className="size-4 mr-2" />
                  Create Agent
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Test Call Modal */}
      {testAgent && (
        <TestCallModal
          agent={{ ...testAgent, language: testAgent.languageCode }}
          onClose={() => setTestAgent(null)}
        />
      )}

      {/* Agent Editor */}
      {editingAgent && (
        <AgentEditor
          agent={editingAgent}
          onClose={() => setEditingAgent(null)}
          onSave={async (updatedAgent) => {
            await updateAgent(updatedAgent.id, {
              name: updatedAgent.name,
              agent_type: updatedAgent.type,
              status: updatedAgent.status,
              voice: updatedAgent.voice,
              language: resolveLanguageCode(updatedAgent.language),
            });
            await refreshAgents();
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

      {/* Agent Chat */}
      {chatAgent && (
        <AgentChatModal
          agent={chatAgent}
          onClose={() => setChatAgent(null)}
        />
      )}
    </div>
  );
}

