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
  onSave: (updatedAgent: any) => Promise<void> | void;
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
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const updatedAgent = {
      ...agent,
      ...formData,
    };
    try {
      await onSave(updatedAgent);
      toast.success(`${formData.name} updated successfully!`);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update agent");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="size-6 text-blue-600" />
              <div>
                <h1 className="text-slate-900">Edit Agent</h1>
                <p className="text-slate-600 text-sm">{agent.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-60"
                disabled={isSaving}
              >
                <Save className="size-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("basic")}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === "basic"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
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
                  : "border-transparent text-slate-600 hover:text-slate-900"
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
                  : "border-transparent text-slate-600 hover:text-slate-900"
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
                  : "border-transparent text-slate-600 hover:text-slate-900"
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
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Configure agent name and type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Agent Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Sales Assistant"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Agent Type</Label>
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
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="text-2xl mb-1">{type.emoji}</div>
                          <p className="text-slate-900 text-sm">{type.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Deployment Type</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setFormData({ ...formData, deployment: "phone" })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          formData.deployment === "phone"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <Phone className="size-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-slate-900 text-sm">Phone</p>
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, deployment: "widget" })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          formData.deployment === "widget"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <Globe className="size-6 mx-auto mb-2 text-purple-600" />
                        <p className="text-slate-900 text-sm">Widget</p>
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, deployment: "both" })}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          formData.deployment === "both"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <Bot className="size-6 mx-auto mb-2 text-green-600" />
                        <p className="text-slate-900 text-sm">Both</p>
                      </button>
                    </div>
                  </div>

                  {formData.deployment !== "widget" && (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
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
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>AI Behavior</CardTitle>
                  <CardDescription>Configure conversation style and personality</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="background">Agent Background</Label>
                    <Textarea
                      id="background"
                      value={formData.background}
                      onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                      rows={3}
                      placeholder="You are a professional AI assistant..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Agent Goal</Label>
                    <Textarea
                      id="goal"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      rows={2}
                      placeholder="Provide excellent customer service..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Agent Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      rows={4}
                      placeholder="Be professional and helpful..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Conversation Tone</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="welcome">Welcome Message</Label>
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
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Voice & Language Settings</CardTitle>
                  <CardDescription>Configure voice and language preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.name}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Voice</Label>
                    <div className="grid gap-3">
                      {voices.map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => setFormData({ ...formData, voice: voice.name })}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            formData.voice === voice.name
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                <Mic className="size-5" />
                              </div>
                              <div>
                                <p className="text-slate-900">{voice.name}</p>
                                <p className="text-slate-600 text-sm">{voice.gender}</p>
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
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>AI model and recording options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">OpenAI Model</Label>
                    <select
                      id="model"
                      value={formData.openAIModel}
                      onChange={(e) => setFormData({ ...formData, openAIModel: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                    >
                      <option value="gpt-4">GPT-4 (Best quality)</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo (Faster)</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Economical)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creativity">
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
                    <p className="text-slate-500 text-sm">
                      Lower = consistent, Higher = creative
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.recordCalls}
                        onChange={(e) =>
                          setFormData({ ...formData, recordCalls: e.target.checked })
                        }
                        className="rounded"
                      />
                      <div>
                        <p className="text-slate-900">Record Calls</p>
                        <p className="text-slate-600 text-sm">Save audio recordings</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.transcribeCalls}
                        onChange={(e) =>
                          setFormData({ ...formData, transcribeCalls: e.target.checked })
                        }
                        className="rounded"
                      />
                      <div>
                        <p className="text-slate-900">Transcribe Calls</p>
                        <p className="text-slate-600 text-sm">Generate text transcripts</p>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 rounded-lg border">
            <Button type="button" variant="outline" onClick={onClose}>
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
