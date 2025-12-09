import { useState } from "react";
import { X, Plus, Check, Settings, Video, Mic, Users, Calendar, Zap, ExternalLink, Copy } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { copyToClipboard } from "../utils/clipboard";

interface AgentIntegrationsProps {
  agent: any;
  onClose: () => void;
}

export function AgentIntegrations({ agent, onClose }: AgentIntegrationsProps) {
  const [activeTab, setActiveTab] = useState<"platforms" | "live" | "settings">("platforms");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const [integrations, setIntegrations] = useState([
    {
      id: "zoom",
      name: "Zoom",
      icon: "🎥",
      color: "bg-blue-500",
      connected: true,
      status: "active",
      meetings: 12,
    },
    {
      id: "google-meet",
      name: "Google Meet",
      icon: "📹",
      color: "bg-green-500",
      connected: true,
      status: "active",
      meetings: 8,
    },
    {
      id: "microsoft-teams",
      name: "Microsoft Teams",
      icon: "👥",
      color: "bg-purple-500",
      connected: false,
      status: "inactive",
      meetings: 0,
    },
    {
      id: "webex",
      name: "Cisco Webex",
      icon: "💼",
      color: "bg-teal-500",
      connected: false,
      status: "inactive",
      meetings: 0,
    },
    {
      id: "slack-huddle",
      name: "Slack Huddle",
      icon: "💬",
      color: "bg-pink-500",
      connected: false,
      status: "inactive",
      meetings: 0,
    },
  ]);

  const [liveMeetings, setLiveMeetings] = useState([
    {
      id: 1,
      platform: "zoom",
      title: "Sales Strategy Review",
      url: "https://zoom.us/j/123456789",
      participants: 5,
      duration: "32 min",
      agentActive: true,
      status: "in-progress",
    },
    {
      id: 2,
      platform: "google-meet",
      title: "Customer Onboarding",
      url: "https://meet.google.com/abc-defg-hij",
      participants: 3,
      duration: "18 min",
      agentActive: true,
      status: "in-progress",
    },
  ]);

  const [meetingSettings, setMeetingSettings] = useState({
    autoJoin: true,
    muteOnEntry: false,
    videoOnEntry: false,
    speakWhenAddressed: true,
    interruptionMode: "polite",
    responseDelay: 1,
    transcribeAll: true,
    recordMeetings: true,
    answerQuestions: true,
    provideInsights: true,
    summarizeMeeting: true,
    quietMode: false,
    keywordTriggers: "hey agent, voice assistant, AI",
  });

  const handleConnect = (platformId: string) => {
    setIntegrations(
      integrations.map((int) =>
        int.id === platformId
          ? { ...int, connected: true, status: "active" }
          : int
      )
    );
    toast.success(`Connected to ${integrations.find(i => i.id === platformId)?.name}`);
    setSelectedPlatform(null);
  };

  const handleDisconnect = (platformId: string) => {
    if (confirm("Are you sure you want to disconnect this integration?")) {
      setIntegrations(
        integrations.map((int) =>
          int.id === platformId
            ? { ...int, connected: false, status: "inactive" }
            : int
        )
      );
      toast.success("Integration disconnected");
    }
  };

  const handleJoinMeeting = () => {
    toast.success("Agent joining meeting...");
  };

  const handleToggleAgent = (meetingId: number) => {
    setLiveMeetings(
      liveMeetings.map((meeting) =>
        meeting.id === meetingId
          ? { ...meeting, agentActive: !meeting.agentActive }
          : meeting
      )
    );
  };

  const handleLeaveMeeting = (meetingId: number) => {
    setLiveMeetings(liveMeetings.filter((m) => m.id !== meetingId));
    toast.success("Agent left the meeting");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-slate-900">Meeting Integrations - {agent.name}</h2>
            <p className="text-slate-600 text-sm">
              Connect your agent to video conferencing platforms
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b bg-slate-50">
          <div className="flex gap-6 px-6">
            <button
              onClick={() => setActiveTab("platforms")}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === "platforms"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Video className="size-4" />
                <span>Platforms</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("live")}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === "live"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="size-4" />
                <span>Live Meetings</span>
                {liveMeetings.length > 0 && (
                  <Badge className="bg-red-500 text-white">{liveMeetings.length}</Badge>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === "settings"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="size-4" />
                <span>Settings</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Platforms Tab */}
          {activeTab === "platforms" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-slate-900 mb-4">Connected Platforms</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {integrations.map((integration) => (
                    <Card
                      key={integration.id}
                      className={`border-2 transition-all ${
                        integration.connected
                          ? "border-green-200 bg-green-50"
                          : "border-slate-200"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`size-12 rounded-lg ${integration.color} flex items-center justify-center text-2xl`}
                            >
                              {integration.icon}
                            </div>
                            <div>
                              <p className="text-slate-900">{integration.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant={
                                    integration.connected ? "default" : "secondary"
                                  }
                                  className={
                                    integration.connected
                                      ? "bg-green-500"
                                      : "bg-slate-400"
                                  }
                                >
                                  {integration.status}
                                </Badge>
                                {integration.connected && (
                                  <span className="text-slate-600 text-sm">
                                    {integration.meetings} meetings
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {integration.connected && (
                            <Check className="size-5 text-green-600" />
                          )}
                        </div>

                        <div className="flex gap-2">
                          {integration.connected ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setSelectedPlatform(integration.id)}
                              >
                                <Settings className="size-4 mr-2" />
                                Configure
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDisconnect(integration.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              onClick={() => setSelectedPlatform(integration.id)}
                            >
                              <Plus className="size-4 mr-2" />
                              Connect
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Join */}
              <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="size-5 text-blue-600" />
                    Quick Join Meeting
                  </CardTitle>
                  <CardDescription>
                    Enter a meeting URL to join instantly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleJoinMeeting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Video className="size-4 mr-2" />
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Live Meetings Tab */}
          {activeTab === "live" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900">Active Meetings ({liveMeetings.length})</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("platforms")}
                >
                  <Plus className="size-4 mr-2" />
                  Join New Meeting
                </Button>
              </div>

              {liveMeetings.length > 0 ? (
                <div className="space-y-3">
                  {liveMeetings.map((meeting) => (
                    <Card key={meeting.id} className="border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="size-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                                <Video className="size-5" />
                              </div>
                              <div>
                                <p className="text-slate-900">{meeting.title}</p>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                    <span className="flex items-center gap-1">
                                      <span className="size-2 bg-red-600 rounded-full animate-pulse" />
                                      LIVE
                                    </span>
                                  </Badge>
                                  <span>{meeting.participants} participants</span>
                                  <span>•</span>
                                  <span>{meeting.duration}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <code className="text-sm bg-slate-100 px-2 py-1 rounded flex-1">
                                {meeting.url}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  copyToClipboard(meeting.url);
                                  toast.success("URL copied!");
                                }}
                              >
                                <Copy className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(meeting.url, "_blank")}
                              >
                                <ExternalLink className="size-4" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge
                                variant={meeting.agentActive ? "default" : "secondary"}
                                className={
                                  meeting.agentActive ? "bg-green-500" : "bg-slate-400"
                                }
                              >
                                <Mic className="size-3 mr-1" />
                                {meeting.agentActive ? "Agent Active" : "Agent Muted"}
                              </Badge>
                              <span className="text-sm text-slate-600">
                                Listening and responding to queries
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleAgent(meeting.id)}
                              className={
                                meeting.agentActive
                                  ? "border-orange-300 text-orange-700 hover:bg-orange-50"
                                  : "border-green-300 text-green-700 hover:bg-green-50"
                              }
                            >
                              <Mic className="size-4 mr-2" />
                              {meeting.agentActive ? "Mute Agent" : "Activate Agent"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLeaveMeeting(meeting.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Leave Meeting
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-slate-200">
                  <CardContent className="p-12 text-center">
                    <Video className="size-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-slate-900 mb-2">No Active Meetings</h3>
                    <p className="text-slate-600 mb-4">
                      Your agent is not currently in any meetings
                    </p>
                    <Button
                      onClick={() => setActiveTab("platforms")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Video className="size-4 mr-2" />
                      Join a Meeting
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle>Meeting Behavior</CardTitle>
                  <CardDescription>
                    Configure how your agent behaves in meetings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={meetingSettings.autoJoin}
                      onChange={(e) =>
                        setMeetingSettings({
                          ...meetingSettings,
                          autoJoin: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <div>
                      <p className="text-slate-900">Auto-join scheduled meetings</p>
                      <p className="text-slate-600 text-sm">
                        Agent joins calendar meetings automatically
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={meetingSettings.muteOnEntry}
                      onChange={(e) =>
                        setMeetingSettings({
                          ...meetingSettings,
                          muteOnEntry: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <div>
                      <p className="text-slate-900">Mute on entry</p>
                      <p className="text-slate-600 text-sm">
                        Agent stays muted until activated
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={meetingSettings.videoOnEntry}
                      onChange={(e) =>
                        setMeetingSettings({
                          ...meetingSettings,
                          videoOnEntry: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <div>
                      <p className="text-slate-900">Enable video on entry</p>
                      <p className="text-slate-600 text-sm">
                        Show agent avatar when joining
                      </p>
                    </div>
                  </label>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle>Response Settings</CardTitle>
                  <CardDescription>
                    Control when and how the agent responds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={meetingSettings.speakWhenAddressed}
                      onChange={(e) =>
                        setMeetingSettings({
                          ...meetingSettings,
                          speakWhenAddressed: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <div>
                      <p className="text-slate-900">Speak when addressed</p>
                      <p className="text-slate-600 text-sm">
                        Respond only when mentioned by name
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={meetingSettings.answerQuestions}
                      onChange={(e) =>
                        setMeetingSettings({
                          ...meetingSettings,
                          answerQuestions: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <div>
                      <p className="text-slate-900">Answer questions</p>
                      <p className="text-slate-600 text-sm">
                        Respond to direct questions from participants
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={meetingSettings.provideInsights}
                      onChange={(e) =>
                        setMeetingSettings({
                          ...meetingSettings,
                          provideInsights: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <div>
                      <p className="text-slate-900">Provide insights</p>
                      <p className="text-slate-600 text-sm">
                        Offer relevant information during discussions
                      </p>
                    </div>
                  </label>

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="interruptMode">Interruption Mode</Label>
                    <select
                      id="interruptMode"
                      value={meetingSettings.interruptionMode}
                      onChange={(e) =>
                        setMeetingSettings({
                          ...meetingSettings,
                          interruptionMode: e.target.value,
                        })
                      }
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                    >
                      <option value="polite">Polite (wait for pauses)</option>
                      <option value="assertive">Assertive (interrupt when needed)</option>
                      <option value="passive">Passive (never interrupt)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responseDelay">
                      Response Delay (seconds): {meetingSettings.responseDelay}
                    </Label>
                    <input
                      id="responseDelay"
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={meetingSettings.responseDelay}
                      onChange={(e) =>
                        setMeetingSettings({
                          ...meetingSettings,
                          responseDelay: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <p className="text-slate-600 text-sm">
                      Wait time before responding to give others chance to speak
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keyword Triggers</Label>
                    <Input
                      id="keywords"
                      value={meetingSettings.keywordTriggers}
                      onChange={(e) =>
                        setMeetingSettings({
                          ...meetingSettings,
                          keywordTriggers: e.target.value,
                        })
                      }
                      placeholder="hey agent, voice assistant, AI"
                    />
                    <p className="text-slate-600 text-sm">
                      Comma-separated keywords that activate the agent
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle>Recording & Transcription</CardTitle>
                  <CardDescription>Data capture settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={meetingSettings.transcribeAll}
                      onChange={(e) =>
                        setMeetingSettings({
                          ...meetingSettings,
                          transcribeAll: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <div>
                      <p className="text-slate-900">Transcribe all conversations</p>
                      <p className="text-slate-600 text-sm">
                        Convert speech to text in real-time
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={meetingSettings.recordMeetings}
                      onChange={(e) =>
                        setMeetingSettings({
                          ...meetingSettings,
                          recordMeetings: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <div>
                      <p className="text-slate-900">Record meetings</p>
                      <p className="text-slate-600 text-sm">
                        Save audio recordings of meetings
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={meetingSettings.summarizeMeeting}
                      onChange={(e) =>
                        setMeetingSettings({
                          ...meetingSettings,
                          summarizeMeeting: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <div>
                      <p className="text-slate-900">Auto-generate meeting summary</p>
                      <p className="text-slate-600 text-sm">
                        Create summary with action items after meeting
                      </p>
                    </div>
                  </label>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success("Meeting settings saved!");
                    onClose();
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Connection Modal */}
        {selectedPlatform && (
          <ConnectionModal
            platform={integrations.find((i) => i.id === selectedPlatform)!}
            onConnect={() => handleConnect(selectedPlatform)}
            onClose={() => setSelectedPlatform(null)}
          />
        )}
      </div>
    </div>
  );
}

function ConnectionModal({ platform, onConnect, onClose }: any) {
  const [credentials, setCredentials] = useState({
    apiKey: "",
    apiSecret: "",
    webhookUrl: "",
  });

  const handleConnect = () => {
    if (!credentials.apiKey || !credentials.apiSecret) {
      toast.error("Please fill in all required fields");
      return;
    }
    onConnect();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{platform.icon}</span>
            Connect {platform.name}
          </CardTitle>
          <CardDescription>
            Enter your API credentials to connect
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key *</Label>
            <Input
              id="apiKey"
              value={credentials.apiKey}
              onChange={(e) =>
                setCredentials({ ...credentials, apiKey: e.target.value })
              }
              placeholder="Enter your API key"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiSecret">API Secret *</Label>
            <Input
              id="apiSecret"
              type="password"
              value={credentials.apiSecret}
              onChange={(e) =>
                setCredentials({ ...credentials, apiSecret: e.target.value })
              }
              placeholder="Enter your API secret"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook">Webhook URL (Optional)</Label>
            <Input
              id="webhook"
              value={credentials.webhookUrl}
              onChange={(e) =>
                setCredentials({ ...credentials, webhookUrl: e.target.value })
              }
              placeholder="https://your-domain.com/webhook"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              📖 Need help? Check our{" "}
              <a href="#" className="underline">
                integration guide
              </a>{" "}
              for {platform.name}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleConnect}
            >
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}