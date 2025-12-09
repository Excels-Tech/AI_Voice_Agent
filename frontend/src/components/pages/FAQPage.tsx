import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useState } from "react";

interface FAQPageProps {
  onBack: () => void;
}

export function FAQPage({ onBack }: FAQPageProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "What is VoiceAI?",
          a: "VoiceAI is an AI-powered voice agent platform that enables businesses to create intelligent voice agents for handling inbound and outbound calls 24/7. Our agents can perform sales, support, lead qualification, appointment setting, and more.",
        },
        {
          q: "How do I create my first agent?",
          a: "Creating an agent is simple: 1) Click 'Create Agent' in your dashboard, 2) Choose a voice and language, 3) Configure the agent's behavior and prompts, 4) Deploy to a phone number or embed on your website. The entire process takes less than 5 minutes.",
        },
        {
          q: "Do I need coding skills?",
          a: "No! VoiceAI is completely no-code. Our intuitive visual builder allows you to create sophisticated voice agents without writing a single line of code. However, developers can use our API for advanced customization.",
        },
      ],
    },
    {
      category: "Pricing & Billing",
      questions: [
        {
          q: "How does pricing work?",
          a: "We offer three plans: Starter ($29/mo), Professional ($79/mo), and Agency ($199/mo). All plans include a set number of minutes per month. Additional minutes are billed at $0.05 per minute. There are no hidden fees or setup costs.",
        },
        {
          q: "Can I change plans anytime?",
          a: "Yes! You can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated difference. If you downgrade, the change will take effect at the start of your next billing cycle.",
        },
        {
          q: "Is there a free trial?",
          a: "Yes! All new accounts get a 14-day free trial with 100 minutes of calling. No credit card required to start. You can test all features during the trial period.",
        },
      ],
    },
    {
      category: "Features & Capabilities",
      questions: [
        {
          q: "How many languages do you support?",
          a: "VoiceAI supports 40+ languages including English, Spanish, French, German, Chinese, Japanese, Arabic, and more. Each agent can be configured to speak one or multiple languages.",
        },
        {
          q: "Can I clone my own voice?",
          a: "Yes! Voice cloning is available on Professional and Agency plans. Simply upload 30 seconds of audio, and we'll create a custom voice that sounds like you. This is perfect for maintaining brand consistency.",
        },
        {
          q: "What integrations are available?",
          a: "VoiceAI integrates with 100+ tools including Salesforce, HubSpot, Pipedrive, Zapier, Slack, Google Calendar, and more. You can also use webhooks to connect to any custom system.",
        },
      ],
    },
    {
      category: "Technical",
      questions: [
        {
          q: "What is the call quality and latency?",
          a: "We use state-of-the-art neural voices with sub-500ms response latency. Our infrastructure is built on enterprise-grade cloud providers, ensuring 99.9% uptime and crystal-clear call quality.",
        },
        {
          q: "Is my data secure?",
          a: "Absolutely. We use bank-level encryption for all data in transit and at rest. We're SOC 2 Type II certified and GDPR compliant. Call recordings are encrypted and can be automatically deleted after a specified period.",
        },
        {
          q: "Do you offer API access?",
          a: "Yes! All plans include full API access. You can programmatically create agents, make calls, retrieve transcriptions, and more. Check out our comprehensive API documentation for details.",
        },
      ],
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
          <h1 className="text-white mb-6">Frequently Asked Questions</h1>
          <p className="text-slate-400 text-xl">
            Everything you need to know about VoiceAI. Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="max-w-4xl mx-auto space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-white mb-4">{category.category}</h2>
              <div className="space-y-3">
                {category.questions.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 10 + faqIndex;
                  const isOpen = openIndex === globalIndex;
                  return (
                    <Card
                      key={faqIndex}
                      className="bg-slate-900 border-slate-800 hover:border-cyan-500/50 transition-all"
                    >
                      <CardContent className="p-0">
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          className="w-full text-left p-6 flex items-center justify-between gap-4"
                        >
                          <span className="text-white">{faq.q}</span>
                          <ChevronDown
                            className={`size-5 text-slate-400 shrink-0 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6 text-slate-400 border-t border-slate-800 pt-4">
                            {faq.a}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 border-0 max-w-4xl mx-auto mt-20">
          <CardContent className="p-12 text-center">
            <h2 className="text-white mb-4">Still Have Questions?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Our support team is here to help. Get in touch and we'll answer all your questions.
            </p>
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
