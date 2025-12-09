import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, Phone, Clock, ThumbsUp, ThumbsDown, Users, Target } from "lucide-react";

export function Analytics() {
  const stats = [
    { label: "Total Calls", value: "1,247", change: "+12%", icon: Phone, color: "from-blue-500 to-cyan-500" },
    { label: "Avg Call Duration", value: "4:32", change: "+8%", icon: Clock, color: "from-purple-500 to-pink-500" },
    { label: "Positive Sentiment", value: "78%", change: "+5%", icon: ThumbsUp, color: "from-green-500 to-emerald-500" },
    { label: "Conversion Rate", value: "34%", change: "+15%", icon: Target, color: "from-orange-500 to-red-500" },
  ];

  const agentPerformance = [
    { agent: "Sales Agent", calls: 234, avgDuration: "3:24", sentiment: 82, conversion: 38 },
    { agent: "Support Agent", calls: 189, avgDuration: "5:12", sentiment: 76, conversion: 28 },
    { agent: "Lead Qualifier", calls: 156, avgDuration: "2:45", sentiment: 71, conversion: 42 },
    { agent: "Appointment Setter", calls: 98, avgDuration: "4:18", sentiment: 85, conversion: 65 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 dark:text-white mb-2">Analytics & Reports</h1>
        <p className="text-slate-600 dark:text-slate-400">Track performance and gain insights from your AI agents</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all cursor-pointer hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="size-5 text-white" />
                </div>
                <Badge className="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50">
                  {stat.change}
                </Badge>
              </div>
              <div className="text-3xl text-slate-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-slate-600 dark:text-slate-400">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b dark:border-slate-800">
            <CardTitle className="dark:text-white">Call Volume Trend</CardTitle>
            <CardDescription className="dark:text-slate-400">Calls over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 flex items-end justify-between gap-2">
              {[45, 62, 58, 72, 68, 85, 92].map((height, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-slate-600 dark:text-slate-400 text-sm">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b dark:border-slate-800">
            <CardTitle className="dark:text-white">Sentiment Distribution</CardTitle>
            <CardDescription className="dark:text-slate-400">Call sentiment breakdown</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="size-4 text-green-500" />
                    <span className="text-slate-900 dark:text-white">Positive</span>
                  </div>
                  <span className="text-slate-900 dark:text-white">78%</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "78%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-blue-500" />
                    <span className="text-slate-900 dark:text-white">Neutral</span>
                  </div>
                  <span className="text-slate-900 dark:text-white">15%</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "15%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="size-4 text-red-500" />
                    <span className="text-slate-900 dark:text-white">Negative</span>
                  </div>
                  <span className="text-slate-900 dark:text-white">7%</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: "7%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b dark:border-slate-800">
          <CardTitle className="dark:text-white">Agent Performance</CardTitle>
          <CardDescription className="dark:text-slate-400">Detailed metrics for each agent</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-slate-800">
                  <th className="text-left py-3 px-4 text-slate-900 dark:text-white">Agent</th>
                  <th className="text-right py-3 px-4 text-slate-900 dark:text-white">Total Calls</th>
                  <th className="text-right py-3 px-4 text-slate-900 dark:text-white">Avg Duration</th>
                  <th className="text-right py-3 px-4 text-slate-900 dark:text-white">Sentiment</th>
                  <th className="text-right py-3 px-4 text-slate-900 dark:text-white">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.map((agent) => (
                  <tr key={agent.agent} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="py-3 px-4 text-slate-900 dark:text-white">{agent.agent}</td>
                    <td className="text-right py-3 px-4 text-slate-700 dark:text-slate-300">{agent.calls}</td>
                    <td className="text-right py-3 px-4 text-slate-700 dark:text-slate-300">{agent.avgDuration}</td>
                    <td className="text-right py-3 px-4">
                      <Badge className="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50">
                        {agent.sentiment}%
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-4">
                      <Badge className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50">
                        {agent.conversion}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <TrendingUp className="size-5 text-blue-600 dark:text-blue-400" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="size-2 bg-blue-500 rounded-full mt-2 shrink-0" />
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Peak hours:</strong> Most calls occur between 2-4 PM, consider scaling during these hours
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="size-2 bg-green-500 rounded-full mt-2 shrink-0" />
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Best performer:</strong> Appointment Setter has the highest conversion rate at 65%
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="size-2 bg-orange-500 rounded-full mt-2 shrink-0" />
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Improvement opportunity:</strong> Support Agent calls are 60% longer than average
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}