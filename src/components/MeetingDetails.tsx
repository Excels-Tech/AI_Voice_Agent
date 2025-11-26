import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  X,
  Download,
  Share2,
  Calendar,
  Clock,
  Users,
  MessageCircle,
  Send,
  CheckCircle2,
  FileText,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface MeetingDetailsProps {
  meeting: any;
  onClose: () => void;
}

export function MeetingDetails({ meeting, onClose }: MeetingDetailsProps) {
  const [question, setQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState([
    {
      question: "What was the main decision about deployment?",
      answer: "On-premise deployment was confirmed due to security requirements.",
    },
  ]);

  const handleAsk = () => {
    if (!question.trim()) return;

    setQaHistory([
      ...qaHistory,
      {
        question,
        answer: "Based on the meeting transcript, this was discussed at timestamp 24:35...",
      },
    ]);
    setQuestion("");
    toast.success("Answer generated from meeting context");
  };

  const transcript = [
    { speaker: "Sarah", time: "10:30", text: "Let's start with the project timeline overview." },
    { speaker: "Client", time: "10:31", text: "We need this deployed by end of Q1." },
    { speaker: "You", time: "10:32", text: "That's achievable. What about the infrastructure?" },
    {
      speaker: "Client",
      time: "10:33",
      text: "We prefer on-premise deployment for security reasons.",
    },
  ];

  const actionItems = [
    { task: "Review API documentation", owner: "You", dueDate: "Nov 15", priority: "high" },
    { task: "Setup infrastructure", owner: "DevOps", dueDate: "Nov 20", priority: "medium" },
    { task: "Security audit", owner: "Security Team", dueDate: "Nov 25", priority: "high" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900 mb-1">{meeting.title}</h1>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  <span>{meeting.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-4" />
                  <span>{meeting.duration}</span>
                </div>
                <Badge variant="secondary">{meeting.status}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied to clipboard");
                }}
              >
                <Share2 className="size-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.success("Downloading transcript...")}
              >
                <Download className="size-4 mr-2" />
                Download
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="size-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="border-b">
                <CardTitle>Meeting Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-slate-900 mb-2">Key Points</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-green-500 mt-1 shrink-0" />
                        <span className="text-slate-700">
                          Project timeline confirmed for Q1 delivery
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-green-500 mt-1 shrink-0" />
                        <span className="text-slate-700">
                          On-premise deployment required for security
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-green-500 mt-1 shrink-0" />
                        <span className="text-slate-700">
                          12 action items identified and assigned
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-slate-900 mb-2">Decisions Made</h4>
                    <ul className="space-y-2">
                      <li className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-slate-900 mb-1">On-premise deployment approved</p>
                        <span className="text-slate-600 text-sm">
                          Discussed at 10:33 with full client agreement
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transcript */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Full Transcript</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const text = transcript
                        .map((t) => `[${t.time}] ${t.speaker}: ${t.text}`)
                        .join("\n");
                      navigator.clipboard.writeText(text);
                      toast.success("Transcript copied to clipboard");
                    }}
                  >
                    <Copy className="size-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transcript.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="shrink-0">
                        <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm">
                          {item.speaker[0]}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-900">{item.speaker}</span>
                          <span className="text-slate-500 text-sm">{item.time}</span>
                        </div>
                        <p className="text-slate-700">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Participants */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-blue-500" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {meeting.participants.map((participant: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm">
                        {participant[0]}
                      </div>
                      <span className="text-slate-700">{participant}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-orange-500" />
                  Action Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {actionItems.map((item, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <p className="text-slate-900 mb-1">{item.task}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>{item.owner}</span>
                        <span>•</span>
                        <span>Due {item.dueDate}</span>
                      </div>
                      <Badge
                        variant={item.priority === "high" ? "destructive" : "default"}
                        className="mt-2"
                      >
                        {item.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ask AI */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="size-5 text-green-500" />
                  Ask About This Meeting
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {qaHistory.map((qa, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 ml-6">
                          <p className="text-slate-900 text-sm">{qa.question}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200 mr-6">
                          <p className="text-slate-700 text-sm">{qa.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask anything..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAsk()}
                    />
                    <Button onClick={handleAsk}>
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
