import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowDown, Video, Radio, Brain, Database, Layout, Shield } from "lucide-react";

export function ArchitectureView() {
  const layers = [
    {
      title: "Client Meeting (LIVE)",
      subtitle: "Zoom / Google Meet / Teams - Real-Time Stream",
      icon: Video,
      color: "from-blue-500 to-cyan-500",
      details: ["Live Audio/Video Stream", "WebRTC Real-Time Connection", "Instant Meeting Metadata"],
    },
    {
      title: "Real-Time Ingestion & Processing",
      subtitle: "Live Audio Pipeline (<500ms latency)",
      icon: Radio,
      color: "from-purple-500 to-pink-500",
      details: ["WebSocket Audio Streaming", "Live Voice Activity Detection", "Streaming ASR Transcription", "Real-Time Speaker Diarization"],
    },
    {
      title: "Live Intelligence Layer",
      subtitle: "Instant NLU / LLM / RAG Processing",
      icon: Brain,
      color: "from-orange-500 to-red-500",
      details: ["Real-Time Intent Extraction", "Live Risk & Action Tagging", "Instant Requirement Detection", "Streaming Summarization"],
    },
    {
      title: "Instant Actions Layer",
      subtitle: "Real-Time Automation & Integration",
      icon: Database,
      color: "from-green-500 to-emerald-500",
      details: ["Live Jira Ticket Creation", "Instant Slack Notifications", "Real-Time Q&A Responses", "Streaming CRM Updates"],
    },
    {
      title: "Live Dashboard / API",
      subtitle: "Real-Time User Interface & Control",
      icon: Layout,
      color: "from-indigo-500 to-purple-500",
      details: ["Live Transcript Stream", "Instant Q&A Interface", "Real-Time Alerts", "Live Analytics Dashboard"],
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5 text-blue-600" />
            Real-Time System Architecture Overview
          </CardTitle>
          <CardDescription>
            Multi-layer architecture for instant meeting processing with live Q&A during calls
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="relative">
        {layers.map((layer, index) => (
          <div key={layer.title} className="relative">
            <Card className="bg-white border-slate-200 hover:shadow-lg transition-shadow mb-4">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${layer.color} shrink-0`}>
                    <layer.icon className="size-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">{layer.title}</h3>
                    <p className="text-slate-600 mb-4">{layer.subtitle}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {layer.details.map((detail) => (
                        <div key={detail} className="flex items-center gap-2 text-slate-700 bg-slate-50 rounded-lg px-3 py-2">
                          <div className="size-1.5 bg-slate-400 rounded-full" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {index < layers.length - 1 && (
              <div className="flex justify-center my-2">
                <div className="p-2 bg-slate-200 rounded-full">
                  <ArrowDown className="size-5 text-slate-600" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-slate-900 mb-3 flex items-center gap-2">
            <Shield className="size-5 text-blue-600" />
            Security & Compliance
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              "Meeting consent & recording notice",
              "PII redaction before storage",
              "AES-256 encryption at rest",
              "OAuth2 authentication",
              "HTTPS/TLS in transit",
              "Optional local processing mode",
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-slate-700">
                <div className="size-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}