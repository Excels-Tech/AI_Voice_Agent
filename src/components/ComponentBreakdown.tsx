import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Mic, Brain, Database, Layers, Lock, Zap } from "lucide-react";

export function ComponentBreakdown() {
  const components = [
    {
      layer: "Capture",
      icon: Mic,
      color: "from-blue-500 to-cyan-500",
      tech: ["Zoom SDK", "WebRTC", "Google Meet API"],
      tasks: ["Record audio streams", "Stream real-time audio", "Handle video feeds"],
    },
    {
      layer: "ASR",
      icon: Zap,
      color: "from-purple-500 to-pink-500",
      tech: ["Whisper-large-v3", "Deepgram", "Azure Speech-to-Text"],
      tasks: ["Convert speech to text", "Real-time transcription", "Multi-language support"],
    },
    {
      layer: "Diarization",
      icon: Layers,
      color: "from-orange-500 to-amber-500",
      tech: ["pyannote.audio"],
      tasks: ["Identify speakers", "Speaker segmentation", "Voice fingerprinting"],
    },
    {
      layer: "Processing Queue",
      icon: Zap,
      color: "from-red-500 to-pink-500",
      tech: ["Redis", "Apache Kafka"],
      tasks: ["Buffer audio chunks", "Event streaming", "Message queuing"],
    },
    {
      layer: "LLM / NLU",
      icon: Brain,
      color: "from-indigo-500 to-purple-500",
      tech: ["GPT-4-turbo", "Llama 3.1", "RAG Pipeline"],
      tasks: ["Extract entities", "Generate summaries", "Intent detection", "Risk analysis"],
    },
    {
      layer: "Vector Store",
      icon: Database,
      color: "from-green-500 to-emerald-500",
      tech: ["Chroma", "pgvector", "Pinecone"],
      tasks: ["Context retrieval", "Semantic search", "Embedding storage"],
    },
    {
      layer: "Storage",
      icon: Database,
      color: "from-teal-500 to-cyan-500",
      tech: ["PostgreSQL", "AWS S3", "Google Cloud Storage"],
      tasks: ["Store metadata", "Archive transcripts", "Media storage"],
    },
    {
      layer: "Integrations",
      icon: Zap,
      color: "from-violet-500 to-purple-500",
      tech: ["Jira API", "Notion API", "Gmail API", "Slack Webhooks"],
      tasks: ["Create tasks", "Send notifications", "Generate reports"],
    },
    {
      layer: "Frontend",
      icon: Layers,
      color: "from-blue-500 to-indigo-500",
      tech: ["Next.js", "React", "Tailwind CSS"],
      tasks: ["Dashboard UI", "Chat interface", "Review & edit"],
    },
    {
      layer: "Backend",
      icon: Zap,
      color: "from-slate-500 to-gray-500",
      tech: ["FastAPI", "Node.js"],
      tasks: ["API orchestration", "Business logic", "Data processing"],
    },
    {
      layer: "Security",
      icon: Lock,
      color: "from-red-500 to-orange-500",
      tech: ["OAuth2", "HTTPS", "PII Redaction"],
      tasks: ["Authentication", "Encryption", "Privacy compliance"],
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>Technology Stack & Components</CardTitle>
          <CardDescription>
            Comprehensive breakdown of technologies, frameworks, and responsibilities for each system layer
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {components.map((component) => (
          <Card key={component.layer} className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${component.color} mb-4`}>
                <component.icon className="size-6 text-white" />
              </div>
              
              <h3 className="text-slate-900 mb-3">{component.layer}</h3>
              
              <div className="mb-4">
                <p className="text-slate-600 mb-2">Technologies:</p>
                <div className="flex flex-wrap gap-2">
                  {component.tech.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-slate-600 mb-2">Key Tasks:</p>
                <ul className="space-y-1">
                  {component.tasks.map((task) => (
                    <li key={task} className="flex items-start gap-2 text-slate-700">
                      <div className="size-1.5 bg-slate-400 rounded-full mt-2 shrink-0" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200">
        <CardContent className="p-6">
          <h3 className="text-slate-900 mb-4">Database Schema (Simplified)</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                table: "meetings",
                fields: "id, title, date, participants[], transcript_url, summary_md",
              },
              {
                table: "events",
                fields: "id, meeting_id, timestamp, speaker, type, text, confidence",
              },
              {
                table: "actions",
                fields: "id, meeting_id, owner, due_date, description, status",
              },
              {
                table: "risks",
                fields: "id, meeting_id, probability, impact, mitigation",
              },
              {
                table: "context_vectors",
                fields: "id, doc_type, content, embedding_vector",
              },
            ].map((schema) => (
              <div key={schema.table} className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="text-slate-900 mb-2 font-mono">{schema.table}</h4>
                <p className="text-slate-600 font-mono">{schema.fields}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
