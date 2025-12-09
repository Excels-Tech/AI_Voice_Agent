import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Code, Copy, Key, BookOpen, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "../utils/clipboard";

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

  const codeExamples: Record<string, Record<string, string>> = {
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
    calls: {
      curl: `curl -X GET https://api.voiceai.app/v1/calls \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      javascript: `const response = await fetch('https://api.voiceai.app/v1/calls', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const calls = await response.json();`,
      python: `import requests

response = requests.get(
    'https://api.voiceai.app/v1/calls',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
calls = response.json()`,
    },
    "start-call": {
      curl: `curl -X POST https://api.voiceai.app/v1/calls/start \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "agent_123",
    "phone_number": "+1234567890",
    "variables": {
      "customer_name": "John Doe"
    }
  }'`,
      javascript: `const response = await fetch('https://api.voiceai.app/v1/calls/start', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agent_id: 'agent_123',
    phone_number: '+1234567890',
    variables: {
      customer_name: 'John Doe'
    }
  })
});`,
      python: `import requests

response = requests.post(
    'https://api.voiceai.app/v1/calls/start',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'agent_id': 'agent_123',
        'phone_number': '+1234567890',
        'variables': {
            'customer_name': 'John Doe'
        }
    }
)`,
    },
  };

  const copyCode = (code: string) => {
    copyToClipboard(code);
    toast.success("Code copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white mb-2">API Documentation</h1>
        <p className="text-slate-400">Build custom integrations with the VoiceAI API</p>
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="size-5 text-blue-400" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm shrink-0 shadow-lg shadow-blue-600/30">
                1
              </div>
              <div>
                <p className="text-white mb-1">Get your API key</p>
                <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <code className="flex-1 text-slate-400 text-sm">
                    sk_live_••••••••••••••••••••1234
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success("API key copied")}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm shrink-0 shadow-lg shadow-blue-600/30">
                2
              </div>
              <div className="flex-1">
                <p className="text-white mb-1">Make your first request</p>
                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                  <code className="text-green-400 text-sm">
                    curl -X GET https://api.voiceai.app/v1/agents \<br />
                    &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY"
                  </code>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm shrink-0 shadow-lg shadow-green-600/30">
                <CheckCircle2 className="size-4" />
              </div>
              <div>
                <p className="text-white">Start building!</p>
                <p className="text-slate-400 text-sm">
                  Check out the endpoints below for more examples
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg w-fit mb-3">
              <Key className="size-5 text-blue-400" />
            </div>
            <h3 className="text-white mb-2">Authentication</h3>
            <p className="text-slate-400 text-sm">
              Use Bearer token authentication with your API key in the header
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg w-fit mb-3">
              <Code className="size-5 text-purple-400" />
            </div>
            <h3 className="text-white mb-2">Base URL</h3>
            <code className="text-purple-400 text-sm">https://api.voiceai.app/v1</code>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg w-fit mb-3">
              <BookOpen className="size-5 text-green-400" />
            </div>
            <h3 className="text-white mb-2">Response Format</h3>
            <p className="text-slate-400 text-sm">All responses are in JSON format</p>
          </CardContent>
        </Card>
      </div>

      {/* Endpoints */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white">API Endpoints</CardTitle>
          <CardDescription className="text-slate-400">Available REST API endpoints</CardDescription>
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
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-800 hover:border-slate-700 bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={endpoint.color}>{endpoint.method}</Badge>
                  </div>
                  <code className="text-white text-sm">{endpoint.path}</code>
                  <p className="text-slate-400 text-sm mt-1">{endpoint.description}</p>
                </button>
              ))}
            </div>

            {/* Code Examples */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-white mb-3">Code Examples</h3>
                <div className="space-y-3">
                  {["curl", "javascript", "python"].map((lang) => (
                    <div key={lang}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="capitalize border-slate-700 text-slate-300">
                          {lang}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyCode(codeExamples[selectedEndpoint]?.[lang] || "")
                          }
                          className="hover:bg-slate-800 text-slate-300 hover:text-white"
                        >
                          <Copy className="size-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto border border-slate-800">
                        <pre className="text-green-400 text-sm">
                          <code>
                            {codeExamples[selectedEndpoint]?.[lang] || "No example available"}
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
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white">Official SDKs</CardTitle>
          <CardDescription className="text-slate-400">Use our official libraries for faster development</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Node.js", install: "npm install voiceai", badge: "Latest v2.1.0" },
              { name: "Python", install: "pip install voiceai", badge: "Latest v2.1.0" },
              { name: "Ruby", install: "gem install voiceai", badge: "Latest v2.1.0" },
            ].map((sdk) => (
              <div key={sdk.name} className="p-4 border border-slate-800 rounded-lg bg-slate-800/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white">{sdk.name}</h4>
                  <Badge variant="outline" className="border-slate-700 text-slate-300">{sdk.badge}</Badge>
                </div>
                <div className="bg-slate-950 rounded p-3 mb-3 border border-slate-800">
                  <code className="text-green-400 text-sm">{sdk.install}</code>
                </div>
                <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                  View Docs
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-white">Rate Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-orange-400 mb-2">Standard Limits</p>
              <ul className="space-y-2 text-slate-300">
                <li>• 100 requests per minute</li>
                <li>• 5,000 requests per hour</li>
                <li>• 100,000 requests per day</li>
              </ul>
            </div>
            <div>
              <p className="text-orange-400 mb-2">Enterprise Limits</p>
              <ul className="space-y-2 text-slate-300">
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
