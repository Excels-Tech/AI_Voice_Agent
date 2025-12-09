import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Calendar, 
  Video, 
  FileText, 
  MessageSquare, 
  Mail, 
  Key, 
  Database, 
  Bell,
  CheckSquare
} from "lucide-react";

export function IntegrationMap() {
  const integrations = [
    {
      function: "Calendar Sync",
      icon: Calendar,
      integration: "Google Calendar API",
      description: "Fetch meeting schedules, attendees, and agenda",
      status: "required",
      color: "from-blue-500 to-cyan-500",
    },
    {
      function: "Meeting Capture",
      icon: Video,
      integration: "Zoom / Google Meet SDK",
      description: "Join meetings, capture audio/video streams",
      status: "required",
      color: "from-purple-500 to-pink-500",
    },
    {
      function: "Task Management",
      icon: CheckSquare,
      integration: "Jira / Linear REST API",
      description: "Create stories, epics, and action items automatically",
      status: "required",
      color: "from-orange-500 to-red-500",
    },
    {
      function: "Documentation",
      icon: FileText,
      integration: "Notion / Confluence API",
      description: "Store meeting notes, summaries, and knowledge base",
      status: "required",
      color: "from-green-500 to-emerald-500",
    },
    {
      function: "Email",
      icon: Mail,
      integration: "Gmail API",
      description: "Draft and send follow-up emails with summaries",
      status: "required",
      color: "from-indigo-500 to-purple-500",
    },
    {
      function: "Authentication",
      icon: Key,
      integration: "Google OAuth / Microsoft SSO",
      description: "Secure user authentication and authorization",
      status: "required",
      color: "from-red-500 to-pink-500",
    },
    {
      function: "File Storage",
      icon: Database,
      integration: "AWS S3 / Google Drive",
      description: "Store audio recordings and generated reports",
      status: "required",
      color: "from-teal-500 to-cyan-500",
    },
    {
      function: "Notifications",
      icon: Bell,
      integration: "Slack Webhooks",
      description: "Real-time alerts for tasks and meeting summaries",
      status: "optional",
      color: "from-yellow-500 to-orange-500",
    },
    {
      function: "Team Chat",
      icon: MessageSquare,
      integration: "Microsoft Teams API",
      description: "Post summaries and updates to team channels",
      status: "optional",
      color: "from-violet-500 to-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle>Integration & API Ecosystem</CardTitle>
          <CardDescription>
            External services and APIs that power the AI Meeting Voice Agent
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.function} className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${integration.color}`}>
                  <integration.icon className="size-6 text-white" />
                </div>
                <Badge variant={integration.status === "required" ? "default" : "outline"}>
                  {integration.status}
                </Badge>
              </div>

              <h3 className="text-slate-900 mb-2">{integration.function}</h3>
              <p className="text-slate-600 mb-3">{integration.description}</p>
              
              <div className="pt-3 border-t border-slate-200">
                <p className="text-slate-700">
                  {integration.integration}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-slate-900 mb-4">API Authentication Flow</h3>
            <ol className="space-y-3">
              {[
                "User initiates OAuth flow with service provider",
                "Receive authorization code and exchange for access token",
                "Store encrypted tokens in secure database",
                "Refresh tokens automatically before expiration",
                "Handle token revocation and re-authentication",
              ].map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="shrink-0 flex items-center justify-center size-6 rounded-full bg-blue-500 text-white">
                    {index + 1}
                  </div>
                  <span className="text-slate-700">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="text-slate-900 mb-4">Integration Best Practices</h3>
            <ul className="space-y-2">
              {[
                "Rate limit handling with exponential backoff",
                "Webhook signature verification for security",
                "Idempotency keys for duplicate prevention",
                "Comprehensive error logging and monitoring",
                "Graceful degradation when services are down",
                "Regular health checks for all integrations",
              ].map((practice) => (
                <li key={practice} className="flex items-start gap-2 text-slate-700">
                  <div className="size-2 bg-green-500 rounded-full mt-2 shrink-0" />
                  <span>{practice}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
