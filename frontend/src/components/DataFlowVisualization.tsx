import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowRight, Database, FileJson, Mail, CheckSquare } from "lucide-react";
import { LiveProcessingFlow } from "./LiveProcessingFlow";

export function DataFlowVisualization() {
  const dataFlowSteps = [
    {
      step: "1",
      title: "Live Meeting",
      description: "Sara speaks in real-time",
      icon: "🎙️",
      color: "from-blue-500 to-cyan-500",
    },
    {
      step: "2",
      title: "Instant ASR",
      description: "Transcribed in 500ms",
      icon: "⚡",
      color: "from-purple-500 to-pink-500",
    },
    {
      step: "3",
      title: "Live NLU",
      description: "Tagged as 'requirement'",
      icon: "🏷️",
      color: "from-orange-500 to-red-500",
    },
    {
      step: "4",
      title: "Real-Time DB",
      description: "Stored for instant retrieval",
      icon: "💾",
      color: "from-green-500 to-emerald-500",
    },
    {
      step: "5",
      title: "Instant Q&A",
      description: "Available for queries NOW",
      icon: "💬",
      color: "from-indigo-500 to-purple-500",
    },
    {
      step: "6",
      title: "Live Actions",
      description: "Jira/Slack updated instantly",
      icon: "🚀",
      color: "from-pink-500 to-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>Real-Time Data Flow (Live Communication)</CardTitle>
          <CardDescription>
            From live audio to instant Q&A - all happening during the meeting, not after
          </CardDescription>
        </CardHeader>
      </Card>

      <LiveProcessingFlow />
    </div>
  );
}