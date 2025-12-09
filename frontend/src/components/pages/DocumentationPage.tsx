import { ArrowLeft, Zap, Code, BookOpen, Package, Video, FileCode, ChevronRight, ArrowRight, Search, X, Send, Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner@2.0.3";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { copyToClipboard } from "../../utils/clipboard";

interface DocSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  items: DocItem[];
  color: string;
  gradient: string;
}

interface DocItem {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
  language?: string;
}

const documentationContent: Record<string, DocItem[]> = {
  "quick-start": [
    {
      id: "installation",
      title: "Installation",
      content: "Get started with our platform in just a few simple steps. First, create your account and obtain your API credentials from the dashboard. Then install our SDK using your preferred package manager.",
      codeExample: `npm install voiceai-sdk\n# or\nyarn add voiceai-sdk\n# or\npnpm add voiceai-sdk`,
      language: "bash"
    },
    {
      id: "your-first-agent",
      title: "Your First Agent",
      content: "Creating your first AI voice agent is simple. Initialize the SDK with your API key, configure your agent's personality and voice, then deploy it to start handling calls.",
      codeExample: `import VoiceAI from 'voiceai-sdk';\n\nconst client = new VoiceAI({\n  apiKey: 'your_api_key_here'\n});\n\nconst agent = await client.agents.create({\n  name: 'Sales Assistant',\n  voice: 'en-US-Neural2-A',\n  language: 'en-US',\n  prompt: 'You are a helpful sales assistant...'\n});\n\nconsole.log('Agent created:', agent.id);`,
      language: "javascript"
    },
    {
      id: "making-calls",
      title: "Making Calls",
      content: "Once your agent is created, you can initiate outbound calls or receive inbound calls. Configure your phone numbers, set up call routing, and start engaging with customers.",
      codeExample: `const call = await client.calls.create({\n  agent_id: agent.id,\n  to: '+1234567890',\n  from: '+0987654321'\n});\n\nconsole.log('Call initiated:', call.status);`,
      language: "javascript"
    },
    {
      id: "webhooks",
      title: "Webhooks",
      content: "Set up webhooks to receive real-time notifications about call events, transcriptions, and agent interactions. Configure your webhook endpoints in the dashboard.",
      codeExample: `// Webhook endpoint example\napp.post('/webhooks/voiceai', (req, res) => {\n  const event = req.body;\n  \n  switch(event.type) {\n    case 'call.started':\n      console.log('Call started:', event.data);\n      break;\n    case 'call.completed':\n      console.log('Call completed:', event.data);\n      break;\n    case 'transcription.ready':\n      console.log('Transcription:', event.data);\n      break;\n  }\n  \n  res.sendStatus(200);\n});`,
      language: "javascript"
    }
  ],
  "api-reference": [
    {
      id: "authentication",
      title: "Authentication",
      content: "All API requests require authentication using your API key. Include your key in the Authorization header using Bearer token authentication. Keep your API keys secure and never expose them in client-side code.",
      codeExample: `curl https://api.voiceai.com/v1/agents \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json"`,
      language: "bash"
    },
    {
      id: "agents-api",
      title: "Agents API",
      content: "The Agents API allows you to create, update, list, and delete AI voice agents. Each agent has a unique configuration including voice, language, and behavioral prompts.",
      codeExample: `// Create an agent\nPOST /api/v1/agents\n{\n  "name": "Customer Support",\n  "voice": "en-US-Neural2-C",\n  "language": "en-US",\n  "prompt": "You are a helpful customer support agent...",\n  "temperature": 0.7\n}\n\n// Get agent details\nGET /api/v1/agents/{agent_id}\n\n// Update an agent\nPATCH /api/v1/agents/{agent_id}\n{\n  "name": "Updated Name",\n  "voice": "en-GB-Neural2-B"\n}\n\n// Delete an agent\nDELETE /api/v1/agents/{agent_id}`,
      language: "javascript"
    },
    {
      id: "calls-api",
      title: "Calls API",
      content: "The Calls API enables you to initiate outbound calls, retrieve call details, access transcriptions, and manage call recordings. Monitor call status in real-time.",
      codeExample: `// Make an outbound call\nPOST /api/v1/calls\n{\n  "agent_id": "agent_abc123",\n  "to": "+1234567890",\n  "from": "+0987654321"\n}\n\n// Get call details\nGET /api/v1/calls/{call_id}\n\n// List all calls\nGET /api/v1/calls?agent_id=agent_abc123&status=completed`,
      language: "javascript"
    },
    {
      id: "analytics-api",
      title: "Analytics API",
      content: "Access comprehensive analytics data including call metrics, agent performance, sentiment analysis, and conversation insights. Use this data to optimize your voice agents.",
      codeExample: `// Get analytics summary\nGET /api/v1/analytics/summary?start_date=2024-01-01&end_date=2024-01-31\n\n// Get agent performance\nGET /api/v1/analytics/agents/{agent_id}/performance\n\n// Get sentiment analysis\nGET /api/v1/analytics/calls/{call_id}/sentiment`,
      language: "javascript"
    }
  ],
  "guides": [
    {
      id: "building-conversations",
      title: "Building Conversations",
      content: "Design natural, engaging conversations by crafting effective prompts, managing conversation flow, and implementing conditional logic. Learn how to handle user intents and create dynamic responses.",
      codeExample: `const conversationPrompt = \`You are a helpful sales assistant for Acme Corp.\n\nYour goals:\n1. Greet the customer warmly\n2. Understand their needs\n3. Recommend appropriate products\n4. Handle objections professionally\n5. Close the sale or schedule a follow-up\n\nImportant guidelines:\n- Be friendly and professional\n- Listen actively to customer concerns\n- Provide specific product recommendations\n- Never make promises you can't keep\n- If unsure, offer to transfer to a human agent\`;\n\nconst agent = await client.agents.create({\n  name: 'Sales Agent',\n  voice: 'en-US-Neural2-A',\n  language: 'en-US',\n  prompt: conversationPrompt,\n  temperature: 0.7,\n  max_duration: 300\n});`,
      language: "javascript"
    },
    {
      id: "voice-customization",
      title: "Voice Customization",
      content: "Choose from 400+ premium voices across 40+ languages. Customize speaking rate, pitch, and tone to match your brand personality. Test different voices to find the perfect fit.",
      codeExample: `const agent = await client.agents.create({\n  name: 'Brand Voice Agent',\n  voice: 'en-US-Neural2-A',\n  language: 'en-US',\n  voice_settings: {\n    speaking_rate: 1.0,  // 0.5 to 2.0\n    pitch: 0,           // -20 to 20\n    volume_gain_db: 0   // -96 to 16\n  },\n  prompt: 'Your prompt here...'\n});\n\n// Available voice options:\n// en-US-Neural2-A (Female, Warm)\n// en-US-Neural2-C (Female, Professional)\n// en-US-Neural2-D (Male, Deep)\n// en-GB-Neural2-B (Male, British)\n// And 400+ more...`,
      language: "javascript"
    },
    {
      id: "integrations",
      title: "Integrations",
      content: "Connect your voice agents with popular CRMs, calendars, and business tools. Sync customer data, schedule appointments, and trigger workflows automatically.",
      codeExample: `// Salesforce Integration\nconst agent = await client.agents.create({\n  name: 'CRM Agent',\n  voice: 'en-US-Neural2-A',\n  language: 'en-US',\n  prompt: 'You are a CRM assistant...',\n  integrations: {\n    salesforce: {\n      enabled: true,\n      auto_create_leads: true,\n      auto_log_calls: true\n    },\n    calendar: {\n      enabled: true,\n      provider: 'google',\n      auto_schedule: true\n    }\n  }\n});`,
      language: "javascript"
    },
    {
      id: "best-practices",
      title: "Best Practices",
      content: "Follow these best practices to build high-performing voice agents: Keep prompts clear and concise, test thoroughly before deployment, monitor performance metrics, implement fallback options, and continuously optimize based on analytics.",
      codeExample: `// Best Practice: Implement error handling and fallbacks\nconst agent = await client.agents.create({\n  name: 'Robust Agent',\n  voice: 'en-US-Neural2-A',\n  language: 'en-US',\n  prompt: 'Your main prompt...',\n  fallback_prompt: 'If you encounter an issue, politely offer to transfer to a human agent.',\n  error_handling: {\n    max_retries: 3,\n    retry_delay: 2000,\n    fallback_action: 'transfer'\n  },\n  monitoring: {\n    log_level: 'info',\n    record_calls: true,\n    sentiment_analysis: true\n  }\n});`,
      language: "javascript"
    }
  ],
  "sdks": [
    {
      id: "javascript-nodejs",
      title: "JavaScript/Node.js",
      content: "Our official JavaScript SDK works seamlessly in Node.js and modern browsers. Full TypeScript support included with type definitions for all API methods.",
      codeExample: `// Installation\nnpm install voiceai-sdk\n\n// Usage\nimport VoiceAI from 'voiceai-sdk';\n\nconst client = new VoiceAI({\n  apiKey: process.env.VOICEAI_API_KEY\n});\n\n// Create an agent\nconst agent = await client.agents.create({\n  name: 'My Agent',\n  voice: 'en-US-Neural2-A',\n  language: 'en-US',\n  prompt: 'You are a helpful assistant...'\n});\n\n// Make a call\nconst call = await client.calls.create({\n  agent_id: agent.id,\n  to: '+1234567890'\n});`,
      language: "javascript"
    },
    {
      id: "python",
      title: "Python",
      content: "The Python SDK provides a Pythonic interface to our API with full async/await support. Perfect for integrating with Django, Flask, or FastAPI applications.",
      codeExample: `# Installation\npip install voiceai\n\n# Usage\nfrom voiceai import VoiceAI\n\nclient = VoiceAI(api_key=\"your_api_key\")\n\n# Create an agent\nagent = client.agents.create(\n    name=\"My Agent\",\n    voice=\"en-US-Neural2-A\",\n    language=\"en-US\",\n    prompt=\"You are a helpful assistant...\"\n)\n\n# Make a call\ncall = client.calls.create(\n    agent_id=agent.id,\n    to=\"+1234567890\"\n)\n\nprint(f\"Call status: {call.status}\")`,
      language: "python"
    },
    {
      id: "ruby",
      title: "Ruby",
      content: "The Ruby SDK follows Ruby conventions and integrates smoothly with Rails applications. Includes comprehensive error handling and logging.",
      codeExample: `# Installation\ngem install voiceai\n\n# Usage\nrequire 'voiceai'\n\nclient = VoiceAI::Client.new(api_key: ENV['VOICEAI_API_KEY'])\n\n# Create an agent\nagent = client.agents.create(\n  name: 'My Agent',\n  voice: 'en-US-Neural2-A',\n  language: 'en-US',\n  prompt: 'You are a helpful assistant...'\n)\n\n# Make a call\ncall = client.calls.create(\n  agent_id: agent.id,\n  to: '+1234567890'\n)\n\nputs \"Call status: #{call.status}\"`,
      language: "ruby"
    },
    {
      id: "php",
      title: "PHP",
      content: "Our PHP SDK is compatible with PHP 7.4+ and supports both synchronous and asynchronous requests. Easy to integrate with Laravel, Symfony, or any PHP framework.",
      codeExample: `// Installation\ncomposer require voiceai/sdk\n\n// Usage\n<?php\nrequire 'vendor/autoload.php';\n\nuse VoiceAI\\Client;\n\n$client = new Client([\n    'api_key' => getenv('VOICEAI_API_KEY')\n]);\n\n// Create an agent\n$agent = $client->agents->create([\n    'name' => 'My Agent',\n    'voice' => 'en-US-Neural2-A',\n    'language' => 'en-US',\n    'prompt' => 'You are a helpful assistant...'\n]);\n\n// Make a call\n$call = $client->calls->create([\n    'agent_id' => $agent->id,\n    'to' => '+1234567890'\n]);\n\necho \"Call status: \" . $call->status;\n?>`,
      language: "php"
    }
  ],
  "video-tutorials": [
    {
      id: "getting-started",
      title: "Getting Started",
      content: "Watch our comprehensive getting started video that walks you through account setup, creating your first agent, and making your first call. Perfect for beginners.",
    },
    {
      id: "advanced-features",
      title: "Advanced Features",
      content: "Learn about advanced features like custom function calling, dynamic voice switching, real-time interruption handling, and multi-turn conversation management.",
    },
    {
      id: "integration-guides",
      title: "Integration Guides",
      content: "Step-by-step video tutorials on integrating with Salesforce, HubSpot, Google Calendar, Zapier, and other popular business tools.",
    },
    {
      id: "use-cases",
      title: "Use Cases",
      content: "Explore real-world use cases including appointment scheduling, lead qualification, customer support, surveys, and reminder calls with live demonstrations.",
    }
  ],
  "examples": [
    {
      id: "basic-call-flow",
      title: "Basic Call Flow",
      content: "A simple example demonstrating the complete flow of initiating a call, handling the conversation, and processing the results.",
      codeExample: `import VoiceAI from 'voiceai-sdk';\n\nconst client = new VoiceAI({ apiKey: process.env.VOICEAI_API_KEY });\n\nasync function makeSimpleCall() {\n  // Create agent\n  const agent = await client.agents.create({\n    name: 'Simple Agent',\n    voice: 'en-US-Neural2-A',\n    language: 'en-US',\n    prompt: 'Greet the customer and ask how you can help them today.'\n  });\n\n  // Initiate call\n  const call = await client.calls.create({\n    agent_id: agent.id,\n    to: '+1234567890',\n    from: '+0987654321'\n  });\n\n  console.log('Call initiated:', call.id);\n  \n  // Wait for call to complete\n  const completedCall = await waitForCallCompletion(call.id);\n  \n  // Get transcription\n  const transcription = await client.calls.getTranscription(call.id);\n  console.log('Transcription:', transcription.text);\n}\n\nmakeSimpleCall();`,
      language: "javascript"
    },
    {
      id: "ivr-system",
      title: "IVR System",
      content: "Build an interactive voice response system with menu options, keypress detection, and call routing.",
      codeExample: `const ivrAgent = await client.agents.create({\n  name: 'IVR Agent',\n  voice: 'en-US-Neural2-C',\n  language: 'en-US',\n  prompt: \`Welcome to Acme Corp.\n  \nMenu options:\n- Press 1 for Sales\n- Press 2 for Support  \n- Press 3 for Billing\n- Press 0 to speak with an operator\n  \nPlease make your selection.\`,\n  features: {\n    dtmf_detection: true,\n    call_routing: {\n      '1': { transfer_to: '+1111111111' },\n      '2': { transfer_to: '+2222222222' },\n      '3': { transfer_to: '+3333333333' },\n      '0': { transfer_to: '+0000000000' }\n    }\n  }\n});`,
      language: "javascript"
    },
    {
      id: "lead-qualification",
      title: "Lead Qualification",
      content: "Automatically qualify leads by asking targeted questions and scoring responses based on predefined criteria.",
      codeExample: `const qualificationAgent = await client.agents.create({\n  name: 'Lead Qualifier',\n  voice: 'en-US-Neural2-A',\n  language: 'en-US',\n  prompt: \`You are a lead qualification specialist.\n  \nAsk these questions:\n1. What is your company size?\n2. What is your budget range?\n3. When are you looking to make a decision?\n4. Who else is involved in the decision?\n  \nBased on the answers, score the lead:\n- High: Enterprise company, budget > $50k, decision within 30 days\n- Medium: Mid-size company, budget $10k-$50k, decision within 90 days  \n- Low: Small company, budget < $10k, no timeline\n  \nBe conversational but efficient.\`,\n  integrations: {\n    salesforce: {\n      enabled: true,\n      auto_create_lead: true,\n      lead_scoring: true\n    }\n  }\n});`,
      language: "javascript"
    },
    {
      id: "appointment-booking",
      title: "Appointment Booking",
      content: "Enable your voice agent to check availability, book appointments, and send calendar invitations automatically.",
      codeExample: `const bookingAgent = await client.agents.create({\n  name: 'Booking Agent',\n  voice: 'en-US-Neural2-C',\n  language: 'en-US',\n  prompt: \`You are an appointment booking assistant.\n  \nSteps:\n1. Greet the customer warmly\n2. Ask what type of appointment they need\n3. Check calendar availability\n4. Offer 3 available time slots\n5. Confirm the appointment details\n6. Send calendar invitation\n7. Provide confirmation number\n  \nBe friendly and efficient.\`,\n  integrations: {\n    calendar: {\n      enabled: true,\n      provider: 'google',\n      auto_schedule: true,\n      send_reminders: true,\n      reminder_times: [24, 2] // hours before\n    }\n  },\n  functions: [\n    {\n      name: 'check_availability',\n      description: 'Check calendar availability',\n      parameters: {\n        date: 'string',\n        time_range: 'string'\n      }\n    },\n    {\n      name: 'book_appointment',\n      description: 'Book an appointment',\n      parameters: {\n        date: 'string',\n        time: 'string',\n        customer_email: 'string'\n      }\n    }\n  ]\n});`,
      language: "javascript"
    }
  ]
};

export function DocumentationPage({ onBack, onNavigate }: { onBack: () => void; onNavigate?: (page: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportForm, setSupportForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const docSections: DocSection[] = [
    {
      id: "quick-start",
      icon: <Zap className="size-8 text-white" />,
      title: "Quick Start",
      description: "Get up and running in minutes",
      items: documentationContent["quick-start"],
      color: "cyan",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      id: "api-reference",
      icon: <Code className="size-8 text-white" />,
      title: "API Reference",
      description: "Complete API documentation",
      items: documentationContent["api-reference"],
      color: "fuchsia",
      gradient: "from-fuchsia-500 to-purple-500",
    },
    {
      id: "guides",
      icon: <BookOpen className="size-8 text-white" />,
      title: "Guides",
      description: "Step-by-step tutorials",
      items: documentationContent["guides"],
      color: "orange",
      gradient: "from-orange-500 to-red-500",
    },
    {
      id: "sdks",
      icon: <Package className="size-8 text-white" />,
      title: "SDKs",
      description: "Official client libraries",
      items: documentationContent["sdks"],
      color: "emerald",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      id: "video-tutorials",
      icon: <Video className="size-8 text-white" />,
      title: "Video Tutorials",
      description: "Learn by watching",
      items: documentationContent["video-tutorials"],
      color: "pink",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      id: "examples",
      icon: <FileCode className="size-8 text-white" />,
      title: "Examples",
      description: "Ready-to-use code samples",
      items: documentationContent["examples"],
      color: "purple",
      gradient: "from-purple-500 to-indigo-500",
    },
  ];

  const filteredSections = docSections.filter(
    section =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.items.some(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCardClick = (section: DocSection) => {
    setSelectedSection(section.id);
    setSelectedTopic(null);
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    setSelectedTopic(null);
  };

  const handleTopicClick = (topicId: string) => {
    setSelectedTopic(topicId);
  };

  const handleCopyCode = async (code: string, id: string) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(id);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleSubmitSupport = () => {
    if (!supportForm.name || !supportForm.email || !supportForm.subject || !supportForm.message) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Support request submitted!", {
      description: "We'll get back to you within 24 hours"
    });
    setShowSupportForm(false);
    setSupportForm({ name: "", email: "", subject: "", message: "" });
  };

  const handleJoinCommunity = () => {
    if (onNavigate) {
      onNavigate("community");
      toast.success("Welcome to the community!");
    }
  };

  const currentSection = docSections.find(s => s.id === selectedSection);
  const currentTopic = currentSection?.items.find(i => i.id === selectedTopic);

  // Show topic detail view
  if (selectedTopic && currentTopic) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBackToSections}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <ArrowLeft className="size-4 mr-2" />
                Back to {currentSection?.title}
              </Button>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                <BookOpen className="size-3 mr-1" />
                {currentSection?.title}
              </Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl text-white mb-6">{currentTopic.title}</h1>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-slate-300 leading-relaxed mb-8">{currentTopic.content}</p>
            </div>

            {currentTopic.codeExample && (
              <Card className="bg-slate-900 border-slate-800 mt-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-white">Code Example</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyCode(currentTopic.codeExample!, currentTopic.id)}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedCode === currentTopic.id ? (
                        <><Check className="size-4 mr-2 text-emerald-400" /> Copied!</>
                      ) : (
                        <><Copy className="size-4 mr-2" /> Copy</>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-slate-300 whitespace-pre">{currentTopic.codeExample}</code>
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Navigation to next/previous topics */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-800">
              {currentSection && (
                <>
                  {currentSection.items.findIndex(i => i.id === selectedTopic) > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => handleTopicClick(currentSection.items[currentSection.items.findIndex(i => i.id === selectedTopic) - 1].id)}
                      className="border-cyan-500/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 hover:from-cyan-500/20 hover:to-blue-500/20 hover:text-cyan-300 hover:border-cyan-400"
                    >
                      <ArrowLeft className="size-4 mr-2" />
                      Previous
                    </Button>
                  )}
                  {currentSection.items.findIndex(i => i.id === selectedTopic) < currentSection.items.length - 1 && (
                    <Button
                      variant="outline"
                      onClick={() => handleTopicClick(currentSection.items[currentSection.items.findIndex(i => i.id === selectedTopic) + 1].id)}
                      className="border-cyan-500/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 hover:from-cyan-500/20 hover:to-blue-500/20 hover:text-cyan-300 hover:border-cyan-400 ml-auto"
                    >
                      Next
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show section topics list
  if (selectedSection && currentSection) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBackToSections}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <ArrowLeft className="size-4 mr-2" />
                Back to Documentation
              </Button>
              <Badge className={`bg-${currentSection.color}-500/20 text-${currentSection.color}-400 border-${currentSection.color}-500/50`}>
                <BookOpen className="size-3 mr-1" />
                {currentSection.title}
              </Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className={`size-20 rounded-xl bg-gradient-to-br ${currentSection.gradient} flex items-center justify-center`}>
                {currentSection.icon}
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl text-white mb-2">{currentSection.title}</h1>
                <p className="text-xl text-slate-400">{currentSection.description}</p>
              </div>
            </div>

            <div className="grid gap-6">
              {currentSection.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    onClick={() => handleTopicClick(item.id)}
                    className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-slate-800 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white text-xl mb-2 group-hover:text-cyan-400 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-slate-400 line-clamp-2">{item.content}</p>
                        </div>
                        <ArrowRight className="size-5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0 ml-4" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show main documentation sections
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Home
            </Button>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
              <BookOpen className="size-3 mr-1" />
              Documentation
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 size-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 size-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full px-6 py-3 mb-8"
            >
              <Zap className="size-5 text-cyan-400" />
              <span className="text-cyan-400">Everything you need to build AI voice agents</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6"
            >
              Documentation
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg sm:text-xl md:text-2xl text-slate-400 mb-10 px-4"
            >
              Everything you need to build, deploy, and scale AI voice agents
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="max-w-2xl mx-auto relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 text-base"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Documentation Cards Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onHoverStart={() => setHoveredCard(section.id)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Card
                onClick={() => handleCardClick(section)}
                className={`bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-slate-800 hover:border-${section.color}-500/50 transition-all duration-300 cursor-pointer group h-full relative overflow-hidden ${
                  hoveredCard === section.id ? "shadow-2xl shadow-" + section.color + "-500/20" : ""
                }`}
              >
                {/* Animated gradient overlay */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />

                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  initial={false}
                  animate={
                    hoveredCard === section.id
                      ? {
                          background: [
                            `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
                            `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
                          ],
                          x: ["-100%", "100%"],
                        }
                      : {}
                  }
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                />

                <CardHeader className="relative">
                  <motion.div
                    className={`size-16 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-4`}
                    animate={hoveredCard === section.id ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {section.icon}
                  </motion.div>

                  <h3 className={`text-white text-xl mb-2 group-hover:text-${section.color}-400 transition-colors`}>
                    {section.title}
                  </h3>
                  <p className="text-slate-400 text-sm">{section.description}</p>
                </CardHeader>

                <CardContent className="relative space-y-2">
                  {section.items.slice(0, 4).map((item, itemIndex) => (
                    <motion.div
                      key={itemIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + itemIndex * 0.05 }}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors group/item"
                    >
                      <ChevronRight className="size-4 text-slate-600 group-hover/item:text-cyan-400 group-hover/item:translate-x-1 transition-all" />
                      <span>{item.title}</span>
                    </motion.div>
                  ))}

                  <motion.div
                    className="flex items-center gap-2 text-cyan-400 pt-4"
                    animate={hoveredCard === section.id ? { x: 5 } : { x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-sm">Explore</span>
                    <ArrowRight className="size-4" />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="size-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-white text-xl mb-2">No results found</h3>
            <p className="text-slate-400">Try searching with different keywords</p>
          </motion.div>
        )}
      </section>

      {/* Quick Links Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-white text-3xl md:text-4xl mb-4">Popular Resources</h2>
          <p className="text-slate-400 text-lg">Frequently accessed documentation and guides</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Authentication", description: "Setup API keys", icon: "🔐", color: "from-cyan-500/20 to-blue-500/20", sectionId: "api-reference", topicId: "authentication" },
            { title: "Webhooks", description: "Real-time events", icon: "🔔", color: "from-purple-500/20 to-pink-500/20", sectionId: "quick-start", topicId: "webhooks" },
            { title: "Your First Agent", description: "Create your first agent", icon: "⚡", color: "from-orange-500/20 to-red-500/20", sectionId: "quick-start", topicId: "your-first-agent" },
            { title: "Code Examples", description: "Ready-to-use samples", icon: "🚨", color: "from-emerald-500/20 to-green-500/20", sectionId: "examples", topicId: "basic-call-flow" },
          ].map((resource, index) => (
            <motion.button
              key={resource.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedSection(resource.sectionId);
                setSelectedTopic(resource.topicId);
              }}
              className={`bg-gradient-to-br ${resource.color} border border-slate-800 rounded-xl p-6 text-left hover:border-cyan-500/50 transition-all group`}
            >
              <div className="text-4xl mb-3">{resource.icon}</div>
              <h3 className="text-white group-hover:text-cyan-400 transition-colors mb-1">{resource.title}</h3>
              <p className="text-slate-400 text-sm">{resource.description}</p>
              <ArrowRight className="size-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all mt-2" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Help Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/20 border-slate-800 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
          <CardContent className="p-8 md:p-12 relative">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-white text-2xl md:text-3xl mb-4">Need Help?</h2>
                <p className="text-slate-400 text-lg mb-8">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => setShowSupportForm(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  >
                    <Send className="size-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button
                    onClick={handleJoinCommunity}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <ArrowRight className="size-4 mr-2" />
                    Join Community
                  </Button>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Support Form Dialog */}
      <Dialog open={showSupportForm} onOpenChange={setShowSupportForm}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Contact Support</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              If you have any questions or need assistance, feel free to contact our support team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Name</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={supportForm.name}
                onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={supportForm.email}
                onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-slate-300">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={supportForm.subject}
                onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-slate-300">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your issue in detail..."
                rows={6}
                value={supportForm.message}
                onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => setShowSupportForm(false)}
              variant="outline"
              className="border-cyan-500/50 bg-gradient-to-r from-slate-900 to-slate-800 text-slate-300 hover:from-cyan-500/10 hover:to-blue-500/10 hover:text-cyan-300 hover:border-cyan-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitSupport}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              <Send className="size-4 mr-2" />
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}