import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Radio, FileText, TrendingUp, CheckCircle2 } from "lucide-react";

export function WorkflowPhases() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Meeting Preparation",
      icon: Calendar,
      color: "bg-blue-500",
      steps: [
        {
          title: "Calendar Sync",
          description: "Fetch meeting metadata (title, invitees, agenda)",
          status: "automated",
        },
        {
          title: "Context Assembly",
          description: "Gather project docs, SOW, previous MoMs, Jira epics",
          status: "automated",
        },
        {
          title: "Vectorization",
          description: "Embed relevant text into vector DB for contextual retrieval",
          status: "automated",
        },
        {
          title: "Pre-Brief Generation",
          description: "Generate summary with client name, goals, last actions",
          status: "automated",
        },
      ],
    },
    {
      phase: "Phase 2",
      title: "Live Meeting Capture",
      icon: Radio,
      color: "bg-purple-500",
      steps: [
        {
          title: "Audio Ingestion",
          description: "Join call via API, capture and split audio per speaker",
          status: "real-time",
        },
        {
          title: "ASR Transcription",
          description: "Real-time transcription with streaming partials every 1-2 seconds",
          status: "real-time",
        },
        {
          title: "NLU & Tagging",
          description: "Detect requirements, decisions, risks, action items with confidence scores",
          status: "real-time",
        },
        {
          title: "Memory Building",
          description: "Store structured meeting events into timeline, update vector memory",
          status: "real-time",
        },
        {
          title: "Live Assist (Optional)",
          description: "On-screen bullets, risk alerts, compliance term detection",
          status: "optional",
        },
      ],
    },
    {
      phase: "Phase 3",
      title: "Post-Meeting Processing",
      icon: FileText,
      color: "bg-orange-500",
      steps: [
        {
          title: "Transcript Cleanup",
          description: "Punctuation, speaker attribution, filler removal",
          status: "automated",
        },
        {
          title: "Information Extraction",
          description: "JSON output: requirements, decisions, actions, risks, questions",
          status: "automated",
        },
        {
          title: "Summarization",
          description: "Generate executive and technical summaries",
          status: "automated",
        },
        {
          title: "Task Creation",
          description: "Send action items to Jira/Linear with acceptance criteria",
          status: "automated",
        },
        {
          title: "Follow-up Email",
          description: "Draft recap email with decisions, next steps, due dates",
          status: "automated",
        },
        {
          title: "Report Generation",
          description: "Produce MoM PDF/Markdown and PowerPoint summary",
          status: "automated",
        },
      ],
    },
    {
      phase: "Phase 4",
      title: "Continuous Learning",
      icon: TrendingUp,
      color: "bg-green-500",
      steps: [
        {
          title: "Feedback Loop",
          description: "Compare generated vs manual corrections, fine-tune prompts",
          status: "continuous",
        },
        {
          title: "Context Linking",
          description: "Cross-reference old meetings for requirement history",
          status: "continuous",
        },
        {
          title: "Analytics",
          description: "Track meeting length, sentiment, risk counts, unresolved actions",
          status: "continuous",
        },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      automated: { variant: "default", label: "Automated" },
      "real-time": { variant: "destructive", label: "Real-time" },
      optional: { variant: "outline", label: "Optional" },
      continuous: { variant: "secondary", label: "Continuous" },
    };
    const config = variants[status] || variants.automated;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {phases.map((phase, phaseIndex) => (
        <Card key={phase.phase} className="bg-white border-slate-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <div className="flex items-center gap-4">
              <div className={`${phase.color} p-3 rounded-lg`}>
                <phase.icon className="size-6 text-white" />
              </div>
              <div>
                <div className="text-slate-600 mb-1">{phase.phase}</div>
                <CardTitle className="text-slate-900">{phase.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {phase.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="flex items-start gap-4 group">
                  <div className="shrink-0 mt-1">
                    <div className="relative">
                      <CheckCircle2 className="size-6 text-slate-300 group-hover:text-green-500 transition-colors" />
                      {stepIndex < phase.steps.length - 1 && (
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-slate-200" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="text-slate-900">{step.title}</h4>
                      {getStatusBadge(step.status)}
                    </div>
                    <p className="text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
