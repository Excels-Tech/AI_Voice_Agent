import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { AlertTriangle, Clipboard, ClipboardCheck, Link2, PhoneCall, ShieldCheck } from "lucide-react";
import { createVonageToken, getVonageStatus, type VonageStatus, type VonageTokenResponse } from "../lib/api";

export function VonageIntegrationCard() {
  const [status, setStatus] = useState<VonageStatus | null>(null);
  const [tokenResult, setTokenResult] = useState<VonageTokenResponse | null>(null);
  const [ttlSeconds, setTtlSeconds] = useState("3600");
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const data = await getVonageStatus();
        setStatus(data);
      } catch (err: any) {
        console.error("Failed to load Vonage status", err);
        toast.error(err?.message || "Unable to load Vonage status");
      }
    };
    loadStatus();
  }, []);

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

  const handleMintToken = async () => {
    setLoading(true);
    try {
      const ttl = parseInt(ttlSeconds, 10);
      const token = await createVonageToken({
        ttl_seconds: Number.isFinite(ttl) ? ttl : undefined,
      });
      setTokenResult(token);
      toast.success("Vonage JWT minted");
    } catch (err: any) {
      toast.error(err?.message || "Unable to mint Vonage token");
    } finally {
      setLoading(false);
    }
  };

  const webhookRows = [
    { label: "Answer webhook", value: status?.answer_url },
    { label: "Event webhook", value: status?.event_url },
  ];

  return (
    <Card className="bg-white border-amber-200 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white">
            <PhoneCall className="size-6" />
          </div>
          <div>
            <CardTitle>Vonage Voice Integration</CardTitle>
            <CardDescription>
              Mint Vonage Voice JWTs and copy the answer/event webhook URLs for your VoiceAI agent.
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-amber-700 border-amber-200">
            Requires VONAGE_APPLICATION_ID + private key
          </Badge>
          <Badge variant="outline" className="text-slate-600 border-slate-200">Inbound + Outbound</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Vonage status</p>
            {status?.configured ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600">
                <ShieldCheck className="size-4 mr-2" />
                Configured
              </Badge>
            ) : (
              <Badge className="bg-amber-500 hover:bg-amber-500">
                <AlertTriangle className="size-4 mr-2" />
                Missing config
              </Badge>
            )}
            {status?.missing?.length ? (
              <div className="text-xs text-amber-700 space-y-1">
                <p>Set these env vars:</p>
                <div className="flex flex-wrap gap-1">
                  {status.missing.map((item) => (
                    <Badge key={item} variant="outline" className="border-amber-200 text-amber-700">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Application ID</p>
            <div className="flex items-center gap-2">
              <Input value={status?.application_id || ""} readOnly placeholder="VONAGE_APPLICATION_ID" />
              <Button variant="outline" size="icon" onClick={() => copyValue("Application ID", status?.application_id)}>
                {copiedField === "Application ID" ? <ClipboardCheck className="size-4" /> : <Clipboard className="size-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">JWT TTL (seconds)</p>
            <Input value={ttlSeconds} onChange={(e) => setTtlSeconds(e.target.value)} placeholder="3600" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {webhookRows.map((row) => (
            <div key={row.label} className="space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <Link2 className="size-4 text-amber-600" />
                <span className="text-sm font-semibold">{row.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input value={row.value || ""} readOnly placeholder="Set VONAGE_VOICE_WEBHOOK_BASE to populate" />
                <Button variant="outline" size="icon" onClick={() => copyValue(row.label, row.value)}>
                  {copiedField === row.label ? <ClipboardCheck className="size-4" /> : <Clipboard className="size-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Mint a Vonage Voice JWT to use with the Voice API or client SDK. Tokens are short-lived by default.
            </p>
          </div>
          <Button
            onClick={handleMintToken}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 flex items-center gap-2"
          >
            <PhoneCall className="size-4" />
            Mint Vonage JWT
          </Button>
        </div>

        {tokenResult && (
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-900">
              <ShieldCheck className="size-4" />
              <span>Token ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Input value={tokenResult.token} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={() => copyValue("Vonage token", tokenResult.token)}>
                {copiedField === "Vonage token" ? <ClipboardCheck className="size-4" /> : <Clipboard className="size-4" />}
              </Button>
            </div>
            <p className="text-xs text-amber-800">Expires at: {new Date(tokenResult.expires_at).toLocaleString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
