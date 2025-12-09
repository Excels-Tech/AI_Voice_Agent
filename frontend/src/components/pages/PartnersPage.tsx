import { ArrowLeft, Users, Award, TrendingUp, Zap, CheckCircle2, Sparkles, Rocket, Shield, Globe, DollarSign, HeadphonesIcon, BookOpen, ChevronRight, Star, Target, BarChart3, UserCheck, ArrowRight, ExternalLink, X, Calendar, Clock, Building2, Mail, Phone, User, Briefcase, MapPin, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { toast } from "sonner@2.0.3";
import { assignAgentToCall } from "../services/CallSchedulerService";

interface PartnersPageProps {
  onBack: () => void;
  onScheduleSuccess?: (details: {
    name: string;
    email: string;
    phone: string;
    company: string;
    preferredDate: string;
    preferredTime: string;
    timezone: string;
    topic: string;
  }) => void;
}

export function PartnersPage({ onBack, onScheduleSuccess }: PartnersPageProps) {
  const [hoveredPartner, setHoveredPartner] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showScheduleCall, setShowScheduleCall] = useState(false);
  const [selectedPartnerType, setSelectedPartnerType] = useState<string>("");

  // Application Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    country: "",
    partnerType: "",
    experience: "",
    clients: "",
    message: ""
  });

  // Schedule Call State
  const [callData, setCallData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    preferredDate: "",
    preferredTime: "",
    timezone: "",
    topic: ""
  });

  // Only include features we actually have in our platform
  const partnerTypes = [
    {
      id: "agency",
      icon: Award,
      title: "Agency Partners",
      description: "Build and manage AI voice agents for your clients with white-label branding",
      benefits: [
        "Full white-label platform access",
        "Unlimited client sub-accounts",
        "Custom domain & branding",
        "25% revenue share on clients",
        "Priority technical support",
        "Agency dashboard & analytics"
      ],
      requirements: [
        "Active digital agency or consultancy",
        "Minimum 3+ existing clients",
        "Marketing & sales capability",
        "Technical onboarding completion"
      ],
      color: "from-fuchsia-500 to-purple-500",
      iconBg: "bg-fuchsia-500",
    },
    {
      id: "reseller",
      icon: Users,
      title: "Reseller Partners",
      description: "Sell VoiceAI platform to your customers and earn recurring commissions",
      benefits: [
        "20% recurring commission",
        "Partner portal access",
        "Sales training & materials",
        "Deal registration system",
        "Co-marketing support",
        "Monthly performance reports"
      ],
      requirements: [
        "Established business entity",
        "Sales team or network",
        "Minimum 5 qualified leads/month",
        "Partner training certification"
      ],
      color: "from-cyan-500 to-blue-500",
      iconBg: "bg-cyan-500",
    },
    {
      id: "referral",
      icon: Zap,
      title: "Referral Partners",
      description: "Earn commissions by referring customers to VoiceAI - no sales required",
      benefits: [
        "15% recurring commission",
        "Simple referral tracking",
        "90-day cookie tracking",
        "Marketing materials provided",
        "Fast monthly payouts",
        "No minimum requirements"
      ],
      requirements: [
        "Valid business email",
        "Referral agreement acceptance",
        "Basic platform knowledge",
        "No conflicting partnerships"
      ],
      color: "from-emerald-500 to-green-500",
      iconBg: "bg-emerald-500",
    }
  ];

  const platformCapabilities = [
    {
      icon: Rocket,
      title: "White-Label Platform",
      description: "Full branding customization with your logo, colors, and domain",
      available: true
    },
    {
      icon: Users,
      title: "Multi-Tenant Workspaces",
      description: "Manage unlimited client accounts from one dashboard",
      available: true
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time call metrics, sentiment analysis, and performance tracking",
      available: true
    },
    {
      icon: Globe,
      title: "40+ Languages",
      description: "Support clients globally with multi-language voice agents",
      available: true
    },
    {
      icon: Zap,
      title: "API Access",
      description: "Full API documentation for custom integrations",
      available: true
    },
    {
      icon: HeadphonesIcon,
      title: "Priority Support",
      description: "Dedicated partner support with 4-hour response SLA",
      available: true
    }
  ];

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.company || !formData.partnerType) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Save to localStorage
    const applications = JSON.parse(localStorage.getItem("partnerApplications") || "[]");
    applications.push({
      ...formData,
      submittedAt: new Date().toISOString(),
      status: "pending"
    });
    localStorage.setItem("partnerApplications", JSON.stringify(applications));

    toast.success("Application submitted successfully!", {
      description: "Our partnership team will review and contact you within 2 business days."
    });

    // Reset form
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      company: "",
      website: "",
      country: "",
      partnerType: "",
      experience: "",
      clients: "",
      message: ""
    });
    setShowApplicationForm(false);
  };

  const handleScheduleCallSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!callData.name || !callData.email || !callData.preferredDate || !callData.preferredTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(callData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Intelligent agent assignment based on topic
    const assignedAgent = assignAgentToCall({
      topic: callData.topic,
      company: callData.company,
      name: callData.name
    });

    // Generate unique ID for the call
    const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Save to localStorage with agent assignment
    const calls = JSON.parse(localStorage.getItem("scheduledCalls") || "[]");
    const newCall = {
      id: callId,
      ...callData,
      assignedAgent: {
        id: assignedAgent.id,
        name: assignedAgent.name,
        type: assignedAgent.type
      },
      scheduledAt: new Date().toISOString(),
      status: "scheduled"
    };
    calls.push(newCall);
    localStorage.setItem("scheduledCalls", JSON.stringify(calls));

    toast.success("Call scheduled successfully!", {
      description: `Assigned to ${assignedAgent.name} - ${assignedAgent.reason}`
    });

    // Call the onScheduleSuccess callback if provided (before resetting form)
    if (onScheduleSuccess) {
      onScheduleSuccess(callData);
    }

    // Reset form
    setCallData({
      name: "",
      email: "",
      phone: "",
      company: "",
      preferredDate: "",
      preferredTime: "",
      timezone: "",
      topic: ""
    });
    setShowScheduleCall(false);
  };

  // Lock body scroll when modals are open
  useEffect(() => {
    if (showApplicationForm || showScheduleCall) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [showApplicationForm, showScheduleCall]);

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
            <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-400 border-purple-500/50">
              <Sparkles className="size-3 mr-1" />
              Partner Program
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-cyan-500/5 to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 size-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 size-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6"
            >
              Partner With VoiceAI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-400 mb-12 px-4"
            >
              Grow your business with our AI voice platform. Offer white-label solutions, earn commissions, and provide cutting-edge technology to your clients.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => setShowApplicationForm(true)}
                className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-600 hover:via-fuchsia-600 hover:to-pink-600 text-white text-lg px-8 py-6"
              >
                <Rocket className="size-5 mr-2" />
                Apply to Partner
              </Button>
              <Button
                onClick={() => setShowScheduleCall(true)}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-lg px-8 py-6"
              >
                <Calendar className="size-5 mr-2" />
                Schedule a Call
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-white text-3xl md:text-5xl mb-4">What Our Platform Offers</h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto">
            Built-in features available to all partners for delivering exceptional value to clients
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {platformCapabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-slate-900 border-slate-800 hover:border-cyan-500/50 transition-all h-full group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <capability.icon className="size-12 text-cyan-400 group-hover:scale-110 transition-transform" />
                    {capability.available && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                        <CheckCircle2 className="size-3 mr-1" />
                        Available
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-white text-xl mb-2 group-hover:text-cyan-400 transition-colors">
                    {capability.title}
                  </h3>
                  <p className="text-slate-400 text-sm">{capability.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Partner Types */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-white text-3xl md:text-5xl mb-4">Partnership Programs</h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto">
            Choose the partnership model that aligns with your business model and capabilities
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {partnerTypes.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onHoverStart={() => setHoveredPartner(partner.id)}
              onHoverEnd={() => setHoveredPartner(null)}
            >
              <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-slate-800 hover:border-cyan-500/50 transition-all duration-300 group h-full relative overflow-hidden">
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${partner.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />

                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      className={`size-16 rounded-xl bg-gradient-to-br ${partner.color} flex items-center justify-center`}
                      animate={hoveredPartner === partner.id ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <partner.icon className="size-8 text-white" />
                    </motion.div>
                  </div>
                  <CardTitle className="text-white text-2xl mb-3 group-hover:text-cyan-400 transition-colors">
                    {partner.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {partner.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative space-y-6">
                  <div>
                    <h4 className="text-white text-sm mb-3">Benefits:</h4>
                    <div className="space-y-2">
                      {partner.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white text-sm mb-3">Requirements:</h4>
                    <div className="space-y-2">
                      {partner.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <ChevronRight className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="text-slate-400 text-sm">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedPartnerType(partner.id);
                      setFormData(prev => ({ ...prev, partnerType: partner.title }));
                      setShowApplicationForm(true);
                    }}
                    className={`w-full bg-gradient-to-r ${partner.color} hover:shadow-lg transition-all`}
                  >
                    Apply for {partner.title}
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How to Become a Partner */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-white text-3xl md:text-5xl mb-4">How to Become a Partner</h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto">
            Four simple steps to join our partner program and start growing your business
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            {
              number: "01",
              title: "Submit Application",
              description: "Complete our online application form with your business details",
              icon: UserCheck,
              color: "from-cyan-500 to-blue-500"
            },
            {
              number: "02",
              title: "Review Process",
              description: "Our team reviews your application within 2 business days",
              icon: Target,
              color: "from-purple-500 to-pink-500"
            },
            {
              number: "03",
              title: "Onboarding & Training",
              description: "Complete partner training and receive access to all resources",
              icon: BookOpen,
              color: "from-orange-500 to-red-500"
            },
            {
              number: "04",
              title: "Start Earning",
              description: "Begin offering VoiceAI to clients and earn recurring commissions",
              icon: Rocket,
              color: "from-emerald-500 to-green-500"
            }
          ].map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {index < 3 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent" />
              )}
              <Card className="bg-slate-900 border-slate-800 hover:border-cyan-500/50 transition-all text-center h-full group relative overflow-hidden">
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />
                <CardContent className="p-6 relative">
                  <div className={`text-5xl bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-4`}>
                    {step.number}
                  </div>
                  <div className={`size-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className="size-6 text-white" />
                  </div>
                  <h3 className="text-white text-lg mb-2 group-hover:text-cyan-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Card className="bg-gradient-to-br from-purple-900/50 via-fuchsia-900/50 to-pink-900/50 border-purple-500/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 size-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 size-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
          
          <CardContent className="p-8 md:p-16 text-center relative">
            <Sparkles className="size-16 text-fuchsia-400 mx-auto mb-6" />
            <h2 className="text-white text-3xl md:text-5xl mb-6">Ready to Get Started?</h2>
            <p className="text-slate-300 text-lg md:text-xl mb-8 max-w-3xl mx-auto">
              Join our partner program today and start earning recurring revenue with VoiceAI. Our team is ready to support your success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setShowApplicationForm(true)}
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white text-lg px-8 py-6"
              >
                <Send className="size-5 mr-2" />
                Apply Now
              </Button>
              <Button
                onClick={() => setShowScheduleCall(true)}
                variant="outline"
                className="border-purple-500/50 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 text-lg px-8 py-6"
              >
                <Calendar className="size-5 mr-2" />
                Schedule a Call
              </Button>
            </div>
            <p className="text-slate-400 text-sm mt-6">
              Questions? Email <span className="text-cyan-400">partners@voiceai.com</span> or call <span className="text-cyan-400">+1 (555) 123-4567</span>
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="bg-gradient-to-r from-purple-900/90 to-fuchsia-900/90 backdrop-blur-sm border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-white text-xl">Partner Application</h3>
                <p className="text-slate-300 text-xs">Join our partner program today</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowApplicationForm(false)}
                className="text-slate-300 hover:text-white hover:bg-slate-800 size-8 p-0"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleApplicationSubmit} className="p-4 space-y-3 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fullName" className="text-white text-sm mb-1 block">
                    Full Name <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-9"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-white text-sm mb-1 block">
                    Email Address <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-9"
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phone" className="text-white text-sm mb-1 block">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-9"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company" className="text-white text-sm mb-1 block">
                    Company Name <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-9"
                      placeholder="Acme Inc"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="website" className="text-white text-sm mb-1 block">
                    Company Website
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-9"
                      placeholder="https://company.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country" className="text-white text-sm mb-1 block">
                    Country
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-9"
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="partnerType" className="text-white text-sm mb-1 block">
                  Partner Type <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={formData.partnerType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, partnerType: value }))}
                  required
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-9">
                    <SelectValue placeholder="Select partnership type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="Agency Partners">Agency Partner</SelectItem>
                    <SelectItem value="Reseller Partners">Reseller Partner</SelectItem>
                    <SelectItem value="Referral Partners">Referral Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="experience" className="text-white text-sm mb-1 block">
                    Years of Experience
                  </Label>
                  <Select
                    value={formData.experience}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-9">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5+">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="clients" className="text-white text-sm mb-1 block">
                    Current Client Base
                  </Label>
                  <Select
                    value={formData.clients}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, clients: value }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-9">
                      <SelectValue placeholder="Select client count" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="0-5">0-5 clients</SelectItem>
                      <SelectItem value="5-10">5-10 clients</SelectItem>
                      <SelectItem value="10-25">10-25 clients</SelectItem>
                      <SelectItem value="25+">25+ clients</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message" className="text-white text-sm mb-1 block">
                  Tell us about your business
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white min-h-20 text-sm"
                  placeholder="Tell us about your business, why you want to partner with us, and how you plan to promote VoiceAI..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-600 hover:via-fuchsia-600 hover:to-pink-600 text-white h-9"
                >
                  <Send className="size-4 mr-2" />
                  Submit Application
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowApplicationForm(false)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 h-9"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Schedule Call Modal */}
      {showScheduleCall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="bg-gradient-to-r from-cyan-900/90 to-blue-900/90 backdrop-blur-sm border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-white text-xl">Schedule a Call</h3>
                <p className="text-slate-300 text-xs">Book a time to discuss partnership opportunities</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowScheduleCall(false)}
                className="text-slate-300 hover:text-white hover:bg-slate-800 size-8 p-0"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleScheduleCallSubmit} className="p-4 space-y-3 overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="callName" className="text-white text-sm mb-1 block">
                    Full Name <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="callName"
                      value={callData.name}
                      onChange={(e) => setCallData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-9"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="callEmail" className="text-white text-sm mb-1 block">
                    Email Address <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="callEmail"
                      type="email"
                      value={callData.email}
                      onChange={(e) => setCallData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-9"
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="callPhone" className="text-white text-sm mb-1 block">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="callPhone"
                      type="tel"
                      value={callData.phone}
                      onChange={(e) => setCallData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-9"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="callCompany" className="text-white text-sm mb-1 block">
                    Company Name
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="callCompany"
                      value={callData.company}
                      onChange={(e) => setCallData(prev => ({ ...prev, company: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-9"
                      placeholder="Acme Inc"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="preferredDate" className="text-white text-sm mb-1 block">
                    Preferred Date <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-cyan-400 z-10 pointer-events-none" />
                    <Input
                      id="preferredDate"
                      type="date"
                      value={callData.preferredDate}
                      onChange={(e) => setCallData(prev => ({ ...prev, preferredDate: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-9 [color-scheme:dark]"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="preferredTime" className="text-white text-sm mb-1 block">
                    Preferred Time <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-cyan-400 z-10 pointer-events-none" />
                    <Input
                      id="preferredTime"
                      type="time"
                      value={callData.preferredTime}
                      onChange={(e) => setCallData(prev => ({ ...prev, preferredTime: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-9 [color-scheme:dark]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="timezone" className="text-white text-sm mb-1 block">
                  Timezone
                </Label>
                <Select
                  value={callData.timezone}
                  onValueChange={(value) => setCallData(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-9">
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="topic" className="text-white text-sm mb-1 block">
                  What would you like to discuss?
                </Label>
                <Textarea
                  id="topic"
                  value={callData.topic}
                  onChange={(e) => setCallData(prev => ({ ...prev, topic: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white min-h-20 text-sm"
                  placeholder="Partnership opportunities, technical questions, pricing, etc..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white h-9"
                >
                  <Calendar className="size-4 mr-2" />
                  Schedule Call
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScheduleCall(false)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-9"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}