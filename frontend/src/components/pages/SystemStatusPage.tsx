import { ArrowLeft, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface SystemStatusPageProps {
  onBack: () => void;
}

export function SystemStatusPage({ onBack }: SystemStatusPageProps) {
  const services = [
    { name: "API Gateway", status: "operational", uptime: "99.99%" },
    { name: "Voice Engine", status: "operational", uptime: "99.98%" },
    { name: "Call Routing", status: "operational", uptime: "99.99%" },
    { name: "Dashboard", status: "operational", uptime: "100%" },
    { name: "Analytics", status: "operational", uptime: "99.97%" },
    { name: "Integrations", status: "operational", uptime: "99.95%" },
  ];

  const incidents = [
    {
      title: "All Systems Operational",
      description: "No incidents reported in the last 90 days",
      date: "Current",
      status: "resolved",
    },
    {
      title: "Scheduled Maintenance - Database Upgrade",
      description: "We will be performing routine database maintenance. Expected downtime: 5 minutes.",
      date: "Dec 15, 2024 at 2:00 AM UTC",
      status: "scheduled",
    },
  ];

  const uptimeData = Array.from({ length: 90 }, (_, i) => ({
    day: i,
    uptime: Math.random() > 0.02 ? 100 : Math.random() * 5 + 95,
  }));

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
          <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
            <CheckCircle2 className="size-4 mr-2" />
            All Systems Operational
          </Badge>
          <h1 className="text-white mb-6">System Status</h1>
          <p className="text-slate-400 text-xl">
            Real-time status and uptime monitoring for all VoiceAI services
          </p>
        </div>

        {/* Current Status */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-white mb-6">Current Status</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <Card key={service.name} className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-emerald-400" />
                      <span className="text-white">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 text-sm">Uptime: {service.uptime}</span>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                        Operational
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Uptime Chart */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-white mb-6">90-Day Uptime History</h2>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-end gap-1 h-32">
                {uptimeData.map((data) => (
                  <div
                    key={data.day}
                    className={`flex-1 rounded-t transition-all ${
                      data.uptime === 100
                        ? "bg-emerald-500 hover:bg-emerald-400"
                        : data.uptime > 99
                        ? "bg-yellow-500 hover:bg-yellow-400"
                        : "bg-red-500 hover:bg-red-400"
                    }`}
                    style={{ height: `${data.uptime}%` }}
                    title={`Day ${data.day + 1}: ${data.uptime.toFixed(2)}% uptime`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
                <span>90 days ago</span>
                <span>Today</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Incidents */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-white mb-6">Recent Incidents & Maintenance</h2>
          <div className="space-y-4">
            {incidents.map((incident, index) => (
              <Card key={index} className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {incident.status === "resolved" ? (
                      <CheckCircle2 className="size-6 text-emerald-400 shrink-0 mt-1" />
                    ) : (
                      <Clock className="size-6 text-yellow-400 shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-white mb-2">{incident.title}</h3>
                      <p className="text-slate-400 mb-3">{incident.description}</p>
                      <div className="text-slate-500 text-sm">{incident.date}</div>
                    </div>
                    <Badge
                      className={
                        incident.status === "resolved"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                      }
                    >
                      {incident.status === "resolved" ? "Resolved" : "Scheduled"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { label: "Average Response Time", value: "120ms" },
            { label: "Overall Uptime (90 days)", value: "99.98%" },
            { label: "Incidents Resolved", value: "< 2 hours" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 text-center">
                <div className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
