import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import {
  X,
  PhoneOff,
  PhoneCall,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Grid3x3,
  Lightbulb,
  Phone,
  CheckCircle2,
  Loader2,
  Delete,
} from "lucide-react";
import { toast } from "sonner";
import { useLiveCallSession, TranscriptEntry } from "../hooks/useLiveCallSession";

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

const KEYPAD = [
  { primary: "1", secondary: "" },
  { primary: "2", secondary: "ABC" },
  { primary: "3", secondary: "DEF" },
  { primary: "4", secondary: "GHI" },
  { primary: "5", secondary: "JKL" },
  { primary: "6", secondary: "MNO" },
  { primary: "7", secondary: "PQRS" },
  { primary: "8", secondary: "TUV" },
  { primary: "9", secondary: "WXYZ" },
  { primary: "*", secondary: "" },
  { primary: "0", secondary: "+" },
  { primary: "#", secondary: "" },
];

export function TestCallModal({ agent, onClose }: TestCallModalProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>(agent.phoneNumber || "");
  const [showKeypad, setShowKeypad] = useState(false);
  const {
    isCallActive,
    isStarting,
    callDuration,
    status,
    microphoneStatus,
    isRecordingUtterance,
    isMicrophoneMuted,
    isAssistantAudioMuted,
    transcript,
    error,
    startCall,
    stopCall,
    startUtteranceRecording,
    stopUtteranceRecording,
    toggleMicrophoneMute,
    toggleAssistantAudioMute,
    sendUserText,
  } = useLiveCallSession(agent.id);

  const isListening = isRecordingUtterance && !isMicrophoneMuted && microphoneStatus === "ready";
  const isConnected = status === "connected" || isCallActive;

  const latestAssistantLine = useMemo<TranscriptEntry | null>(() => {
    const reversed = [...transcript].reverse();
    return reversed.find((entry) => entry.role === "assistant") || null;
  }, [transcript]);

  const latestUserLine = useMemo<TranscriptEntry | null>(() => {
    const reversed = [...transcript].reverse();
    return reversed.find((entry) => entry.role === "user") || null;
  }, [transcript]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (isCallActive && !isRecordingUtterance && microphoneStatus === "ready") {
      startUtteranceRecording();
    }
  }, [isCallActive, isRecordingUtterance, microphoneStatus, startUtteranceRecording]);

  const handleStart = async () => {
    if (!agent.id) {
      toast.error("Missing agent id");
      return;
    }
    try {
      await startCall({
        phoneNumber: phoneNumber || "web-demo",
        callerName: "Test Agent",
        language: agent.language,
      });
      setShowKeypad(false);
    } catch (err: any) {
      toast.error(err?.message || "Unable to start call");
    }
  };

  const handleEndCall = () => {
    stopUtteranceRecording();
    stopCall();
    setTimeout(() => onClose(), 150);
  };

  const appendDigit = (digit: string) => {
    setPhoneNumber((prev) => `${prev}${digit}`);
    if (isConnected) {
      sendUserText(digit);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl relative overflow-hidden border border-slate-200 flex flex-col">
        <div className="px-8 pt-6 pb-5 border-b border-slate-200">
          <button
            type="button"
            onClick={handleEndCall}
            className="absolute right-4 top-4 p-2 rounded-full text-slate-500 hover:bg-slate-100 transition"
          >
            <X className="size-5" />
          </button>
          <p className="text-xl font-semibold text-slate-900">Test Agent</p>
          <p className="text-slate-500 text-base">Call with {agent.name || "Customer Support Agent"}</p>
        </div>

        {!isConnected && (
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            <div className="space-y-2">
              <label className="text-slate-700 font-semibold">Phone Number</label>
              <div className="flex items-center gap-2">
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="text-lg py-3"
                />
                <Button variant="ghost" size="icon" onClick={handleBackspace} title="Clear last digit">
                  <Delete className="size-4 text-slate-500" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {KEYPAD.map((key) => (
                <button
                  key={key.primary}
                  onClick={() => appendDigit(key.primary)}
                  className="rounded-xl border border-slate-200 py-4 bg-white hover:bg-slate-50 shadow-sm transition flex flex-col items-center"
                >
                  <span className="text-xl text-slate-900 font-semibold">{key.primary}</span>
                  {key.secondary && <span className="text-xs text-slate-500">{key.secondary}</span>}
                </button>
              ))}
            </div>

            <Button
              onClick={handleStart}
              disabled={isStarting}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg flex items-center justify-center gap-2 rounded-lg"
            >
              {isStarting ? <Loader2 className="size-5 animate-spin" /> : <Phone className="size-5" />}
              Start Call
            </Button>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 font-semibold">
                  <Lightbulb className="size-4" />
                  Quick Tips
                </div>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li>Call connects within 10 seconds</li>
                  <li>Fully recorded and transcribed</li>
                  <li>Use controls to mute or enable speaker</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {isConnected && (
          <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="size-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <PhoneCall className="size-9 text-white" />
                </div>
                <span className="absolute -right-3 -top-2 bg-white border border-green-200 text-green-700 text-xs px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <CheckCircle2 className="size-4" />
                  {status === "connected" ? "Connected" : "Connecting"}
                </span>
              </div>
              <div className="text-center space-y-1">
                <p className="text-slate-900 font-semibold text-lg">{agent.name || "Customer Support Agent"}</p>
                <p className="text-slate-500 text-sm">{phoneNumber || "Live session"}</p>
              </div>
              <div className="bg-slate-100 text-slate-700 rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-sm">
                <span className="size-2 rounded-full bg-rose-500" />
                {formatDuration(callDuration)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-rose-500 text-sm font-semibold">
                <span className="size-2 rounded-full bg-rose-500" />
                Live Transcript
              </div>
              <div className="space-y-2 text-slate-900">
                <p>
                  <span className="text-indigo-600 font-semibold mr-1">AI:</span>
                  {latestAssistantLine?.text || "Waiting for the agent to respond..."}
                </p>
                {latestUserLine?.text ? (
                  <p className="text-slate-700">
                    <span className="text-slate-600 font-semibold mr-1">You:</span>
                    {latestUserLine.text}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={toggleMicrophoneMute}
                className={`rounded-xl border py-4 flex flex-col items-center gap-2 transition shadow-sm ${isMicrophoneMuted
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
              >
                {isMicrophoneMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                <span className="text-sm">Mute</span>
              </button>
              <button
                onClick={() => setShowKeypad((prev) => !prev)}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-4 flex flex-col items-center gap-2 shadow-sm"
              >
                <Grid3x3 className="size-5" />
                <span className="text-sm">Keypad</span>
              </button>
              <button
                onClick={toggleAssistantAudioMute}
                className={`rounded-xl border py-4 flex flex-col items-center gap-2 transition shadow-sm ${isAssistantAudioMuted
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
              >
                {isAssistantAudioMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                <span className="text-sm">Speaker</span>
              </button>
            </div>

            {showKeypad && (
              <div className="grid grid-cols-3 gap-3">
                {KEYPAD.map((key) => (
                  <button
                    key={`connected-${key.primary}`}
                    onClick={() => appendDigit(key.primary)}
                    className="rounded-lg border border-slate-200 py-3 bg-white hover:bg-slate-50 transition flex flex-col items-center shadow-sm"
                  >
                    <span className="text-lg text-slate-900 font-semibold">{key.primary}</span>
                    {key.secondary && <span className="text-[11px] text-slate-500">{key.secondary}</span>}
                  </button>
                ))}
              </div>
            )}

            <Button
              onClick={handleEndCall}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 text-lg flex items-center justify-center gap-2 rounded-lg shadow-sm"
            >
              <PhoneOff className="size-5" />
              End Call
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
