import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  HelpCircle,
  Search,
  MessageCircle,
  Mail,
  Phone,
  BookOpen,
  Video,
  FileText,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create my first AI voice agent?",
          a: "Click on 'Create New Agent' button from the dashboard, follow the 4-step wizard to configure, customize, select voice & language, and deploy your agent.",
        },
        {
          q: "What languages are supported?",
          a: "We support 40+ languages including English, Spanish, French, German, Chinese, Japanese, and many more.",
        },
        {
          q: "How do I get a phone number for my agent?",
          a: "During agent setup, you can purchase a phone number directly or connect your existing Twilio number.",
        },
      ],
    },
    {
      category: "Billing & Plans",
      questions: [
        {
          q: "How is usage calculated?",
          a: "Usage is calculated based on total minutes of calls handled by your agents each month. Each plan includes a set number of minutes.",
        },
        {
          q: "Can I upgrade or downgrade my plan?",
          a: "Yes, you can change your plan at any time from the Billing page. Changes take effect immediately.",
        },
        {
          q: "What happens if I exceed my plan limits?",
          a: "Overage charges apply at $0.15 per additional minute. You'll receive alerts at 80% and 100% usage.",
        },
      ],
    },
    {
      category: "Integrations",
      questions: [
        {
          q: "Which CRMs are supported?",
          a: "We integrate with Salesforce, HubSpot, Pipedrive, and many others. You can also use Zapier or webhooks for custom integrations.",
        },
        {
          q: "How do webhooks work?",
          a: "Webhooks send real-time data to your specified endpoint whenever events occur (call started, call ended, transcription ready, etc.).",
        },
      ],
    },
  ];

  const resources = [
    {
      icon: BookOpen,
      title: "Documentation",
      description: "Complete guides and API reference",
      color: "from-blue-500 to-cyan-500",
      action: () => toast.success("Opening documentation..."),
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      color: "from-purple-500 to-pink-500",
      action: () => toast.success("Opening video tutorials..."),
    },
    {
      icon: FileText,
      title: "API Reference",
      description: "Developer documentation",
      color: "from-green-500 to-emerald-500",
      action: () => toast.success("Opening API docs..."),
    },
    {
      icon: MessageCircle,
      title: "Community Forum",
      description: "Connect with other users",
      color: "from-orange-500 to-red-500",
      action: () => toast.success("Opening community forum..."),
    },
  ];

  const filteredFaqs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (faq) =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-2">Help & Support</h1>
        <p className="text-slate-600">Get help with VoiceAI and find answers to your questions</p>
      </div>

      {/* Search */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <Input
              placeholder="Search for help articles, FAQs, tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Resources */}
      <div>
        <h2 className="text-slate-900 mb-4">Quick Resources</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource) => (
            <Card
              key={resource.title}
              className="bg-white border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={resource.action}
            >
              <CardContent className="p-6">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${resource.color} mb-4`}>
                  <resource.icon className="size-6 text-white" />
                </div>
                <h3 className="text-slate-900 mb-2">{resource.title}</h3>
                <p className="text-slate-600 text-sm">{resource.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b">
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>Our team is here to help you</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={() => toast.success("Opening live chat...")}
              className="p-6 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
            >
              <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="size-6 text-blue-600" />
              </div>
              <h3 className="text-slate-900 mb-1">Live Chat</h3>
              <p className="text-slate-600 text-sm mb-2">Average response: 2 minutes</p>
              <Badge className="bg-green-500">Available Now</Badge>
            </button>

            <button
              onClick={() => toast.success("Opening email form...")}
              className="p-6 border-2 border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
            >
              <div className="size-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <Mail className="size-6 text-purple-600" />
              </div>
              <h3 className="text-slate-900 mb-1">Email Support</h3>
              <p className="text-slate-600 text-sm mb-2">Response within 24 hours</p>
              <p className="text-purple-600 text-sm">support@voiceai.app</p>
            </button>

            <button
              onClick={() => toast.success("Scheduling call...")}
              className="p-6 border-2 border-slate-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center"
            >
              <div className="size-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Phone className="size-6 text-green-600" />
              </div>
              <h3 className="text-slate-900 mb-1">Schedule Call</h3>
              <p className="text-slate-600 text-sm mb-2">Talk to our team</p>
              <p className="text-green-600 text-sm">Book a time slot</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <div>
        <h2 className="text-slate-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {(searchQuery ? filteredFaqs : faqs).map((category) => (
            <Card key={category.category} className="bg-white border-slate-200">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="size-5 text-blue-600" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {category.questions.map((faq, idx) => (
                    <details key={idx} className="group">
                      <summary className="flex items-center justify-between cursor-pointer p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                        <span className="text-slate-900">{faq.q}</span>
                        <ChevronRight className="size-5 text-slate-400 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="p-4 text-slate-700 border-l-2 border-blue-500 ml-4 mt-2">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {searchQuery && filteredFaqs.length === 0 && (
            <Card className="bg-white border-slate-200">
              <CardContent className="p-12 text-center">
                <HelpCircle className="size-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-600 mb-6">
                  Try different keywords or contact our support team
                </p>
                <Button
                  onClick={() => toast.success("Opening live chat...")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <MessageCircle className="size-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Status */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <p className="text-green-900">All Systems Operational</p>
                <p className="text-green-700 text-sm">Last updated: 2 minutes ago</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => toast.success("Opening status page...")}>
              View Status Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
