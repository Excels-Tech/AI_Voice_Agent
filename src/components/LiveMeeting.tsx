import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Mic,
  Video,
  Phone,
  MessageCircle,
  Send,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Settings,
  Maximize2,
  MicOff,
  VideoOff,
} from "lucide-react";

interface LiveMeetingProps {
  onExit: () => void;
}

export function LiveMeeting({ onExit }: LiveMeetingProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Array<{ type: "question" | "answer"; text: string }>>([
    {
      type: "answer",
      text: "I'm ready to help! Ask me anything about this meeting or previous discussions.",
    },
  ]);

  const handleAskQuestion = () => {
    if (!question.trim()) return;

    setMessages([
      ...messages,
      { type: "question", text: question },
      {
        type: "answer",
        text: "Based on the Oct 15 meeting, Sara mentioned the deployment must be on-premise due to data privacy regulations. This was confirmed at timestamp 10:12.",
      },
    ]);
    setQuestion("");
  };

  const handleEndCall = () => {
    onExit();
  };

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Bar */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="size-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white">Live Meeting</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="size-4" />
                <span>24:37</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-white hover:bg-slate-700">
                <Settings className="size-5" />
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-slate-700"
                onClick={handleEndCall}
              >
                <Phone className="size-5 text-red-500" />
                <span className="ml-2">End</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Video & Transcript */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Area */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-t-lg flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="size-24 rounded-full bg-blue-600 flex items-center justify-center mb-4 mx-auto">
                        <Video className="size-12 text-white" />
                      </div>
                      <p className="text-white mb-2">Client Kickoff - Acme Corp</p>
                      <Badge className="bg-green-500">AI Recording Active</Badge>
                    </div>
                  </div>

                  {/* Participant Thumbnails */}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {["You", "Sarah", "Client"].map((name) => (
                      <div
                        key={name}
                        className="size-16 rounded-lg bg-slate-700 border-2 border-blue-500 flex items-center justify-center"
                      >
                        <span className="text-white text-sm">{name[0]}</span>
                      </div>
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="absolute bottom-4 right-4">
                    <Button size="sm" variant="ghost" className="text-white">
                      <Maximize2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-slate-800 rounded-b-lg border-t border-slate-700">
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      size="lg"
                      onClick={toggleMute}
                      className={`rounded-full ${
                        isMuted ? "bg-red-600 hover:bg-red-700" : "bg-slate-700 hover:bg-slate-600"
                      }`}
                    >
                      {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                    </Button>
                    <Button
                      size="lg"
                      onClick={toggleVideo}
                      className={`rounded-full ${
                        isVideoOff
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-slate-700 hover:bg-slate-600"
                      }`}
                    >
                      {isVideoOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
                    </Button>
                    <Button
                      size="lg"
                      className="rounded-full bg-red-600 hover:bg-red-700"
                      onClick={handleEndCall}
                    >
                      <Phone className="size-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Transcript */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mic className="size-5 text-blue-400" />
                    Live Transcript
                  </CardTitle>
                  <Badge className="bg-red-500">LIVE</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {[
                    {
                      speaker: "Sarah",
                      time: "24:35",
                      text: "We need the API to handle at least 10,000 requests per minute.",
                      tag: "requirement",
                    },
                    {
                      speaker: "You",
                      time: "24:37",
                      text: "Understood. What about the data retention policy?",
                      tag: null,
                    },
                    {
                      speaker: "Sarah",
                      time: "24:40",
                      text: "We need to keep all transaction logs for 7 years for compliance.",
                      tag: "requirement",
                    },
                    {
                      speaker: "Client",
                      time: "24:42",
                      text: "That's correct. Also, we prefer on-premise deployment for security.",
                      tag: "constraint",
                    },
                  ].map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        idx === 3 ? "bg-blue-900/30 border-2 border-blue-500" : "bg-slate-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white">{msg.speaker}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400">{msg.time}</span>
                        {msg.tag && (
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {msg.tag}
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-300">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Assistant */}
          <div className="space-y-6">
            {/* Meeting Info */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white">Meeting Info</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 mb-1">Project</p>
                    <p className="text-white">Acme Corp Platform</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Participants</p>
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-slate-400" />
                      <span className="text-white">8 people</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">AI Status</p>
                    <Badge className="bg-green-500">All systems active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Detections */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="size-5 text-yellow-400" />
                  Live Detections
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 bg-purple-900/30 rounded-lg border border-purple-500">
                    <CheckCircle2 className="size-5 text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white mb-1">3 Requirements</p>
                      <p className="text-slate-400 text-sm">
                        10k req/min, 7yr retention, on-prem
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-orange-900/30 rounded-lg border border-orange-500">
                    <Clock className="size-5 text-orange-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white mb-1">2 Action Items</p>
                      <p className="text-slate-400 text-sm">Infrastructure setup, API docs</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-yellow-900/30 rounded-lg border border-yellow-500">
                    <AlertCircle className="size-5 text-yellow-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white mb-1">1 Risk Identified</p>
                      <p className="text-slate-400 text-sm">High storage costs for 7yr retention</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Q&A */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="size-5 text-green-400" />
                  Ask AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.type === "question"
                            ? "bg-blue-900/30 border border-blue-500 ml-6"
                            : "bg-green-900/30 border border-green-500 mr-6"
                        }`}
                      >
                        <p className="text-white text-sm">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about past discussions..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                    <Button
                      onClick={handleAskQuestion}
                      className="bg-green-600 hover:bg-green-700 shrink-0"
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}