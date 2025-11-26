import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Phone,
  Plus,
  Trash2,
  RefreshCw,
  Check,
  X,
  ExternalLink,
  PhoneCall,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

export function TelephonyProvider() {
  const [providers, setProviders] = useState([
    {
      id: 1,
      name: "Twilio",
      status: "connected",
      accountSid: "AC**********************",
      numbers: 5,
      lastSync: "2 hours ago",
    },
  ]);
  const [showConnect, setShowConnect] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState([
    {
      id: 1,
      number: "+1 (555) 123-4567",
      type: "local",
      country: "US",
      capabilities: ["voice", "sms"],
      assignedAgent: "Sales Agent",
      status: "active",
    },
    {
      id: 2,
      number: "+1 (555) 234-5678",
      type: "toll-free",
      country: "US",
      capabilities: ["voice"],
      assignedAgent: "Support Agent",
      status: "active",
    },
    {
      id: 3,
      number: "+44 20 1234 5678",
      type: "local",
      country: "UK",
      capabilities: ["voice", "sms"],
      assignedAgent: null,
      status: "available",
    },
  ]);
  const [twilioConfig, setTwilioConfig] = useState({
    accountSid: "",
    authToken: "",
    apiKey: "",
  });

  const handleConnectTwilio = () => {
    if (!twilioConfig.accountSid || !twilioConfig.authToken) {
      toast.error("Please enter Account SID and Auth Token");
      return;
    }
    const newProvider = {
      id: providers.length + 1,
      name: "Twilio",
      status: "connected",
      accountSid: twilioConfig.accountSid.substring(0, 5) + "********************",
      numbers: 0,
      lastSync: "Just now",
    };
    setProviders([...providers, newProvider]);
    setTwilioConfig({ accountSid: "", authToken: "", apiKey: "" });
    setShowConnect(false);
    toast.success("Twilio account connected successfully!");
  };

  const handleSyncNumbers = () => {
    toast.success("Syncing phone numbers from Twilio...");
    setTimeout(() => {
      toast.success("Phone numbers synced successfully!");
    }, 1500);
  };

  const handleDisconnect = (id: number) => {
    if (confirm("Are you sure you want to disconnect this provider?")) {
      setProviders(providers.filter((p) => p.id !== id));
      toast.success("Provider disconnected");
    }
  };

  const handlePurchaseNumber = () => {
    toast.success("Redirecting to Twilio to purchase numbers...");
  };

  const handleReleaseNumber = (id: number) => {
    const number = phoneNumbers.find((n) => n.id === id);
    if (confirm(`Release number ${number?.number}?`)) {
      setPhoneNumbers(phoneNumbers.filter((n) => n.id !== id));
      toast.success("Number released");
    }
  };

  const handleAssignNumber = (numberId: number) => {
    toast.success("Opening agent assignment...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">Telephony Providers</h1>
          <p className="text-slate-600">
            Manage phone numbers and telephony integrations
          </p>
        </div>
        <Button
          onClick={() => setShowConnect(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="size-4 mr-2" />
          Connect Provider
        </Button>
      </div>

      {/* Connect Provider Form */}
      {showConnect && (
        <Card className="bg-white border-blue-200 border-2">
          <CardHeader>
            <CardTitle>Connect Twilio Account</CardTitle>
            <CardDescription>
              Enter your Twilio credentials to connect your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900 mb-2">📱 How to get your credentials:</p>
              <ol className="text-blue-700 text-sm space-y-1 ml-4 list-decimal">
                <li>Go to your Twilio Console</li>
                <li>Find Account SID and Auth Token</li>
                <li>Copy and paste them below</li>
              </ol>
              <Button
                variant="link"
                className="text-blue-600 p-0 h-auto mt-2"
                onClick={() => toast.success("Opening Twilio Console...")}
              >
                Open Twilio Console
                <ExternalLink className="size-3 ml-1" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-sid">Account SID *</Label>
              <Input
                id="account-sid"
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={twilioConfig.accountSid}
                onChange={(e) =>
                  setTwilioConfig({ ...twilioConfig, accountSid: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-token">Auth Token *</Label>
              <Input
                id="auth-token"
                type="password"
                placeholder="Your auth token"
                value={twilioConfig.authToken}
                onChange={(e) =>
                  setTwilioConfig({ ...twilioConfig, authToken: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key (optional)</Label>
              <Input
                id="api-key"
                placeholder="For enhanced security"
                value={twilioConfig.apiKey}
                onChange={(e) =>
                  setTwilioConfig({ ...twilioConfig, apiKey: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleConnectTwilio}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Check className="size-4 mr-2" />
                Connect Account
              </Button>
              <Button variant="outline" onClick={() => setShowConnect(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected Providers */}
      {providers.length > 0 && (
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Connected Providers</CardTitle>
              <Button variant="outline" size="sm" onClick={handleSyncNumbers}>
                <RefreshCw className="size-4 mr-2" />
                Sync Numbers
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white">
                      <Phone className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-slate-900">{provider.name}</p>
                        <Badge className="bg-green-500">
                          <Check className="size-3 mr-1" />
                          {provider.status}
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-sm">
                        {provider.accountSid} • {provider.numbers} numbers • Synced{" "}
                        {provider.lastSync}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success("Opening provider settings...")}
                    >
                      <Settings className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(provider.id)}
                    >
                      <X className="size-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phone Numbers */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Phone Numbers</CardTitle>
              <CardDescription>
                Manage your phone numbers and assign them to agents
              </CardDescription>
            </div>
            <Button
              onClick={handlePurchaseNumber}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="size-4 mr-2" />
              Purchase Number
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {phoneNumbers.map((number) => (
              <div
                key={number.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                    <PhoneCall className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-slate-900">{number.number}</p>
                      <Badge variant="outline" className="capitalize">
                        {number.type}
                      </Badge>
                      <Badge
                        variant={
                          number.status === "active" ? "default" : "secondary"
                        }
                        className={
                          number.status === "active" ? "bg-green-500" : ""
                        }
                      >
                        {number.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600">
                        {number.country === "US" ? "🇺🇸" : "🇬🇧"} {number.country}
                      </span>
                      <span className="text-slate-600">
                        {number.capabilities.join(", ")}
                      </span>
                      {number.assignedAgent && (
                        <span className="text-blue-600">
                          → {number.assignedAgent}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!number.assignedAgent ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignNumber(number.id)}
                    >
                      Assign to Agent
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignNumber(number.id)}
                    >
                      Reassign
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReleaseNumber(number.id)}
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {providers.length === 0 && (
        <Card className="bg-white border-slate-200">
          <CardContent className="p-12 text-center">
            <Phone className="size-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-slate-900 mb-2">No Providers Connected</h3>
            <p className="text-slate-600 mb-6">
              Connect a telephony provider to start making and receiving calls
            </p>
            <Button
              onClick={() => setShowConnect(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="size-4 mr-2" />
              Connect Twilio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
