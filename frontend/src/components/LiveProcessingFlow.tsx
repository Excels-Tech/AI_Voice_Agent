import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowRight, Zap } from "lucide-react";

export function LiveProcessingFlow() {
  return (
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="size-5 text-blue-600" />
          Real-Time Processing Flow (Live Communication)
        </CardTitle>
        <CardDescription>
          From spoken word to instant answer - all while the meeting is happening
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Desktop Timeline */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-3">
              {[
                { time: "0ms", event: "Sara speaks", color: "blue" },
                { time: "100ms", event: "Audio captured", color: "purple" },
                { time: "500ms", event: "Text transcribed", color: "pink" },
                { time: "700ms", event: "Intent tagged", color: "orange" },
                { time: "800ms", event: "Stored in vector DB", color: "green" },
                { time: "Ready", event: "Available for Q&A", color: "indigo" },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 flex-1">
                  <div className="text-center flex-1">
                    <div className={`size-16 rounded-full bg-${step.color}-500 flex items-center justify-center text-white mb-2 mx-auto shadow-lg`}>
                      <span className="font-mono">{step.time}</span>
                    </div>
                    <p className="text-slate-700">{step.event}</p>
                  </div>
                  {idx < 5 && <ArrowRight className="size-6 text-slate-400 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="lg:hidden space-y-4">
            {[
              { time: "0ms", event: "Sara speaks", color: "blue" },
              { time: "100ms", event: "Audio captured", color: "purple" },
              { time: "500ms", event: "Text transcribed", color: "pink" },
              { time: "700ms", event: "Intent tagged", color: "orange" },
              { time: "800ms", event: "Stored in vector DB", color: "green" },
              { time: "Ready", event: "Available for Q&A", color: "indigo" },
            ].map((step, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-3">
                  <div className={`size-12 rounded-full bg-${step.color}-500 flex items-center justify-center text-white shadow-lg shrink-0`}>
                    <span className="text-sm font-mono">{step.time}</span>
                  </div>
                  <p className="text-slate-700">{step.event}</p>
                </div>
                {idx < 5 && (
                  <div className="flex justify-center my-2">
                    <ArrowRight className="size-6 text-slate-400 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Key Point */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-300">
            <div className="flex items-start gap-3">
              <Zap className="size-6 text-green-600 shrink-0 mt-1" />
              <div>
                <h4 className="text-slate-900 mb-2">Total Latency: Less than 1 second</h4>
                <p className="text-slate-700 mb-3">
                  From the moment someone speaks until the information is available for instant Q&A queries. 
                  You can ask questions about what was just said <strong>while the meeting is still happening</strong>.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-500">Real-Time</Badge>
                  <Badge className="bg-blue-500">WebSocket Streaming</Badge>
                  <Badge className="bg-purple-500">Live Processing</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
