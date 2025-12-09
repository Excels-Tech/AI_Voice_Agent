import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Radio,
  Mic,
  Video,
  MessageCircle,
  Bell,
  Zap,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Database,
  Eye,
  Sparkles
} from "lucide-react";

export function RealTimeDashboard() {
  const [isLive, setIsLive] = useState(true);

  return (
    <div className="space-y-6">
      {/* Live Status Banner */}
      <Card className="bg-gradient-to-r from-red-600 to-pink-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                <div className="relative p-3 bg-white/20 rounded-full backdrop-blur">
                  <Radio className="size-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-white mb-1">LIVE MEETING IN PROGRESS</h2>
                <p className="text-red-100">AI Agent actively processing and ready to answer queries</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white mb-1">Duration</div>
              <div className="text-2xl">24:37</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Processing Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Live Transcript */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mic className="size-5 text-blue-600" />
                  Live Transcript Stream
                </CardTitle>
                <Badge className="bg-red-500">LIVE</Badge>
              </div>
              <CardDescription>Real-time speech-to-text with speaker identification</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {[
                  { speaker: "Sara", time: "24:35", text: "So we need to ensure the API can handle at least 10,000 requests per minute.", tag: "requirement", color: "purple" },
                  { speaker: "You", time: "24:37", text: "Understood. What about the data retention policy?", tag: null, color: "blue" },
                  { speaker: "Sara", time: "24:40", text: "We need to keep all transaction logs for 7 years for compliance.", tag: "requirement", color: "purple" },
                  { speaker: "John", time: "24:42", text: "That's a significant storage requirement. I'll create a Jira ticket for the infrastructure team.", tag: "action", color: "orange" },
                  { speaker: "Sara", time: "24:45", text: "Great. When can we expect the first prototype?", tag: "question", color: "blue" },
                ].map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 p-4 rounded-lg ${idx === 4 ? 'bg-blue-50 border-2 border-blue-300' : 'bg-slate-50'}`}>
                    <div className="shrink-0">
                      <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                        {msg.speaker[0]}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-900">{msg.speaker}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-500">{msg.time}</span>
                        {msg.tag && (
                          <Badge variant="outline" className={`text-${msg.color}-600 border-${msg.color}-300`}>
                            {msg.tag}
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-700">{msg.text}</p>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                <div className="flex gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
                  <div className="shrink-0">
                    <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                      Y
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-900">You</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-500">NOW</span>
                      <Sparkles className="size-4 text-blue-500 animate-pulse" />
                    </div>
                    <p className="text-slate-400 italic">Speaking...</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Q&A Interface */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="size-5 text-green-600" />
                Instant Q&A Assistant
              </CardTitle>
              <CardDescription>Ask anything about the meeting or past discussions - get instant answers</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ask: What was our previous decision on the deployment model?" 
                    className="flex-1"
                  />
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Zap className="size-4 mr-2" />
                    Ask
                  </Button>
                </div>

                {/* Recent Q&A */}
                <div className="space-y-3">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="size-5 text-green-600 mt-1 shrink-0" />
                      <div className="flex-1">
                        <p className="text-slate-700 mb-2">
                          <strong>You asked:</strong> What API rate limit did we agree on?
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-slate-700 mb-2">
                            <strong>AI:</strong> Sara just mentioned 10,000 requests per minute at 24:35 in this meeting. 
                            This is a new requirement that wasn't discussed previously.
                          </p>
                          <Badge variant="secondary">Source: Current meeting 24:35</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="size-5 text-blue-600 mt-1 shrink-0" />
                      <div className="flex-1">
                        <p className="text-slate-700 mb-2">
                          <strong>You asked:</strong> When did we decide on PostgreSQL?
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <p className="text-slate-700 mb-2">
                            <strong>AI:</strong> PostgreSQL was chosen in the Oct 15 meeting due to ACID compliance requirements. 
                            John mentioned it needed to handle complex transactions.
                          </p>
                          <Badge variant="secondary">Source: Oct 15, 2025 at 14:23</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Live Intelligence */}
        <div className="space-y-6">
          {/* Meeting Info */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b">
              <CardTitle>Meeting Info</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-slate-600 mb-1">Project</p>
                  <p className="text-slate-900">E-Commerce Platform API</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Participants</p>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-slate-500" />
                    <span className="text-slate-900">Sara, John, You</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Status</p>
                  <Badge className="bg-green-500">All systems operational</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Detections */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Eye className="size-5 text-purple-600" />
                Live Detections
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <CheckCircle2 className="size-5 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-900 mb-1">2 Requirements</p>
                    <p className="text-slate-600">10k req/min, 7yr retention</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Clock className="size-5 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-900 mb-1">1 Action Item</p>
                    <p className="text-slate-600">John: Create infrastructure ticket</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <MessageCircle className="size-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-900 mb-1">1 Question</p>
                    <p className="text-slate-600">When's the prototype ready?</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Suggestions */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200">
            <CardHeader className="border-b border-orange-200">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-orange-600" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <div className="flex items-start gap-2">
                    <Bell className="size-4 text-orange-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-slate-900 mb-1">Similar requirement found</p>
                      <p className="text-slate-600">Previous meeting mentioned 5k req/min. Clarify if this is an increase.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-4 text-red-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-slate-900 mb-1">Cost implication</p>
                      <p className="text-slate-600">7-year retention may need enterprise storage plan.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle2 className="size-4 mr-2" />
                  Create Jira Ticket
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="size-4 mr-2" />
                  Save to Knowledge Base
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="size-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Real-Time Processing Architecture */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>Real-Time Processing Architecture</CardTitle>
          <CardDescription>How the system processes and responds in milliseconds during live meetings</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                title: "Audio Stream",
                description: "WebRTC captures audio chunks every 100ms",
                time: "~100ms",
                icon: Mic,
                color: "from-blue-500 to-cyan-500",
              },
              {
                title: "Live ASR",
                description: "Streaming transcription with partial results",
                time: "~500ms",
                icon: Zap,
                color: "from-purple-500 to-pink-500",
              },
              {
                title: "NLU Tagging",
                description: "Real-time intent extraction and classification",
                time: "~200ms",
                icon: Eye,
                color: "from-orange-500 to-red-500",
              },
              {
                title: "Instant Q&A",
                description: "RAG retrieval + LLM response generation",
                time: "~2-3s",
                icon: MessageCircle,
                color: "from-green-500 to-emerald-500",
              },
            ].map((step) => (
              <Card key={step.title} className="bg-gradient-to-br from-slate-50 to-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${step.color} mb-3`}>
                    <step.icon className="size-6 text-white" />
                  </div>
                  <h4 className="text-slate-900 mb-2">{step.title}</h4>
                  <p className="text-slate-600 mb-3">{step.description}</p>
                  <Badge className="bg-green-500">{step.time}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Capabilities */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-slate-900 mb-4 flex items-center gap-2">
              <Radio className="size-5 text-blue-600" />
              Real-Time Capabilities
            </h3>
            <ul className="space-y-2">
              {[
                "Live transcription with <500ms latency",
                "Instant speaker diarization",
                "Real-time entity extraction (requirements, decisions, actions)",
                "Live risk and compliance detection",
                "On-the-fly question answering",
                "Streaming context updates to knowledge base",
                "Live notifications to Slack/Teams",
                "Concurrent processing of multiple speakers",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-slate-700">
                  <Zap className="size-4 text-blue-500 mt-1 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="text-slate-900 mb-4 flex items-center gap-2">
              <MessageCircle className="size-5 text-green-600" />
              Live Q&A Features
            </h3>
            <ul className="space-y-2">
              {[
                "Query current meeting context instantly",
                "Cross-reference with all past meetings",
                "Get answers while others are speaking",
                "Clarify requirements in real-time",
                "Check if topics were discussed before",
                "Verify commitments and promises",
                "Get instant data from Jira/Notion",
                "Multilingual query support (English/Urdu)",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="size-4 text-green-500 mt-1 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* WebSocket Architecture */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <h3 className="text-slate-900 mb-4">WebSocket-Based Real-Time Architecture</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="text-slate-900 mb-2 flex items-center gap-2">
                  <Video className="size-4 text-purple-600" />
                  Meeting Platform
                </h4>
                <p className="text-slate-600">Zoom/Meet SDK streams audio via WebRTC to processing server</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="text-slate-900 mb-2 flex items-center gap-2">
                  <Zap className="size-4 text-purple-600" />
                  Processing Pipeline
                </h4>
                <p className="text-slate-600">Real-time ASR, NLU, and RAG processing with streaming outputs</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="text-slate-900 mb-2 flex items-center gap-2">
                  <Eye className="size-4 text-purple-600" />
                  Your Dashboard
                </h4>
                <p className="text-slate-600">WebSocket pushes live transcript, tags, and Q&A responses instantly</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="text-slate-900 mb-3">Key Technologies</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "WebRTC", "WebSocket", "Server-Sent Events", "Redis Pub/Sub",
                  "Kafka Streaming", "gRPC", "Streaming LLM APIs", "Edge Computing"
                ].map((tech) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
