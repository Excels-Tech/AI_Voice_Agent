import { ArrowLeft, Users, Target, Zap, Heart } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
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
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-white mb-6">About VoiceAI</h1>
          <p className="text-slate-400 text-xl">
            We're on a mission to make AI voice technology accessible to every business,
            enabling human-like conversations at scale.
          </p>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
          <Card className="bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 border-0 text-white">
            <CardContent className="p-8">
              <div className="size-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                <Target className="size-8 text-white" />
              </div>
              <h3 className="text-white text-2xl mb-4">Our Mission</h3>
              <p className="text-white/90 text-lg">
                To revolutionize business communication by providing AI-powered voice agents
                that deliver exceptional customer experiences 24/7.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-fuchsia-500 via-purple-500 to-violet-600 border-0 text-white">
            <CardContent className="p-8">
              <div className="size-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                <Heart className="size-8 text-white" />
              </div>
              <h3 className="text-white text-2xl mb-4">Our Values</h3>
              <p className="text-white/90 text-lg">
                Innovation, transparency, and customer success drive everything we do.
                We believe in ethical AI that empowers businesses while respecting users.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20">
          {[
            { value: "10K+", label: "Active Users" },
            { value: "1M+", label: "Calls Handled" },
            { value: "40+", label: "Languages" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-xl bg-slate-900 border border-slate-800"
            >
              <div className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                {stat.value}
              </div>
              <div className="text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white text-center mb-12">Our Leadership</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "CEO & Co-Founder",
                bio: "Former VP at Google AI, 15+ years in machine learning",
              },
              {
                name: "Michael Rodriguez",
                role: "CTO & Co-Founder",
                bio: "Ex-Amazon Alexa, PhD in Natural Language Processing",
              },
              {
                name: "Emma Williams",
                role: "VP of Product",
                bio: "Previously led product at Twilio, passionate about UX",
              },
            ].map((member) => (
              <div
                key={member.name}
                className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all"
              >
                <div className="size-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl mb-4 mx-auto">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h4 className="text-white text-center mb-1">{member.name}</h4>
                <p className="text-cyan-400 text-center text-sm mb-3">{member.role}</p>
                <p className="text-slate-400 text-sm text-center">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
