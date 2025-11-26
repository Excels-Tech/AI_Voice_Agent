import { X, TrendingUp, Phone, Clock, ThumbsUp, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AgentAnalyticsProps {
  agent: any;
  onClose: () => void;
}

export function AgentAnalytics({ agent, onClose }: AgentAnalyticsProps) {
  const callData = [
    { date: "Mon", calls: 45, successful: 38, failed: 7 },
    { date: "Tue", calls: 52, successful: 47, failed: 5 },
    { date: "Wed", calls: 48, successful: 42, failed: 6 },
    { date: "Thu", calls: 61, successful: 55, failed: 6 },
    { date: "Fri", calls: 55, successful: 49, failed: 6 },
    { date: "Sat", calls: 38, successful: 34, failed: 4 },
    { date: "Sun", calls: 35, successful: 31, failed: 4 },
  ];

  const sentimentData = [
    { name: "Positive", value: 65, color: "#10b981" },
    { name: "Neutral", value: 25, color: "#6366f1" },
    { name: "Negative", value: 10, color: "#ef4444" },
  ];

  const stats = [
    {
      label: "Total Calls",
      value: agent.calls,
      change: "+12%",
      icon: Phone,
      color: "blue",
    },
    {
      label: "Avg Duration",
      value: "4:32",
      change: "+8%",
      icon: Clock,
      color: "purple",
    },
    {
      label: "Success Rate",
      value: "89%",
      change: "+5%",
      icon: ThumbsUp,
      color: "green",
    },
    {
      label: "Revenue Impact",
      value: "$12.4K",
      change: "+18%",
      icon: DollarSign,
      color: "orange",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-slate-900">Analytics - {agent.name}</h2>
            <p className="text-slate-600 text-sm">Performance metrics and insights</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`size-8 text-${stat.color}-600`} />
                    <span className="text-green-600 text-sm">{stat.change}</span>
                  </div>
                  <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-slate-900 text-2xl">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Call Volume Chart */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Call Volume (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={callData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="successful" fill="#10b981" name="Successful" />
                    <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trend */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={callData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} name="Total Calls" />
                  <Line type="monotone" dataKey="successful" stroke="#10b981" strokeWidth={2} name="Successful" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
