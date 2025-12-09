import { ArrowLeft, Search, CheckCircle2, Plus, Settings, Trash2, ExternalLink, Copy, Key, Zap, Lock, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { toast } from "sonner@2.0.3";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

interface IntegrationsPageProps {
  onBack: () => void;
}

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  isConnected: boolean;
  isPremium: boolean;
  connectionType: 'oauth' | 'api-key' | 'webhook' | 'credentials';
  features: string[];
  setupInstructions?: string;
  config?: {
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    domain?: string;
    username?: string;
    password?: string;
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    settings?: any;
  };
}

const integrationCategories = [
  "All",
  "CRM",
  "Communication",
  "Calendar",
  "Productivity",
  "Analytics",
  "Payment",
  "Marketing",
  "Developer Tools"
];

export function IntegrationsPage({ onBack }: IntegrationsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [connectionData, setConnectionData] = useState<any>({});
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = () => {
    const stored = localStorage.getItem('integrations');
    const defaultIntegrations: Integration[] = [
      // CRM
      {
        id: 'salesforce',
        name: 'Salesforce',
        category: 'CRM',
        description: 'Sync contacts, leads, and call data with Salesforce CRM',
        icon: '☁️',
        color: 'from-blue-400 to-blue-600',
        isConnected: false,
        isPremium: false,
        connectionType: 'oauth',
        features: ['Contact sync', 'Lead management', 'Call logging', 'Activity tracking']
      },
      {
        id: 'hubspot',
        name: 'HubSpot',
        category: 'CRM',
        description: 'Integrate with HubSpot CRM for seamless contact and deal management',
        icon: '🧲',
        color: 'from-orange-400 to-orange-600',
        isConnected: false,
        isPremium: false,
        connectionType: 'api-key',
        features: ['Contact sync', 'Deal tracking', 'Email integration', 'Workflow automation']
      },
      {
        id: 'pipedrive',
        name: 'Pipedrive',
        category: 'CRM',
        description: 'Connect Pipedrive to manage your sales pipeline with voice AI',
        icon: '📊',
        color: 'from-green-400 to-green-600',
        isConnected: false,
        isPremium: false,
        connectionType: 'api-key',
        features: ['Pipeline management', 'Contact sync', 'Activity logging', 'Deal updates']
      },
      // Communication
      {
        id: 'slack',
        name: 'Slack',
        category: 'Communication',
        description: 'Send call notifications and summaries to Slack channels',
        icon: '💬',
        color: 'from-purple-400 to-purple-600',
        isConnected: false,
        isPremium: false,
        connectionType: 'webhook',
        features: ['Real-time notifications', 'Call summaries', 'Channel routing', 'Bot commands']
      },
      {
        id: 'teams',
        name: 'Microsoft Teams',
        category: 'Communication',
        description: 'Post call updates and alerts to Microsoft Teams channels',
        icon: '👥',
        color: 'from-blue-400 to-indigo-600',
        isConnected: false,
        isPremium: false,
        connectionType: 'webhook',
        features: ['Team notifications', 'Call alerts', 'Meeting integration', 'Adaptive cards']
      },
      {
        id: 'discord',
        name: 'Discord',
        category: 'Communication',
        description: 'Connect Discord servers for community support and notifications',
        icon: '🎮',
        color: 'from-indigo-400 to-indigo-600',
        isConnected: false,
        isPremium: false,
        connectionType: 'webhook',
        features: ['Server notifications', 'Bot integration', 'Channel routing', 'Voice updates']
      },
      // Calendar
      {
        id: 'google-calendar',
        name: 'Google Calendar',
        category: 'Calendar',
        description: 'Schedule calls and sync appointments with Google Calendar',
        icon: '📅',
        color: 'from-blue-400 to-blue-500',
        isConnected: false,
        isPremium: false,
        connectionType: 'oauth',
        features: ['Auto-scheduling', 'Appointment sync', 'Reminder integration', 'Availability check']
      },
      {
        id: 'outlook-calendar',
        name: 'Outlook Calendar',
        category: 'Calendar',
        description: 'Integrate with Outlook for seamless calendar management',
        icon: '📆',
        color: 'from-blue-500 to-blue-700',
        isConnected: false,
        isPremium: false,
        connectionType: 'oauth',
        features: ['Meeting scheduling', 'Event sync', 'Availability management', 'Reminders']
      },
      // Productivity
      {
        id: 'notion',
        name: 'Notion',
        category: 'Productivity',
        description: 'Save call transcripts and notes to your Notion workspace',
        icon: '📝',
        color: 'from-gray-400 to-gray-600',
        isConnected: false,
        isPremium: false,
        connectionType: 'api-key',
        features: ['Note saving', 'Database integration', 'Template support', 'Transcript storage']
      },
      {
        id: 'airtable',
        name: 'Airtable',
        category: 'Productivity',
        description: 'Store call data and contacts in Airtable bases',
        icon: '🗂️',
        color: 'from-yellow-400 to-orange-500',
        isConnected: false,
        isPremium: false,
        connectionType: 'api-key',
        features: ['Data sync', 'Custom fields', 'Automation', 'Record creation']
      },
      {
        id: 'asana',
        name: 'Asana',
        category: 'Productivity',
        description: 'Create tasks and track follow-ups in Asana',
        icon: '✅',
        color: 'from-pink-400 to-pink-600',
        isConnected: false,
        isPremium: false,
        connectionType: 'api-key',
        features: ['Task creation', 'Project tracking', 'Follow-up automation', 'Team collaboration']
      },
      // Analytics
      {
        id: 'google-analytics',
        name: 'Google Analytics',
        category: 'Analytics',
        description: 'Track call metrics and conversions in Google Analytics',
        icon: '📈',
        color: 'from-orange-400 to-red-500',
        isConnected: false,
        isPremium: false,
        connectionType: 'api-key',
        features: ['Event tracking', 'Conversion analytics', 'Custom metrics', 'Dashboard integration']
      },
      {
        id: 'mixpanel',
        name: 'Mixpanel',
        category: 'Analytics',
        description: 'Send call events and user behavior to Mixpanel',
        icon: '🔬',
        color: 'from-purple-400 to-purple-600',
        isConnected: false,
        isPremium: true,
        connectionType: 'api-key',
        features: ['Event tracking', 'User analytics', 'Funnel analysis', 'Cohort tracking']
      },
      // Payment
      {
        id: 'stripe',
        name: 'Stripe',
        category: 'Payment',
        description: 'Process payments and manage subscriptions with Stripe',
        icon: '💳',
        color: 'from-indigo-400 to-purple-600',
        isConnected: false,
        isPremium: false,
        connectionType: 'api-key',
        features: ['Payment processing', 'Subscription management', 'Invoice creation', 'Customer sync']
      },
      {
        id: 'paypal',
        name: 'PayPal',
        category: 'Payment',
        description: 'Accept PayPal payments and manage transactions',
        icon: '💰',
        color: 'from-blue-400 to-blue-600',
        isConnected: false,
        isPremium: false,
        connectionType: 'credentials',
        features: ['Payment processing', 'Transaction tracking', 'Refund management', 'Invoice creation']
      },
      // Marketing
      {
        id: 'mailchimp',
        name: 'Mailchimp',
        category: 'Marketing',
        description: 'Sync contacts and trigger email campaigns from call data',
        icon: '📧',
        color: 'from-yellow-400 to-yellow-600',
        isConnected: false,
        isPremium: false,
        connectionType: 'api-key',
        features: ['Contact sync', 'List management', 'Campaign triggers', 'Audience segmentation']
      },
      {
        id: 'sendgrid',
        name: 'SendGrid',
        category: 'Marketing',
        description: 'Send transactional emails and marketing campaigns',
        icon: '✉️',
        color: 'from-blue-400 to-cyan-500',
        isConnected: false,
        isPremium: false,
        connectionType: 'api-key',
        features: ['Email sending', 'Template management', 'Analytics', 'Contact management']
      },
      // Developer Tools
      {
        id: 'github',
        name: 'GitHub',
        category: 'Developer Tools',
        description: 'Create issues and track development from call feedback',
        icon: '🐙',
        color: 'from-gray-600 to-gray-800',
        isConnected: false,
        isPremium: false,
        connectionType: 'oauth',
        features: ['Issue creation', 'Pull request tracking', 'Repository integration', 'Webhook support']
      },
      {
        id: 'zapier',
        name: 'Zapier',
        category: 'Developer Tools',
        description: 'Connect to 5000+ apps with Zapier automation',
        icon: '⚡',
        color: 'from-orange-400 to-orange-600',
        isConnected: false,
        isPremium: false,
        connectionType: 'webhook',
        features: ['5000+ app connections', 'Custom workflows', 'Multi-step zaps', 'Conditional logic']
      },
      {
        id: 'make',
        name: 'Make (Integromat)',
        category: 'Developer Tools',
        description: 'Build complex automation workflows with Make',
        icon: '🔧',
        color: 'from-purple-400 to-indigo-600',
        isConnected: false,
        isPremium: true,
        connectionType: 'webhook',
        features: ['Visual workflow builder', 'Advanced logic', 'Error handling', 'Scheduling']
      }
    ];

    if (stored) {
      const storedIntegrations = JSON.parse(stored);
      // Merge with defaults to add any new integrations
      const merged = defaultIntegrations.map(def => {
        const existing = storedIntegrations.find((s: Integration) => s.id === def.id);
        return existing || def;
      });
      setIntegrations(merged);
    } else {
      setIntegrations(defaultIntegrations);
    }
  };

  const saveIntegrations = (updatedIntegrations: Integration[]) => {
    localStorage.setItem('integrations', JSON.stringify(updatedIntegrations));
    setIntegrations(updatedIntegrations);
  };

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConnectionData({});
    setShowConnectionModal(true);
  };

  const handleDisconnect = (integrationId: string) => {
    const updated = integrations.map(int =>
      int.id === integrationId
        ? { ...int, isConnected: false, config: {} }
        : int
    );
    saveIntegrations(updated);
    toast.success('Integration disconnected successfully');
  };

  const handleSettings = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConnectionData(integration.config || {});
    setShowSettingsModal(true);
  };

  const handleSubmitConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const updated = integrations.map(int =>
      int.id === selectedIntegration?.id
        ? { ...int, isConnected: true, config: connectionData }
        : int
    );
    saveIntegrations(updated);

    setIsConnecting(false);
    setShowConnectionModal(false);
    setShowSettingsModal(false);
    
    toast.success(`${selectedIntegration?.name} connected successfully!`, {
      description: 'Your integration is now active and ready to use'
    });
  };

  const handleTestConnection = async () => {
    toast.info('Testing connection...', {
      description: 'Verifying your credentials and connectivity'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate validation
    const isValid = Math.random() > 0.2; // 80% success rate for demo
    
    if (isValid) {
      toast.success('Connection test successful!', {
        description: 'All systems are working correctly'
      });
    } else {
      toast.error('Connection test failed', {
        description: 'Please check your credentials and try again'
      });
    }
  };

  const copyWebhookUrl = (integrationId: string) => {
    const webhookUrl = `https://api.voiceai.com/webhooks/${integrationId}/${Date.now()}`;
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Webhook URL copied to clipboard!');
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === "All" || integration.category === selectedCategory;
    const matchesSearch = searchQuery === "" ||
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = integrations.filter(i => i.isConnected).length;

  const renderConnectionForm = () => {
    if (!selectedIntegration) return null;

    switch (selectedIntegration.connectionType) {
      case 'api-key':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="text-slate-900 dark:text-slate-200">API Key *</Label>
              <div className="relative mt-2">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 dark:text-slate-400" />
                <Input
                  id="apiKey"
                  type="password"
                  required
                  value={connectionData.apiKey || ''}
                  onChange={(e) => setConnectionData({ ...connectionData, apiKey: e.target.value })}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10"
                  placeholder="Enter your API key"
                />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                Find your API key in your {selectedIntegration.name} account settings
              </p>
            </div>

            {selectedIntegration.id === 'hubspot' && (
              <div>
                <Label htmlFor="domain" className="text-slate-900 dark:text-slate-200">HubSpot Domain</Label>
                <Input
                  id="domain"
                  value={connectionData.domain || ''}
                  onChange={(e) => setConnectionData({ ...connectionData, domain: e.target.value })}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white mt-2"
                  placeholder="your-company.hubspot.com"
                />
              </div>
            )}

            <div className="bg-blue-100 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-blue-700 dark:text-blue-300 text-sm mb-1">How to get your API key:</h4>
                  <ol className="text-slate-700 dark:text-slate-300 text-xs space-y-1 list-decimal list-inside">
                    <li>Log in to your {selectedIntegration.name} account</li>
                    <li>Navigate to Settings → Integrations → API Keys</li>
                    <li>Click "Generate New API Key" or copy existing key</li>
                    <li>Paste the key above and click Connect</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        );

      case 'oauth':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-cyan-100/50 to-blue-100/50 dark:from-cyan-500/10 dark:to-blue-500/10 border border-cyan-300 dark:border-cyan-500/30 rounded-lg p-6 text-center">
              <Lock className="size-12 text-cyan-600 dark:text-cyan-400 mx-auto mb-4" />
              <h3 className="text-slate-900 dark:text-white mb-2">Secure OAuth Connection</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-4">
                Click the button below to securely connect your {selectedIntegration.name} account. 
                You'll be redirected to {selectedIntegration.name} to authorize access.
              </p>
              <Button
                type="button"
                onClick={() => {
                  toast.info('Redirecting to OAuth...', {
                    description: 'Opening authentication window'
                  });
                  // Simulate OAuth flow
                  setTimeout(() => {
                    setConnectionData({ accessToken: 'oauth_' + Date.now() });
                  }, 1000);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                <ExternalLink className="size-4 mr-2" />
                Authorize with {selectedIntegration.name}
              </Button>
            </div>

            {connectionData.accessToken && (
              <div className="bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-5" />
                  <span className="text-sm">Authorization successful! Click Connect to finish setup.</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhookUrl" className="text-slate-900 dark:text-slate-200">Webhook URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="webhookUrl"
                  value={`https://api.voiceai.com/webhooks/${selectedIntegration.id}/${Date.now()}`}
                  readOnly
                  className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copyWebhookUrl(selectedIntegration.id)}
                  className="border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                Copy this URL and add it to your {selectedIntegration.name} webhook settings
              </p>
            </div>

            <div>
              <Label htmlFor="events" className="text-slate-900 dark:text-slate-200">Events to Send</Label>
              <div className="space-y-2 mt-2">
                {['call_started', 'call_ended', 'call_completed', 'transcription_ready', 'sentiment_analyzed'].map(event => (
                  <div key={event} className="flex items-center gap-2">
                    <Switch
                      id={`event-${event}`}
                      checked={connectionData.events?.[event] || false}
                      onCheckedChange={(checked) => setConnectionData({
                        ...connectionData,
                        events: { ...connectionData.events, [event]: checked }
                      })}
                    />
                    <Label htmlFor={`event-${event}`} className="text-slate-700 dark:text-slate-300 text-sm cursor-pointer">
                      {event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Zap className="size-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-purple-700 dark:text-purple-300 text-sm mb-1">Webhook Configuration:</h4>
                  <ul className="text-slate-700 dark:text-slate-300 text-xs space-y-1">
                    <li>• Copy the webhook URL above</li>
                    <li>• Add it to your {selectedIntegration.name} integration settings</li>
                    <li>• Select the events you want to receive</li>
                    <li>• Test the connection to verify it's working</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'credentials':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientId" className="text-slate-900 dark:text-slate-200">Client ID *</Label>
              <Input
                id="clientId"
                required
                value={connectionData.clientId || ''}
                onChange={(e) => setConnectionData({ ...connectionData, clientId: e.target.value })}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white mt-2"
                placeholder="Enter your Client ID"
              />
            </div>

            <div>
              <Label htmlFor="clientSecret" className="text-slate-900 dark:text-slate-200">Client Secret *</Label>
              <Input
                id="clientSecret"
                type="password"
                required
                value={connectionData.clientSecret || ''}
                onChange={(e) => setConnectionData({ ...connectionData, clientSecret: e.target.value })}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white mt-2"
                placeholder="Enter your Client Secret"
              />
            </div>

            {selectedIntegration.id === 'paypal' && (
              <div>
                <Label htmlFor="environment" className="text-slate-900 dark:text-slate-200">Environment</Label>
                <Select
                  value={connectionData.environment || 'sandbox'}
                  onValueChange={(value) => setConnectionData({ ...connectionData, environment: value })}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                    <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                    <SelectItem value="production">Production (Live)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12"
        >
          <Badge className="bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/50 mb-4">
            Integrations
          </Badge>
          <h1 className="text-slate-900 dark:text-white text-3xl md:text-5xl mb-4">
            Connect Your <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">Favorite Tools</span>
          </h1>
          <p className="text-slate-700 dark:text-slate-400 text-base md:text-lg max-w-3xl">
            Seamlessly integrate with your existing workflow. Connect CRMs, communication tools, calendars, and more.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 md:mt-8">
            <Card className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800">
              <CardContent className="p-4 md:p-6">
                <div className="text-2xl md:text-3xl text-slate-900 dark:text-white mb-1">{integrations.length}</div>
                <div className="text-slate-700 dark:text-slate-400 text-xs md:text-sm">Available Integrations</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800">
              <CardContent className="p-4 md:p-6">
                <div className="text-2xl md:text-3xl text-cyan-600 dark:text-cyan-400 mb-1">{connectedCount}</div>
                <div className="text-slate-700 dark:text-slate-400 text-xs md:text-sm">Connected</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 col-span-2 md:col-span-1">
              <CardContent className="p-4 md:p-6">
                <div className="text-2xl md:text-3xl text-purple-600 dark:text-purple-400 mb-1">{integrationCategories.length - 1}</div>
                <div className="text-slate-700 dark:text-slate-400 text-xs md:text-sm">Categories</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <div className="mb-6 md:mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 size-4 md:size-5 text-slate-500 dark:text-slate-400" />
            <Input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 pl-10 md:pl-12 h-11 md:h-12 text-sm md:text-base"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {integrationCategories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`text-xs md:text-sm ${selectedCategory === category
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent hover:from-cyan-600 hover:to-blue-700"
                  : "border-slate-400 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-500 dark:hover:border-slate-600"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredIntegrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-all h-full flex flex-col ${
                integration.isConnected ? 'ring-2 ring-cyan-500/50' : ''
              }`}>
                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className={`size-10 md:size-12 rounded-lg bg-gradient-to-br ${integration.color} flex items-center justify-center text-xl md:text-2xl shrink-0`}>
                      {integration.icon}
                    </div>
                    <div className="flex gap-2">
                      {integration.isPremium && (
                        <Badge className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/50 text-xs">
                          Premium
                        </Badge>
                      )}
                      {integration.isConnected && (
                        <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/50 text-xs">
                          <CheckCircle2 className="size-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-slate-900 dark:text-white text-base md:text-lg mb-2">{integration.name}</CardTitle>
                  <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                    {integration.description}
                  </p>
                  <div className="space-y-1">
                    {integration.features.slice(0, 3).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                        <CheckCircle2 className="size-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {integration.isConnected ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSettings(integration)}
                        variant="outline"
                        className="flex-1 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 text-xs md:text-sm h-9 md:h-10"
                      >
                        <Settings className="size-3 md:size-4 mr-1 md:mr-2" />
                        Settings
                      </Button>
                      <Button
                        onClick={() => handleDisconnect(integration.id)}
                        variant="outline"
                        className="border-red-300 dark:border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-400 dark:hover:border-red-500 h-9 md:h-10"
                      >
                        <Trash2 className="size-3 md:size-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleConnect(integration)}
                      className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white text-xs md:text-sm h-9 md:h-10"
                    >
                      <Plus className="size-3 md:size-4 mr-1 md:mr-2" />
                      Connect
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No integrations found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Connection Modal */}
      <Dialog open={showConnectionModal} onOpenChange={setShowConnectionModal}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl text-slate-900 dark:text-white">Connect {selectedIntegration?.name}</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Set up your {selectedIntegration?.name} integration to start syncing data
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitConnection} className="space-y-6 mt-4">
            {renderConnectionForm()}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-300 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                className="flex-1 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Test Connection
              </Button>
              <Button
                type="submit"
                disabled={isConnecting}
                className="flex-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white"
              >
                {isConnecting ? 'Connecting...' : (
                  <>
                    <CheckCircle2 className="size-4 mr-2" />
                    Connect {selectedIntegration?.name}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl text-slate-900 dark:text-white">{selectedIntegration?.name} Settings</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Manage your {selectedIntegration?.name} integration settings
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitConnection} className="space-y-6 mt-4">
            {renderConnectionForm()}

            <div>
              <Label className="text-slate-700 dark:text-slate-300 mb-2 block">Sync Settings</Label>
              <div className="space-y-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-900 dark:text-white text-sm">Auto-sync enabled</div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs">Automatically sync data in real-time</div>
                  </div>
                  <Switch
                    checked={connectionData.autoSync || false}
                    onCheckedChange={(checked) => setConnectionData({ ...connectionData, autoSync: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-900 dark:text-white text-sm">Two-way sync</div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs">Sync data bidirectionally</div>
                  </div>
                  <Switch
                    checked={connectionData.twoWaySync || false}
                    onCheckedChange={(checked) => setConnectionData({ ...connectionData, twoWaySync: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-300 dark:border-slate-800">
              <Button
                type="submit"
                disabled={isConnecting}
                className="flex-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white"
              >
                {isConnecting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}