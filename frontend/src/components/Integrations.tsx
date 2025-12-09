import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Webhook, Calendar, Mail, MessageSquare, Database, Zap, Check, Plus, X, Settings, ExternalLink, Key, Copy, AlertCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface IntegrationConfig {
  [key: string]: any;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  iconColor: string;
  connected: boolean;
  category: string;
  authType: "oauth" | "apikey" | "credentials";
  fields: {
    name: string;
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
    helpText?: string;
  }[];
  configFields?: {
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
  }[];
}

export function Integrations() {
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>(["google-calendar", "zapier"]);
  const [integrationConfigs, setIntegrationConfigs] = useState<{ [key: string]: IntegrationConfig }>({
    "google-calendar": {
      defaultCalendar: "primary",
      timezone: "America/New_York",
      meetingDuration: "30"
    },
    "zapier": {
      apiKey: "zpk_test_••••••••••••••••",
      webhookUrl: "https://hooks.zapier.com/hooks/catch/123456/abc123/",
      triggerEvents: "all"
    }
  });
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [connectionForm, setConnectionForm] = useState<{ [key: string]: string }>({});
  const [configForm, setConfigForm] = useState<{ [key: string]: string }>({});

  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookName, setWebhookName] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["call.completed"]);
  const [webhooks, setWebhooks] = useState([
    {
      id: 1,
      name: "Custom Webhook 1",
      url: "https://api.voiceai.app/v1",
      events: ["call.completed"],
      active: true,
    },
  ]);

  const integrations: Integration[] = [
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Automatically schedule appointments and sync calendars",
      icon: Calendar,
      iconColor: "bg-blue-500",
      connected: connectedIntegrations.includes("google-calendar"),
      category: "Calendar",
      authType: "oauth",
      fields: [
        {
          name: "email",
          label: "Google Account Email",
          type: "email",
          placeholder: "your-email@gmail.com",
          required: true,
          helpText: "The Google account to connect"
        }
      ],
      configFields: [
        {
          name: "defaultCalendar",
          label: "Default Calendar",
          type: "select",
          options: [
            { value: "primary", label: "Primary Calendar" },
            { value: "work", label: "Work Calendar" },
            { value: "personal", label: "Personal Calendar" }
          ]
        },
        {
          name: "timezone",
          label: "Timezone",
          type: "select",
          options: [
            { value: "America/New_York", label: "Eastern Time (ET)" },
            { value: "America/Chicago", label: "Central Time (CT)" },
            { value: "America/Denver", label: "Mountain Time (MT)" },
            { value: "America/Los_Angeles", label: "Pacific Time (PT)" }
          ]
        },
        {
          name: "meetingDuration",
          label: "Default Meeting Duration (minutes)",
          type: "number",
          placeholder: "30"
        }
      ]
    },
    {
      id: "slack",
      name: "Slack",
      description: "Send call notifications and summaries to Slack channels",
      icon: MessageSquare,
      iconColor: "bg-purple-500",
      connected: connectedIntegrations.includes("slack"),
      category: "Communication",
      authType: "oauth",
      fields: [
        {
          name: "workspaceName",
          label: "Workspace Name",
          type: "text",
          placeholder: "your-workspace",
          required: true,
          helpText: "Your Slack workspace name"
        }
      ],
      configFields: [
        {
          name: "defaultChannel",
          label: "Default Channel",
          type: "text",
          placeholder: "#general"
        },
        {
          name: "notificationEvents",
          label: "Notify On",
          type: "select",
          options: [
            { value: "all", label: "All Calls" },
            { value: "completed", label: "Completed Calls Only" },
            { value: "failed", label: "Failed Calls Only" }
          ]
        },
        {
          name: "includeTranscript",
          label: "Include Transcript",
          type: "select",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" }
          ]
        }
      ]
    },
    {
      id: "salesforce",
      name: "Salesforce",
      description: "Sync call data and leads to your CRM automatically",
      icon: Database,
      iconColor: "bg-orange-500",
      connected: connectedIntegrations.includes("salesforce"),
      category: "CRM",
      authType: "credentials",
      fields: [
        {
          name: "instanceUrl",
          label: "Salesforce Instance URL",
          type: "text",
          placeholder: "https://yourcompany.salesforce.com",
          required: true,
          helpText: "Your Salesforce instance URL"
        },
        {
          name: "username",
          label: "Username",
          type: "text",
          placeholder: "user@company.com",
          required: true
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "••••••••",
          required: true
        },
        {
          name: "securityToken",
          label: "Security Token",
          type: "password",
          placeholder: "Your Salesforce security token",
          required: true,
          helpText: "Found in Salesforce Settings > Reset Security Token"
        }
      ],
      configFields: [
        {
          name: "createLeads",
          label: "Auto-create Leads",
          type: "select",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" }
          ]
        },
        {
          name: "leadSource",
          label: "Lead Source",
          type: "text",
          placeholder: "VoiceAI"
        },
        {
          name: "syncFrequency",
          label: "Sync Frequency",
          type: "select",
          options: [
            { value: "realtime", label: "Real-time" },
            { value: "hourly", label: "Every Hour" },
            { value: "daily", label: "Daily" }
          ]
        }
      ]
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description: "Create contacts and log calls in HubSpot CRM",
      icon: Database,
      iconColor: "bg-green-500",
      connected: connectedIntegrations.includes("hubspot"),
      category: "CRM",
      authType: "apikey",
      fields: [
        {
          name: "apiKey",
          label: "HubSpot API Key",
          type: "password",
          placeholder: "pat-na1-••••••••-••••-••••-••••-••••••••••••",
          required: true,
          helpText: "Found in HubSpot Settings > Integrations > API Key"
        },
        {
          name: "portalId",
          label: "Portal ID (Hub ID)",
          type: "text",
          placeholder: "12345678",
          required: true,
          helpText: "Your HubSpot Portal/Hub ID"
        }
      ],
      configFields: [
        {
          name: "autoCreateContacts",
          label: "Auto-create Contacts",
          type: "select",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" }
          ]
        },
        {
          name: "logCalls",
          label: "Log All Calls",
          type: "select",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" }
          ]
        },
        {
          name: "pipeline",
          label: "Default Pipeline",
          type: "text",
          placeholder: "Sales Pipeline"
        }
      ]
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect to 5,000+ apps with custom automations",
      icon: Zap,
      iconColor: "bg-indigo-500",
      connected: connectedIntegrations.includes("zapier"),
      category: "Automation",
      authType: "apikey",
      fields: [
        {
          name: "apiKey",
          label: "Zapier API Key",
          type: "password",
          placeholder: "zpk_•••••••••••••••",
          required: true,
          helpText: "Found in Zapier Account Settings"
        },
        {
          name: "webhookUrl",
          label: "Webhook URL",
          type: "text",
          placeholder: "https://hooks.zapier.com/hooks/catch/...",
          required: true,
          helpText: "Your Zapier webhook URL"
        }
      ],
      configFields: [
        {
          name: "triggerEvents",
          label: "Trigger On",
          type: "select",
          options: [
            { value: "all", label: "All Events" },
            { value: "call_completed", label: "Call Completed" },
            { value: "call_started", label: "Call Started" }
          ]
        },
        {
          name: "dataFormat",
          label: "Data Format",
          type: "select",
          options: [
            { value: "json", label: "JSON" },
            { value: "form", label: "Form Data" }
          ]
        }
      ]
    },
    {
      id: "make",
      name: "Make (Integromat)",
      description: "Advanced workflow automation with visual builder",
      icon: Zap,
      iconColor: "bg-pink-500",
      connected: connectedIntegrations.includes("make"),
      category: "Automation",
      authType: "apikey",
      fields: [
        {
          name: "apiKey",
          label: "Make API Key",
          type: "password",
          placeholder: "••••••••••••••••",
          required: true,
          helpText: "Found in Make Team Settings"
        },
        {
          name: "webhookUrl",
          label: "Webhook URL",
          type: "text",
          placeholder: "https://hook.integromat.com/...",
          required: true,
          helpText: "Your Make webhook URL"
        }
      ],
      configFields: [
        {
          name: "scenarioName",
          label: "Scenario Name",
          type: "text",
          placeholder: "VoiceAI Integration"
        },
        {
          name: "triggerType",
          label: "Trigger Type",
          type: "select",
          options: [
            { value: "instant", label: "Instant" },
            { value: "scheduled", label: "Scheduled" }
          ]
        }
      ]
    },
    {
      id: "gmail",
      name: "Gmail",
      description: "Send follow-up emails and summaries automatically",
      icon: Mail,
      iconColor: "bg-red-500",
      connected: connectedIntegrations.includes("gmail"),
      category: "Email",
      authType: "oauth",
      fields: [
        {
          name: "email",
          label: "Gmail Address",
          type: "email",
          placeholder: "your-email@gmail.com",
          required: true
        }
      ],
      configFields: [
        {
          name: "autoSendSummary",
          label: "Auto-send Call Summary",
          type: "select",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" }
          ]
        },
        {
          name: "emailTemplate",
          label: "Email Template",
          type: "select",
          options: [
            { value: "standard", label: "Standard Summary" },
            { value: "detailed", label: "Detailed Report" },
            { value: "custom", label: "Custom Template" }
          ]
        }
      ]
    },
    {
      id: "outlook",
      name: "Outlook",
      description: "Microsoft 365 email and calendar integration",
      icon: Calendar,
      iconColor: "bg-cyan-500",
      connected: connectedIntegrations.includes("outlook"),
      category: "Email",
      authType: "oauth",
      fields: [
        {
          name: "email",
          label: "Microsoft Account Email",
          type: "email",
          placeholder: "your-email@outlook.com",
          required: true
        }
      ],
      configFields: [
        {
          name: "syncCalendar",
          label: "Sync Calendar",
          type: "select",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" }
          ]
        },
        {
          name: "syncContacts",
          label: "Sync Contacts",
          type: "select",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" }
          ]
        }
      ]
    },
  ];

  const handleConnectClick = (integration: Integration) => {
    if (integration.connected) {
      // Disconnect
      setConnectedIntegrations(connectedIntegrations.filter((i) => i !== integration.id));
      const newConfigs = { ...integrationConfigs };
      delete newConfigs[integration.id];
      setIntegrationConfigs(newConfigs);
      toast.success(`${integration.name} disconnected successfully`);
    } else {
      // Show connection modal
      setSelectedIntegration(integration);
      setConnectionForm({});
      setShowConnectionModal(true);
    }
  };

  const handleConfigureClick = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigForm(integrationConfigs[integration.id] || {});
    setShowConfigModal(true);
  };

  const handleConnect = () => {
    if (!selectedIntegration) return;

    const missingFields = selectedIntegration.fields.filter(
      field => field.required && !connectionForm[field.name]
    );

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedIntegration.authType === "oauth") {
      toast.success(`Opening ${selectedIntegration.name} authorization...`, {
        description: "You'll be redirected to authorize the connection"
      });
      
      setTimeout(() => {
        setConnectedIntegrations([...connectedIntegrations, selectedIntegration.id]);
        setIntegrationConfigs({
          ...integrationConfigs,
          [selectedIntegration.id]: connectionForm
        });
        toast.success(`${selectedIntegration.name} connected successfully!`);
        setShowConnectionModal(false);
      }, 1500);
    } else {
      setConnectedIntegrations([...connectedIntegrations, selectedIntegration.id]);
      setIntegrationConfigs({
        ...integrationConfigs,
        [selectedIntegration.id]: connectionForm
      });
      toast.success(`${selectedIntegration.name} connected successfully!`);
      setShowConnectionModal(false);
    }
  };

  const handleSaveConfig = () => {
    if (!selectedIntegration) return;

    setIntegrationConfigs({
      ...integrationConfigs,
      [selectedIntegration.id]: {
        ...integrationConfigs[selectedIntegration.id],
        ...configForm
      }
    });
    toast.success("Configuration saved successfully");
    setShowConfigModal(false);
  };

  const handleAddWebhook = () => {
    if (!webhookName) {
      toast.error("Please enter a webhook name");
      return;
    }
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error("Please select at least one event");
      return;
    }

    const newWebhook = {
      id: webhooks.length + 1,
      name: webhookName,
      url: webhookUrl,
      events: selectedEvents,
      active: true,
    };
    setWebhooks([...webhooks, newWebhook]);
    toast.success("Webhook added successfully");
    setWebhookUrl("");
    setWebhookName("");
    setSelectedEvents([]);
    setShowWebhookForm(false);
  };

  const handleDeleteWebhook = (id: number) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast.success("Webhook deleted");
  };

  const handleTestWebhook = (webhook: any) => {
    toast.success("Testing webhook...", {
      description: `Sending test data to ${webhook.url}`
    });
    setTimeout(() => {
      toast.success("Webhook test successful!", {
        description: "Response: 200 OK"
      });
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 dark:text-white mb-2">Integrations</h1>
        <p className="text-slate-600 dark:text-slate-400">Connect your AI agents with your favorite tools</p>
      </div>

      {/* Popular Integrations */}
      <div>
        <h2 className="text-slate-900 dark:text-white mb-6">Popular Integrations</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all relative overflow-hidden group">
              <CardContent className="p-6 flex flex-col h-full">
                {/* Connected Badge */}
                {integration.connected && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                      <Check className="size-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                )}

                {/* Icon */}
                <div className="mb-4">
                  <div className={`inline-flex p-4 rounded-xl ${integration.iconColor}`}>
                    <integration.icon className="size-7 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="mb-5 flex-1">
                  <h3 className="text-slate-900 dark:text-white mb-2">{integration.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3">
                    {integration.description}
                  </p>
                  <Badge variant="outline" className="text-xs dark:border-slate-700 dark:text-slate-300">
                    {integration.category}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="mt-auto">
                  {integration.connected ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        onClick={() => handleConfigureClick(integration)}
                      >
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-600"
                        onClick={() => handleConnectClick(integration)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                      onClick={() => handleConnectClick(integration)}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Webhooks Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-slate-900 dark:text-white mb-1">Custom Webhooks</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Send call data to custom endpoints</p>
          </div>
          <Button
            onClick={() => setShowWebhookForm(!showWebhookForm)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="size-4 mr-2" />
            Add Webhook
          </Button>
        </div>

        {showWebhookForm && (
          <Card className="mb-6 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="webhook-name" className="text-slate-900 dark:text-white">Webhook Name</Label>
                  <Input
                    id="webhook-name"
                    placeholder="My Custom Webhook"
                    value={webhookName}
                    onChange={(e) => setWebhookName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="webhook-url" className="text-slate-900 dark:text-white">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-domain.com/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="webhook-events" className="text-slate-900 dark:text-white">Events</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full mt-1.5 justify-between dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                        >
                          <span className="truncate">
                            {selectedEvents.length === 0
                              ? "Select events..."
                              : `${selectedEvents.length} event${selectedEvents.length > 1 ? 's' : ''} selected`}
                          </span>
                          <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 dark:bg-slate-900 dark:border-slate-700" align="start">
                      <div className="p-3 space-y-2">
                        {[
                          { value: "call.completed", label: "Call Completed" },
                          { value: "call.started", label: "Call Started" },
                          { value: "call.transcribed", label: "Call Transcribed" },
                        ].map((event) => (
                          <div key={event.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={event.value}
                              checked={selectedEvents.includes(event.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedEvents([...selectedEvents, event.value]);
                                } else {
                                  setSelectedEvents(selectedEvents.filter((e) => e !== event.value));
                                }
                              }}
                            />
                            <label
                              htmlFor={event.value}
                              className="text-sm cursor-pointer select-none dark:text-white"
                            >
                              {event.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddWebhook} className="bg-purple-600 hover:bg-purple-700">
                    Add Webhook
                  </Button>
                  <Button variant="outline" onClick={() => setShowWebhookForm(false)} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shrink-0">
                    <Webhook className="size-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-slate-900 dark:text-white">{webhook.name}</h3>
                      <Badge className={webhook.active ? "bg-green-500 text-white" : "bg-slate-400 text-white"}>
                        {webhook.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 truncate">{webhook.url}</p>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs dark:border-slate-700 dark:text-slate-300">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestWebhook(webhook)}
                      className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-600"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* API Documentation */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-blue-600">
              <Key className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white mb-1">API Documentation</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Build custom integrations with our API</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
              <p className="text-slate-900 dark:text-white text-sm mb-2">API Endpoint</p>
              <code className="text-blue-600 dark:text-blue-400">https://api.voiceai.app/v1</code>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
              <p className="text-slate-900 dark:text-white text-sm mb-2">Your API Key</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-slate-600 dark:text-slate-400 text-sm">sk_live_••••••••••••••••••••1234</code>
                <Button variant="outline" size="sm" onClick={() => toast.success("API key copied")} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
                  <Copy className="size-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
            <Button variant="outline" className="bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white" onClick={() => toast.info("Opening documentation...")}>
              <ExternalLink className="size-4 mr-2" />
              View Full Documentation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connection Modal */}
      <Dialog open={showConnectionModal} onOpenChange={setShowConnectionModal}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Connect {selectedIntegration?.name}</DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Set up your {selectedIntegration?.name} integration to start syncing data
            </DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-6 mt-2">
              {/* Integration Header */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className={`p-3 rounded-xl ${selectedIntegration.iconColor}`}>
                  <selectedIntegration.icon className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white">{selectedIntegration.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{selectedIntegration.description}</p>
                </div>
              </div>

              {/* OAuth Notice */}
              {selectedIntegration.authType === "oauth" && (
                <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                  <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-300">
                    <strong>OAuth Authorization:</strong> You'll be redirected to {selectedIntegration.name} to authorize the connection.
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                {selectedIntegration.fields.map((field) => (
                  <div key={field.name}>
                    <Label htmlFor={field.name} className="text-slate-900 dark:text-white">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={connectionForm[field.name] || ""}
                      onChange={(e) =>
                        setConnectionForm({ ...connectionForm, [field.name]: e.target.value })
                      }
                      required={field.required}
                      className="mt-1.5"
                    />
                    {field.helpText && (
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleConnect}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {selectedIntegration.authType === "oauth" ? "Authorize Connection" : "Connect"}
                </Button>
                <Button variant="outline" onClick={() => setShowConnectionModal(false)} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Configuration Modal */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Configure {selectedIntegration?.name}</DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Customize settings and preferences for your {selectedIntegration?.name} integration
            </DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-6 mt-2">
              {/* Integration Header */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className={`p-3 rounded-xl ${selectedIntegration.iconColor}`}>
                  <selectedIntegration.icon className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white mb-1">{selectedIntegration.name}</h3>
                  <Badge className="bg-green-500 text-white">
                    <Check className="size-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              </div>

              {/* Config Fields */}
              {selectedIntegration.configFields && selectedIntegration.configFields.length > 0 ? (
                <div className="space-y-4">
                  {selectedIntegration.configFields.map((field) => (
                    <div key={field.name}>
                      <Label htmlFor={field.name} className="text-slate-900 dark:text-white">{field.label}</Label>
                      {field.type === "select" && field.options ? (
                        <select
                          id={field.name}
                          value={configForm[field.name] || ""}
                          onChange={(e) =>
                            setConfigForm({ ...configForm, [field.name]: e.target.value })
                          }
                          className="w-full mt-1.5 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select an option</option>
                          {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          id={field.name}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={configForm[field.name] || ""}
                          onChange={(e) =>
                            setConfigForm({ ...configForm, [field.name]: e.target.value })
                          }
                          className="mt-1.5"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <Settings className="size-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">No additional configuration required</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSaveConfig}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={() => setShowConfigModal(false)} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}