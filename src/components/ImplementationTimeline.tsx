import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export function ImplementationTimeline() {
  const timeline = [
    {
      week: "Week 1",
      milestone: "Setup Capture + ASR",
      deliverables: ["Join meeting via SDK", "Real-time audio capture", "Store raw transcript"],
      status: "planning",
    },
    {
      week: "Week 2",
      milestone: "Add Diarization + Chunked Extraction",
      deliverables: [
        "Speaker identification",
        "JSON structure for requirements/decisions/actions",
        "Timeline event storage",
      ],
      status: "planning",
    },
    {
      week: "Week 3",
      milestone: "Summarizer + MoM Output",
      deliverables: ["Executive summary generation", "Technical summary", "PDF/MD export", "Email draft creation"],
      status: "planning",
    },
    {
      week: "Week 4",
      milestone: "Integrations",
      deliverables: ["Jira API integration", "Gmail API for emails", "Notion API for documentation", "Slack webhooks"],
      status: "planning",
    },
    {
      week: "Week 5",
      milestone: "UI Dashboard",
      deliverables: [
        "Meeting list view",
        "Audio playback with transcript sync",
        "Edit and approve summaries",
        "Task management interface",
      ],
      status: "planning",
    },
    {
      week: "Week 6",
      milestone: "Risk Analytics & Multilingual",
      deliverables: [
        "Urdu/English mixed transcription",
        "Risk detection and heatmap",
        "Analytics dashboard",
        "Sentiment analysis",
      ],
      status: "planning",
    },
    {
      week: "Week 7",
      milestone: "Testing & Feedback",
      deliverables: ["QA with real client calls", "Performance optimization", "Bug fixes", "User feedback integration"],
      status: "planning",
    },
    {
      week: "Week 8",
      milestone: "Security + Deploy",
      deliverables: [
        "OAuth2 implementation",
        "Encryption setup (AES-256)",
        "PII redaction system",
        "Production deployment",
        "Monitoring & alerting",
      ],
      status: "planning",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="size-6 text-green-500" />;
      case "in-progress":
        return <Clock className="size-6 text-blue-500" />;
      default:
        return <Circle className="size-6 text-slate-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { variant: "default" as const, label: "Completed" },
      "in-progress": { variant: "destructive" as const, label: "In Progress" },
      planning: { variant: "secondary" as const, label: "Planning" },
    };
    const { variant, label } = config[status as keyof typeof config] || config.planning;
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>8-Week Implementation Roadmap</CardTitle>
        </CardHeader>
      </Card>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 md:left-1/2" />

        <div className="space-y-8">
          {timeline.map((item, index) => (
            <div key={item.week} className="relative">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Left side - Week number and icon (Desktop) */}
                <div className="md:flex-1 md:text-right md:pr-8 flex items-center gap-4 md:block">
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 bg-white z-10">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="ml-16 md:ml-0">
                    <h3 className="text-slate-900">{item.week}</h3>
                    <p className="text-slate-600">{item.milestone}</p>
                  </div>
                </div>

                {/* Right side - Card with deliverables */}
                <Card className="flex-1 md:ml-8 bg-white border-slate-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-slate-900">Deliverables</h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <ul className="space-y-2">
                      {item.deliverables.map((deliverable) => (
                        <li key={deliverable} className="flex items-start gap-2 text-slate-700">
                          <div className="size-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <h3 className="text-slate-900 mb-4">Key Milestones & Success Metrics</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-slate-900 mb-3">Technical Milestones</h4>
              <ul className="space-y-2">
                {[
                  "Real-time transcription accuracy > 95%",
                  "Speaker diarization accuracy > 90%",
                  "End-to-end latency < 5 seconds",
                  "System uptime > 99.5%",
                  "API response time < 200ms",
                ].map((metric) => (
                  <li key={metric} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="size-4 text-purple-500 mt-1 shrink-0" />
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 mb-3">Business Milestones</h4>
              <ul className="space-y-2">
                {[
                  "Reduce manual MoM time by 80%",
                  "100% action item capture rate",
                  "Client satisfaction > 4.5/5",
                  "Zero data security incidents",
                  "Support 10+ concurrent meetings",
                ].map((metric) => (
                  <li key={metric} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="size-4 text-pink-500 mt-1 shrink-0" />
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
