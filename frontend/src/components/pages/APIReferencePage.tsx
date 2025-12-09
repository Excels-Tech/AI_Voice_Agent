import { ArrowLeft, Copy, Check, Code, Search, Key, Lock, Eye, EyeOff, RefreshCw, Play, Zap, BookOpen, Terminal, Globe, Shield, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { toast } from "sonner@2.0.3";
import { useState } from "react";
import { copyToClipboard } from "../../utils/clipboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function APIReferencePage({ onBack }: { onBack: () => void }) {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>("create-agent");
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [apiVersion, setApiVersion] = useState("v1.0.0");

  // Simulated user API keys
  const userApiKeys = {
    production: "LIVE_API_KEY_EXAMPLE",
    development: "TEST_API_KEY_EXAMPLE",
  };

  const [selectedApiKey, setSelectedApiKey] = useState<"production" | "development">("production");

  const handleCopy = async (code: string, id: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(id);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      toast.error("Failed to copy code");
    }
  };

  const handleRegenerateKey = () => {
    toast.success("API key regenerated successfully!");
  };

  const handleTestEndpoint = () => {
    setTestResponse({
      success: true,
      data: {
        id: "agent_abc123",
        name: "Sales Agent",
        status: "active",
        created_at: new Date().toISOString(),
      },
    });
    toast.success("Request sent successfully!");
  };

  const endpoints = [
    {
      id: "create-agent",
      method: "POST",
      path: "/api/v1/agents",
      title: "Create Agent",
      description: "Create a new AI voice agent with custom configuration",
      color: "emerald",
      category: "Agents",
      parameters: [
        { name: "name", type: "string", required: true, description: "Agent name" },
        { name: "voice", type: "string", required: true, description: "Voice ID" },
        { name: "language", type: "string", required: true, description: "Language code" },
        { name: "prompt", type: "string", required: true, description: "System prompt" },
      ],
    },
    {
      id: "list-agents",
      method: "GET",
      path: "/api/v1/agents",
      title: "List Agents",
      description: "Retrieve all your AI voice agents",
      color: "blue",
      category: "Agents",
      parameters: [
        { name: "page", type: "number", required: false, description: "Page number" },
        { name: "limit", type: "number", required: false, description: "Results per page" },
      ],
    },
    {
      id: "get-agent",
      method: "GET",
      path: "/api/v1/agents/{id}",
      title: "Get Agent",
      description: "Get details of a specific agent",
      color: "blue",
      category: "Agents",
      parameters: [
        { name: "id", type: "string", required: true, description: "Agent ID" },
      ],
    },
    {
      id: "update-agent",
      method: "PATCH",
      path: "/api/v1/agents/{id}",
      title: "Update Agent",
      description: "Update agent configuration",
      color: "orange",
      category: "Agents",
      parameters: [
        { name: "id", type: "string", required: true, description: "Agent ID" },
        { name: "name", type: "string", required: false, description: "Agent name" },
        { name: "voice", type: "string", required: false, description: "Voice ID" },
      ],
    },
    {
      id: "delete-agent",
      method: "DELETE",
      path: "/api/v1/agents/{id}",
      title: "Delete Agent",
      description: "Permanently delete an agent",
      color: "red",
      category: "Agents",
      parameters: [
        { name: "id", type: "string", required: true, description: "Agent ID" },
      ],
    },
    {
      id: "make-call",
      method: "POST",
      path: "/api/v1/calls",
      title: "Make Outbound Call",
      description: "Initiate an outbound call with an agent",
      color: "emerald",
      category: "Calls",
      parameters: [
        { name: "agent_id", type: "string", required: true, description: "Agent ID" },
        { name: "to", type: "string", required: true, description: "Phone number" },
        { name: "from", type: "string", required: false, description: "Caller ID" },
      ],
    },
    {
      id: "get-call",
      method: "GET",
      path: "/api/v1/calls/{id}",
      title: "Get Call Details",
      description: "Get call details and transcription",
      color: "blue",
      category: "Calls",
      parameters: [
        { name: "id", type: "string", required: true, description: "Call ID" },
      ],
    },
    {
      id: "list-calls",
      method: "GET",
      path: "/api/v1/calls",
      title: "List Calls",
      description: "Retrieve all call logs",
      color: "blue",
      category: "Calls",
      parameters: [
        { name: "agent_id", type: "string", required: false, description: "Filter by agent" },
        { name: "status", type: "string", required: false, description: "Call status" },
      ],
    },
  ];

  const getCodeExample = (endpointId: string, language: string) => {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (!endpoint) return "";

    const apiKey = userApiKeys[selectedApiKey];

    switch (language) {
      case "javascript":
        if (endpoint.method === "POST") {
          return `const response = await fetch('https://api.voiceai.com${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Sales Agent",
    voice: "en-US-Neural2-A",
    language: "en-US",
    prompt: "You are a helpful sales assistant..."
  })
});

const data = await response.json();
console.log(data);`;
        } else {
          return `const response = await fetch('https://api.voiceai.com${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer ${apiKey}'
  }
});

const data = await response.json();
console.log(data);`;
        }

      case "python":
        if (endpoint.method === "POST") {
          return `import requests

response = requests.post(
  'https://api.voiceai.com${endpoint.path}',
  headers={
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  json={
    'name': 'Sales Agent',
    'voice': 'en-US-Neural2-A',
    'language': 'en-US',
    'prompt': 'You are a helpful sales assistant...'
  }
)

data = response.json()
print(data)`;
        } else {
          return `import requests

response = requests.${endpoint.method.toLowerCase()}(
  'https://api.voiceai.com${endpoint.path}',
  headers={'Authorization': 'Bearer ${apiKey}'}
)

data = response.json()
print(data)`;
        }

      case "curl":
        if (endpoint.method === "POST") {
          return `curl -X ${endpoint.method} https://api.voiceai.com${endpoint.path} \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Sales Agent",
    "voice": "en-US-Neural2-A",
    "language": "en-US",
    "prompt": "You are a helpful sales assistant..."
  }'`;
        } else {
          return `curl -X ${endpoint.method} https://api.voiceai.com${endpoint.path} \\
  -H "Authorization: Bearer ${apiKey}"`;
        }

      case "php":
        return `<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.voiceai.com${endpoint.path}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer ${apiKey}",
    "Content-Type: application/json"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);

$data = json_decode($response);
print_r($data);
?>`;

      default:
        return "";
    }
  };

  const filteredEndpoints = endpoints.filter(endpoint =>
    endpoint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(endpoints.map(e => e.category)));

  const selectedEndpointData = endpoints.find(e => e.id === selectedEndpoint);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-3">
              <Badge className={`${isAuthenticated ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                <Shield className="size-3 mr-1" />
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </Badge>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                {apiVersion}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b border-slate-800 bg-slate-950/50">
        <div className="px-6 py-6">
          <div className="max-w-3xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
            <Input
              placeholder="Search endpoints, methods, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="border-b border-slate-800 bg-slate-950/30">
        <div className="px-6 py-6">
          <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/20 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                    <Key className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white">Your API Keys</h3>
                    <p className="text-slate-400 text-sm">Manage your authentication credentials</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateKey}
                  className="border-cyan-500/50 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 hover:from-cyan-500/20 hover:to-purple-500/20 hover:text-cyan-300 hover:border-cyan-400"
                >
                  <RefreshCw className="size-4 mr-2" />
                  Regenerate
                </Button>
              </div>
              
              <Tabs value={selectedApiKey} onValueChange={(v) => setSelectedApiKey(v as any)}>
                <TabsList className="bg-slate-950 border border-slate-800 mb-4">
                  <TabsTrigger 
                    value="production" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=inactive]:text-slate-400"
                  >
                    <Lock className="size-4 mr-2" />
                    Production
                  </TabsTrigger>
                  <TabsTrigger 
                    value="development" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-400"
                  >
                    <Code className="size-4 mr-2" />
                    Development
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={selectedApiKey}>
                  <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-lg p-4">
                    <code className="flex-1 text-cyan-400 font-mono text-sm">
                      {showApiKey ? userApiKeys[selectedApiKey] : userApiKeys[selectedApiKey].replace(/./g, "•")}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-slate-400 hover:text-white"
                    >
                      {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(userApiKeys[selectedApiKey], "api-key")}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedCode === "api-key" ? (
                        <Check className="size-4 text-emerald-400" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                  {selectedApiKey === "production" && (
                    <div className="flex items-start gap-2 mt-3 text-sm text-orange-400">
                      <Lock className="size-4 mt-0.5 shrink-0" />
                      <p>Keep your production key secure. Never expose it in client-side code.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Endpoints List */}
        <div className="w-80 border-r border-slate-800 bg-slate-950/50 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400">
              <ChevronRight className="size-5" />
              <h2 className="text-white">Endpoints</h2>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {categories.map((category) => (
              <div key={category} className="mb-6">
                <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-3 px-2">{category}</h3>
                <div className="space-y-1">
                  {filteredEndpoints
                    .filter(e => e.category === category)
                    .map((endpoint) => (
                      <button
                        key={endpoint.id}
                        onClick={() => {
                          setSelectedEndpoint(endpoint.id);
                          setTestResponse(null);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          selectedEndpoint === endpoint.id
                            ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50"
                            : "bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={`text-xs ${
                              endpoint.color === "emerald"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                : endpoint.color === "blue"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                                : endpoint.color === "orange"
                                ? "bg-orange-500/20 text-orange-400 border-orange-500/50"
                                : "bg-red-500/20 text-red-400 border-red-500/50"
                            }`}
                          >
                            {endpoint.method}
                          </Badge>
                          <span className="text-white text-sm truncate">{endpoint.title}</span>
                        </div>
                        <code className="text-xs text-slate-400 block truncate">{endpoint.path}</code>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Endpoint Details */}
        <div className="flex-1 overflow-y-auto">
          {selectedEndpointData ? (
            <div className="p-6 space-y-6">
              {/* Endpoint Header */}
              <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/20 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          className={`${
                            selectedEndpointData.color === "emerald"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                              : selectedEndpointData.color === "blue"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                              : selectedEndpointData.color === "orange"
                              ? "bg-orange-500/20 text-orange-400 border-orange-500/50"
                              : "bg-red-500/20 text-red-400 border-red-500/50"
                          }`}
                        >
                          {selectedEndpointData.method}
                        </Badge>
                        <h2 className="text-white text-2xl">{selectedEndpointData.title}</h2>
                      </div>
                      <p className="text-slate-400">{selectedEndpointData.description}</p>
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                    <code className="text-cyan-400 font-mono">
                      https://api.voiceai.com{selectedEndpointData.path}
                    </code>
                  </div>
                </CardContent>
              </Card>

              {/* Parameters */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedEndpointData.parameters.map((param, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-3 bg-slate-800/50 border border-slate-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-cyan-400 font-mono text-sm">{param.name}</code>
                            <Badge
                              variant="outline"
                              className={
                                param.required
                                  ? "bg-red-500/20 text-red-400 border-red-500/50 text-xs"
                                  : "bg-slate-500/20 text-slate-400 border-slate-500/50 text-xs"
                              }
                            >
                              {param.required ? "Required" : "Optional"}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">
                              {param.type}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm">{param.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Code Examples */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Code Examples</CardTitle>
                    <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <TabsList className="bg-slate-800 border-slate-700">
                        <TabsTrigger value="javascript" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                          JavaScript
                        </TabsTrigger>
                        <TabsTrigger value="python" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                          Python
                        </TabsTrigger>
                        <TabsTrigger value="curl" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                          cURL
                        </TabsTrigger>
                        <TabsTrigger value="php" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                          PHP
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(getCodeExample(selectedEndpoint!, selectedLanguage), `code-${selectedEndpoint}`)}
                      className="absolute top-3 right-3 bg-slate-800 hover:bg-slate-700 text-white z-10"
                    >
                      {copiedCode === `code-${selectedEndpoint}` ? (
                        <Check className="size-4 text-emerald-400" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                    <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm text-slate-300 whitespace-pre">
                        {getCodeExample(selectedEndpoint!, selectedLanguage)}
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* API Playground */}
              <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/20 border-slate-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Play className="size-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">API Playground</CardTitle>
                      <p className="text-slate-400 text-sm">Test this endpoint directly</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleTestEndpoint}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Play className="size-4 mr-2" />
                    Send Test Request
                  </Button>
                  {testResponse && (
                    <div className="bg-slate-950 border border-emerald-500/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="size-2 rounded-full bg-emerald-400" />
                        <span className="text-emerald-400 text-sm">200 OK</span>
                      </div>
                      <pre className="text-sm text-slate-300 overflow-x-auto">
                        {JSON.stringify(testResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SDKs & Resources */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* SDKs */}
                <Card className="bg-gradient-to-br from-slate-900 to-cyan-900/20 border-slate-800">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                        <Code className="size-5 text-white" />
                      </div>
                      <CardTitle className="text-white">Official SDKs</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { name: "JavaScript SDK", cmd: "npm install voiceai-sdk" },
                      { name: "Python SDK", cmd: "pip install voiceai" },
                      { name: "Ruby SDK", cmd: "gem install voiceai" },
                      { name: "PHP SDK", cmd: "composer require voiceai/sdk" },
                    ].map((sdk) => (
                      <button
                        key={sdk.name}
                        onClick={() => handleCopy(sdk.cmd, `sdk-${sdk.name}`)}
                        className="w-full text-left p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500/50 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm group-hover:text-cyan-400 transition-colors">{sdk.name}</div>
                            <code className="text-xs text-slate-500">{sdk.cmd}</code>
                          </div>
                          {copiedCode === `sdk-${sdk.name}` ? (
                            <Check className="size-4 text-emerald-400" />
                          ) : (
                            <Copy className="size-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                          )}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Resources */}
                <Card className="bg-gradient-to-br from-slate-900 to-purple-900/20 border-slate-800">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <BookOpen className="size-5 text-white" />
                      </div>
                      <CardTitle className="text-white">Resources</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={() => {
                        toast.success("Opening documentation...");
                        window.open("https://docs.voiceai.com", "_blank");
                      }}
                    >
                      <BookOpen className="size-4 mr-2" />
                      Documentation
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={() => {
                        toast.success("Checking API status...");
                        setTimeout(() => {
                          toast.success("All systems operational! ✓", {
                            description: "API response time: 45ms"
                          });
                        }, 1000);
                      }}
                    >
                      <Terminal className="size-4 mr-2" />
                      API Status
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={() => {
                        toast.success("Opening GitHub examples...");
                        window.open("https://github.com/voiceai/examples", "_blank");
                      }}
                    >
                      <Code className="size-4 mr-2" />
                      GitHub Examples
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={() => {
                        toast.info("Rate Limits", {
                          description: "60/min • 1000/hr • 10 concurrent"
                        });
                      }}
                    >
                      <Zap className="size-4 mr-2" />
                      Rate Limits
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Terminal className="size-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400">Select an endpoint to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
