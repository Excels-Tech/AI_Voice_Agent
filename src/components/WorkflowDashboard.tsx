import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArchitectureView } from "./ArchitectureView";
import { WorkflowPhases } from "./WorkflowPhases";
import { ComponentBreakdown } from "./ComponentBreakdown";
import { IntegrationMap } from "./IntegrationMap";
import { ImplementationTimeline } from "./ImplementationTimeline";
import { DataFlowVisualization } from "./DataFlowVisualization";
import { IntelligentQA } from "./IntelligentQA";
import { RealTimeDashboard } from "./RealTimeDashboard";
import { Brain, Workflow, Boxes, Plug, Calendar, GitBranch, MessageCircle, Radio } from "lucide-react";

export function WorkflowDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
              <Brain className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900">AI Meeting Voice Agent</h1>
              <p className="text-slate-600">Real-Time Live Meeting Assistant with Instant Q&A</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8 h-auto p-1 bg-white/60 backdrop-blur">
            <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
              <Brain className="size-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="live-demo" className="flex items-center gap-2 py-3">
              <Radio className="size-4" />
              <span className="hidden sm:inline">Live Demo</span>
            </TabsTrigger>
            <TabsTrigger value="qa-system" className="flex items-center gap-2 py-3">
              <MessageCircle className="size-4" />
              <span className="hidden sm:inline">Q&A System</span>
            </TabsTrigger>
            <TabsTrigger value="architecture" className="flex items-center gap-2 py-3">
              <Boxes className="size-4" />
              <span className="hidden sm:inline">Architecture</span>
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2 py-3">
              <Workflow className="size-4" />
              <span className="hidden sm:inline">Workflow</span>
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2 py-3">
              <GitBranch className="size-4" />
              <span className="hidden sm:inline">Components</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2 py-3">
              <Plug className="size-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2 py-3">
              <Calendar className="size-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewSection />
            <DataFlowVisualization />
          </TabsContent>

          <TabsContent value="live-demo">
            <RealTimeDashboard />
          </TabsContent>

          <TabsContent value="qa-system">
            <IntelligentQA />
          </TabsContent>

          <TabsContent value="architecture">
            <ArchitectureView />
          </TabsContent>

          <TabsContent value="workflow">
            <WorkflowPhases />
          </TabsContent>

          <TabsContent value="components">
            <ComponentBreakdown />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationMap />
          </TabsContent>

          <TabsContent value="timeline">
            <ImplementationTimeline />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[
        {
          title: "Meeting Preparation",
          description: "Calendar sync, context assembly, and pre-brief generation",
          icon: Calendar,
          color: "from-blue-500 to-cyan-500",
        },
        {
          title: "Live Capture",
          description: "Real-time transcription, diarization, and intelligent tagging",
          icon: Brain,
          color: "from-purple-500 to-pink-500",
        },
        {
          title: "Real-Time Processing",
          description: "Instant Q&A, live alerts, and on-the-fly decision tracking",
          icon: Workflow,
          color: "from-orange-500 to-red-500",
        },
        {
          title: "Live Q&A Assistant",
          description: "Answer any query instantly during the meeting",
          icon: MessageCircle,
          color: "from-green-500 to-emerald-500",
        },
      ].map((phase) => (
        <div key={phase.title} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${phase.color} mb-4`}>
            <phase.icon className="size-6 text-white" />
          </div>
          <h3 className="text-slate-900 mb-2">{phase.title}</h3>
          <p className="text-slate-600">{phase.description}</p>
        </div>
      ))}
    </div>
  );
}