import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Phone,
  PhoneOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Radio,
  Clock,
  User,
  Bot,
  Activity,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

export function RealTimeMonitoring() {
  const [activeCalls, setActiveCalls] = useState([
    {
      id: 1,
      agent: "Sales Agent Pro",
      caller: "John Smith",
      callerNumber: "+1 (555) 123-4567",
      direction: "inbound",
      status: "active",
      duration: 125,
      sentiment: "positive",
      transcript: [
        { speaker: "agent", text: "Hello! Thanks for calling. How can I help you today?" },
        {
          speaker: "caller",
          text: "Hi, I'm interested in learning more about your pricing plans.",
        },
        {
          speaker: "agent",
          text: "Great! I'd be happy to help. Are you looking for a solution for personal use or for your business?",
        },
        { speaker: "caller", text: "For my small business. We have about 10 employees." },
      ],
      monitoring: true,
    },
    {
      id: 2,
      agent: "Support Agent",
      caller: "Sarah Johnson",
      callerNumber: "+1 (555) 987-6543",
      direction: "outbound",
      status: "active",
      duration: 58,
      sentiment: "neutral",
      transcript: [
        { speaker: "agent", text: "Hello, this is calling from VoiceAI. Is this Sarah?" },
        { speaker: "caller", text: "Yes, speaking." },
        {
          speaker: "agent",
          text: "Great! I wanted to follow up on your recent inquiry about our support plans.",
        },
      ],
      monitoring: false,
    },
    {
      id: 3,
      agent: "Lead Qualifier",
      caller: "Mike Davis",
      callerNumber: "+1 (555) 456-7890",
      direction: "inbound",
      status: "active",
      duration: 203,
      sentiment: "positive",
      transcript: [
        { speaker: "agent", text: "Thanks for calling! What brings you in today?" },
        {
          speaker: "caller",
          text: "I saw your ad and wanted to learn more about your AI voice agents.",
        },
      ],
      monitoring: false,
    },
  ]);

  const [selectedCall, setSelectedCall] = useState<number | null>(1);

  useEffect(() => {
    // Simulate live call duration updates
    const interval = setInterval(() => {
      setActiveCalls((calls) =>
        calls.map((call) => ({
          ...call,
          duration: call.duration + 1,
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleBarge = (callId: number) => {
    toast.success("Joining call as listener...");
    setActiveCalls(
      activeCalls.map((call) =>
        call.id === callId ? { ...call, monitoring: true } : call
      )
    );
  };

  const handleHangup = (callId: number) => {
    const call = activeCalls.find((c) => c.id === callId);
    if (call && confirm(`Hang up call with ${call.caller}?`)) {
      setActiveCalls(activeCalls.filter((c) => c.id !== callId));
      toast.success("Call terminated");
      if (selectedCall === callId) {
        setSelectedCall(activeCalls[0]?.id || null);
      }
    }
  };

  const handleWhisper = (callId: number) => {
    toast.success("Whisper mode activated - Only agent can hear you");
  };

  const selectedCallData = activeCalls.find((c) => c.id === selectedCall);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2 flex items-center gap-2">
            <Radio className="size-6 text-red-500 animate-pulse" />
            Real-Time Call Monitoring
          </h1>
          <p className="text-slate-600">Monitor and supervise active calls in real-time</p>
        </div>
        <Badge className="bg-red-500 flex items-center gap-2">
          <Activity className="size-4" />
          {activeCalls.length} Live Calls
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Calls List */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Active Calls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeCalls.map((call) => (
                <button
                  key={call.id}
                  onClick={() => setSelectedCall(call.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedCall === call.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`size-3 rounded-full ${
                          call.status === "active"
                            ? "bg-green-500 animate-pulse"
                            : "bg-slate-300"
                        }`}
                      />
                      <p className="text-slate-900">{call.caller}</p>
                    </div>
                    {call.monitoring && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <Radio className="size-3 mr-1" />
                        Live
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm mb-2">{call.agent}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="size-4 text-slate-400" />
                      <span className="text-slate-600">{formatDuration(call.duration)}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        call.sentiment === "positive"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : call.sentiment === "negative"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-slate-50 text-slate-700"
                      }
                    >
                      {call.sentiment}
                    </Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {activeCalls.length === 0 && (
            <Card className="bg-white border-slate-200">
              <CardContent className="p-12 text-center">
                <Phone className="size-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600">No active calls</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Call Details & Transcript */}
        {selectedCallData && (
          <div className="lg:col-span-2 space-y-4">
            {/* Call Info */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="size-5 text-blue-600" />
                      {selectedCallData.caller}
                    </CardTitle>
                    <CardDescription>{selectedCallData.callerNumber}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl text-slate-900 mb-1">
                      {formatDuration(selectedCallData.duration)}
                    </p>
                    <Badge
                      variant={selectedCallData.direction === "inbound" ? "default" : "secondary"}
                      className={
                        selectedCallData.direction === "inbound"
                          ? "bg-blue-500"
                          : "bg-purple-500"
                      }
                    >
                      {selectedCallData.direction}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Bot className="size-5 text-green-600" />
                    <span className="text-slate-700">{selectedCallData.agent}</span>
                  </div>
                  <span className="text-slate-400">•</span>
                  <Badge
                    variant="outline"
                    className={
                      selectedCallData.sentiment === "positive"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : selectedCallData.sentiment === "negative"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-slate-50 text-slate-700"
                    }
                  >
                    <TrendingUp className="size-3 mr-1" />
                    {selectedCallData.sentiment} sentiment
                  </Badge>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center gap-2">
                  {!selectedCallData.monitoring ? (
                    <Button
                      onClick={() => handleBarge(selectedCallData.id)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Radio className="size-4 mr-2" />
                      Join & Listen
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => handleWhisper(selectedCallData.id)}>
                        <Mic className="size-4 mr-2" />
                        Whisper to Agent
                      </Button>
                      <Button variant="outline">
                        <Volume2 className="size-4 mr-2" />
                        Listening
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleHangup(selectedCallData.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <PhoneOff className="size-4 mr-2" />
                    Hang Up
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Transcript */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="size-5" />
                  Live Transcript
                </CardTitle>
                <CardDescription>Real-time conversation transcription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedCallData.transcript.map((line, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${
                        line.speaker === "agent" ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-md p-3 rounded-lg ${
                          line.speaker === "agent"
                            ? "bg-blue-100 text-blue-900"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <p className="text-xs mb-1 opacity-70">
                          {line.speaker === "agent" ? (
                            <span className="flex items-center gap-1">
                              <Bot className="size-3" /> Agent
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <User className="size-3" /> Caller
                            </span>
                          )}
                        </p>
                        <p className="text-sm">{line.text}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Listening...</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-blue-700 text-sm mb-1">Duration</p>
                  <p className="text-blue-900 text-xl">
                    {formatDuration(selectedCallData.duration)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <p className="text-green-700 text-sm mb-1">Sentiment</p>
                  <p className="text-green-900 text-xl capitalize">
                    {selectedCallData.sentiment}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <p className="text-purple-700 text-sm mb-1">Exchanges</p>
                  <p className="text-purple-900 text-xl">{selectedCallData.transcript.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <p className="text-orange-700 text-sm mb-1">Direction</p>
                  <p className="text-orange-900 text-xl capitalize">
                    {selectedCallData.direction}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Pro Feature Banner */}
      <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white mb-2">Real-Time Monitoring - Pro Feature</h3>
              <p className="text-purple-100">
                Monitor live calls, join conversations, and provide real-time guidance to your AI
                agents
              </p>
            </div>
            <Badge className="bg-white text-purple-600">Pro Plan</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
