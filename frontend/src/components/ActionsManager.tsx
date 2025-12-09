import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Plus,
  Mail,
  MessageSquare,
  Webhook,
  Calendar,
  Trash2,
  Edit,
  Play,
  Zap,
  Send,
} from "lucide-react";
import { toast } from "sonner";

interface ActionsManagerProps {
  agentId?: string;
  agentName?: string;
}

export function ActionsManager({ agentId, agentName }: ActionsManagerProps) {
  const [actions, setActions] = useState([
    {
      id: 1,
      type: "email",
      name: "Send Welcome Email",
      trigger: "after_call",
      enabled: true,
      config: {
        to: "{{customer_email}}",
        subject: "Thanks for calling!",
        template: "welcome_email",
      },
    },
    {
      id: 2,
      type: "webhook",
      name: "Update CRM",
      trigger: "call_completed",
      enabled: true,
      config: {
        url: "https://api.crm.com/leads",
        method: "POST",
      },
    },
    {
      id: 3,
      type: "sms",
      name: "Send Confirmation SMS",
      trigger: "booking_confirmed",
      enabled: false,
      config: {
        to: "{{customer_phone}}",
        message: "Your appointment is confirmed!",
      },
    },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [newAction, setNewAction] = useState({
    type: "",
    name: "",
    trigger: "after_call",
    email_to: "",
    email_subject: "",
    email_body: "",
    sms_to: "",
    sms_message: "",
    webhook_url: "",
    webhook_method: "POST",
    webhook_headers: "",
  });

  const actionTypes = [
    {
      id: "email",
      name: "Send Email",
      icon: Mail,
      description: "Send automated emails",
      color: "from-blue-500 to-indigo-500",
    },
    {
      id: "sms",
      name: "Send SMS",
      icon: MessageSquare,
      description: "Send text messages",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "webhook",
      name: "Webhook",
      icon: Webhook,
      description: "Call external APIs",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "calendar",
      name: "Calendar Booking",
      icon: Calendar,
      description: "Schedule appointments",
      color: "from-orange-500 to-red-500",
    },
  ];

  const triggers = [
    { id: "during_call", name: "During Call", desc: "Trigger while call is active" },
    { id: "after_call", name: "After Call", desc: "Trigger when call ends" },
    { id: "call_completed", name: "Call Completed", desc: "Successful completion" },
    { id: "booking_confirmed", name: "Booking Confirmed", desc: "Appointment booked" },
    { id: "lead_qualified", name: "Lead Qualified", desc: "Lead meets criteria" },
  ];

  const handleCreateAction = () => {
    if (!newAction.type || !newAction.name) {
      toast.error("Please select action type and enter a name");
      return;
    }

    const action: any = {
      id: actions.length + 1,
      type: newAction.type,
      name: newAction.name,
      trigger: newAction.trigger,
      enabled: true,
      config: {},
    };

    if (newAction.type === "email") {
      action.config = {
        to: newAction.email_to,
        subject: newAction.email_subject,
        body: newAction.email_body,
      };
    } else if (newAction.type === "sms") {
      action.config = {
        to: newAction.sms_to,
        message: newAction.sms_message,
      };
    } else if (newAction.type === "webhook") {
      action.config = {
        url: newAction.webhook_url,
        method: newAction.webhook_method,
        headers: newAction.webhook_headers,
      };
    }

    setActions([...actions, action]);
    setNewAction({
      type: "",
      name: "",
      trigger: "after_call",
      email_to: "",
      email_subject: "",
      email_body: "",
      sms_to: "",
      sms_message: "",
      webhook_url: "",
      webhook_method: "POST",
      webhook_headers: "",
    });
    setSelectedType(null);
    setShowCreate(false);
    toast.success("Action created successfully!");
  };

  const handleToggleAction = (id: number) => {
    setActions(
      actions.map((a) =>
        a.id === id ? { ...a, enabled: !a.enabled } : a
      )
    );
    const action = actions.find((a) => a.id === id);
    toast.success(`${action?.name} ${action?.enabled ? "disabled" : "enabled"}`);
  };

  const handleDeleteAction = (id: number) => {
    const action = actions.find((a) => a.id === id);
    if (confirm(`Delete action "${action?.name}"?`)) {
      setActions(actions.filter((a) => a.id !== id));
      toast.success("Action deleted");
    }
  };

  const handleTestAction = (action: any) => {
    toast.success(`Testing ${action.name}...`);
  };

  const getActionIcon = (type: string) => {
    const actionType = actionTypes.find((t) => t.id === type);
    return actionType?.icon || Zap;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">
            Actions {agentName && `- ${agentName}`}
          </h1>
          <p className="text-slate-600">
            Automate tasks during and after calls
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="size-4 mr-2" />
          Create Action
        </Button>
      </div>

      {/* Create Action */}
      {showCreate && (
        <Card className="bg-white border-blue-200 border-2">
          <CardHeader>
            <CardTitle>Create New Action</CardTitle>
            <CardDescription>
              Choose an action type and configure it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Action Type Selection */}
            {!selectedType && (
              <div>
                <Label>Action Type</Label>
                <div className="grid md:grid-cols-2 gap-3 mt-2">
                  {actionTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          setSelectedType(type.id);
                          setNewAction({ ...newAction, type: type.id });
                        }}
                        className="p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 transition-all text-left"
                      >
                        <div
                          className={`size-12 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center text-white mb-3`}
                        >
                          <Icon className="size-6" />
                        </div>
                        <p className="text-slate-900 mb-1">{type.name}</p>
                        <p className="text-slate-600 text-sm">{type.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Configuration */}
            {selectedType && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="action-name">Action Name *</Label>
                  <Input
                    id="action-name"
                    placeholder="e.g., Send Welcome Email"
                    value={newAction.name}
                    onChange={(e) =>
                      setNewAction({ ...newAction, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trigger</Label>
                  <div className="grid gap-2">
                    {triggers.map((trigger) => (
                      <button
                        key={trigger.id}
                        onClick={() =>
                          setNewAction({ ...newAction, trigger: trigger.id })
                        }
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          newAction.trigger === trigger.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <p className="text-slate-900">{trigger.name}</p>
                        <p className="text-slate-600 text-sm">{trigger.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Config */}
                {selectedType === "email" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email-to">To Email Address *</Label>
                      <Input
                        id="email-to"
                        placeholder="{{customer_email}} or email@example.com"
                        value={newAction.email_to}
                        onChange={(e) =>
                          setNewAction({ ...newAction, email_to: e.target.value })
                        }
                      />
                      <p className="text-slate-500 text-sm">
                        Use {`{{customer_email}}`} for dynamic values
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-subject">Subject *</Label>
                      <Input
                        id="email-subject"
                        placeholder="Thanks for calling!"
                        value={newAction.email_subject}
                        onChange={(e) =>
                          setNewAction({ ...newAction, email_subject: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-body">Email Body *</Label>
                      <Textarea
                        id="email-body"
                        placeholder="Hi {{customer_name}}, thank you for contacting us..."
                        rows={5}
                        value={newAction.email_body}
                        onChange={(e) =>
                          setNewAction({ ...newAction, email_body: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                {/* SMS Config */}
                {selectedType === "sms" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="sms-to">To Phone Number *</Label>
                      <Input
                        id="sms-to"
                        placeholder="{{customer_phone}} or +1234567890"
                        value={newAction.sms_to}
                        onChange={(e) =>
                          setNewAction({ ...newAction, sms_to: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sms-message">Message *</Label>
                      <Textarea
                        id="sms-message"
                        placeholder="Your appointment is confirmed for {{date}}..."
                        rows={4}
                        value={newAction.sms_message}
                        onChange={(e) =>
                          setNewAction({ ...newAction, sms_message: e.target.value })
                        }
                      />
                      <p className="text-slate-500 text-sm">160 character limit</p>
                    </div>
                  </>
                )}

                {/* Webhook Config */}
                {selectedType === "webhook" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">Webhook URL *</Label>
                      <Input
                        id="webhook-url"
                        placeholder="https://api.example.com/webhook"
                        value={newAction.webhook_url}
                        onChange={(e) =>
                          setNewAction({ ...newAction, webhook_url: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="webhook-method">HTTP Method</Label>
                      <select
                        id="webhook-method"
                        value={newAction.webhook_method}
                        onChange={(e) =>
                          setNewAction({ ...newAction, webhook_method: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="POST">POST</option>
                        <option value="GET">GET</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="webhook-headers">Headers (JSON)</Label>
                      <Textarea
                        id="webhook-headers"
                        placeholder={'{"Authorization": "Bearer token"}'}
                        rows={3}
                        value={newAction.webhook_headers}
                        onChange={(e) =>
                          setNewAction({ ...newAction, webhook_headers: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                {/* Calendar Config */}
                {selectedType === "calendar" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-900 mb-2">📅 Calendar Integration</p>
                    <p className="text-blue-700 text-sm mb-3">
                      Configure calendar settings in the Integrations panel first
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success("Opening integrations...")}
                    >
                      Go to Integrations
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateAction}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Action
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreate(false);
                      setSelectedType(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions List */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>Configured Actions</CardTitle>
          <CardDescription>
            Manage automated actions for this agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actions.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="size-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-slate-900 mb-2">No actions configured</h3>
              <p className="text-slate-600 mb-6">
                Create actions to automate tasks during and after calls
              </p>
              <Button
                onClick={() => setShowCreate(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="size-4 mr-2" />
                Create First Action
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((action) => {
                const Icon = getActionIcon(action.type);
                const actionType = actionTypes.find((t) => t.id === action.type);
                return (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`size-12 rounded-lg bg-gradient-to-br ${
                          actionType?.color || "from-gray-500 to-gray-600"
                        } flex items-center justify-center text-white`}
                      >
                        <Icon className="size-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-slate-900">{action.name}</p>
                          <Badge variant="outline" className="capitalize">
                            {action.type}
                          </Badge>
                          <Badge
                            variant={action.enabled ? "default" : "secondary"}
                            className={action.enabled ? "bg-green-500" : ""}
                          >
                            {action.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <p className="text-slate-600 text-sm">
                          Trigger: {triggers.find((t) => t.id === action.trigger)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestAction(action)}
                      >
                        <Play className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAction(action.id)}
                      >
                        {action.enabled ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success("Opening editor...")}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAction(action.id)}
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
