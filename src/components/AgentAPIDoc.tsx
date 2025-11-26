import { useState } from "react";
import { X, Copy, Check, Code } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface AgentAPIDocProps {
  agent: any;
  onClose: () => void;
}

export function AgentAPIDoc({ agent, onClose }: AgentAPIDocProps) {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const apiKey = "sk_live_1234567890abcdef";
  const agentId = `agent_${agent.id}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(label);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      method: "POST",
      path: "/v1/agents/{agent_id}/call",
      description: "Initiate an outbound call",
      code: `curl -X POST https://api.voiceai.com/v1/agents/${agentId}/call \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "+15551234567",
    "variables": {
      "customer_name": "John Doe",
      "order_id": "12345"
    }
  }'`,
    },
    {
      method: "GET",
      path: "/v1/agents/{agent_id}/calls",
      description: "Retrieve all calls for this agent",
      code: `curl -X GET https://api.voiceai.com/v1/agents/${agentId}/calls \\
  -H "Authorization: Bearer ${apiKey}"`,
    },
    {
      method: "GET",
      path: "/v1/agents/{agent_id}/calls/{call_id}",
      description: "Get details of a specific call",
      code: `curl -X GET https://api.voiceai.com/v1/agents/${agentId}/calls/call_123 \\
  -H "Authorization: Bearer ${apiKey}"`,
    },
    {
      method: "POST",
      path: "/v1/agents/{agent_id}/update",
      description: "Update agent configuration",
      code: `curl -X POST https://api.voiceai.com/v1/agents/${agentId}/update \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Updated Agent Name",
    "voice": "nova",
    "language": "en-US"
  }'`,
    },
    {
      method: "GET",
      path: "/v1/agents/{agent_id}/analytics",
      description: "Get agent performance analytics",
      code: `curl -X GET https://api.voiceai.com/v1/agents/${agentId}/analytics \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d "start_date=2024-01-01&end_date=2024-01-31"`,
    },
  ];

  const webhookExample = `{
  "event": "call.completed",
  "agent_id": "${agentId}",
  "call_id": "call_123",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "phone_number": "+15551234567",
    "duration": 272,
    "status": "completed",
    "sentiment": "positive",
    "transcript": "...",
    "recording_url": "https://..."
  }
}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-slate-900">API Documentation - {agent.name}</h2>
            <p className="text-slate-600 text-sm">Integration endpoints and examples</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Key */}
          <Card className="border-slate-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-sm">API Key</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-4 py-2 rounded border text-sm">
                  {apiKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(apiKey, "apiKey")}
                >
                  {copiedEndpoint === "apiKey" ? (
                    <Check className="size-4 text-green-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints */}
          <div className="space-y-4">
            <h3 className="text-slate-900">API Endpoints</h3>

            {endpoints.map((endpoint, index) => (
              <Card key={index} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        endpoint.method === "POST"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : "bg-blue-100 text-blue-800 border-blue-300"
                      }
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm">{endpoint.path}</code>
                  </div>
                  <p className="text-slate-600 text-sm mt-2">{endpoint.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{endpoint.code}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-white"
                      onClick={() => copyToClipboard(endpoint.code, `endpoint-${index}`)}
                    >
                      {copiedEndpoint === `endpoint-${index}` ? (
                        <Check className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Webhook */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="size-5 text-purple-600" />
                Webhook Events
              </CardTitle>
              <p className="text-slate-600 text-sm">
                Configure a webhook URL to receive real-time events
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{webhookExample}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-white"
                  onClick={() => copyToClipboard(webhookExample, "webhook")}
                >
                  {copiedEndpoint === "webhook" ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SDKs */}
          <Card className="border-slate-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-sm">Available SDKs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded border text-center">
                  <p className="text-slate-900">Node.js</p>
                  <code className="text-xs text-slate-600">npm install @voiceai/sdk</code>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <p className="text-slate-900">Python</p>
                  <code className="text-xs text-slate-600">pip install voiceai</code>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <p className="text-slate-900">PHP</p>
                  <code className="text-xs text-slate-600">composer require voiceai/sdk</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
