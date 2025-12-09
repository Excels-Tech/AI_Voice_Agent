import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Bot,
  Phone,
  Globe,
  Mic,
  MessageSquare,
  Settings as SettingsIcon,
  Rocket,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

interface AgentBuilderProps {
  onClose: () => void;
  onSave: () => void;
}

export function AgentBuilder({ onClose, onSave }: AgentBuilderProps) {
  const [step, setStep] = useState(1);
  const [agentData, setAgentData] = useState({
    name: "",
    type: "sales",
    language: "en-US",
    voice: "nova",
    phoneNumber: "",
    deploymentType: "phone",
    welcomeMessage: "",
    instructions: "",
    tone: "professional",
    recordCalls: true,
    transcribeCalls: true,
  });

  const voices = [
    { id: "nova", name: "Nova", gender: "Female", accent: "US", demo: true },
    { id: "shimmer", name: "Shimmer", gender: "Female", accent: "US", demo: true },
    { id: "echo", name: "Echo", gender: "Male", accent: "US", demo: true },
    { id: "alloy", name: "Alloy", gender: "Neutral", accent: "US", demo: true },
    { id: "fable", name: "Fable", gender: "Male", accent: "UK", demo: true },
    { id: "onyx", name: "Onyx", gender: "Male", accent: "US", demo: true },
  ];

  const languages = [
    { code: "en-US", name: "English (US)", flag: "🇺🇸" },
    { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
    { code: "es-ES", name: "Spanish (Spain)", flag: "🇪🇸" },
    { code: "es-MX", name: "Spanish (Mexico)", flag: "🇲🇽" },
    { code: "fr-FR", name: "French", flag: "🇫🇷" },
    { code: "de-DE", name: "German", flag: "🇩🇪" },
    { code: "it-IT", name: "Italian", flag: "🇮🇹" },
    { code: "pt-BR", name: "Portuguese (Brazil)", flag: "🇧🇷" },
    { code: "zh-CN", name: "Chinese (Mandarin)", flag: "🇨🇳" },
    { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
    { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
    { code: "ar-SA", name: "Arabic", flag: "🇸🇦" },
  ];

  const agentTypes = [
    {
      id: "sales",
      name: "Sales Agent",
      description: "Close deals and qualify leads",
      icon: "💼",
    },
    {
      id: "support",
      name: "Support Agent",
      description: "Handle customer inquiries",
      icon: "🎧",
    },
    {
      id: "appointment",
      name: "Appointment Setter",
      description: "Schedule meetings and callbacks",
      icon: "📅",
    },
    {
      id: "lead",
      name: "Lead Qualifier",
      description: "Qualify and route leads",
      icon: "🎯",
    },
    {
      id: "custom",
      name: "Custom Agent",
      description: "Build your own workflow",
      icon: "⚙️",
    },
  ];

  const handleNext = () => {
    if (step === 1 && !agentData.name) {
      toast.error("Please enter an agent name");
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    toast.success("Agent created successfully!");
    onSave();
  };

  const playVoiceDemo = (voiceId: string) => {
    toast.success(`Playing ${voiceId} voice demo`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="size-6 text-blue-600" />
              <h1 className="text-slate-900">Create New Agent</h1>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {[
              { num: 1, title: "Configure", icon: SettingsIcon },
              { num: 2, title: "Customize", icon: MessageSquare },
              { num: 3, title: "Voice & Language", icon: Mic },
              { num: 4, title: "Deploy", icon: Rocket },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center ${
                      step >= s.num
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {step > s.num ? (
                      <Check className="size-5" />
                    ) : (
                      <s.icon className="size-5" />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p
                      className={`${
                        step >= s.num ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {s.title}
                    </p>
                  </div>
                </div>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      step > s.num ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Configure */}
          {step === 1 && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle>Configure Your Agent</CardTitle>
                <CardDescription>
                  Set up basic information and deployment type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Sales Assistant, Support Bot"
                    value={agentData.name}
                    onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Agent Type</Label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {agentTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setAgentData({ ...agentData, type: type.id })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          agentData.type === type.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <p className="text-slate-900 mb-1">{type.name}</p>
                        <p className="text-slate-600 text-sm">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Deployment Type</Label>
                  <div className="grid md:grid-cols-3 gap-3">
                    <button
                      onClick={() => setAgentData({ ...agentData, deploymentType: "phone" })}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        agentData.deploymentType === "phone"
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <Phone className="size-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-slate-900">Phone Number</p>
                      <p className="text-slate-600 text-sm">Inbound & Outbound</p>
                    </button>
                    <button
                      onClick={() => setAgentData({ ...agentData, deploymentType: "widget" })}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        agentData.deploymentType === "widget"
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <Globe className="size-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-slate-900">Web Widget</p>
                      <p className="text-slate-600 text-sm">Website Embed</p>
                    </button>
                    <button
                      onClick={() => setAgentData({ ...agentData, deploymentType: "both" })}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        agentData.deploymentType === "both"
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <Bot className="size-8 mx-auto mb-2 text-green-600" />
                      <p className="text-slate-900">Both</p>
                      <p className="text-slate-600 text-sm">Phone + Widget</p>
                    </button>
                  </div>
                </div>

                {(agentData.deploymentType === "phone" || agentData.deploymentType === "both") && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 000-0000"
                      value={agentData.phoneNumber}
                      onChange={(e) =>
                        setAgentData({ ...agentData, phoneNumber: e.target.value })
                      }
                    />
                    <p className="text-slate-500 text-sm">
                      Don't have a number?{" "}
                      <button
                        onClick={() => toast.success("Redirecting to phone number provider...")}
                        className="text-blue-600 hover:underline"
                      >
                        Get one now
                      </button>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Customize */}
          {step === 2 && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle>Customize Behavior</CardTitle>
                <CardDescription>
                  Define how your agent should interact with callers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="welcome">Welcome Message</Label>
                  <Textarea
                    id="welcome"
                    placeholder="Hello! Thanks for calling. How can I help you today?"
                    rows={3}
                    value={agentData.welcomeMessage}
                    onChange={(e) =>
                      setAgentData({ ...agentData, welcomeMessage: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Agent Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="You are a helpful sales assistant. Your goal is to qualify leads and book demos. Always be polite and professional..."
                    rows={6}
                    value={agentData.instructions}
                    onChange={(e) =>
                      setAgentData({ ...agentData, instructions: e.target.value })
                    }
                  />
                  <p className="text-slate-500 text-sm">
                    Provide clear instructions on how the agent should behave
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Conversation Tone</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: "professional", name: "Professional", emoji: "💼" },
                      { id: "friendly", name: "Friendly", emoji: "😊" },
                      { id: "casual", name: "Casual", emoji: "👋" },
                      { id: "formal", name: "Formal", emoji: "🎩" },
                    ].map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() => setAgentData({ ...agentData, tone: tone.id })}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          agentData.tone === tone.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-2xl mb-1">{tone.emoji}</div>
                        <p className="text-slate-900 text-sm">{tone.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Call Settings</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={agentData.recordCalls}
                        onChange={(e) =>
                          setAgentData({ ...agentData, recordCalls: e.target.checked })
                        }
                        className="rounded"
                      />
                      <div>
                        <p className="text-slate-900">Record Calls</p>
                        <p className="text-slate-600 text-sm">
                          Save audio recordings of all calls
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={agentData.transcribeCalls}
                        onChange={(e) =>
                          setAgentData({ ...agentData, transcribeCalls: e.target.checked })
                        }
                        className="rounded"
                      />
                      <div>
                        <p className="text-slate-900">Transcribe Calls</p>
                        <p className="text-slate-600 text-sm">
                          Generate text transcripts automatically
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Voice & Language */}
          {step === 3 && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle>Voice & Language</CardTitle>
                <CardDescription>
                  Choose the voice and language for your agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setAgentData({ ...agentData, language: lang.code })}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          agentData.language === lang.code
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <span className="text-2xl mr-2">{lang.flag}</span>
                        <span className="text-slate-900">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Voice</Label>
                  <div className="grid gap-3">
                    {voices.map((voice) => (
                      <div
                        key={voice.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          agentData.voice === voice.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setAgentData({ ...agentData, voice: voice.id })}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                <Mic className="size-5" />
                              </div>
                              <div>
                                <p className="text-slate-900">{voice.name}</p>
                                <p className="text-slate-600 text-sm">
                                  {voice.gender} • {voice.accent} Accent
                                </p>
                              </div>
                            </div>
                          </button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playVoiceDemo(voice.id)}
                          >
                            <Volume2 className="size-4 mr-2" />
                            Play Demo
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 mb-2">🎤 Need a custom voice?</p>
                  <p className="text-blue-700 text-sm mb-3">
                    Clone your own voice or create a custom voice with ElevenLabs integration
                  </p>
                  <Button variant="outline" size="sm">
                    Setup Voice Cloning
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Deploy */}
          {step === 4 && (
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle>Deploy Your Agent</CardTitle>
                <CardDescription>Review and activate your agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check className="size-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-green-900 mb-2">Agent Ready to Deploy!</h3>
                      <p className="text-green-700 mb-4">
                        Your agent is configured and ready to start handling calls
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-green-900 mb-1">Agent Name</p>
                          <p className="text-green-700">{agentData.name || "Unnamed Agent"}</p>
                        </div>
                        <div>
                          <p className="text-green-900 mb-1">Type</p>
                          <p className="text-green-700 capitalize">{agentData.type}</p>
                        </div>
                        <div>
                          <p className="text-green-900 mb-1">Voice</p>
                          <p className="text-green-700 capitalize">{agentData.voice}</p>
                        </div>
                        <div>
                          <p className="text-green-900 mb-1">Language</p>
                          <p className="text-green-700">
                            {languages.find((l) => l.code === agentData.language)?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {agentData.deploymentType !== "widget" && (
                  <div className="space-y-3">
                    <h4 className="text-slate-900">Phone Setup</h4>
                    <div className="p-4 bg-slate-50 rounded-lg border">
                      <p className="text-slate-900 mb-2">
                        Phone Number: {agentData.phoneNumber || "Not configured"}
                      </p>
                      <p className="text-slate-600 text-sm">
                        Inbound calls will be handled automatically
                      </p>
                    </div>
                  </div>
                )}

                {agentData.deploymentType !== "phone" && (
                  <div className="space-y-3">
                    <h4 className="text-slate-900">Web Widget Code</h4>
                    <div className="p-4 bg-slate-900 rounded-lg">
                      <code className="text-green-400 text-sm">
                        {`<script src="https://voiceai.app/widget.js" 
  data-agent-id="${Math.random().toString(36).substr(2, 9)}"
></script>`}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => toast.success("Code copied to clipboard")}
                    >
                      Copy Widget Code
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-slate-900">Next Steps</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="size-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-700">
                        Test your agent with a sample call
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-700">
                        Configure integrations (CRM, Calendar, Webhooks)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-700">Monitor calls and analytics</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              {step < 4 ? (
                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                  Next
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Rocket className="size-4 mr-2" />
                  Deploy Agent
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}