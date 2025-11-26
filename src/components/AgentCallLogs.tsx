import { useEffect, useMemo, useState } from "react";
import { X, Phone, Clock, Download, Play, FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { listCallLogs, type CallLog } from "../lib/api";

interface AgentCallLogsProps {
  agent: { id: number; name: string; workspace_id?: number };
  onClose: () => void;
}

export function AgentCallLogs({ agent, onClose }: AgentCallLogsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return "—";
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
    if (!agent?.workspace_id && agent?.id === undefined) return;
    let active = true;

    const load = async () => {
      if (!agent.workspace_id) return;
      try {
        setLoading(true);
        setError(null);
        const callData = await listCallLogs({ workspaceId: agent.workspace_id, agentId: agent.id, limit: 100 });
        if (!active) return;
        setCalls(callData || []);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Unable to load call logs");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [agent]);

  const filteredLogs = useMemo(
    () =>
      calls.filter(
        (log) =>
          (log.caller_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (log.outcome || "").toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [calls, searchQuery]
  );

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="size-4 text-green-600" />;
      case "negative":
        return <TrendingDown className="size-4 text-red-600" />;
      default:
        return <Minus className="size-4 text-slate-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-slate-900">Call Logs - {agent.name}</h2>
              <p className="text-slate-600 text-sm">View all call history and recordings</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>

          <Input
            placeholder="Search by phone number or outcome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="p-6">
          {loading && <p className="text-slate-600">Loading call history...</p>}
          {error && <p className="text-red-600">{error}</p>}
          <div className="space-y-3">
            {!loading &&
              !error &&
              filteredLogs.map((log) => (
                <Card key={log.id} className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Phone className="size-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-slate-900">{log.caller_number || "Unknown"}</p>
                            <p className="text-slate-600 text-sm">
                              {new Date(log.started_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={log.status === "completed" ? "default" : "secondary"}
                            className={log.status === "completed" ? "bg-green-500" : "bg-red-500"}
                          >
                            {log.status}
                          </Badge>
                          <Badge variant="outline" className={getSentimentColor(log.sentiment)}>
                            <span className="flex items-center gap-1">
                              {getSentimentIcon(log.sentiment)}
                              {log.sentiment}
                            </span>
                          </Badge>
                          <div className="flex items-center gap-1 text-slate-600 text-sm">
                            <Clock className="size-4" />
                            {formatDuration(log.duration_seconds)}
                          </div>
                        </div>

                        <p className="text-slate-900 mb-2">
                          <span className="text-slate-600">Outcome:</span> {log.outcome || "—"}
                        </p>

                        <p className="text-slate-600 text-sm bg-slate-50 p-2 rounded">
                          {transcriptPreview(log)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {log.recording_url && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => window.open(log.recording_url || "#", "_blank")}>
                              <Play className="size-4 mr-2" />
                              Play
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => window.open(log.recording_url || "#", "_blank")}>
                              <Download className="size-4 mr-2" />
                              Download
                            </Button>
                          </>
                        )}
                        {log.transcript && (
                          <Button variant="outline" size="sm">
                            <FileText className="size-4 mr-2" />
                            Transcript
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {!loading && !error && filteredLogs.length === 0 && (
            <div className="text-center text-slate-600 py-6">No calls yet for this agent</div>
          )}
        </div>
      </div>
    </div>
  );
}
