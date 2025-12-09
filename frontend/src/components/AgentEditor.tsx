import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  X,
  Save,
  Bot,
  Phone,
  Globe,
  Mic,
  MessageSquare,
  Settings as SettingsIcon,
  Brain,
  Volume2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface AgentEditorProps {
  agent: any;
  onClose: () => void;
  onSave: (updatedAgent: any) => void;
}

export function AgentEditor({ agent, onClose, onSave }: AgentEditorProps) {
  const [formData, setFormData] = useState({
    name: agent.name,
    type: agent.type,
    status: agent.status,
    deployment: agent.deployment,
    phoneNumber: agent.phoneNumber,
    language: agent.language,
    voice: agent.voice,
    welcomeMessage: "Hello! Thanks for calling. How can I help you today?",
    instructions: "Be professional and helpful. Answer customer questions accurately.",
    background: "You are a professional AI assistant.",
    goal: "Provide excellent customer service.",
    tone: "professional",
    recordCalls: true,
    transcribeCalls: true,
    openAIModel: "gpt-4",
    answerCreativity: 0.7,
  });

  const [activeTab, setActiveTab] = useState<"basic" | "conversation" | "voice" | "advanced">("basic");

  const voices = [
    { id: "nova", name: "Nova", gender: "Female" },
    { id: "shimmer", name: "Shimmer", gender: "Female" },
    { id: "echo", name: "Echo", gender: "Male" },
    { id: "alloy", name: "Alloy", gender: "Neutral" },
    { id: "fable", name: "Fable", gender: "Male" },
    { id: "onyx", name: "Onyx", gender: "Male" },
  ];

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish (Spain)" },
    { code: "es-MX", name: "Spanish (Mexico)" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
  ];

  const handleSave = () => {
    const updatedAgent = {
      ...agent,
      ...formData,
    };
    onSave(updatedAgent);
    toast.success(`${formData.name} updated successfully!`);
    onClose();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-black dark:via-slate-950 dark:to-black">
      {/* Header */}
      <div className="border-b dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="size-6 text-blue-600" />
              <div>
                <h1 className="text-slate-900 dark:text-white">Edit Agent</h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{agent.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="size-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("basic")}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === "basic"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <SettingsIcon className="size-4 inline mr-2" />
              Basic Settings
            </button>
            <button
              onClick={() => setActiveTab("conversation")}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === "conversation"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Brain className="size-4 inline mr-2" />
              Conversation
            </button>
            <button
              onClick={() => setActiveTab("voice")}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === "voice"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Mic className="size-4 inline mr-2" />
              Voice & Language
            </button>
            <button
              onClick={() => setActiveTab("advanced")}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === "advanced"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MessageSquare className="size-4 inline mr-2" />
              Advanced
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Basic Settings Tab */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Basic Information</CardTitle>
                  <CardDescription className="dark:text-slate-400">Configure agent name and type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-white">Agent Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Sales Assistant"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-white">Agent Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: "sales", name: "Sales", emoji: "💼" },
                        { id: "support", name: "Support", emoji: "🎧" },
                        { id: "lead", name: "Lead Qualifier", emoji: "🎯" },
                        { id: "appointment", name: "Appointment", emoji: "📅" },
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setFormData({ ...formData, type: type.id })}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            formData.type === type.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                          }`}
                        >
                          <div className="text-2xl mb-1">{type.emoji}</div>
                          <p className="text-slate-900 dark:text-white text-sm">{type.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-white">Deployment Type</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setFormData({ ...formData, deployment: "phone" })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          formData.deployment === "phone"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                      >
                        <Phone className="size-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-slate-900 dark:text-white text-sm">Phone</p>
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, deployment: "widget" })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          formData.deployment === "widget"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                      >
                        <Globe className="size-6 mx-auto mb-2 text-purple-600" />
                        <p className="text-slate-900 dark:text-white text-sm">Widget</p>
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, deployment: "both" })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          formData.deployment === "both"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                      >
                        <Bot className="size-6 mx-auto mb-2 text-green-600" />
                        <p className="text-slate-900 dark:text-white text-sm">Both</p>
                      </button>
                    </div>
                  </div>

                  {formData.deployment !== "widget" && (
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="dark:text-white">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Conversation Tab */}
          {activeTab === "conversation" && (
            <div className="space-y-6">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">AI Behavior</CardTitle>
                  <CardDescription className="dark:text-slate-400">Configure conversation style and personality</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="background" className="dark:text-white">Agent Background</Label>
                    <Textarea
                      id="background"
                      value={formData.background}
                      onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                      rows={3}
                      placeholder="You are a professional AI assistant..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal" className="dark:text-white">Agent Goal</Label>
                    <Textarea
                      id="goal"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      rows={2}
                      placeholder="Provide excellent customer service..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions" className="dark:text-white">Agent Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      rows={4}
                      placeholder="Be professional and helpful..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-white">Conversation Tone</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { id: "professional", name: "Professional", emoji: "💼" },
                        { id: "friendly", name: "Friendly", emoji: "😊" },
                        { id: "casual", name: "Casual", emoji: "👋" },
                        { id: "formal", name: "Formal", emoji: "🎩" },
                      ].map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => setFormData({ ...formData, tone: tone.id })}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            formData.tone === tone.id
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

                  <div className="space-y-2">
                    <Label htmlFor="welcome" className="dark:text-white">Welcome Message</Label>
                    <Textarea
                      id="welcome"
                      value={formData.welcomeMessage}
                      onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                      rows={2}
                      placeholder="Hello! Thanks for calling..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Voice & Language Tab */}
          {activeTab === "voice" && (
            <div className="space-y-6">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Voice & Language Settings</CardTitle>
                  <CardDescription className="dark:text-slate-400">Configure voice and language preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="dark:text-white">Language</Label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.name}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-white">Voice</Label>
                    <div className="grid gap-3">
                      {voices.map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => setFormData({ ...formData, voice: voice.name })}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            formData.voice === voice.name
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                <Mic className="size-5" />
                              </div>
                              <div>
                                <p className="text-slate-900 dark:text-white">{voice.name}</p>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">{voice.gender}</p>
                              </div>
                            </div>
                            {formData.voice === voice.name && (
                              <Check className="size-5 text-blue-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === "advanced" && (
            <div className="space-y-6">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Advanced Settings</CardTitle>
                  <CardDescription className="dark:text-slate-400">AI model and recording options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model" className="dark:text-white">OpenAI Model</Label>
                    <select
                      id="model"
                      value={formData.openAIModel}
                      onChange={(e) => setFormData({ ...formData, openAIModel: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                    >
                      <option value="gpt-4">GPT-4 (Best quality)</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo (Faster)</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Economical)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creativity" className="dark:text-white">
                      Answer Creativity: {formData.answerCreativity}
                    </Label>
                    <input
                      type="range"
                      id="creativity"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.answerCreativity}
                      onChange={(e) =>
                        setFormData({ ...formData, answerCreativity: parseFloat(e.target.value) })
                      }
                      className="w-full"
                    />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Lower = consistent, Higher = creative
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={formData.recordCalls}
                        onChange={(e) =>
                          setFormData({ ...formData, recordCalls: e.target.checked })
                        }
                        className="rounded"
                      />
                      <div>
                        <p className="text-slate-900 dark:text-white">Record Calls</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Save audio recordings</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={formData.transcribeCalls}
                        onChange={(e) =>
                          setFormData({ ...formData, transcribeCalls: e.target.checked })
                        }
                        className="rounded"
                      />
                      <div>
                        <p className="text-slate-900 dark:text-white">Transcribe Calls</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Generate text transcripts</p>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-lg border dark:border-slate-800">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="size-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
