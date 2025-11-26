import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Brain, CheckCircle2, Clock, MessageCircle, Shield, Zap, Users, FileText, Mail, Play } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { VideoDemo } from "./VideoDemo";
import { toast } from "sonner";
import type { AppUser } from "../types/user";

interface LandingPageProps {
  onLogin: (user: AppUser) => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showDemo, setShowDemo] = useState(false);

  const handleAuth = (user: AppUser) => {
    setShowAuth(false);
    onLogin(user);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContactSales = () => {
    toast.success("Sales team will contact you within 24 hours!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                <Brain className="size-6 text-white" />
              </div>
              <span className="text-slate-900">VoiceAI</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection("features")}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Testimonials
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setAuthMode("login");
                  setShowAuth(true);
                }}
              >
                Sign In
              </Button>
              <Button
                onClick={() => {
                  setAuthMode("signup");
                  setShowAuth(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
            AI Voice Agents for Your Business
          </Badge>
          <h1 className="text-slate-900 mb-6">
            AI Can Make & Take Calls On Your Behalf - 24/7
          </h1>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Create AI voice agents that handle inbound and outbound calls automatically. 
            Sales, support, lead qualification, appointment setting - all automated with human-like conversations.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => {
                setAuthMode("signup");
                setShowAuth(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => setShowDemo(true)}>
              <Play className="size-4 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-slate-900 mb-4">Everything You Need for Better Meetings</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Powerful features designed to make your meetings more productive
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: MessageCircle,
              title: "Inbound & Outbound Calls",
              description: "Handle customer calls 24/7 or make automated outbound calls to prospects and leads",
              color: "from-blue-500 to-cyan-500",
            },
            {
              icon: Clock,
              title: "Human-Like Conversations",
              description: "Natural voices in 40+ languages with real-time responses under 500ms latency",
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: CheckCircle2,
              title: "No-Code Agent Builder",
              description: "Create voice agents in minutes with our intuitive 3-step wizard - no coding required",
              color: "from-orange-500 to-red-500",
            },
            {
              icon: FileText,
              title: "Call Recording & Transcripts",
              description: "Automatically record, transcribe and analyze every call with sentiment analysis",
              color: "from-green-500 to-emerald-500",
            },
            {
              icon: Zap,
              title: "Seamless Integrations",
              description: "Connect to CRM, calendar, Zapier, webhooks and 1000+ apps instantly",
              color: "from-indigo-500 to-purple-500",
            },
            {
              icon: Shield,
              title: "400+ Neural Voices",
              description: "Choose from hundreds of voices or clone your own for authentic brand voice",
              color: "from-red-500 to-pink-500",
            },
          ].map((feature) => (
            <Card key={feature.title} className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4`}>
                  <feature.icon className="size-6 text-white" />
                </div>
                <h3 className="text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-slate-900 mb-4">How It Works</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Three simple steps to transform your meetings
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "1",
              title: "Create Your Agent",
              description: "Use our no-code builder to configure name, voice, language and behavior in minutes.",
              icon: Users,
            },
            {
              step: "2",
              title: "Deploy Instantly",
              description: "Attach to phone number or embed on website. Start handling calls immediately.",
              icon: Brain,
            },
            {
              step: "3",
              title: "Monitor & Optimize",
              description: "Track calls, analyze sentiment, review transcripts and improve performance.",
              icon: Mail,
            },
          ].map((step) => (
            <div key={step.step} className="text-center">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-blue-600 text-white mb-4">
                <span className="text-2xl">{step.step}</span>
              </div>
              <h3 className="text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-slate-900 mb-4">Trusted by Teams Worldwide</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: "Sarah Johnson",
              role: "Product Manager",
              company: "TechCorp",
              quote: "VoiceAI handles our customer support 24/7. We've reduced response time by 90% and costs by 70%.",
              avatar: "SJ",
            },
            {
              name: "Michael Chen",
              role: "Sales Director",
              company: "SalesForce Inc",
              quote: "Our AI sales agent qualifies 200+ leads per day. It's like having 10 SDRs working around the clock.",
              avatar: "MC",
            },
            {
              name: "Emma Williams",
              role: "Agency Owner",
              company: "Marketing Pro",
              quote: "We use VoiceAI for all our clients. The white-label option is perfect for our agency.",
              avatar: "EW",
            },
          ].map((testimonial) => (
            <Card key={testimonial.name} className="bg-white border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-slate-900">{testimonial.name}</p>
                    <p className="text-slate-600 text-sm">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className="text-slate-700">"{testimonial.quote}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-slate-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Choose the plan that's right for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: "Starter",
              price: "$29",
              period: "per month",
              features: [
                "Up to 3 agents",
                "1,000 minutes/month",
                "30+ languages",
                "Basic analytics",
                "Email support",
              ],
            },
            {
              name: "Professional",
              price: "$79",
              period: "per month",
              features: [
                "Unlimited agents",
                "5,000 minutes/month",
                "All 400+ voices",
                "Advanced analytics",
                "All integrations",
                "Priority support",
              ],
              popular: true,
            },
            {
              name: "Agency",
              price: "$199",
              period: "per month",
              features: [
                "Everything in Professional",
                "20,000 minutes/month",
                "White-label branding",
                "Multiple workspaces",
                "Custom voice cloning",
                "Dedicated support",
              ],
            },
          ].map((plan) => (
            <Card
              key={plan.name}
              className={`bg-white ${
                plan.popular ? "border-blue-500 border-2 shadow-lg" : "border-slate-200"
              }`}
            >
              <CardHeader>
                {plan.popular && (
                  <Badge className="w-fit mb-2 bg-blue-600">Most Popular</Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-slate-900 text-3xl">{plan.price}</span>
                  <span className="text-slate-600"> {plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="size-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                  onClick={() => {
                    if (plan.price === "Custom") {
                      handleContactSales();
                    } else {
                      setAuthMode("signup");
                      setShowAuth(true);
                    }
                  }}
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-white mb-4">Ready to Transform Your Meetings?</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using MeetingAI to make their meetings more productive
            </p>
            <Button
              size="lg"
              onClick={() => {
                setAuthMode("signup");
                setShowAuth(true);
              }}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Start Your Free Trial
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-16">
          {/* Top Section */}
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <Brain className="size-7 text-white" />
                </div>
                <span className="text-white text-2xl">VoiceAI</span>
              </div>
              <p className="text-blue-200 mb-6 leading-relaxed">
                Transform your business communication with AI voice agents. Handle inbound and outbound calls 24/7 with human-like conversations.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setAuthMode("signup");
                    setShowAuth(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:shadow-lg transition-all"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => setShowDemo(true)}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all border border-white/20"
                >
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white mb-6">Product</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("pricing")}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowDemo(true)}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    Demo
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => toast.success("Opening FAQ...")}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    FAQ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => toast.success("Opening integrations...")}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    Integrations
                  </button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white mb-6">Company</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => toast.success("Opening about page...")}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => toast.success("Opening blog...")}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    Blog
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => toast.success("Opening careers page...")}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    Careers
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleContactSales}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    Contact Sales
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => toast.success("Opening partners page...")}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    Partners
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white mb-6">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => toast.success("Opening documentation...")}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    Documentation
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => toast.success("Opening API docs...")}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    API Reference
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => toast.success("Opening help center...")}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    Help Center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => toast.success("Opening status page...")}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    System Status
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => toast.success("Opening community...")}
                    className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="size-1.5 rounded-full bg-blue-400 group-hover:bg-white transition-colors" />
                    Community
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Middle Section - Social & Newsletter */}
          <div className="border-t border-white/10 pt-12 pb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Social Links */}
              <div>
                <h4 className="text-white mb-4">Follow Us</h4>
                <div className="flex gap-4">
                  {[
                    { name: "Twitter", icon: "𝕏" },
                    { name: "LinkedIn", icon: "in" },
                    { name: "Facebook", icon: "f" },
                    { name: "Instagram", icon: "📷" },
                    { name: "YouTube", icon: "▶" },
                  ].map((social) => (
                    <button
                      key={social.name}
                      onClick={() => toast.success(`Opening ${social.name}...`)}
                      className="size-12 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 transition-all flex items-center justify-center group"
                      title={social.name}
                    >
                      <span className="text-white group-hover:scale-110 transition-transform">
                        {social.icon}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div>
                <h4 className="text-white mb-4">Stay Updated</h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => toast.success("Subscribed to newsletter!")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:shadow-lg transition-all"
                  >
                    <Mail className="size-5" />
                  </button>
                </div>
                <p className="text-blue-200 text-sm mt-2">
                  Get the latest updates and AI insights
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-blue-200 text-sm">
                © 2025 VoiceAI. All rights reserved.
              </p>
              <div className="flex gap-6">
                <button
                  onClick={() => toast.success("Opening privacy policy...")}
                  className="text-blue-200 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => toast.success("Opening terms...")}
                  className="text-blue-200 hover:text-white transition-colors text-sm"
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => toast.success("Opening security...")}
                  className="text-blue-200 hover:text-white transition-colors text-sm"
                >
                  Security
                </button>
                <button
                  onClick={() => toast.success("Opening cookies policy...")}
                  className="text-blue-200 hover:text-white transition-colors text-sm"
                >
                  Cookie Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuth}
        />
      )}

      {showDemo && <VideoDemo onClose={() => setShowDemo(false)} />}
    </div>
  );
}
