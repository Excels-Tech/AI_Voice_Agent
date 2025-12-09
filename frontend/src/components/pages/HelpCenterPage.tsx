import { ArrowLeft, Book, MessageCircle, Video, FileText, HelpCircle, Search, Phone, Mail, Clock, ArrowRight, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { useState } from "react";
import { toast } from "sonner@2.0.3";
import { LiveChatDialog } from "../LiveChatDialog";

interface HelpCenterPageProps {
  onBack: () => void;
}

export function HelpCenterPage({ onBack }: HelpCenterPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);

  const categories = [
    {
      icon: Book,
      title: "Getting Started",
      description: "New to VoiceAI? Start here",
      articles: 12,
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: MessageCircle,
      title: "Agent Configuration",
      description: "Build and customize your agents",
      articles: 24,
      color: "from-purple-500 to-fuchsia-500",
    },
    {
      icon: Video,
      title: "Call Management",
      description: "Handle inbound and outbound calls",
      articles: 18,
      color: "from-orange-500 to-red-500",
    },
    {
      icon: FileText,
      title: "Integrations",
      description: "Connect with your favorite tools",
      articles: 30,
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: HelpCircle,
      title: "Billing & Plans",
      description: "Manage subscriptions and payments",
      articles: 15,
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Book,
      title: "Troubleshooting",
      description: "Common issues and solutions",
      articles: 20,
      color: "from-indigo-500 to-blue-500",
    },
  ];

  const popularArticles = [
    "How to create your first AI voice agent",
    "Understanding call duration and pricing",
    "Connecting VoiceAI to your CRM",
    "Setting up voicemail detection",
    "Best practices for conversation design",
    "How to clone your voice",
    "Managing multiple workspaces",
    "Integrating with Zapier",
  ];

  const articleContent: Record<string, { title: string; content: string }> = {
    "How to create your first AI voice agent": {
      title: "How to create your first AI voice agent",
      content: "Creating your first AI voice agent is simple and takes just a few minutes. Follow these steps:\n\n1. Click the 'Create Agent' button in your dashboard\n2. Choose a name for your agent (e.g., 'Customer Support Agent')\n3. Select a voice from our library of 400+ options\n4. Choose the language your agent will speak\n5. Write a system prompt that defines your agent's personality and behavior\n6. Configure advanced settings like voicemail detection and transfer rules\n7. Click 'Deploy' to make your agent live\n\nYour agent is now ready to handle calls! You can test it by calling the assigned phone number.",
    },
    "Understanding call duration and pricing": {
      title: "Understanding call duration and pricing",
      content: "VoiceAI pricing is simple and transparent:\n\n• Starter Plan: $29/month includes 1,000 minutes\n• Professional Plan: $79/month includes 5,000 minutes\n• Agency Plan: $199/month includes 20,000 minutes\n\nAdditional minutes are billed at $0.05 per minute. Call duration is measured from when the call is answered until it ends. Voicemails and transfers are included in the duration.\n\nYou can monitor your usage in real-time from the Billing page in your dashboard.",
    },
    "Connecting VoiceAI to your CRM": {
      title: "Connecting VoiceAI to your CRM",
      content: "VoiceAI integrates seamlessly with all major CRM platforms:\n\nSalesforce Integration:\n1. Go to Integrations page\n2. Click 'Connect' on Salesforce card\n3. Authorize VoiceAI to access your Salesforce account\n4. Map call data fields to Salesforce objects\n5. Enable automatic logging of calls and transcripts\n\nHubSpot, Pipedrive, and other CRMs follow a similar process. Once connected, all call data, transcripts, and recordings are automatically synced to your CRM.",
    },
    "Setting up voicemail detection": {
      title: "Setting up voicemail detection",
      content: "Voicemail detection helps your AI agent leave messages when calls go to voicemail:\n\n1. Open your agent configuration\n2. Navigate to Advanced Settings\n3. Enable 'Voicemail Detection'\n4. Write a custom voicemail message\n5. Set the detection sensitivity (recommended: Medium)\n6. Save your changes\n\nThe AI will automatically detect when a call reaches voicemail and leave your pre-configured message.",
    },
    "Best practices for conversation design": {
      title: "Best practices for conversation design",
      content: "Create natural, effective conversations with these tips:\n\n• Keep prompts clear and concise\n• Define specific goals for each conversation\n• Include example dialogues in your system prompt\n• Handle common objections and edge cases\n• Use natural language, avoid robotic phrasing\n• Test with real scenarios before deploying\n• Iterate based on call analytics and feedback\n• Set appropriate tone for your brand\n\nGreat conversation design leads to better customer experiences and higher success rates.",
    },
    "How to clone your voice": {
      title: "How to clone your voice",
      content: "Voice cloning is available on Professional and Agency plans:\n\n1. Go to Voice Library in your dashboard\n2. Click 'Clone Voice'\n3. Record or upload 30 seconds of clear audio\n4. Speak naturally and clearly\n5. Submit for processing (takes 5-10 minutes)\n6. Once ready, select your custom voice in agent settings\n\nYour cloned voice can be used for any agent, maintaining perfect brand consistency across all customer interactions.",
    },
    "Managing multiple workspaces": {
      title: "Managing multiple workspaces",
      content: "Workspaces help you organize agents and team members:\n\n1. Click your profile menu\n2. Select 'Workspaces'\n3. Click 'Create Workspace'\n4. Name your workspace (e.g., 'Sales Team')\n5. Invite team members via email\n6. Assign roles and permissions\n7. Switch between workspaces using the dropdown\n\nEach workspace has separate agents, call logs, and billing. Perfect for agencies managing multiple clients.",
    },
    "Integrating with Zapier": {
      title: "Integrating with Zapier",
      content: "Connect VoiceAI to 5000+ apps via Zapier:\n\n1. Go to Integrations page\n2. Click 'Connect' on Zapier card\n3. Create a new Zap in Zapier\n4. Choose VoiceAI as the trigger app\n5. Select a trigger event (e.g., 'Call Completed')\n6. Connect your VoiceAI account\n7. Choose an action app and configure\n8. Test and enable your Zap\n\nPopular automations: Send Slack notifications, create Google Sheets rows, add contacts to email lists, and more.",
    },
  };

  const categoryArticles: Record<string, string[]> = {
    "Getting Started": [
      "How to create your first AI voice agent",
      "Understanding the dashboard",
      "Making your first test call",
      "Deploying to a phone number",
    ],
    "Agent Configuration": [
      "Choosing the right voice",
      "Writing effective prompts",
      "Setting up voicemail detection",
      "Configuring transfer rules",
    ],
    "Call Management": [
      "Making outbound calls",
      "Handling inbound calls",
      "Call recording and transcription",
      "Real-time call monitoring",
    ],
    "Integrations": [
      "Connecting VoiceAI to your CRM",
      "Integrating with Zapier",
      "Setting up webhooks",
      "API authentication",
    ],
    "Billing & Plans": [
      "Understanding call duration and pricing",
      "Upgrading your plan",
      "Managing payment methods",
      "Viewing usage and invoices",
    ],
    "Troubleshooting": [
      "Common call quality issues",
      "Why isn't my agent responding?",
      "Integration connection errors",
      "Billing and payment issues",
    ],
  };

  const handleCategoryClick = (categoryTitle: string) => {
    setSelectedCategory(categoryTitle);
  };

  const handleArticleClick = (article: string) => {
    if (articleContent[article]) {
      setSelectedArticle(article);
    } else {
      toast.success(`Opening article: ${article}`);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-white mb-6">Help Center</h1>
          <p className="text-slate-400 text-xl mb-8">
            Get instant answers to your questions about VoiceAI
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              className="pl-12 py-6 bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-20">
          {categories.map((category) => (
            <Card
              key={category.title}
              onClick={() => handleCategoryClick(category.title)}
              className="bg-slate-900 border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group"
            >
              <CardContent className="p-6">
                <div className={`size-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}>
                  <category.icon className="size-7 text-white" />
                </div>
                <h3 className="text-white text-xl mb-2 group-hover:text-cyan-400 transition-colors">
                  {category.title}
                </h3>
                <p className="text-slate-400 mb-3">{category.description}</p>
                <div className="text-cyan-400 text-sm">{category.articles} articles</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Popular Articles */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-white mb-8">Popular Articles</h2>
          <div className="space-y-3">
            {popularArticles.map((article, index) => (
              <button
                key={index}
                className="w-full text-left p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all group flex items-center justify-between"
                onClick={() => handleArticleClick(article)}
              >
                <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">
                  {article}
                </span>
                <ArrowRight className="size-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 border-0 max-w-4xl mx-auto">
          <CardContent className="p-12 text-center">
            <h2 className="text-white mb-4">Still Need Help?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Our support team is here to help you. Get in touch and we'll respond within 24 hours.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  // Route to support email for now
                  window.location.href = "mailto:support@voiceai.com?subject=VoiceAI%20Support%20Request";
                }}
              >
                Contact Support
              </Button>
              <Button 
                variant="outline" 
                className="bg-transparent border-white/30 text-white hover:bg-white/20 hover:border-white/50" 
                onClick={() => setIsLiveChatOpen(true)}
              >
                Live Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Category Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-slate-800 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h2 className="text-white">{selectedCategory}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="size-5" />
                </Button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-3">
                  {categoryArticles[selectedCategory]?.map((article, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedCategory(null);
                        handleArticleClick(article);
                      }}
                      className="w-full text-left p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all group flex items-center justify-between"
                    >
                      <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">
                        {article}
                      </span>
                      <ArrowRight className="size-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Article Modal */}
      {selectedArticle && articleContent[selectedArticle] && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-slate-800 max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h2 className="text-white">{articleContent[selectedArticle].title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedArticle(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="size-5" />
                </Button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="text-slate-200 whitespace-pre-line leading-relaxed text-[15px]">
                  {articleContent[selectedArticle].content}
                </div>
                <div className="mt-8 p-4 rounded-xl bg-slate-800 border border-slate-700">
                  <p className="text-slate-300 text-sm">
                    Was this article helpful? Let us know!
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={() => {
                        toast.success("Thanks for your feedback!");
                        setSelectedArticle(null);
                      }}
                    >
                      Yes, helpful
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
                      onClick={() => {
                        toast.success("Thanks for your feedback. We'll improve this article.");
                        setSelectedArticle(null);
                      }}
                    >
                      No, needs improvement
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live Chat Dialog */}
      <LiveChatDialog isOpen={isLiveChatOpen} onClose={() => setIsLiveChatOpen(false)} />
    </div>
  );
}
