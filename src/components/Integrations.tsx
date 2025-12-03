import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Webhook, Calendar, Mail, MessageSquare, Database, Zap, Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { VonageIntegrationCard } from "./VonageIntegrationCard";

export function Integrations() {
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>(["zapier"]);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  const handleConnect = (id: string) => {
    if (connectedIntegrations.includes(id)) {
      setConnectedIntegrations(connectedIntegrations.filter((i) => i !== id));
      toast.success("Integration disconnected");
    } else {
      setConnectedIntegrations([...connectedIntegrations, id]);
      toast.success("Integration connected successfully!");
    }
  };

  const handleAddWebhook = () => {
    if (webhookUrl) {
      toast.success("Webhook added successfully");
      setWebhookUrl("");
      setShowWebhookForm(false);
    }
  };

  const integrations = [
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Automatically schedule appointments and sync calendars",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      connected: connectedIntegrations.includes("google-calendar"),
      category: "Calendar",
    },
    {
      id: "slack",
      name: "Slack",
      description: "Send call notifications and summaries to Slack channels",
      icon: MessageSquare,
      color: "from-purple-500 to-pink-500",
      connected: connectedIntegrations.includes("slack"),
      category: "Communication",
    },
    {
      id: "salesforce",
      name: "Salesforce",
      description: "Sync call data and leads to your CRM automatically",
      icon: Database,
      color: "from-orange-500 to-red-500",
      connected: connectedIntegrations.includes("salesforce"),
      category: "CRM",
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description: "Create contacts and log calls in HubSpot CRM",
      icon: Database,
      color: "from-green-500 to-emerald-500",
      connected: connectedIntegrations.includes("hubspot"),
      category: "CRM",
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect to 5,000+ apps with custom automations",
      icon: Zap,
      color: "from-indigo-500 to-purple-500",
      connected: connectedIntegrations.includes("zapier"),
      category: "Automation",
    },
    {
      id: "make",
      name: "Make (Integromat)",
      description: "Advanced workflow automation with visual builder",
      icon: Zap,
      color: "from-red-500 to-pink-500",
      connected: connectedIntegrations.includes("make"),
      category: "Automation",
    },
    {
      id: "gmail",
      name: "Gmail",
      description: "Send follow-up emails and summaries automatically",
      icon: Mail,
      color: "from-blue-500 to-indigo-500",
      connected: connectedIntegrations.includes("gmail"),
      category: "Email",
    },
    {
      id: "outlook",
      name: "Outlook",
      description: "Microsoft 365 email and calendar integration",
      icon: Calendar,
      color: "from-cyan-500 to-blue-500",
      connected: connectedIntegrations.includes("outlook"),
      category: "Email",
    },
  ];

  const webhooks = [
    {
      id: 1,
      name: "Call Started Webhook",
      url: "https://api.example.com/webhooks/call-started",
      events: ["call.started"],
      active: true,
    },
    {
      id: 2,
      name: "Call Ended Webhook",
      url: "https://api.example.com/webhooks/call-ended",
      events: ["call.ended", "call.transcribed"],
      active: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-2">Integrations</h1>
        <p className="text-slate-600">Connect your AI agents with your favorite tools</p>
      </div>

      <VonageIntegrationCard />

      {/* Popular Integrations */}
      <div>
        <h2 className="text-slate-900 mb-4">Popular Integrations</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id} className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${integration.color}`}>
                    <integration.icon className="size-6 text-white" />
                  </div>
                  {integration.connected && (
                    <Badge className="bg-green-500">
                      <Check className="size-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
                <h3 className="text-slate-900 mb-2">{integration.name}</h3>
                <p className="text-slate-600 text-sm mb-4">{integration.description}</p>
                <Badge variant="outline" className="mb-4">
                  {integration.category}
                </Badge>
                {integration.connected ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => toast.success("Opening settings...")}
                    >
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect(integration.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="sm"
                    onClick={() => handleConnect(integration.id)}
                  >
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Webhooks */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="size-5 text-purple-600" />
                Custom Webhooks
              </CardTitle>
              <CardDescription>Send call data to custom endpoints</CardDescription>
            </div>
            <Button
              onClick={() => setShowWebhookForm(!showWebhookForm)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="size-4 mr-2" />
              Add Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {showWebhookForm && (
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-domain.com/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddWebhook} className="bg-purple-600 hover:bg-purple-700">
                    Add Webhook
                  </Button>
                  <Button variant="outline" onClick={() => setShowWebhookForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} className="bg-white border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                        <Webhook className="size-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-slate-900">{webhook.name}</h3>
                          <Badge className={webhook.active ? "bg-green-500" : "bg-slate-400"}>
                            {webhook.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-slate-600 text-sm mb-2">{webhook.url}</p>
                        <div className="flex flex-wrap gap-2">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success("Testing webhook...")}
                      >
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success("Webhook deleted")}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>Build custom integrations with our API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-slate-900 mb-2">API Endpoint</p>
              <code className="text-blue-600">https://api.voiceai.app/v1</code>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-slate-900 mb-2">Your API Key</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-slate-600">sk_live_••••••••••••••••••••1234</code>
                <Button variant="outline" size="sm" onClick={() => toast.success("API key copied")}>
                  Copy
                </Button>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.open("https://docs.voiceai.app", "_blank")}>
              View Full Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
