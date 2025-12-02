import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import {
  Radio,
  Satellite,
  PhoneForwarded,
  Rocket,
  Clipboard,
  ClipboardCheck,
  Activity,
  ListChecks,
} from "lucide-react";
import {
  createAutoDialerBatch,
  createLiveKitPreview,
  createLiveKitToken,
  type AutoDialBatchResponse,
  type LiveKitCallPreviewResponse,
  type LiveKitTokenResponse,
} from "../lib/api";

const defaultLeads = ["+15551234567", "+15559876543"].join("\n");

export function LiveKitIntegrationCard() {
  const [agentId, setAgentId] = useState("");
  const [targetNumber, setTargetNumber] = useState("");
  const [monitorRoom, setMonitorRoom] = useState("voiceai-preview");
  const [leadNumbers, setLeadNumbers] = useState(defaultLeads);
  const [tokenResult, setTokenResult] = useState<LiveKitTokenResponse | null>(null);
  const [previewResult, setPreviewResult] = useState<LiveKitCallPreviewResponse | null>(null);
  const [batchResult, setBatchResult] = useState<AutoDialBatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const parsedLeads = useMemo(
    () =>
      leadNumbers
        .split("\n")
        .map((row) => row.trim())
        .filter(Boolean),
    [leadNumbers]
  );

  const copyValue = async (label: string, value?: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 1200);
      toast.success(`${label} copied`);
    } catch (err) {
      console.error("Failed to copy", err);
      toast.error("Unable to copy to clipboard");
    }
  };

  const handleMintMonitor = async () => {
    setLoading(true);
    try {
      const token = await createLiveKitToken({
        room: monitorRoom || "voiceai-preview",
        identity: `monitor-${Date.now()}`,
        can_publish: false,
        can_subscribe: true,
      });
      setTokenResult(token);
      toast.success("Monitor token generated");
    } catch (err: any) {
      toast.error(err?.message || "Unable to mint token");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewCall = async () => {
    if (!agentId) {
      toast.error("Enter an agent id to start a preview");
      return;
    }
    setLoading(true);
    try {
      const resp = await createLiveKitPreview({
        agent_id: Number(agentId),
        to_number: targetNumber || undefined,
        caller_name: "LiveKit Preview",
      });
      setPreviewResult(resp);
      setBatchResult(null);
      toast.success("Preview call session created");
    } catch (err: any) {
      toast.error(err?.message || "Unable to start preview call");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDial = async () => {
    if (!agentId) {
      toast.error("Enter an agent id to start the auto dialer");
      return;
    }
    if (!parsedLeads.length) {
      toast.error("Add at least one phone number");
      return;
    }
    setLoading(true);
    try {
      const resp = await createAutoDialerBatch({
        agent_id: Number(agentId),
        leads: parsedLeads.map((num) => ({ phone_number: num })),
      });
      setBatchResult(resp);
      setPreviewResult(null);
      toast.success("Auto-dial batch created");
    } catch (err: any) {
      toast.error(err?.message || "Unable to create auto-dial batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border-blue-200 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            <Satellite className="size-6" />
          </div>
          <div>
            <CardTitle>LiveKit Voice Transport</CardTitle>
            <CardDescription>
              Mint LiveKit tokens for inbound/outbound previews, queue auto-dial batches, and monitor calls in real-time.
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-blue-700 border-blue-200">
            Requires LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
          </Badge>
          <Badge variant="outline" className="text-slate-600 border-slate-200">Inbound + Outbound</Badge>
          <Badge variant="outline" className="text-slate-600 border-slate-200">Monitor-ready</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label>Agent ID</Label>
            <Input
              placeholder="e.g. 1"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
            />
            <p className="text-sm text-slate-600">
              The VoiceAI agent that will speak inside the LiveKit room.
            </p>
          </div>
          <div className="space-y-3">
            <Label>Preview / Monitor Room</Label>
            <Input
              placeholder="voiceai-preview"
              value={monitorRoom}
              onChange={(e) => setMonitorRoom(e.target.value)}
            />
            <p className="text-sm text-slate-600">
              Create a dedicated room for supervisors or for quick web previews.
            </p>
          </div>
          <div className="space-y-3">
            <Label>Target Number (optional)</Label>
            <Input
              placeholder="+15551234567"
              value={targetNumber}
              onChange={(e) => setTargetNumber(e.target.value)}
            />
            <p className="text-sm text-slate-600">
              Attach a PSTN or SIP destination for outbound preview calls.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Button
            onClick={handleMintMonitor}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Radio className="size-4" />
            Mint Monitor Token
          </Button>
          <Button
            onClick={handlePreviewCall}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
          >
            <PhoneForwarded className="size-4" />
            Start Preview Call
          </Button>
          <Button
            onClick={handleAutoDial}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ListChecks className="size-4" />
            Launch Auto-Dial Batch
          </Button>
        </div>

        {tokenResult && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-blue-900">
              <Activity className="size-4" />
              <span>Monitor token ready</span>
            </div>
            <div className="grid md:grid-cols-3 gap-3 text-sm text-blue-900">
              <div className="flex items-center justify-between gap-2 bg-white rounded-md border px-3 py-2">
                <span className="font-mono truncate">{tokenResult.room}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyValue("Room", tokenResult.room)}
                >
                  {copiedField === "Room" ? <ClipboardCheck className="size-4 text-green-600" /> : <Clipboard className="size-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2 bg-white rounded-md border px-3 py-2">
                <span className="font-mono truncate">{tokenResult.identity}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyValue("Identity", tokenResult.identity)}
                >
                  {copiedField === "Identity" ? <ClipboardCheck className="size-4 text-green-600" /> : <Clipboard className="size-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2 bg-white rounded-md border px-3 py-2">
                <span className="font-mono truncate">Token</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyValue("Token", tokenResult.token)}
                >
                  {copiedField === "Token" ? <ClipboardCheck className="size-4 text-green-600" /> : <Clipboard className="size-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-blue-800">
              Join via LiveKit Web: <code>{tokenResult.url || "https://your-livekit-host"}</code>
            </p>
          </div>
        )}

        <Separator />

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Rocket className="size-4 text-indigo-600" />
              <p className="font-semibold text-slate-900">Auto-dial list</p>
            </div>
            <Textarea
              rows={6}
              value={leadNumbers}
              onChange={(e) => setLeadNumbers(e.target.value)}
              placeholder="+15551230000\n+15559870000"
            />
            <p className="text-sm text-slate-600">
              One number per line. The server queues calls and returns LiveKit tokens for each.
            </p>
          </div>
          {parsedLeads.length > 0 && (
            <Card className="border-slate-200 bg-slate-50">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm text-slate-700">
                  Preview batch ({parsedLeads.length} leads)
                </p>
                <div className="flex flex-wrap gap-2">
                  {parsedLeads.map((lead) => (
                    <Badge key={lead} variant="outline" className="bg-white text-slate-700">
                      {lead}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {previewResult && (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-indigo-900">
              <PhoneForwarded className="size-4" />
              <span>Preview call {previewResult.call.id} created</span>
            </div>
            {previewResult.livekit ? (
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-slate-700">Room</p>
                  <code className="bg-white border rounded px-2 py-1 block truncate">{previewResult.livekit.room}</code>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-700">Monitor token</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyValue("Monitor token", previewResult.livekit.monitor_token)}
                  >
                    Copy token
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-700">
                LiveKit is not configured on the server yet. Add LIVEKIT_* env vars to enable token minting.
              </p>
            )}
          </div>
        )}

        {batchResult && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900">
              <Activity className="size-4" />
              <span>Auto-dial batch {batchResult.batch_id}</span>
            </div>
            <div className="space-y-2">
              {batchResult.calls.map((call) => (
                <div
                  key={call.call.id}
                  className="rounded border border-emerald-100 bg-white p-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-slate-900">Call #{call.call.id}</p>
                    <p className="text-sm text-slate-600">
                      {call.call.caller_number || "unknown"} • {call.call.direction}
                    </p>
                  </div>
                  {call.livekit?.monitor_token ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyValue(`Call ${call.call.id} token`, call.livekit?.monitor_token)}
                    >
                      Copy monitor token
                    </Button>
                  ) : (
                    <Badge variant="outline">Configure LiveKit</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
