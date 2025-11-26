import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Code, Copy, Key, BookOpen, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState("agents");

  const endpoints = [
    {
      id: "agents",
      method: "GET",
      path: "/v1/agents",
      description: "List all agents",
      color: "bg-green-500",
    },
    {
      id: "create-agent",
      method: "POST",
      path: "/v1/agents",
      description: "Create new agent",
      color: "bg-blue-500",
    },
    {
      id: "calls",
      method: "GET",
      path: "/v1/calls",
      description: "List call logs",
      color: "bg-green-500",
    },
    {
      id: "start-call",
      method: "POST",
      path: "/v1/calls/start",
      description: "Start outbound call",
      color: "bg-blue-500",
    },
  ];

  const codeExamples = {
    agents: {
      curl: `curl -X GET https://api.voiceai.app/v1/agents \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      javascript: `const response = await fetch('https://api.voiceai.app/v1/agents', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const agents = await response.json();`,
      python: `import requests

response = requests.get(
    'https://api.voiceai.app/v1/agents',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
agents = response.json()`,
    },
    "create-agent": {
      curl: `curl -X POST https://api.voiceai.app/v1/agents \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Sales Agent",
    "voice": "nova",
    "language": "en-US"
  }'`,
      javascript: `const response = await fetch('https://api.voiceai.app/v1/agents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Sales Agent',
    voice: 'nova',
    language: 'en-US'
  })
});`,
      python: `import requests

response = requests.post(
    'https://api.voiceai.app/v1/agents',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'name': 'Sales Agent',
        'voice': 'nova',
        'language': 'en-US'
    }
)`,
    },
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-2">API Documentation</h1>
        <p className="text-slate-600">Build custom integrations with the VoiceAI API</p>
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5 text-blue-600" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm shrink-0">
                1
              </div>
              <div>
                <p className="text-slate-900 mb-1">Get your API key</p>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                  <code className="flex-1 text-slate-600 text-sm">
                    sk_live_••••••••••••••••••••1234
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success("API key copied")}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm shrink-0">
                2
              </div>
              <div className="flex-1">
                <p className="text-slate-900 mb-1">Make your first request</p>
                <div className="bg-slate-900 rounded-lg p-4">
                  <code className="text-green-400 text-sm">
                    curl -X GET https://api.voiceai.app/v1/agents \<br />
                    &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY"
                  </code>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm shrink-0">
                <CheckCircle2 className="size-4" />
              </div>
              <div>
                <p className="text-slate-900">Start building!</p>
                <p className="text-slate-600 text-sm">
                  Check out the endpoints below for more examples
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="p-3 bg-blue-100 rounded-lg w-fit mb-3">
              <Key className="size-5 text-blue-600" />
            </div>
            <h3 className="text-slate-900 mb-2">Authentication</h3>
            <p className="text-slate-600 text-sm">
              Use Bearer token authentication with your API key in the header
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="p-3 bg-purple-100 rounded-lg w-fit mb-3">
              <Code className="size-5 text-purple-600" />
            </div>
            <h3 className="text-slate-900 mb-2">Base URL</h3>
            <code className="text-purple-600 text-sm">https://api.voiceai.app/v1</code>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="p-3 bg-green-100 rounded-lg w-fit mb-3">
              <BookOpen className="size-5 text-green-600" />
            </div>
            <h3 className="text-slate-900 mb-2">Response Format</h3>
            <p className="text-slate-600 text-sm">All responses are in JSON format</p>
          </CardContent>
        </Card>
      </div>

      {/* Endpoints */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b">
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>Available REST API endpoints</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Endpoint List */}
            <div className="lg:col-span-1 space-y-2">
              {endpoints.map((endpoint) => (
                <button
                  key={endpoint.id}
                  onClick={() => setSelectedEndpoint(endpoint.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedEndpoint === endpoint.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={endpoint.color}>{endpoint.method}</Badge>
                  </div>
                  <code className="text-slate-900 text-sm">{endpoint.path}</code>
                  <p className="text-slate-600 text-sm mt-1">{endpoint.description}</p>
                </button>
              ))}
            </div>

            {/* Code Examples */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-slate-900 mb-3">Code Examples</h3>
                <div className="space-y-3">
                  {["curl", "javascript", "python"].map((lang) => (
                    <div key={lang}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="capitalize">
                          {lang}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyCode(
                              codeExamples[selectedEndpoint as keyof typeof codeExamples]?.[
                                lang as keyof typeof codeExamples.agents
                              ] || ""
                            )
                          }
                        >
                          <Copy className="size-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-green-400 text-sm">
                          <code>
                            {codeExamples[selectedEndpoint as keyof typeof codeExamples]?.[
                              lang as keyof typeof codeExamples.agents
                            ]}
                          </code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SDKs */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b">
          <CardTitle>Official SDKs</CardTitle>
          <CardDescription>Use our official libraries for faster development</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Node.js", install: "npm install voiceai", badge: "Latest v2.1.0" },
              { name: "Python", install: "pip install voiceai", badge: "Latest v2.1.0" },
              { name: "Ruby", install: "gem install voiceai", badge: "Latest v2.1.0" },
            ].map((sdk) => (
              <div key={sdk.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-slate-900">{sdk.name}</h4>
                  <Badge variant="outline">{sdk.badge}</Badge>
                </div>
                <div className="bg-slate-900 rounded p-3 mb-3">
                  <code className="text-green-400 text-sm">{sdk.install}</code>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View Docs
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-orange-900 mb-2">Standard Limits</p>
              <ul className="space-y-2 text-orange-700">
                <li>• 100 requests per minute</li>
                <li>• 5,000 requests per hour</li>
                <li>• 100,000 requests per day</li>
              </ul>
            </div>
            <div>
              <p className="text-orange-900 mb-2">Enterprise Limits</p>
              <ul className="space-y-2 text-orange-700">
                <li>• Custom rate limits</li>
                <li>• Dedicated infrastructure</li>
                <li>• Contact us for details</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
