import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  MessageCircle, 
  Search, 
  Database, 
  Brain, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  FileText,
  Users,
  AlertTriangle,
  Send
} from "lucide-react";

export function IntelligentQA() {
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);

  const exampleQueries = [
    {
      category: "Past Decisions",
      icon: CheckCircle2,
      color: "from-blue-500 to-cyan-500",
      queries: [
        "What deployment model did we agree on in the Oct 15 meeting?",
        "When was the decision to use microservices architecture made?",
        "Who approved the budget increase for cloud infrastructure?",
        "What were the key decisions from last week's stakeholder meeting?",
      ],
    },
    {
      category: "Requirements",
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      queries: [
        "When was requirement R-021 first mentioned?",
        "What are all the security requirements discussed so far?",
        "List all on-premise deployment constraints",
        "Show me the API performance requirements we agreed on",
      ],
    },
    {
      category: "Action Items",
      icon: Clock,
      color: "from-orange-500 to-red-500",
      queries: [
        "What are Sara's pending action items?",
        "Show all overdue tasks from client meetings",
        "What was promised for the Nov 25 deadline?",
        "List all action items related to database migration",
      ],
    },
    {
      category: "Risks & Issues",
      icon: AlertTriangle,
      color: "from-red-500 to-pink-500",
      queries: [
        "What risks were identified about GPU access?",
        "Show all high-priority risks from recent meetings",
        "What mitigation strategies were discussed for timeline delays?",
        "Were there any concerns raised about data privacy?",
      ],
    },
    {
      category: "Team & Responsibilities",
      icon: Users,
      color: "from-green-500 to-emerald-500",
      queries: [
        "Who is responsible for the authentication module?",
        "What did John say about the API integration timeline?",
        "Which team members attended the architecture review?",
        "Who raised concerns about the testing phase?",
      ],
    },
  ];

  const ragPipeline = [
    {
      step: "1",
      title: "Query Processing",
      description: "Parse and understand user intent",
      icon: Search,
    },
    {
      step: "2",
      title: "Vector Search",
      description: "Find relevant meeting segments",
      icon: Database,
    },
    {
      step: "3",
      title: "Context Assembly",
      description: "Gather related decisions & docs",
      icon: FileText,
    },
    {
      step: "4",
      title: "LLM Generation",
      description: "Generate accurate response",
      icon: Brain,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-0">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-white/20 rounded-xl backdrop-blur">
              <MessageCircle className="size-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-white mb-2">Real-Time Intelligent Q&A System</h2>
              <p className="text-blue-100 mb-4">
                Your AI agent answers any client query INSTANTLY during live meetings by searching through current 
                conversation and all past meeting history. Get answers in 2-3 seconds while others are still speaking.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white/20 text-white border-white/30">Live Processing</Badge>
                <Badge className="bg-white/20 text-white border-white/30">Instant Answers</Badge>
                <Badge className="bg-white/20 text-white border-white/30">Multi-Meeting Search</Badge>
                <Badge className="bg-white/20 text-white border-white/30">Citation-Backed</Badge>
                <Badge className="bg-white/20 text-white border-white/30">&lt;3s Response</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Chat Demo */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>Try the Real-Time Q&A System</CardTitle>
          <CardDescription>
            Ask anything during the live meeting - get instant answers while others speak
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input 
              placeholder="Ask: When did we decide on the on-prem deployment model?"
              className="flex-1"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Send className="size-4 mr-2" />
              Ask
            </Button>
          </div>

          {/* Example Response */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Brain className="size-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-slate-900 mb-2">AI Response</h4>
                <p className="text-slate-700 mb-4">
                  The decision to deploy on-premise was made during the <strong>October 15, 2025 client meeting</strong> at 
                  timestamp 10:12:03. Sara explicitly stated: "We must deploy on-prem" due to data privacy regulations 
                  in your industry.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-slate-900 mb-2">Related Information:</h5>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className="size-4 text-green-500 mt-1 shrink-0" />
                        <span><strong>Risk identified:</strong> Limited GPU access for ML workloads (Medium probability, High impact)</span>
                      </li>
                      <li className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className="size-4 text-orange-500 mt-1 shrink-0" />
                        <span><strong>Action item:</strong> Setup on-prem pipeline by Nov 25, 2025 (Assigned to DevOps team)</span>
                      </li>
                      <li className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className="size-4 text-blue-500 mt-1 shrink-0" />
                        <span><strong>Jira ticket:</strong> INFRA-234 created with acceptance criteria</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-slate-600">
                      <strong>Sources:</strong> Meeting Oct-15-2025.mp4 (10:12:03), MoM-Oct-15-2025.pdf, Jira ticket INFRA-234
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RAG Pipeline Visualization */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>How It Works: Real-Time RAG Pipeline</CardTitle>
          <CardDescription>
            Retrieval-Augmented Generation ensures accurate responses in under 3 seconds during live meetings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {ragPipeline.map((step, index) => (
              <div key={step.step} className="relative">
                <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-blue-200">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex p-3 bg-blue-600 rounded-full mb-3">
                      <step.icon className="size-6 text-white" />
                    </div>
                    <div className="text-slate-600 mb-1">Step {step.step}</div>
                    <h4 className="text-slate-900 mb-2">{step.title}</h4>
                    <p className="text-slate-600">{step.description}</p>
                  </CardContent>
                </Card>
                {index < ragPipeline.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 -translate-y-1/2 z-10">
                    <ArrowRight className="size-8 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Example Queries by Category */}
      <div className="space-y-4">
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle>Example Queries During Live Meetings</CardTitle>
            <CardDescription>
              The AI agent can answer these questions instantly while the meeting is in progress
            </CardDescription>
          </CardHeader>
        </Card>

        {exampleQueries.map((category) => (
          <Card key={category.category} className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color}`}>
                  <category.icon className="size-6 text-white" />
                </div>
                <h3 className="text-slate-900">{category.category}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {category.queries.map((query) => (
                  <button
                    key={query}
                    onClick={() => setSelectedQuery(query)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedQuery === query
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MessageCircle className="size-4 text-blue-600 mt-1 shrink-0" />
                      <span className="text-slate-700">{query}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Knowledge Base Structure */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <h3 className="text-slate-900 mb-4">Knowledge Base Architecture</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="text-slate-900 mb-3">Meeting Transcripts</h4>
              <ul className="space-y-2">
                {[
                  "Full transcription with timestamps",
                  "Speaker attribution",
                  "Audio file references",
                  "Diarization metadata",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-slate-700">
                    <div className="size-1.5 bg-purple-500 rounded-full mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="text-slate-900 mb-3">Structured Events</h4>
              <ul className="space-y-2">
                {[
                  "Requirements & constraints",
                  "Decisions & approvals",
                  "Action items & owners",
                  "Risks & mitigations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-slate-700">
                    <div className="size-1.5 bg-purple-500 rounded-full mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="text-slate-900 mb-3">Project Context</h4>
              <ul className="space-y-2">
                {[
                  "SOW & contracts",
                  "Technical documentation",
                  "Jira epics & stories",
                  "Email threads",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-slate-700">
                    <div className="size-1.5 bg-purple-500 rounded-full mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <h3 className="text-slate-900 mb-4">Real-Time Q&A System Features</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-slate-900 mb-3">Live Intelligence Features</h4>
              <ul className="space-y-2">
                {[
                  "Instant answers during live meetings (2-3s response)",
                  "Query what was just said seconds ago",
                  "Multi-meeting context aggregation in real-time",
                  "Semantic search across current + past transcripts",
                  "Timeline-aware responses (what changed when)",
                  "Speaker-specific query handling",
                  "Cross-reference detection (requirements → decisions → tasks)",
                  "Live contradiction detection across meetings",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="size-4 text-green-500 mt-1 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 mb-3">Response Quality</h4>
              <ul className="space-y-2">
                {[
                  "Direct quotes with timestamps as evidence",
                  "Confidence scores for each answer",
                  "Multiple source citation",
                  "Related information suggestions",
                  "Uncertainty acknowledgment when data is missing",
                  "Follow-up question recommendations",
                  "Real-time fact checking against past meetings",
                  "Instant context switching between topics",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="size-4 text-emerald-500 mt-1 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6">
          <h3 className="text-slate-900 mb-4">Real-World Use Cases (During Live Meetings)</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                scenario: "Client asks about a past commitment (LIVE)",
                solution: 'While on call, query: "What did we promise for Q4?" → Agent instantly finds exact quote from previous meeting',
              },
              {
                scenario: "Need to recall decision reasoning (LIVE)",
                solution: 'During discussion, ask: "Why did we choose PostgreSQL?" → Get instant answer while client is speaking',
              },
              {
                scenario: "Clarify what was just said (LIVE)",
                solution: 'Ask immediately: "What API rate limit did Sara mention?" → Get answer from 30 seconds ago',
              },
              {
                scenario: "Verify commitment before agreeing (LIVE)",
                solution: 'Before responding, query: "Did we commit to on-prem?" → Instant verification with evidence',
              },
              {
                scenario: "Check if topic was discussed before (LIVE)",
                solution: 'During meeting, ask: "Have we talked about data retention?" → Instant search across all meetings',
              },
              {
                scenario: "Get context before answering (LIVE)",
                solution: 'Query: "What\'s our current timeline?" → Pull from Jira/past meetings instantly while on call',
              },
            ].map((useCase) => (
              <div key={useCase.scenario} className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="text-slate-900 mb-2">{useCase.scenario}</h4>
                <p className="text-slate-600">{useCase.solution}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}