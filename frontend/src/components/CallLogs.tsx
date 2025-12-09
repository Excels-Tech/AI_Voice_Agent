import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Phone, Search, Download, Play, Pause, FileText, Clock, User, CheckCircle2, PhoneMissed, Voicemail, X, Volume2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface Call {
  id: number;
  caller: string;
  number: string;
  agent: string;
  duration: string;
  durationSeconds: number;
  timestamp: string;
  date: Date;
  status: "completed" | "voicemail" | "missed";
  sentiment: "positive" | "neutral" | "negative";
  recording: boolean;
  recordingUrl: string;
  transcript: string;
  fullTranscript: string;
  outcome: string;
}

export function CallLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "completed" | "voicemail" | "missed">("all");
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [playingCallId, setPlayingCallId] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const allCalls: Call[] = [
    {
      id: 1,
      caller: "John Smith",
      number: "+1 (555) 123-4567",
      agent: "Sales Agent",
      duration: "3:24",
      durationSeconds: 204,
      timestamp: "2025-11-12 14:30",
      date: new Date("2025-11-12T14:30:00"),
      status: "completed",
      sentiment: "positive",
      recording: true,
      recordingUrl: "https://example.com/recording1.mp3",
      transcript: "Customer inquired about pricing and features...",
      fullTranscript: `Agent: Hello! Thank you for calling VoiceAI. My name is Sarah. How can I help you today?

Customer: Hi Sarah, I'm interested in learning more about your pricing plans and features.

Agent: Absolutely! I'd be happy to walk you through our pricing. We offer three main tiers: Starter at $99/month, Professional at $299/month, and Enterprise which is custom priced. Which type of business are you calling from?

Customer: We're a mid-sized company, about 50 employees. What's included in the Professional plan?

Agent: Great question! The Professional plan includes up to 10 AI agents, 5,000 minutes per month, advanced analytics, CRM integrations, priority support, and access to all 400+ voices in 40+ languages. It also includes our advanced call routing and real-time monitoring features.

Customer: That sounds interesting. Do you offer a trial period?

Agent: Yes! We offer a 14-day free trial with full access to all features. No credit card required. Would you like me to set that up for you?

Customer: Yes, that would be great. I'd like to test it out before committing.

Agent: Perfect! I'll send you a link to get started. I'll also schedule a demo call with our team to help you set up your first agent. Does next Tuesday at 2 PM work for you?

Customer: Tuesday at 2 PM works perfectly.

Agent: Excellent! You should receive an email within the next few minutes with your trial access and calendar invite. Is there anything else I can help you with today?

Customer: No, that's all. Thank you so much for your help!

Agent: You're very welcome! Enjoy your trial, and we'll see you on Tuesday. Have a great day!`,
      outcome: "Qualified lead - interested in Enterprise plan",
    },
    {
      id: 2,
      caller: "Sarah Johnson",
      number: "+1 (555) 234-5678",
      agent: "Support Agent",
      duration: "5:12",
      durationSeconds: 312,
      timestamp: "2025-11-12 13:15",
      date: new Date("2025-11-12T13:15:00"),
      status: "completed",
      sentiment: "neutral",
      recording: true,
      recordingUrl: "https://example.com/recording2.mp3",
      transcript: "Technical support request for API integration...",
      fullTranscript: `Agent: Hello, this is VoiceAI technical support. How can I assist you today?

Customer: Hi, I'm having trouble integrating your API with our CRM system. The webhook isn't triggering properly.

Agent: I'm sorry to hear that. Let me help you troubleshoot this. Can you tell me which CRM system you're using?

Customer: We're using Salesforce.

Agent: Okay, and have you configured the webhook URL in your VoiceAI dashboard under Integrations?

Customer: Yes, I have. I've double-checked the URL and it looks correct.

Agent: Let's verify the webhook is receiving the POST requests. Can you check your server logs to see if you're receiving any requests from our IP addresses?

Customer: Let me check... No, I'm not seeing any incoming requests.

Agent: That's helpful information. It sounds like the webhook might not be properly activated. Go to Settings > Integrations > Salesforce, and make sure the "Enable Webhook" toggle is turned on.

Customer: Oh! I see it now. It was off. Let me turn it on... Okay, it's enabled now.

Agent: Great! Now try making a test call and let's see if the webhook triggers.

Customer: Okay, making a test call now... Yes! I'm seeing the data come through now. That fixed it!

Agent: Excellent! I'm glad we could resolve that. I'll send you our API integration guide via email as well, which includes troubleshooting tips.

Customer: That would be helpful, thank you!

Agent: Is there anything else I can help you with?

Customer: No, that's all. Thanks for your help!`,
      outcome: "Issue resolved - sent documentation",
    },
    {
      id: 3,
      caller: "Unknown",
      number: "+1 (555) 345-6789",
      agent: "Lead Qualifier",
      duration: "1:45",
      durationSeconds: 105,
      timestamp: "2025-11-12 11:20",
      date: new Date("2025-11-12T11:20:00"),
      status: "voicemail",
      sentiment: "neutral",
      recording: true,
      recordingUrl: "https://example.com/recording3.mp3",
      transcript: "Left voicemail message...",
      fullTranscript: `Agent: Hello, this is calling from VoiceAI regarding your inquiry about our voice agent platform. We offer AI-powered voice agents that can handle both inbound and outbound calls 24/7. I'd love to discuss how we can help automate your business communications. Please give us a call back at 1-800-VOICEAI, or visit our website at voiceai.com to schedule a demo. Thank you, and have a great day!

[Voicemail system detected - message left successfully]`,
      outcome: "Voicemail detected",
    },
    {
      id: 4,
      caller: "Mike Chen",
      number: "+1 (555) 456-7890",
      agent: "Sales Agent",
      duration: "8:35",
      durationSeconds: 515,
      timestamp: "2025-11-12 10:05",
      date: new Date("2025-11-12T10:05:00"),
      status: "completed",
      sentiment: "positive",
      recording: true,
      recordingUrl: "https://example.com/recording4.mp3",
      transcript: "Demo scheduled, discussed implementation timeline...",
      fullTranscript: `Agent: Good morning! Thank you for calling VoiceAI. This is Alex. How can I help you today?

Customer: Hi Alex, I attended your webinar last week and I'm very interested in implementing your voice AI solution for our customer service department.

Agent: That's wonderful to hear! I'm glad you found the webinar valuable. Tell me more about your current customer service setup.

Customer: We currently have a team of 20 agents handling about 500 calls per day. We're looking to reduce wait times and handle more volume without hiring additional staff.

Agent: I completely understand. Our AI agents can definitely help with that. They can handle routine inquiries 24/7, which typically reduces the load on your human agents by 60-70%. The AI can also intelligently route complex issues to your human team.

Customer: That's exactly what we need. What's the implementation timeline like?

Agent: Great question. Our typical implementation takes 2-4 weeks depending on complexity. Week 1 is setup and configuration, Week 2 is training the AI on your specific knowledge base, Week 3 is testing, and Week 4 is the soft launch with monitoring.

Customer: That's faster than I expected. What kind of training data do you need?

Agent: We'll need your FAQ documents, call scripts, product information, and any other knowledge base materials. We can also analyze recordings of your best customer service calls to train the AI on your preferred communication style.

Customer: We have all of that ready. What about integration with our existing systems?

Agent: We integrate with all major CRM platforms, ticketing systems, and phone systems. Which ones are you currently using?

Customer: We use Zendesk for ticketing and RingCentral for our phone system.

Agent: Perfect! We have native integrations with both of those. The setup is straightforward and we'll handle most of it for you.

Customer: This sounds great. What are the next steps?

Agent: I'd like to schedule a personalized demo where we can show you exactly how this would work for your team. We can even create a sample agent using some of your data. Does Thursday at 2 PM work for you?

Customer: Thursday at 2 PM is perfect.

Agent: Excellent! I'll send you a calendar invite with a Zoom link. I'll also send over our Enterprise package details and a customized quote based on your volume. You should expect around 10,000-15,000 minutes per month based on what you've described.

Customer: That would be great. I'm looking forward to the demo.

Agent: Me too! Is there anything specific you'd like me to prepare for the demo?

Customer: Can you show us the real-time analytics dashboard? That's really important for our management team.

Agent: Absolutely! I'll make sure to showcase our real-time monitoring, sentiment analysis, and performance analytics. You'll love it.

Customer: Perfect. Thanks Alex!

Agent: Thank you Mike! Talk to you Thursday!`,
      outcome: "Demo booked for Nov 15",
    },
    {
      id: 5,
      caller: "Emma Williams",
      number: "+1 (555) 567-8901",
      agent: "Support Agent",
      duration: "2:18",
      durationSeconds: 138,
      timestamp: "2025-11-12 09:40",
      date: new Date("2025-11-12T09:40:00"),
      status: "completed",
      sentiment: "negative",
      recording: true,
      recordingUrl: "https://example.com/recording5.mp3",
      transcript: "Complaint about service downtime...",
      fullTranscript: `Agent: Hello, this is VoiceAI support. How can I help you today?

Customer: Hi, I'm calling because we experienced significant downtime this morning. Our AI agents weren't working for almost 2 hours!

Agent: I sincerely apologize for the inconvenience. Let me look into this right away. Can you provide me with your account email or company name?

Customer: It's emma@techstart.com.

Agent: Thank you. I'm pulling up your account now... Yes, I can see there was a service interruption from 7:15 AM to 9:10 AM affecting your region. This was due to an unexpected issue with our cloud provider.

Customer: This is unacceptable. We missed dozens of important customer calls during that time.

Agent: I completely understand your frustration, and you're absolutely right to be upset. This is not the level of service we promise. Let me see what we can do to make this right.

Customer: We have SLA guarantees in our contract. This needs to be addressed.

Agent: Absolutely. According to our SLA, you're entitled to service credits for this downtime. I'm escalating this to our technical team and account management team immediately. They'll reach out within the next hour with a detailed incident report and credit information.

Customer: Okay, I appreciate that. We also need to discuss redundancy options to prevent this from happening again.

Agent: That's a very good point. I'm adding that to the ticket for the account team to discuss high-availability and failover options with you. Is there anything else you need from me right now?

Customer: No, but I expect someone from management to contact me soon.

Agent: You will absolutely hear from them within the hour. Again, I apologize for the disruption. We take this very seriously.`,
      outcome: "Escalated to technical team",
    },
  ];

  // Filter by date
  const filterByDate = (calls: Call[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    switch (dateFilter) {
      case "today":
        return calls.filter(call => call.date >= today);
      case "week":
        return calls.filter(call => call.date >= weekAgo);
      case "month":
        return calls.filter(call => call.date >= monthAgo);
      default:
        return calls;
    }
  };

  // Filter by status
  const filterByStatus = (calls: Call[]) => {
    if (selectedFilter === "all") return calls;
    return calls.filter(call => call.status === selectedFilter);
  };

  // Filter by search
  const filterBySearch = (calls: Call[]) => {
    if (!searchQuery) return calls;
    const query = searchQuery.toLowerCase();
    return calls.filter(call =>
      call.caller.toLowerCase().includes(query) ||
      call.agent.toLowerCase().includes(query) ||
      call.number.toLowerCase().includes(query) ||
      call.transcript.toLowerCase().includes(query)
    );
  };

  // Sort calls
  const sortCalls = (calls: Call[]) => {
    const sorted = [...calls];
    switch (sortBy) {
      case "recent":
        return sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
      case "duration":
        return sorted.sort((a, b) => b.durationSeconds - a.durationSeconds);
      case "sentiment":
        const sentimentOrder = { positive: 0, neutral: 1, negative: 2 };
        return sorted.sort((a, b) => sentimentOrder[a.sentiment] - sentimentOrder[b.sentiment]);
      default:
        return sorted;
    }
  };

  // Apply all filters
  const filteredCalls = sortCalls(
    filterBySearch(
      filterByStatus(
        filterByDate(allCalls)
      )
    )
  );

  const handleExport = () => {
    // Create CSV content
    const headers = ["Caller", "Number", "Agent", "Duration", "Timestamp", "Status", "Sentiment", "Outcome"];
    const rows = filteredCalls.map(call => [
      call.caller,
      call.number,
      call.agent,
      call.duration,
      call.timestamp,
      call.status,
      call.sentiment,
      call.outcome
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `call-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Call logs exported successfully!");
  };

  const handleDownloadTranscript = (call: Call) => {
    const blob = new Blob([call.fullTranscript], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${call.caller.replace(/\s/g, "-")}-${call.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Transcript downloaded!");
  };

  const handleDownloadPDF = (call: Call) => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // App branding colors
      const primaryBlue = [59, 130, 246]; // #3b82f6
      const darkBlue = [99, 102, 241]; // #6366f1
      const textDark = [15, 23, 42]; // #0f172a
      const textLight = [100, 116, 139]; // #64748b

      // Header background gradient effect
      pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      pdf.rect(0, 0, pageWidth, 50, 'F');

      // VoiceAI Logo/Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text("VoiceAI", margin, 25);
      
      pdf.setFontSize(12);
      pdf.text("Call Transcript Report", margin, 35);

      // Reset to dark text
      pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
      
      yPosition = 60;

      // Call Information Section
      pdf.setFillColor(248, 250, 252); // slate-50
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 45, 'F');
      
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.text("Call Information", margin + 5, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
      
      pdf.text(`Caller: ${call.caller}`, margin + 5, yPosition);
      pdf.text(`Phone: ${call.number}`, pageWidth / 2, yPosition);
      
      yPosition += 7;
      pdf.text(`Agent: ${call.agent}`, margin + 5, yPosition);
      pdf.text(`Duration: ${call.duration}`, pageWidth / 2, yPosition);
      
      yPosition += 7;
      pdf.text(`Date: ${call.timestamp}`, margin + 5, yPosition);
      pdf.text(`Sentiment: ${call.sentiment.toUpperCase()}`, pageWidth / 2, yPosition);
      
      yPosition += 7;
      pdf.text(`Status: ${call.status.toUpperCase()}`, margin + 5, yPosition);
      
      yPosition += 15;

      // Transcript Section
      pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
      pdf.setFontSize(14);
      pdf.text("Conversation Transcript", margin, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(9);
      
      // Split transcript by paragraphs
      const paragraphs = call.fullTranscript.split('\n\n');
      
      for (const paragraph of paragraphs) {
        const lines = paragraph.split('\n');
        
        for (const line of lines) {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = margin;
          }
          
          // Color code speakers
          if (line.startsWith('Agent:')) {
            pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
          } else if (line.startsWith('Customer:')) {
            pdf.setTextColor(34, 197, 94); // green-500
          } else if (line.startsWith('[')) {
            pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
            pdf.setFont(undefined, 'italic');
          } else {
            pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
          }
          
          // Word wrap
          const splitText = pdf.splitTextToSize(line, pageWidth - 2 * margin);
          pdf.text(splitText, margin, yPosition);
          yPosition += splitText.length * lineHeight;
          
          pdf.setFont(undefined, 'normal');
        }
        
        yPosition += 5; // Space between paragraphs
      }

      // Outcome Section
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      
      yPosition += 10;
      pdf.setFillColor(239, 246, 255); // blue-50
      pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
      
      pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
      pdf.setFontSize(11);
      pdf.text("Call Outcome", margin + 5, yPosition + 5);
      
      pdf.setFontSize(9);
      pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
      const outcomeText = pdf.splitTextToSize(call.outcome, pageWidth - 2 * margin - 10);
      pdf.text(outcomeText, margin + 5, yPosition + 12);

      // Footer
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
      pdf.text(`Generated on ${new Date().toLocaleString()}`, margin, footerY);
      pdf.text("VoiceAI Platform", pageWidth - margin - 30, footerY);

      // Save PDF
      pdf.save(`transcript-${call.caller.replace(/\s/g, "-")}-${call.id}.pdf`);
      toast.success("PDF transcript downloaded!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const handleViewTranscript = (call: Call) => {
    setSelectedCall(call);
    setShowTranscript(true);
  };

  const handlePlayRecording = (call: Call) => {
    const callId = call.id;
    
    if (playingCallId === callId) {
      // Pause audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingCallId(null);
      toast.success("Recording paused");
    } else {
      // Stop previous audio if any
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Since we don't have real audio files, we'll create a simulated audio experience
      // In production, you would load the actual audio file using: new Audio(call.recordingUrl)
      toast.success(`Playing recording for ${call.caller}...`, {
        description: "Audio playback simulated (no actual file)"
      });
      
      setPlayingCallId(callId);
      
      // Simulate audio playback with actual duration
      const simulatedDuration = call.durationSeconds * 1000; // Convert to milliseconds
      setTimeout(() => {
        setPlayingCallId(null);
        toast.info("Recording finished");
      }, Math.min(simulatedDuration, 5000)); // Cap at 5 seconds for demo
      
      // In production, use this code instead:
      /*
      const audio = new Audio(call.recordingUrl);
      audioRef.current = audio;
      
      audio.addEventListener('ended', () => {
        setPlayingCallId(null);
        toast.info("Recording finished");
      });
      
      audio.addEventListener('error', () => {
        setPlayingCallId(null);
        toast.error("Failed to play recording");
      });
      
      audio.play().catch((error) => {
        console.error("Audio playback error:", error);
        setPlayingCallId(null);
        toast.error("Failed to play recording");
      });
      */
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stats = {
    total: allCalls.length,
    completed: allCalls.filter(c => c.status === "completed").length,
    voicemail: allCalls.filter(c => c.status === "voicemail").length,
    missed: allCalls.filter(c => c.status === "missed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 dark:text-white mb-2">Call Logs</h1>
        <p className="text-slate-600 dark:text-slate-400">View and analyze all call recordings and transcripts</p>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search calls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="duration">Longest Duration</option>
              <option value="sentiment">Best Sentiment</option>
            </select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="size-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card
          className={`bg-white dark:bg-slate-900 border-2 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
            selectedFilter === "all" ? "border-blue-500 shadow-lg" : "border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600"
          }`}
          onClick={() => setSelectedFilter("all")}
        >
          <CardContent className="p-6">
            <Phone className="size-8 text-blue-600 mb-3" />
            <div className="text-3xl text-slate-900 dark:text-white mb-1">{stats.total}</div>
            <div className="text-slate-600 dark:text-slate-400">Total Calls</div>
          </CardContent>
        </Card>
        <Card
          className={`bg-white dark:bg-slate-900 border-2 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
            selectedFilter === "completed" ? "border-green-500 shadow-lg" : "border-slate-200 dark:border-slate-800 hover:border-green-400 dark:hover:border-green-600"
          }`}
          onClick={() => setSelectedFilter("completed")}
        >
          <CardContent className="p-6">
            <CheckCircle2 className="size-8 text-green-600 mb-3" />
            <div className="text-3xl text-slate-900 dark:text-white mb-1">{stats.completed}</div>
            <div className="text-slate-600 dark:text-slate-400">Completed</div>
          </CardContent>
        </Card>
        <Card
          className={`bg-white dark:bg-slate-900 border-2 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
            selectedFilter === "voicemail" ? "border-orange-500 shadow-lg" : "border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-600"
          }`}
          onClick={() => setSelectedFilter("voicemail")}
        >
          <CardContent className="p-6">
            <Voicemail className="size-8 text-orange-600 mb-3" />
            <div className="text-3xl text-slate-900 dark:text-white mb-1">{stats.voicemail}</div>
            <div className="text-slate-600 dark:text-slate-400">Voicemail</div>
          </CardContent>
        </Card>
        <Card
          className={`bg-white dark:bg-slate-900 border-2 cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
            selectedFilter === "missed" ? "border-red-500 shadow-lg" : "border-slate-200 dark:border-slate-800 hover:border-red-400 dark:hover:border-red-600"
          }`}
          onClick={() => setSelectedFilter("missed")}
        >
          <CardContent className="p-6">
            <PhoneMissed className="size-8 text-red-600 mb-3" />
            <div className="text-3xl text-slate-900 dark:text-white mb-1">{stats.missed}</div>
            <div className="text-slate-600 dark:text-slate-400">Missed</div>
          </CardContent>
        </Card>
      </div>

      {/* Call List */}
      <div className="space-y-4">
        {filteredCalls.map((call) => (
          <Card key={call.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shrink-0">
                    <Phone className="size-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-slate-900 dark:text-white">{call.caller}</h3>
                      <Badge
                        variant={
                          call.sentiment === "positive"
                            ? "default"
                            : call.sentiment === "negative"
                            ? "destructive"
                            : "secondary"
                        }
                        className={call.sentiment === "positive" ? "bg-green-500" : ""}
                      >
                        {call.sentiment}
                      </Badge>
                      {call.status === "voicemail" && (
                        <Badge variant="outline" className="dark:border-slate-600 dark:text-slate-300">Voicemail</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 text-sm mb-3">
                      <span className="flex items-center gap-1">
                        <User className="size-4" />
                        {call.agent}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="size-4" />
                        {call.number}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-4" />
                        {call.duration}
                      </span>
                      <span>{call.timestamp}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-3">
                      <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">{call.transcript}</p>
                      <p className="text-slate-900 dark:text-white">
                        <strong>Outcome:</strong> {call.outcome}
                      </p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTranscript(call)}
                      >
                        <FileText className="size-4 mr-2" />
                        Transcript
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlayRecording(call)}
                      >
                        {playingCallId === call.id ? (
                          <Pause className="size-4" />
                        ) : (
                          <Play className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadTranscript(call)}
                      >
                        <Download className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(call)}
                      >
                        <Download className="size-4" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCalls.length === 0 && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-12 text-center">
            <Phone className="size-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-slate-900 dark:text-white mb-2">No calls found</h3>
            <p className="text-slate-600 dark:text-slate-400">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Transcript Modal */}
      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between dark:text-white">
              <span>Call Transcript</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedCall && handleDownloadPDF(selectedCall)}
                >
                  <Download className="size-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedCall && handleDownloadTranscript(selectedCall)}
                >
                  <Download className="size-4 mr-2" />
                  TXT
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-4">
                <span><strong>Caller:</strong> {selectedCall.caller}</span>
                <span><strong>Agent:</strong> {selectedCall.agent}</span>
                <span><strong>Duration:</strong> {selectedCall.duration}</span>
                <span><strong>Date:</strong> {selectedCall.timestamp}</span>
              </div>
              <div className="mt-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-4">
                  {selectedCall.fullTranscript.split('\n\n').map((paragraph, index) => (
                    <div key={index} className="space-y-2">
                      {paragraph.split('\n').map((line, lineIndex) => {
                        const isAgent = line.startsWith('Agent:');
                        const isCustomer = line.startsWith('Customer:');
                        const isSystem = line.startsWith('[');
                        
                        return (
                          <p
                            key={lineIndex}
                            className={`${
                              isAgent
                                ? 'text-blue-700 dark:text-blue-400 pl-4 border-l-4 border-blue-500 py-1'
                                : isCustomer
                                ? 'text-green-700 dark:text-green-400 pl-4 border-l-4 border-green-500 py-1'
                                : isSystem
                                ? 'text-slate-500 dark:text-slate-400 italic text-sm'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-slate-900 dark:text-white mb-2">
                    <strong>Sentiment Analysis:</strong>{" "}
                    <Badge
                      variant={
                        selectedCall.sentiment === "positive"
                          ? "default"
                          : selectedCall.sentiment === "negative"
                          ? "destructive"
                          : "secondary"
                      }
                      className={selectedCall.sentiment === "positive" ? "bg-green-500" : ""}
                    >
                      {selectedCall.sentiment}
                    </Badge>
                  </p>
                  <p className="text-slate-900 dark:text-white">
                    <strong>Outcome:</strong> {selectedCall.outcome}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}