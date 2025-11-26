import { useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { X, Phone, Mic, MicOff, Volume2, VolumeX, PhoneOff, Activity } from "lucide-react";
import { toast } from "sonner";
import { useLiveCallSession } from "../hooks/useLiveCallSession";

interface TestCallModalProps {
  agent: {
    id?: number;
    name: string;
    phoneNumber?: string;
    language?: string;
    voice?: string;
  };
  onClose: () => void;
}

export function TestCallModal({ agent, onClose }: TestCallModalProps) {
  const {
    isCallActive,
    callDuration,
    status,
    microphoneStatus,
    isRecordingUtterance,
    isMicrophoneMuted,
    isAssistantAudioMuted,
    error,
    startCall,
    stopCall,
    startUtteranceRecording,
    stopUtteranceRecording,
    toggleMicrophoneMute,
    toggleAssistantAudioMute,
  } = useLiveCallSession(agent.id);

  const isListening =
    isRecordingUtterance && !isMicrophoneMuted && microphoneStatus === "ready";

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Auto-start call on mount
  useEffect(() => {
    const initCall = async () => {
      if (!agent.id) return;
      try {
        await startCall({
          phoneNumber: agent.phoneNumber || "web-demo",
          callerName: "Demo User",
          language: agent.language,
        });
      } catch (err) {
        console.error("Failed to auto-start call", err);
      }
    };
    initCall();
  }, [agent.id, agent.phoneNumber, agent.language, startCall]);

  useEffect(() => {
    if (isCallActive && !isRecordingUtterance && microphoneStatus === "ready") {
      startUtteranceRecording();
    }
  }, [isCallActive, isRecordingUtterance, microphoneStatus, startUtteranceRecording]);

  const handleEndCall = () => {
    stopUtteranceRecording();
    stopCall();
    setTimeout(() => onClose(), 300);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleEndCall}
          className="absolute right-4 top-4 p-2 hover:bg-slate-800 rounded-full transition-colors z-10 text-slate-400 hover:text-white"
        >
          <X className="size-5" />
        </button>

        <CardContent className="p-8 flex flex-col items-center justify-between min-h-[500px]">
          {/* Header Info */}
          <div className="text-center space-y-2 mt-4">
            <Badge variant="outline" className="border-slate-700 text-slate-400 mb-4 px-3 py-1">
              {status === "connected" ? "Live Call" : "Connecting..."}
            </Badge>
            <h2 className="text-2xl font-semibold text-white tracking-tight">{agent.name}</h2>
            <p className="text-slate-400 text-sm font-medium">{agent.voice || "AI Assistant"}</p>
          </div>

          {/* Visualizer Area */}
          <div className="flex-1 flex items-center justify-center w-full py-8">
            <div className="relative">
              {/* Pulse Rings */}
              {status === "connected" && (
                <>
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping duration-[3s]" />
                  <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping duration-[2s] delay-75" />
                </>
              )}

              {/* Main Avatar Circle */}
              <div className={`size-32 rounded-full flex items-center justify-center transition-all duration-500 ${status === "connected"
                ? "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_0_40px_rgba(37,99,235,0.3)]"
                : "bg-slate-800"
                }`}>
                {status === "connected" ? (
                  <Activity className="size-12 text-white animate-pulse" />
                ) : (
                  <Phone className="size-12 text-slate-500 animate-pulse" />
                )}
              </div>

              {/* Listening Indicator */}
              {isListening && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-1 h-6 items-end">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-green-500 rounded-full animate-music-bar"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Timer */}
          <div className="mb-8 font-mono text-slate-500 text-lg tracking-wider">
            {formatDuration(callDuration)}
          </div>

          {/* Controls */}
          <div className="w-full space-y-6">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={toggleMicrophoneMute}
                className={`p-4 rounded-full transition-all duration-200 ${isMicrophoneMuted
                  ? "bg-slate-800 text-red-500 hover:bg-slate-700"
                  : "bg-slate-800 text-white hover:bg-slate-700 hover:scale-105"
                  }`}
              >
                {isMicrophoneMuted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
              </button>

              <button
                onClick={handleEndCall}
                className="p-5 rounded-full bg-red-600 text-white hover:bg-red-700 hover:scale-105 shadow-lg shadow-red-900/20 transition-all duration-200"
              >
                <PhoneOff className="size-8" />
              </button>

              <button
                onClick={toggleAssistantAudioMute}
                className={`p-4 rounded-full transition-all duration-200 ${isAssistantAudioMuted
                  ? "bg-slate-800 text-red-500 hover:bg-slate-700"
                  : "bg-slate-800 text-white hover:bg-slate-700 hover:scale-105"
                  }`}
              >
                {isAssistantAudioMuted ? <VolumeX className="size-6" /> : <Volume2 className="size-6" />}
              </button>
            </div>

            <p className="text-center text-xs text-slate-500">
              {isMicrophoneMuted ? "Microphone muted" : "Listening..."}
            </p>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
        .animate-music-bar {
          animation: music-bar 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
