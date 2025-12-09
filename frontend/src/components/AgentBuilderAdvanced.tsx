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
  Upload,
  FileText,
  Trash2,
  Zap,
  Mail,
  Webhook,
  Calendar,
  Clock,
  Brain,
  Sliders,
  PhoneCall,
  PhoneForwarded,
} from "lucide-react";
import { toast } from "sonner";

interface AgentBuilderAdvancedProps {
  onClose: () => void;
  onSave: () => void;
}

export function AgentBuilderAdvanced({ onClose, onSave }: AgentBuilderAdvancedProps) {
  const [step, setStep] = useState(1);
  const [agentData, setAgentData] = useState({
    // Basic config
    name: "",
    type: "sales",
    format: "inbound", // inbound or outbound
    timezone: "America/New_York",
    language: "en-US",
    voice: "nova",
    phoneNumber: "",
    deploymentType: "phone",
    
    // Conversation settings
    welcomeMessage: "",
    welcomeDelay: 0,
    instructions: "",
    background: "",
    goal: "",
    tone: "professional",
    scriptMode: false,
    script: "",
    
    // Call settings
    recordCalls: true,
    transcribeCalls: true,
    
    // Voicemail & detection
    voicemailDetection: true,
    voicemailBehavior: "leave_message", // leave_message or hangup
    voicemailMessage: "",
    machineDetectionTimeout: 30,
    
    // AI/LLM settings
    openAIModel: "gpt-4",
    answerCreativity: 0.7, // temperature
    contextTokenLimit: 2000,
    maxAnswerLength: 200,
    
    // Speech controls
    speechStopSensitivity: 0.5,
    utteranceDetectionWindow: 1.5,
    silencePrompt: true,
    autoHangupOnSilence: true,
    silenceTimeout: 10,
    fillerWordTranscription: true,
    
    // WebRTC settings
    backgroundNoise: "office", // none, office, cafe, outdoor
    
    // Advanced
    blockedPhoneTypes: [] as string[],
    maxLatencyOptimization: false,
    
    // Knowledge & actions
    knowledgeFiles: [] as any[],
    actions: [] as any[],
  });

  const voices = [
    { id: "nova", name: "Nova", gender: "Female", accent: "US", provider: "OpenAI" },
    { id: "shimmer", name: "Shimmer", gender: "Female", accent: "US", provider: "OpenAI" },
    { id: "echo", name: "Echo", gender: "Male", accent: "US", provider: "OpenAI" },
    { id: "alloy", name: "Alloy", gender: "Neutral", accent: "US", provider: "OpenAI" },
    { id: "fable", name: "Fable", gender: "Male", accent: "UK", provider: "OpenAI" },
    { id: "onyx", name: "Onyx", gender: "Male", accent: "US", provider: "OpenAI" },
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
    { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
    { code: "nl-NL", name: "Dutch", flag: "🇳🇱" },
    { code: "sv-SE", name: "Swedish", flag: "🇸🇪" },
    { code: "pl-PL", name: "Polish", flag: "🇵🇱" },
  ];

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
  ];

  const agentTypes = [
    { id: "sales", name: "Sales Agent", description: "Close deals and qualify leads", icon: "💼" },
    { id: "support", name: "Support Agent", description: "Handle customer inquiries", icon: "🎧" },
    { id: "appointment", name: "Appointment Setter", description: "Schedule meetings", icon: "📅" },
    { id: "lead", name: "Lead Qualifier", description: "Qualify and route leads", icon: "🎯" },
    { id: "custom", name: "Custom Agent", description: "Build your own workflow", icon: "⚙️" },
  ];

  const handleNext = () => {
    if (step === 1 && !agentData.name) {
      toast.error("Please enter an agent name");
      return;
    }
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    toast.success("Agent created successfully with all advanced settings!");
    onSave();
  };

  const playVoiceDemo = (voiceId: string) => {
    toast.success(`Playing ${voiceId} voice demo`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      setAgentData({ ...agentData, knowledgeFiles: [...agentData.knowledgeFiles, ...newFiles] });
      toast.success(`${files.length} file(s) uploaded to knowledge base`);
    }
  };

  const removeKnowledgeFile = (id: string) => {
    setAgentData({
      ...agentData,
      knowledgeFiles: agentData.knowledgeFiles.filter((f) => f.id !== id),
    });
    toast.success("File removed from knowledge base");
  };

  const addAction = (type: "email" | "sms" | "webhook") => {
    const newAction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      config: {},
    };
    setAgentData({ ...agentData, actions: [...agentData.actions, newAction] });
    toast.success(`${type.toUpperCase()} action added`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="border-b dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="size-6 text-blue-600" />
              <h1 className="text-slate-900 dark:text-white">Create Advanced Agent</h1>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            {[
              { num: 1, title: "Configure", icon: SettingsIcon },
              { num: 2, title: "AI & Behavior", icon: Brain },
              { num: 3, title: "Voice & Speech", icon: Mic },
              { num: 4, title: "Knowledge & Actions", icon: Zap },
              { num: 5, title: "Deploy", icon: Rocket },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center ${
                      step >= s.num ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {step > s.num ? <Check className="size-5" /> : <s.icon className="size-5" />}
                  </div>
                  <div className="hidden md:block">
                    <p className={`text-sm ${step >= s.num ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                      {s.title}
                    </p>
                  </div>
                </div>
                {idx < 4 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step > s.num ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Step 1: Configure */}
          {step === 1 && (
            <div className="space-y-6">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Basic Configuration</CardTitle>
                  <CardDescription className="dark:text-slate-400">Set up fundamental agent settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="dark:text-white">Agent Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Sales Assistant Pro"
                        value={agentData.name}
                        onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="dark:text-white">Timezone</Label>
                      <select
                        id="timezone"
                        value={agentData.timezone}
                        onChange={(e) => setAgentData({ ...agentData, timezone: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                      >
                        {timezones.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-white">Agent Type</Label>
                    <div className="grid md:grid-cols-3 gap-3">
                      {agentTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setAgentData({ ...agentData, type: type.id })}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            agentData.type === type.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                          }`}
                        >
                          <div className="text-2xl mb-2">{type.icon}</div>
                          <p className="text-slate-900 dark:text-white mb-1">{type.name}</p>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">{type.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-white">Call Format</Label>
                    <div className="grid md:grid-cols-2 gap-3">
                      <button
                        onClick={() => setAgentData({ ...agentData, format: "inbound" })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          agentData.format === "inbound"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                      >
                        <PhoneCall className="size-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-slate-900 dark:text-white">Inbound</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Receive incoming calls</p>
                      </button>
                      <button
                        onClick={() => setAgentData({ ...agentData, format: "outbound" })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          agentData.format === "outbound"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                      >
                        <PhoneForwarded className="size-8 mx-auto mb-2 text-purple-600" />
                        <p className="text-slate-900 dark:text-white">Outbound</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Make outgoing calls</p>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-white">Deployment Type</Label>
                    <div className="grid md:grid-cols-3 gap-3">
                      <button
                        onClick={() => setAgentData({ ...agentData, deploymentType: "phone" })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          agentData.deploymentType === "phone"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                      >
                        <Phone className="size-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-slate-900 dark:text-white">Phone Number</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Via Twilio</p>
                      </button>
                      <button
                        onClick={() => setAgentData({ ...agentData, deploymentType: "webrtc" })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          agentData.deploymentType === "webrtc"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                      >
                        <Globe className="size-8 mx-auto mb-2 text-purple-600" />
                        <p className="text-slate-900 dark:text-white">WebRTC</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Browser calling</p>
                      </button>
                      <button
                        onClick={() => setAgentData({ ...agentData, deploymentType: "both" })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          agentData.deploymentType === "both"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                      >
                        <Bot className="size-8 mx-auto mb-2 text-green-600" />
                        <p className="text-slate-900 dark:text-white">Both</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Phone + WebRTC</p>
                      </button>
                    </div>
                  </div>

                  {(agentData.deploymentType === "phone" || agentData.deploymentType === "both") && (
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="dark:text-white">Phone Number (Twilio)</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        value={agentData.phoneNumber}
                        onChange={(e) => setAgentData({ ...agentData, phoneNumber: e.target.value })}
                      />
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        <button
                          onClick={() => toast.success("Opening Twilio number management...")}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Manage Twilio numbers
                        </button>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: AI & Behavior */}
          {step === 2 && (
            <div className="space-y-6">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">AI & Conversation Behavior</CardTitle>
                  <CardDescription className="dark:text-slate-400">Configure LLM settings and conversation style</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="model" className="dark:text-white">OpenAI Model</Label>
                      <select
                        id="model"
                        value={agentData.openAIModel}
                        onChange={(e) => setAgentData({ ...agentData, openAIModel: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                      >
                        <option value="gpt-4">GPT-4 (Best quality)</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo (Faster)</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Economical)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="creativity" className="dark:text-white">Answer Creativity: {agentData.answerCreativity}</Label>
                      <input
                        type="range"
                        id="creativity"
                        min="0"
                        max="1"
                        step="0.1"
                        value={agentData.answerCreativity}
                        onChange={(e) =>
                          setAgentData({ ...agentData, answerCreativity: parseFloat(e.target.value) })
                        }
                        className="w-full"
                      />
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Lower = consistent, Higher = creative
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contextLimit" className="dark:text-white">Context Token Limit</Label>
                      <Input
                        type="number"
                        id="contextLimit"
                        value={agentData.contextTokenLimit}
                        onChange={(e) =>
                          setAgentData({ ...agentData, contextTokenLimit: parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAnswer" className="dark:text-white">Max Answer Length (words)</Label>
                      <Input
                        type="number"
                        id="maxAnswer"
                        value={agentData.maxAnswerLength}
                        onChange={(e) =>
                          setAgentData({ ...agentData, maxAnswerLength: parseInt(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background" className="dark:text-white">Agent Background</Label>
                    <Textarea
                      id="background"
                      placeholder="You are an expert sales representative with 10 years of experience..."
                      rows={3}
                      value={agentData.background}
                      onChange={(e) => setAgentData({ ...agentData, background: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal" className="dark:text-white">Agent Goal</Label>
                    <Textarea
                      id="goal"
                      placeholder="Qualify leads and book demos for the sales team..."
                      rows={2}
                      value={agentData.goal}
                      onChange={(e) => setAgentData({ ...agentData, goal: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions" className="dark:text-white">Agent Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Always be polite and professional. Ask qualifying questions. If the lead is qualified, offer to book a demo..."
                      rows={4}
                      value={agentData.instructions}
                      onChange={(e) => setAgentData({ ...agentData, instructions: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-white">Conversation Tone</Label>
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
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                          }`}
                        >
                          <div className="text-2xl mb-1">{tone.emoji}</div>
                          <p className="text-slate-900 dark:text-white text-sm">{tone.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="scriptMode"
                        checked={agentData.scriptMode}
                        onChange={(e) => setAgentData({ ...agentData, scriptMode: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="scriptMode" className="dark:text-white">Enable Script Mode (strict adherence)</Label>
                    </div>
                    {agentData.scriptMode && (
                      <Textarea
                        placeholder="Enter your exact script here..."
                        rows={5}
                        value={agentData.script}
                        onChange={(e) => setAgentData({ ...agentData, script: e.target.value })}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Voice & Speech */}
          {step === 3 && (
            <div className="space-y-6">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Voice & Speech Settings</CardTitle>
                  <CardDescription className="dark:text-slate-400">Configure voice, language, and speech detection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="dark:text-white">Language</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setAgentData({ ...agentData, language: lang.code })}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            agentData.language === lang.code
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                          }`}
                        >
                          <span className="text-xl mr-2">{lang.flag}</span>
                          <span className="text-slate-900 dark:text-white text-sm">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-white">Voice Selection</Label>
                    <div className="grid gap-3">
                      {voices.map((voice) => (
                        <div
                          key={voice.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            agentData.voice === voice.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
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
                                  <p className="text-slate-900 dark:text-white">{voice.name}</p>
                                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    {voice.gender} • {voice.accent} • {voice.provider}
                                  </p>
                                </div>
                              </div>
                            </button>
                            <Button size="sm" variant="outline" onClick={() => playVoiceDemo(voice.id)}>
                              <Volume2 className="size-4 mr-2" />
                              Demo
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <p className="text-purple-900 dark:text-purple-300 mb-2">🎙️ Voice Cloning (ElevenLabs)</p>
                    <p className="text-purple-700 dark:text-purple-400 text-sm mb-3">
                      Clone a custom voice for your brand
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success("Opening ElevenLabs voice cloning...")}
                    >
                      Setup Voice Clone
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="welcomeDelay" className="dark:text-white">Welcome Message Delay (seconds)</Label>
                      <Input
                        type="number"
                        id="welcomeDelay"
                        value={agentData.welcomeDelay}
                        onChange={(e) =>
                          setAgentData({ ...agentData, welcomeDelay: parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="silenceTimeout" className="dark:text-white">Auto-Hangup Silence (seconds)</Label>
                      <Input
                        type="number"
                        id="silenceTimeout"
                        value={agentData.silenceTimeout}
                        onChange={(e) =>
                          setAgentData({ ...agentData, silenceTimeout: parseInt(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="welcome" className="dark:text-white">Welcome Message</Label>
                    <Textarea
                      id="welcome"
                      placeholder="Hello! Thanks for calling. How can I help you today?"
                      rows={2}
                      value={agentData.welcomeMessage}
                      onChange={(e) => setAgentData({ ...agentData, welcomeMessage: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-slate-900 dark:text-white">Speech Detection Controls</h4>
                    <div className="space-y-2">
                      <Label htmlFor="speechSensitivity" className="dark:text-white">
                        Speech Stop Sensitivity: {agentData.speechStopSensitivity}
                      </Label>
                      <input
                        type="range"
                        id="speechSensitivity"
                        min="0"
                        max="1"
                        step="0.1"
                        value={agentData.speechStopSensitivity}
                        onChange={(e) =>
                          setAgentData({ ...agentData, speechStopSensitivity: parseFloat(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="utteranceWindow" className="dark:text-white">
                        Utterance Detection Window: {agentData.utteranceDetectionWindow}s
                      </Label>
                      <input
                        type="range"
                        id="utteranceWindow"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={agentData.utteranceDetectionWindow}
                        onChange={(e) =>
                          setAgentData({
                            ...agentData,
                            utteranceDetectionWindow: parseFloat(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={agentData.fillerWordTranscription}
                        onChange={(e) =>
                          setAgentData({ ...agentData, fillerWordTranscription: e.target.checked })
                        }
                        className="rounded"
                      />
                      <div>
                        <p className="text-slate-900 dark:text-white">Transcribe Filler Words</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Include "um", "uh", etc. in transcript</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={agentData.silencePrompt}
                        onChange={(e) => setAgentData({ ...agentData, silencePrompt: e.target.checked })}
                        className="rounded"
                      />
                      <div>
                        <p className="text-slate-900 dark:text-white">Silence Prompts</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Agent prompts on extended silence</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={agentData.autoHangupOnSilence}
                        onChange={(e) =>
                          setAgentData({ ...agentData, autoHangupOnSilence: e.target.checked })
                        }
                        className="rounded"
                      />
                      <div>
                        <p className="text-slate-900 dark:text-white">Auto-Hangup on Silence</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">End call after silence timeout</p>
                      </div>
                    </label>
                  </div>

                  {agentData.deploymentType !== "phone" && (
                    <div className="space-y-2">
                      <Label className="dark:text-white">Background Ambience (WebRTC only)</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { id: "none", name: "None", emoji: "🔇" },
                          { id: "office", name: "Office", emoji: "🏢" },
                          { id: "cafe", name: "Café", emoji: "☕" },
                          { id: "outdoor", name: "Outdoor", emoji: "🌳" },
                        ].map((bg) => (
                          <button
                            key={bg.id}
                            onClick={() => setAgentData({ ...agentData, backgroundNoise: bg.id })}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              agentData.backgroundNoise === bg.id
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                            }`}
                          >
                            <div className="text-2xl mb-1">{bg.emoji}</div>
                            <p className="text-slate-900 dark:text-white text-sm">{bg.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="text-slate-900 dark:text-white">Voicemail & Machine Detection</h4>
                    <label className="flex items-center gap-3 p-3 border dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={agentData.voicemailDetection}
                        onChange={(e) =>
                          setAgentData({ ...agentData, voicemailDetection: e.target.checked })
                        }
                        className="rounded"
                      />
                      <div>
                        <p className="text-slate-900 dark:text-white">Enable Voicemail Detection</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Detect answering machines</p>
                      </div>
                    </label>

                    {agentData.voicemailDetection && (
                      <div className="space-y-4 ml-8">
                        <div className="space-y-2">
                          <Label htmlFor="machineTimeout" className="dark:text-white">Detection Timeout (seconds)</Label>
                          <Input
                            type="number"
                            id="machineTimeout"
                            value={agentData.machineDetectionTimeout}
                            onChange={(e) =>
                              setAgentData({
                                ...agentData,
                                machineDetectionTimeout: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="dark:text-white">Voicemail Behavior</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() =>
                                setAgentData({ ...agentData, voicemailBehavior: "leave_message" })
                              }
                              className={`p-3 rounded-lg border-2 text-center transition-all ${
                                agentData.voicemailBehavior === "leave_message"
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950 dark:text-white"
                                  : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 dark:text-slate-300"
                              }`}
                            >
                              Leave Message
                            </button>
                            <button
                              onClick={() => setAgentData({ ...agentData, voicemailBehavior: "hangup" })}
                              className={`p-3 rounded-lg border-2 text-center transition-all ${
                                agentData.voicemailBehavior === "hangup"
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950 dark:text-white"
                                  : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 dark:text-slate-300"
                              }`}
                            >
                              Hang Up
                            </button>
                          </div>
                        </div>
                        {agentData.voicemailBehavior === "leave_message" && (
                          <div className="space-y-2">
                            <Label htmlFor="voicemailMsg" className="dark:text-white">Voicemail Message</Label>
                            <Textarea
                              id="voicemailMsg"
                              placeholder="Hi, this is calling from... Please call us back at..."
                              rows={3}
                              value={agentData.voicemailMessage}
                              onChange={(e) =>
                                setAgentData({ ...agentData, voicemailMessage: e.target.value })
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Knowledge & Actions */}
          {step === 4 && (
            <div className="space-y-6">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Knowledge Base</CardTitle>
                  <CardDescription className="dark:text-slate-400">Upload files to train your agent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <Upload className="size-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-900 mb-2">Upload Knowledge Files</p>
                    <p className="text-slate-600 text-sm mb-4">
                      PDF, DOCX, TXT - Max 10MB per file
                    </p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button variant="outline" className="pointer-events-none">
                        <Upload className="size-4 mr-2" />
                        Choose Files
                      </Button>
                    </label>
                  </div>

                  {agentData.knowledgeFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-slate-900 dark:text-white">Uploaded Files</h4>
                      {agentData.knowledgeFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 border dark:border-slate-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="size-5 text-blue-600" />
                            <div>
                              <p className="text-slate-900 dark:text-white">{file.name}</p>
                              <p className="text-slate-600 dark:text-slate-400 text-sm">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeKnowledgeFile(file.id)}
                          >
                            <Trash2 className="size-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Actions & Integrations</CardTitle>
                  <CardDescription className="dark:text-slate-400">Automate tasks during or after calls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-3">
                    <button
                      onClick={() => addAction("email")}
                      className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                    >
                      <Mail className="size-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-slate-900 dark:text-white">Email Action</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Send emails</p>
                    </button>
                    <button
                      onClick={() => addAction("sms")}
                      className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                    >
                      <MessageSquare className="size-8 mx-auto mb-2 text-green-600" />
                      <p className="text-slate-900 dark:text-white">SMS Action</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Send SMS</p>
                    </button>
                    <button
                      onClick={() => addAction("webhook")}
                      className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                    >
                      <Webhook className="size-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-slate-900 dark:text-white">Webhook</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">HTTP POST</p>
                    </button>
                  </div>

                  {agentData.actions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-slate-900 dark:text-white">Configured Actions</h4>
                      {agentData.actions.map((action) => (
                        <div key={action.id} className="p-3 border dark:border-slate-700 rounded-lg flex items-center justify-between">
                          <Badge variant="outline" className="capitalize">
                            {action.type}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            Configure
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Zap className="size-6 text-purple-600 dark:text-purple-400 shrink-0 mt-1" />
                      <div>
                        <p className="text-purple-900 dark:text-purple-300 mb-2">Zapier Integration</p>
                        <p className="text-purple-700 dark:text-purple-400 text-sm mb-3">
                          Connect 3000+ apps via Zapier webhooks
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.success("Opening Zapier integration...")}
                        >
                          Connect Zapier
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Advanced Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={agentData.recordCalls}
                      onChange={(e) => setAgentData({ ...agentData, recordCalls: e.target.checked })}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <p className="text-slate-900 dark:text-white">Record Calls</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Save audio recordings</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={agentData.transcribeCalls}
                      onChange={(e) => setAgentData({ ...agentData, transcribeCalls: e.target.checked })}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <p className="text-slate-900 dark:text-white">Transcribe Calls</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Generate text transcripts</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30">
                    <input
                      type="checkbox"
                      checked={agentData.maxLatencyOptimization}
                      onChange={(e) =>
                        setAgentData({ ...agentData, maxLatencyOptimization: e.target.checked })
                      }
                      className="rounded"
                    />
                    <div className="flex-1">
                      <p className="text-yellow-900 dark:text-yellow-300 flex items-center gap-2">
                        Max Latency Optimization
                        <Badge className="bg-yellow-600 dark:bg-yellow-700">Premium Add-on</Badge>
                      </p>
                      <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                        ~800ms response time - Premium feature
                      </p>
                    </div>
                  </label>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Deploy */}
          {step === 5 && (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Deploy Your Agent</CardTitle>
                <CardDescription className="dark:text-slate-400">Review and activate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check className="size-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-green-900 dark:text-green-300 mb-2">Advanced Agent Ready!</h3>
                      <p className="text-green-700 dark:text-green-400 mb-4">
                        All CallFluent features configured
                      </p>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-green-900 dark:text-green-300 mb-1">Name</p>
                          <p className="text-green-700 dark:text-green-400">{agentData.name || "Unnamed"}</p>
                        </div>
                        <div>
                          <p className="text-green-900 dark:text-green-300 mb-1">Format</p>
                          <p className="text-green-700 dark:text-green-400 capitalize">{agentData.format}</p>
                        </div>
                        <div>
                          <p className="text-green-900 dark:text-green-300 mb-1">Model</p>
                          <p className="text-green-700 dark:text-green-400">{agentData.openAIModel}</p>
                        </div>
                        <div>
                          <p className="text-green-900 dark:text-green-300 mb-1">Voice</p>
                          <p className="text-green-700 dark:text-green-400 capitalize">{agentData.voice}</p>
                        </div>
                        <div>
                          <p className="text-green-900 dark:text-green-300 mb-1">Knowledge Files</p>
                          <p className="text-green-700 dark:text-green-400">{agentData.knowledgeFiles.length}</p>
                        </div>
                        <div>
                          <p className="text-green-900 dark:text-green-300 mb-1">Actions</p>
                          <p className="text-green-700 dark:text-green-400">{agentData.actions.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-slate-900 dark:text-white">API Endpoint (Outbound Calls)</h4>
                  <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-lg">
                    <code className="text-green-400 text-sm break-all">
                      POST https://api.yourapp.ai/call/make-call/{agentData.name
                        .toLowerCase()
                        .replace(/\s/g, "-")}
                    </code>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Use this endpoint to trigger outbound calls programmatically
                  </p>
                </div>

                {agentData.deploymentType !== "phone" && (
                  <div className="space-y-3">
                    <h4 className="text-slate-900 dark:text-white">WebRTC Widget Code</h4>
                    <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-lg">
                      <code className="text-green-400 text-sm">
                        {`<script src="https://cdn.yourapp.ai/webrtc.js" 
  data-agent="${Math.random().toString(36).substr(2, 9)}"
  data-ambience="${agentData.backgroundNoise}"
></script>`}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => toast.success("Code copied!")}
                    >
                      Copy Widget Code
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-slate-900 dark:text-white">Features Enabled</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Check className="size-4 text-green-500" />
                      <span className="text-slate-700 dark:text-slate-300">AI Model: {agentData.openAIModel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="size-4 text-green-500" />
                      <span className="text-slate-700 dark:text-slate-300">Voice: {agentData.voice}</span>
                    </div>
                    {agentData.voicemailDetection && (
                      <div className="flex items-center gap-2">
                        <Check className="size-4 text-green-500" />
                        <span className="text-slate-700 dark:text-slate-300">Voicemail Detection</span>
                      </div>
                    )}
                    {agentData.recordCalls && (
                      <div className="flex items-center gap-2">
                        <Check className="size-4 text-green-500" />
                        <span className="text-slate-700 dark:text-slate-300">Call Recording</span>
                      </div>
                    )}
                    {agentData.transcribeCalls && (
                      <div className="flex items-center gap-2">
                        <Check className="size-4 text-green-500" />
                        <span className="text-slate-700 dark:text-slate-300">Transcription</span>
                      </div>
                    )}
                    {agentData.maxLatencyOptimization && (
                      <div className="flex items-center gap-2">
                        <Check className="size-4 text-yellow-500" />
                        <span className="text-slate-700 dark:text-slate-300">Low Latency (~800ms)</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              {step < 5 ? (
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