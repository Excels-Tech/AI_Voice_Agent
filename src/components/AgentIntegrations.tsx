import { useEffect, useState } from "react";
import {
  X,
  Plus,
  Check,
  Settings,
  Video,
  Mic,
  MicOff,
  Users,
  Calendar,
  Zap,
  ExternalLink,
  Copy,
  RefreshCw,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { useLiveCallSession } from "../hooks/useLiveCallSession";

interface AgentIntegrationsProps {
  agent: any;
  onClose: () => void;
}

export function AgentIntegrations({ agent, onClose }: AgentIntegrationsProps) {
  const [activeTab, setActiveTab] = useState<"platforms" | "live" | "settings">("platforms");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const agentSlug =
    (agent?.name || "voiceai")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "voiceai";
  const createVoiceLink = () => `https://meet.jit.si/${agentSlug}-voiceai-${Math.random().toString(36).slice(-5)}`;
  const [voiceRoomLink] = useState(() => createVoiceLink());
  const [quickJoinUrl, setQuickJoinUrl] = useState(voiceRoomLink);

  const [integrations, setIntegrations] = useState([
    {
      id: "voiceai-room",
      name: "VoiceAI Room",
      icon: "??",
      color: "bg-indigo-600",
      connected: true,
      status: "active",
      meetings: 14,
      joinUrl: voiceRoomLink,
      description: "Built-in browser meeting room powered by Jitsi. No paid conferencing account required.",
    },
    {
      id: "zoom",
      name: "Zoom",
      icon: "??",
      color: "bg-blue-500",
      connected: false,
      status: "inactive",
      meetings: 0,
      requiresCredentials: true,
      requiresPaidPlan: true,
      note: "Zoom's Meeting SDK/API requires a paid Pro or Business key. Use VoiceAI Room or Meet if you do not have one.",
    },
    {
      id: "google-meet",
      name: "Google Meet",
      icon: "??",
      color: "bg-green-500",
      connected: true,
      status: "active",
      meetings: 8,
      joinUrl: "https://meet.new",
      description: "Generate a free meet.new link with any Gmail account.",
    },
    {
      id: "microsoft-teams",
      name: "Microsoft Teams",
      icon: "??",
      color: "bg-purple-500",
      connected: false,
      status: "inactive",
      meetings: 0,
      requiresCredentials: true,
      note: "Requires a Microsoft Entra app registration with OnlineMeetings.ReadWrite scope.",
    },
    {
      id: "webex",
      name: "Cisco Webex",
      icon: "??",
      color: "bg-teal-500",
      connected: false,
      status: "inactive",
      meetings: 0,
      requiresCredentials: true,
    },
    {
      id: "slack-huddle",
      name: "Slack Huddle",
      icon: "??",
      color: "bg-pink-500",
      connected: false,
      status: "inactive",
      meetings: 0,
      requiresCredentials: true,
    },
  ]);

  const [liveMeetings, setLiveMeetings] = useState([
    {
      id: 1,
      platform: "voiceai-room",
      title: "VoiceAI Browser Room",
      url: voiceRoomLink,
      participants: 1,
      duration: "LIVE",
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
  const [activeMeetingUrl, setActiveMeetingUrl] = useState<string | null>(null);
  const {
    isCallActive,
    isStarting: isStartingCall,
    callDuration,
    status: callStatus,
    microphoneStatus,
    isRecordingUtterance,
    isMicrophoneMuted,
    isAssistantAudioMuted,
    error: callError,
    startCall,
    stopCall,
    startUtteranceRecording,
    stopUtteranceRecording,
    toggleMicrophoneMute,
    toggleAssistantAudioMute,
  } = useLiveCallSession(agent?.id);

  useEffect(() => {
    if (callError) {
      toast.error(callError);
    }
  }, [callError]);

  useEffect(() => {
    if (isCallActive && !isRecordingUtterance && microphoneStatus === "ready") {
      startUtteranceRecording();
    }
  }, [isCallActive, isRecordingUtterance, microphoneStatus, startUtteranceRecording]);

  useEffect(() => {
    return () => {
      stopUtteranceRecording();
      stopCall();
    };
  }, [stopCall, stopUtteranceRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const connectAgentBridge = async (meetingUrl: string, platformId?: string) => {
    if (!agent?.id) {
      toast.error("Cannot start voice bridge: missing agent ID");
      return;
    }
    if (!meetingUrl) {
      toast.error("No meeting URL detected");
      return;
    }
    if (isStartingCall) {
      toast.info("Voice bridge is already connecting...");
      return;
    }

    if (isCallActive) {
      stopUtteranceRecording();
      stopCall();
    }

    setActiveMeetingUrl(meetingUrl);
    try {
      await startCall({
        phoneNumber: `${platformId || "meeting"}:${meetingUrl}`,
        callerName: agent.name,
        language: agent.language,
      });
      toast.success("Voice bridge connected");
    } catch (err) {
      setActiveMeetingUrl(null);
    }
  };

  const handleBridgeDisconnect = () => {
    if (!isCallActive && !isStartingCall) return;
    setActiveMeetingUrl(null);
    try {
      stopUtteranceRecording();
      stopCall();
    } catch (err) {
      console.error("Failed to stop voice bridge", err);
    } finally {
      toast.success("Voice bridge disconnected");
    }
  };

  const handleCloseModal = () => {
    try {
      handleBridgeDisconnect();
    } catch (err) {
      console.error("Failed to disconnect before closing", err);
    }
    onClose();
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  const detectPlatformFromUrl = (url: string) => {
    if (!url) return "custom";
    if (url.includes("jit.si")) return "voiceai-room";
    if (url.includes("zoom.us")) return "zoom";
    if (url.includes("meet.google")) return "google-meet";
    if (url.includes("teams.microsoft")) return "microsoft-teams";
    return "custom";
  };

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

  const regenerateQuickLink = () => {
    const freshLink = createVoiceLink();
    setQuickJoinUrl(freshLink);
  };

  const handleJoinMeeting = (url?: string, platformId?: string) => {
    if (!url) {
      toast.error("Please provide a meeting link");
      return;
    }
    const meetingUrl = url.trim();
    if (!meetingUrl) {
      toast.error("Please provide a valid meeting URL");
      return;
    }
    const resolvedPlatform = platformId || detectPlatformFromUrl(meetingUrl);
    toast.success("Launching meeting and connecting your agent...");
    window.open(meetingUrl, "_blank", "noopener,noreferrer");
    setLiveMeetings((prev) => [
      {
        id: Date.now(),
        platform: resolvedPlatform,
        title: "Instant Meeting",
        url: meetingUrl,
        participants: Math.max(1, prev[0]?.participants || 1),
        duration: "LIVE",
        agentActive: true,
        status: "in-progress",
      },
      ...prev,
    ]);
    connectAgentBridge(meetingUrl, resolvedPlatform);
  };

  const handleResumeMeeting = (meeting: (typeof liveMeetings)[number]) => {
    if (!meeting?.url) {
      toast.error("Meeting link unavailable");
      return;
    }
    window.open(meeting.url, "_blank", "noopener,noreferrer");
    connectAgentBridge(meeting.url, meeting.platform);
  };

  const handleBridgeReconnect = () => {
    const targetUrl = activeMeetingUrl || quickJoinUrl;
    if (!targetUrl) {
      toast.error("No meeting link available");
      return;
    }
    if (activeMeetingUrl) {
      connectAgentBridge(activeMeetingUrl, detectPlatformFromUrl(activeMeetingUrl));
    } else {
      handleJoinMeeting(targetUrl);
    }
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
    const leaving = liveMeetings.find((m) => m.id === meetingId);
    setLiveMeetings(liveMeetings.filter((m) => m.id !== meetingId));
    if (leaving?.url && leaving.url === activeMeetingUrl) {
      handleBridgeDisconnect();
    }
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCloseModal}
          >
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

                        {integration.joinUrl && (
                          <div className="space-y-2 mb-4">
                            <Label className="text-xs uppercase text-slate-500">Shareable link</Label>
                            <div className="flex gap-2">
                              <Input readOnly value={integration.joinUrl} className="text-sm" />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyLink(integration.joinUrl)}
                              >
                                <Copy className="size-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleJoinMeeting(integration.joinUrl, integration.id)}
                              >
                                <ExternalLink className="size-4" />
                              </Button>
                            </div>
                            {integration.description && (
                              <p className="text-xs text-slate-600">{integration.description}</p>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          {integration.connected ? (
                            integration.joinUrl ? (
                              <>
                                <Button
                                  size="sm"
                                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handleJoinMeeting(integration.joinUrl!, integration.id)}
                                >
                                  <Video className="size-4 mr-2" />
                                  Launch Room
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
                            )
                          ) : (
                            <div className="flex-1">
                              <Button
                                size="sm"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => setSelectedPlatform(integration.id)}
                              >
                                <Plus className="size-4 mr-2" />
                                Connect
                              </Button>
                              {integration.note && (
                                <p className="text-xs text-amber-600 mt-2">{integration.note}</p>
                              )}
                            </div>
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
                    Use our free browser room or paste any Google Meet / Teams / Webex link
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <Input
                      value={quickJoinUrl}
                      onChange={(e) => setQuickJoinUrl(e.target.value)}
                      placeholder="https://meet.google.com/abc-defg or https://meet.jit.si/voiceai-room"
                      className="flex-1"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(quickJoinUrl)}
                      >
                        <Copy className="size-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={regenerateQuickLink}
                      >
                        <RefreshCw className="size-4 mr-2" />
                        New Free Link
                      </Button>
                      <Button
                        onClick={() => handleJoinMeeting(quickJoinUrl)}
                        className="bg-blue-600 hover:bg-blue-700 flex-1"
                      >
                        <Video className="size-4 mr-2" />
                        Launch Agent In Meeting
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600">
                      The generated link uses a free VoiceAI / Jitsi room, so you can test the agent without Zoom or any paid key.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PhoneCall className="size-5 text-green-600" />
                    Agent Voice Bridge
                  </CardTitle>
                  <CardDescription>
                    Live call session that streams your mic into {agent.name} so it can speak inside the meeting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs uppercase text-slate-500">Connection</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          className={`text-white ${
                            isCallActive ? "bg-green-500" : isStartingCall ? "bg-amber-500" : "bg-slate-400"
                          }`}
                        >
                          {isCallActive ? "Connected" : isStartingCall ? "Connecting..." : "Idle"}
                        </Badge>
                        {isCallActive && (
                          <span className="text-sm text-slate-600">{formatDuration(callDuration)}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">Microphone</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          className={`text-white ${
                            microphoneStatus === "ready"
                              ? "bg-green-500"
                              : microphoneStatus === "blocked"
                              ? "bg-red-500"
                              : "bg-slate-400"
                          }`}
                        >
                          {microphoneStatus === "ready"
                            ? "Ready"
                            : microphoneStatus === "blocked"
                            ? "Permission needed"
                            : "Requesting"}
                        </Badge>
                        <span className="text-sm text-slate-600">
                          {isMicrophoneMuted ? "Muted" : isRecordingUtterance ? "Listening" : "Paused"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">Active Room</p>
                      <p className="text-sm text-slate-900 break-all">
                        {activeMeetingUrl || "No room launched yet"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!isCallActive && !isStartingCall}
                      onClick={toggleMicrophoneMute}
                    >
                      {isMicrophoneMuted ? <MicOff className="size-4 mr-2" /> : <Mic className="size-4 mr-2" />}
                      {isMicrophoneMuted ? "Unmute Myself" : "Mute Myself"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!isCallActive}
                      onClick={toggleAssistantAudioMute}
                    >
                      {isAssistantAudioMuted ? (
                        <VolumeX className="size-4 mr-2" />
                      ) : (
                        <Volume2 className="size-4 mr-2" />
                      )}
                      {isAssistantAudioMuted ? "Unmute Agent Audio" : "Mute Agent Audio"}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleBridgeReconnect}
                      disabled={isStartingCall}
                    >
                      {isStartingCall ? (
                        <Loader2 className="size-4 mr-2 animate-spin" />
                      ) : (
                        <PhoneCall className="size-4 mr-2" />
                      )}
                      {isCallActive ? "Reconnect Agent" : "Start Voice Bridge"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={!isCallActive && !isStartingCall}
                      onClick={handleBridgeDisconnect}
                    >
                      <PhoneOff className="size-4 mr-2" />
                      End Bridge
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
                                  <span className="text-slate-300">|</span>
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
                                onClick={() => handleCopyLink(meeting.url)}
                              >
                                <Copy className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResumeMeeting(meeting)}
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
                <Button type="button" variant="outline" onClick={onClose}>
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
  const needsCredentials = platform?.requiresCredentials !== false;

  const handleConnect = () => {
    if (needsCredentials && (!credentials.apiKey || !credentials.apiSecret)) {
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
            {platform.requiresPaidPlan
              ? "This integration needs a paid enterprise key before VoiceAI can join your meetings."
              : "Enter your API credentials to connect"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {needsCredentials && (
            <>
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
            </>
          )}

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
              for {platform.name}.
              {platform.note && <span className="block mt-1 text-amber-700">{platform.note}</span>}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
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
