import { useState } from "react";
import { X, Save, Shield, Zap, Bell, Database } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

interface AgentAdvancedSettingsProps {
  agent: any;
  onClose: () => void;
  onSave: (settings: any) => void;
}

export function AgentAdvancedSettings({ agent, onClose, onSave }: AgentAdvancedSettingsProps) {
  const [settings, setSettings] = useState({
    maxCallDuration: 600,
    callTimeout: 30,
    retryAttempts: 3,
    retryDelay: 60,
    voicemailDetection: true,
    voicemailAction: "leave_message",
    voicemailMessage: "Hello, this is an automated call. Please call us back at your earliest convenience.",
    callRecording: true,
    callTranscription: true,
    sentimentAnalysis: true,
    webhookUrl: "https://your-domain.com/webhook",
    webhookEvents: ["call.started", "call.completed", "call.failed"],
    fallbackBehavior: "transfer_to_human",
    fallbackNumber: "+1 (555) 000-0000",
    customVariables: "order_id\ncustomer_name\naccount_number",
    rateLimitCalls: 100,
    rateLimitPeriod: "hour",
    enableLogging: true,
    logRetention: 90,
  });

  const handleSave = () => {
    onSave(settings);
    toast.success("Advanced settings saved successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-slate-900">Advanced Settings - {agent.name}</h2>
            <p className="text-slate-600 text-sm">Configure advanced agent behavior</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="size-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Call Behavior */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-5 text-blue-600" />
                Call Behavior
              </CardTitle>
              <CardDescription>Configure call duration and retry logic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxDuration">Max Call Duration (seconds)</Label>
                  <Input
                    id="maxDuration"
                    type="number"
                    value={settings.maxCallDuration}
                    onChange={(e) =>
                      setSettings({ ...settings, maxCallDuration: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Call Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={settings.callTimeout}
                    onChange={(e) =>
                      setSettings({ ...settings, callTimeout: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retryAttempts">Retry Attempts</Label>
                  <Input
                    id="retryAttempts"
                    type="number"
                    value={settings.retryAttempts}
                    onChange={(e) =>
                      setSettings({ ...settings, retryAttempts: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retryDelay">Retry Delay (seconds)</Label>
                  <Input
                    id="retryDelay"
                    type="number"
                    value={settings.retryDelay}
                    onChange={(e) =>
                      setSettings({ ...settings, retryDelay: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voicemail Detection */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-5 text-purple-600" />
                Voicemail Detection
              </CardTitle>
              <CardDescription>Configure voicemail behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={settings.voicemailDetection}
                  onChange={(e) =>
                    setSettings({ ...settings, voicemailDetection: e.target.checked })
                  }
                  className="rounded"
                />
                <div>
                  <p className="text-slate-900">Enable Voicemail Detection</p>
                  <p className="text-slate-600 text-sm">Detect when call goes to voicemail</p>
                </div>
              </label>

              {settings.voicemailDetection && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="vmAction">Voicemail Action</Label>
                    <select
                      id="vmAction"
                      value={settings.voicemailAction}
                      onChange={(e) =>
                        setSettings({ ...settings, voicemailAction: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                    >
                      <option value="leave_message">Leave Message</option>
                      <option value="hang_up">Hang Up</option>
                      <option value="callback">Schedule Callback</option>
                    </select>
                  </div>

                  {settings.voicemailAction === "leave_message" && (
                    <div className="space-y-2">
                      <Label htmlFor="vmMessage">Voicemail Message</Label>
                      <Textarea
                        id="vmMessage"
                        value={settings.voicemailMessage}
                        onChange={(e) =>
                          setSettings({ ...settings, voicemailMessage: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Data & Analytics */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-5 text-green-600" />
                Data & Analytics
              </CardTitle>
              <CardDescription>Recording and analysis settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={settings.callRecording}
                  onChange={(e) =>
                    setSettings({ ...settings, callRecording: e.target.checked })
                  }
                  className="rounded"
                />
                <div>
                  <p className="text-slate-900">Call Recording</p>
                  <p className="text-slate-600 text-sm">Record all calls</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={settings.callTranscription}
                  onChange={(e) =>
                    setSettings({ ...settings, callTranscription: e.target.checked })
                  }
                  className="rounded"
                />
                <div>
                  <p className="text-slate-900">Call Transcription</p>
                  <p className="text-slate-600 text-sm">Generate text transcripts</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={settings.sentimentAnalysis}
                  onChange={(e) =>
                    setSettings({ ...settings, sentimentAnalysis: e.target.checked })
                  }
                  className="rounded"
                />
                <div>
                  <p className="text-slate-900">Sentiment Analysis</p>
                  <p className="text-slate-600 text-sm">Analyze conversation sentiment</p>
                </div>
              </label>

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="logRetention">Log Retention (days)</Label>
                  <Input
                    id="logRetention"
                    type="number"
                    value={settings.logRetention}
                    onChange={(e) =>
                      setSettings({ ...settings, logRetention: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Webhooks */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>Receive real-time event notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={settings.webhookUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, webhookUrl: e.target.value })
                  }
                  placeholder="https://your-domain.com/webhook"
                />
              </div>

              <div className="space-y-2">
                <Label>Webhook Events</Label>
                <div className="space-y-2">
                  {["call.started", "call.completed", "call.failed", "call.voicemail"].map(
                    (event) => (
                      <label
                        key={event}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={settings.webhookEvents.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSettings({
                                ...settings,
                                webhookEvents: [...settings.webhookEvents, event],
                              });
                            } else {
                              setSettings({
                                ...settings,
                                webhookEvents: settings.webhookEvents.filter(
                                  (e) => e !== event
                                ),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-slate-700">{event}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fallback Behavior */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5 text-orange-600" />
                Fallback Behavior
              </CardTitle>
              <CardDescription>What to do when agent cannot handle the call</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fallback">Fallback Action</Label>
                <select
                  id="fallback"
                  value={settings.fallbackBehavior}
                  onChange={(e) =>
                    setSettings({ ...settings, fallbackBehavior: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                >
                  <option value="transfer_to_human">Transfer to Human</option>
                  <option value="take_message">Take Message</option>
                  <option value="schedule_callback">Schedule Callback</option>
                  <option value="end_call">End Call</option>
                </select>
              </div>

              {settings.fallbackBehavior === "transfer_to_human" && (
                <div className="space-y-2">
                  <Label htmlFor="fallbackNumber">Fallback Phone Number</Label>
                  <Input
                    id="fallbackNumber"
                    value={settings.fallbackNumber}
                    onChange={(e) =>
                      setSettings({ ...settings, fallbackNumber: e.target.value })
                    }
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Variables */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Custom Variables</CardTitle>
              <CardDescription>Define variables to pass in API calls (one per line)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={settings.customVariables}
                onChange={(e) =>
                  setSettings({ ...settings, customVariables: e.target.value })
                }
                rows={5}
                placeholder="order_id&#10;customer_name&#10;account_number"
              />
            </CardContent>
          </Card>

          {/* Rate Limiting */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Rate Limiting</CardTitle>
              <CardDescription>Control call volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rateLimit">Max Calls</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={settings.rateLimitCalls}
                    onChange={(e) =>
                      setSettings({ ...settings, rateLimitCalls: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ratePeriod">Period</Label>
                  <select
                    id="ratePeriod"
                    value={settings.rateLimitPeriod}
                    onChange={(e) =>
                      setSettings({ ...settings, rateLimitPeriod: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  >
                    <option value="minute">Per Minute</option>
                    <option value="hour">Per Hour</option>
                    <option value="day">Per Day</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
