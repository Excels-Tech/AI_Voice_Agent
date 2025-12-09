import { ArrowLeft, MessageCircle, Globe, Mic, TrendingUp, Zap, Shield } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface FeaturesPageProps {
  onBack: () => void;
}

export function FeaturesPage({ onBack }: FeaturesPageProps) {
  const features = [
    {
      icon: MessageCircle,
      title: "Inbound & Outbound Calls",
      description: "Handle customer calls 24/7 or make automated outbound calls to prospects and leads",
      bgClass: "bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600",
    },
    {
      icon: Globe,
      title: "40+ Languages",
      description: "Communicate with customers worldwide in their native language with natural conversations",
      bgClass: "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600",
    },
    {
      icon: Mic,
      title: "400+ AI Voices",
      description: "Choose from hundreds of natural-sounding voices or clone your own for brand consistency",
      bgClass: "bg-gradient-to-br from-fuchsia-500 via-purple-500 to-violet-600",
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Real-time insights, sentiment analysis, and performance metrics for every conversation",
      bgClass: "bg-gradient-to-br from-orange-400 via-orange-500 to-red-500",
    },
    {
      icon: Zap,
      title: "CRM Integrations",
      description: "Seamlessly connect with Salesforce, HubSpot, Pipedrive, and 100+ other tools",
      bgClass: "bg-gradient-to-br from-pink-500 via-rose-500 to-red-600",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption, GDPR compliant, and SOC 2 certified for your peace of mind",
      bgClass: "bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-600",
    },
  ];

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
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-white mb-6">
            Everything You Need for AI Voice Agents
          </h1>
          <p className="text-slate-400 text-xl">
            Powerful features designed to transform your business communication and customer experience
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className={`${feature.bgClass} border-0 text-white hover:shadow-2xl hover:scale-105 transition-all cursor-pointer`}
            >
              <CardContent className="p-8">
                <div className="size-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                  <feature.icon className="size-8 text-white" />
                </div>
                <h3 className="text-white text-xl mb-3">{feature.title}</h3>
                <p className="text-white/90">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-20">
          <h2 className="text-white text-center mb-12">More Powerful Capabilities</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Voicemail Detection",
                description: "Automatically detect voicemails and leave custom messages",
              },
              {
                title: "Call Recording",
                description: "Record and transcribe every call for quality assurance",
              },
              {
                title: "Smart Routing",
                description: "Route calls to the right agent based on intent and context",
              },
              {
                title: "Custom Workflows",
                description: "Build complex conversation flows with our visual builder",
              },
              {
                title: "A/B Testing",
                description: "Test different scripts and voices to optimize performance",
              },
              {
                title: "White Label",
                description: "Fully customizable branding for agencies and resellers",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all"
              >
                <h4 className="text-white mb-2">{item.title}</h4>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
