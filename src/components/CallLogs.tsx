import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Phone,
  Search,
  Download,
  Play,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  CheckCircle2,
  PhoneMissed,
  Voicemail,
} from "lucide-react";
import { toast } from "sonner";
import { listAgents, listCallLogs, listWorkspaces, type CallLog } from "../lib/api";

export function CallLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedCall, setSelectedCall] = useState<number | null>(null);
  const [selectedTranscript, setSelectedTranscript] = useState<{ callId: number; transcript: any[]; summary?: string; outcome?: string } | null>(null);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [agentsById, setAgentsById] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return "--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const transcriptPreview = (call: CallLog) => {
    if (call.summary) return call.summary;
    if (Array.isArray(call.transcript) && call.transcript.length) {
      const first = call.transcript[0] as any;
      if (typeof first === "string") return first;
      if (first?.content) return first.content;
      if (first?.text) return first.text;
      return JSON.stringify(first).slice(0, 140);
    }
    return "No transcript yet";
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const workspaces = await listWorkspaces();
        if (!mounted) return;
        const activeWorkspace = workspaces?.find((w: any) => w.is_active) ?? workspaces?.[0];
        const wsId = activeWorkspace?.id ?? activeWorkspace?.workspace_id;
        if (wsId) setWorkspaceId(wsId);
      } catch (err: any) {
        setError(err?.message || "Unable to load workspaces");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    let active = true;

    const load = async () => {
      try {
        if (isFirstLoad) setLoading(true);
        setError(null);
        const [callData, agentList] = await Promise.all([
          listCallLogs({ workspaceId, limit: 200 }),
          listAgents(workspaceId),
        ]);
        if (!active) return;
        const agentMap: Record<number, string> = {};
        (agentList || []).forEach((a: any) => {
          if (a?.id) agentMap[a.id] = a.name || `Agent ${a.id}`;
        });
        setAgentsById(agentMap);
        const incoming = (callData || []) as CallLog[];
        setCalls((prev) => {
          const map = new Map<number, CallLog>();
          prev.forEach((c) => map.set(c.id, c));
          incoming.forEach((c) => {
            const existing = map.get(c.id);
            map.set(c.id, existing ? { ...existing, ...c } : c);
          });
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
          );
        });
        setLastUpdated(new Date());
        setIsFirstLoad(false);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Unable to load call logs");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    const interval = autoRefresh ? setInterval(load, 30000) : null;
    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [workspaceId, autoRefresh]);

  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      const matchesStatus = selectedFilter === "all" || call.status === selectedFilter;
      const caller = (call.caller_name || call.caller_number || "").toLowerCase();
      const agent = call.agent_id ? (agentsById[call.agent_id] || "").toLowerCase() : "";
      const matchesSearch =
        caller.includes(searchQuery.toLowerCase()) ||
        agent.includes(searchQuery.toLowerCase()) ||
        (call.caller_number || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [calls, selectedFilter, searchQuery, agentsById]);

  const stats = useMemo(() => {
    return {
      total: calls.length,
      completed: calls.filter((c) => c.status === "completed").length,
      voicemail: calls.filter((c) => c.status === "voicemail").length,
      missed: calls.filter((c) => c.status === "missed").length,
    };
  }, [calls]);

  const handleExport = () => {
    toast.success("Exporting call logs to CSV...");
  };

  const handleDownloadRecording = (callId: number) => {
    const call = calls.find((c) => c.id === callId);
    if (call?.recording_url) {
      window.open(call.recording_url, "_blank", "noopener,noreferrer");
      return;
    }
    toast.error("Recording not available yet.");
  };

  const handleViewTranscript = (callId: number) => {
    setSelectedCall(callId);
    (async () => {
      try {
        const data = await getCallTranscript(callId);
        setSelectedTranscript({
          callId,
          transcript: data?.transcript || [],
          summary: data?.summary,
          outcome: data?.outcome,
        });
      } catch (err: any) {
        toast.error(err?.message || "Unable to load transcript");
      }
    })();
  };

  const handlePlayRecording = (callId: number) => {
    const call = calls.find((c) => c.id === callId);
    if (call?.recording_url) {
      window.open(call.recording_url, "_blank", "noopener,noreferrer");
      return;
    }
    toast.error("Recording not available yet.");
  };

  const triggerManualRefresh = () => {
    // briefly disable/enable autoRefresh to run load once via effect
    setAutoRefresh(false);
    setTimeout(() => setAutoRefresh(true), 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 mb-2">Call Logs</h1>
        <p className="text-slate-600">Call history with optional auto-refresh (every 30s)</p>
        <div className="flex items-center gap-3 mt-2 text-sm text-slate-600 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-blue-600"
            />
            Auto-refresh
          </label>
          <Button size="sm" variant="outline" onClick={triggerManualRefresh}>
            Refresh now
          </Button>
          {lastUpdated && <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>}
        </div>
      </div>

      <Card className="bg-white border-slate-200">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Search calls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                toast.success(`Filtered by ${e.target.value}`);
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => toast.success(`Sorted by ${e.target.value}`)}
            >
              <option value="recent">Most Recent</option>
              <option value="duration">Longest Duration</option>
              <option value="sentiment">Best Sentiment</option>
            </select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="size-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-4 gap-6">
        <Card
          className={`bg-white border-2 cursor-pointer transition-all ${
            selectedFilter === "all" ? "border-blue-500 shadow-lg" : "border-slate-200"
          }`}
          onClick={() => setSelectedFilter("all")}
        >
          <CardContent className="p-6">
            <Phone className="size-8 text-blue-600 mb-3" />
            <div className="text-3xl text-slate-900 mb-1">{stats.total}</div>
            <div className="text-slate-600">Total Calls</div>
          </CardContent>
        </Card>
        <Card
          className={`bg-white border-2 cursor-pointer transition-all ${
            selectedFilter === "completed" ? "border-green-500 shadow-lg" : "border-slate-200"
          }`}
          onClick={() => setSelectedFilter("completed")}
        >
          <CardContent className="p-6">
            <CheckCircle2 className="size-8 text-green-600 mb-3" />
            <div className="text-3xl text-slate-900 mb-1">{stats.completed}</div>
            <div className="text-slate-600">Completed</div>
          </CardContent>
        </Card>
        <Card
          className={`bg-white border-2 cursor-pointer transition-all ${
            selectedFilter === "voicemail" ? "border-orange-500 shadow-lg" : "border-slate-200"
          }`}
          onClick={() => setSelectedFilter("voicemail")}
        >
          <CardContent className="p-6">
            <Voicemail className="size-8 text-orange-600 mb-3" />
            <div className="text-3xl text-slate-900 mb-1">{stats.voicemail}</div>
            <div className="text-slate-600">Voicemail</div>
          </CardContent>
        </Card>
        <Card
          className={`bg-white border-2 cursor-pointer transition-all ${
            selectedFilter === "missed" ? "border-red-500 shadow-lg" : "border-slate-200"
          }`}
          onClick={() => setSelectedFilter("missed")}
        >
          <CardContent className="p-6">
            <PhoneMissed className="size-8 text-red-600 mb-3" />
            <div className="text-3xl text-slate-900 mb-1">{stats.missed}</div>
            <div className="text-slate-600">Missed</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {loading && <p className="text-slate-600">Loading latest calls...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading &&
          !error &&
          filteredCalls.map((call) => {
            const agentName = call.agent_id ? agentsById[call.agent_id] || `Agent ${call.agent_id}` : "Unassigned";
            return (
              <Card key={call.id} className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                        <Phone className="size-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-slate-900">{call.caller_name || "Unknown caller"}</h3>
                          <Badge
                            variant={
                              call.sentiment === "positive"
                                ? "default"
                                : call.sentiment === "negative"
                                ? "destructive"
                                : "secondary"
                            }
                            className={call.sentiment === "positive" ? "bg-green-500" : ""}
                          >
                            {call.sentiment}
                          </Badge>
                          {call.status === "voicemail" && <Badge variant="outline">Voicemail</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-slate-600 text-sm mb-3 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="size-4" />
                            {agentName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="size-4" />
                            {call.caller_number || "Unknown"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-4" />
                            {formatDuration(call.duration_seconds)}
                          </span>
                          <span>{new Date(call.started_at).toLocaleString()}</span>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 mb-3">
                          <p className="text-slate-700 text-sm mb-2">{transcriptPreview(call)}</p>
                          <p className="text-slate-900">
                            <strong>Outcome:</strong> {call.outcome || call.summary || "Pending"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button variant="outline" size="sm" onClick={() => handleViewTranscript(call.id)}>
                            <FileText className="size-4 mr-2" />
                            Transcript
                          </Button>
                          {call.recording_url && (
                            <Button variant="outline" size="sm" onClick={() => handlePlayRecording(call.id)}>
                              <Play className="size-4" />
                            </Button>
                          )}
                          {call.recording_url && (
                            <Button variant="outline" size="sm" onClick={() => handleDownloadRecording(call.id)}>
                              <Download className="size-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          call.status === "completed"
                            ? "default"
                            : call.status === "voicemail"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          call.status === "completed"
                            ? "bg-green-500"
                            : call.status === "voicemail"
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }
                      >
                        {call.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {!loading && !error && filteredCalls.length === 0 && (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-12 text-center">
            <Phone className="size-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-slate-900 mb-2">No calls found</h3>
            <p className="text-slate-600">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}

      {selectedTranscript && (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-slate-900">Transcript for call #{selectedTranscript.callId}</h4>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTranscript(null)}>
                Close
              </Button>
            </div>
            {selectedTranscript.summary && (
              <p className="text-slate-700 text-sm">
                <strong>Summary:</strong> {selectedTranscript.summary}
              </p>
            )}
            {selectedTranscript.outcome && (
              <p className="text-slate-700 text-sm">
                <strong>Outcome:</strong> {selectedTranscript.outcome}
              </p>
            )}
            <div className="space-y-1 max-h-64 overflow-auto">
              {selectedTranscript.transcript?.length ? (
                selectedTranscript.transcript.map((entry: any, idx: number) => (
                  <div key={idx} className="text-sm text-slate-700">
                    <span className="font-semibold capitalize">{entry.role || "speaker"}: </span>
                    <span>{entry.content || entry.text || JSON.stringify(entry)}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-600 text-sm">No transcript available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
