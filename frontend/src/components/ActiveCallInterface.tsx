import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Pause, Play, User, Building2, Clock, Activity } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { toast } from "sonner@2.0.3";
import { useVoiceSession } from "../utils/useVoiceSession";

interface ActiveCallInterfaceProps {
  call: {
    id: string;
    name: string;
    company: string;
    phone: string;
    assignedAgent: {
      id: string;
      name: string;
      type: string;
    };
    topic: string;
  };
  onEndCall: () => void;
}

export function ActiveCallInterface({ call, onEndCall }: ActiveCallInterfaceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected'>('connecting');
  const {
    status: voiceStatus,
    error: voiceError,
    transcripts,
    assistantSpeaking,
    startSession,
    stopSession,
    setMuted: setVoiceMuted,
    setMicActive,
    setSpeakerEnabled,
  } = useVoiceSession();

  useEffect(() => {
    // Simulate call connection sequence
    const ringTimer = setTimeout(() => {
      setCallStatus('ringing');
    }, 1000);

    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
      toast.success('Call Connected!', {
        description: `Now speaking with ${call.name}`
      });
    }, 3000);

    // Duration counter
    let durationInterval: NodeJS.Timeout;
    const startDuration = setTimeout(() => {
      durationInterval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }, 3000);

    return () => {
      clearTimeout(ringTimer);
      clearTimeout(connectTimer);
      clearTimeout(startDuration);
      if (durationInterval) clearInterval(durationInterval);
    };
  }, [call.name]);

  // Kick off the live voice session once connected
  useEffect(() => {
    if (callStatus === 'connected') {
      startSession({
        agentId: Number(call.assignedAgent.id) || undefined,
        callerName: call.name,
        callerNumber: call.phone,
      });
    }
    return () => {
      stopSession();
    };
  }, [call.assignedAgent.id, call.name, call.phone, callStatus, startSession, stopSession]);

  // Sync mute/pause/speaker controls to the voice client
  useEffect(() => {
    setVoiceMuted(isMuted);
  }, [isMuted, setVoiceMuted]);

  useEffect(() => {
    setMicActive(!isPaused && !isMuted);
  }, [isPaused, isMuted, setMicActive]);

  useEffect(() => {
    setSpeakerEnabled(isSpeakerOn);
  }, [isSpeakerOn, setSpeakerEnabled]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    toast.success('Call Ended', {
      description: `Call with ${call.name} completed (${formatDuration(duration)})`
    });
    onEndCall();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <Card className="w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
          <div className="p-8">
            {/* Status Badge */}
            <div className="flex justify-center mb-6">
              <Badge className={`
                ${callStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : ''}
                ${callStatus === 'ringing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : ''}
                ${callStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : ''}
                border px-4 py-1.5 text-sm
              `}>
                {callStatus === 'connecting' && 'Connecting...'}
                {callStatus === 'ringing' && 'Ringing...'}
                {callStatus === 'connected' && 'Connected'}
                {voiceStatus === 'error' && 'Audio Error'}
              </Badge>
            </div>

            {/* Caller Avatar */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={callStatus === 'ringing' ? {
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{ repeat: callStatus === 'ringing' ? Infinity : 0, duration: 1.5 }}
                className="relative"
              >
                <div className="size-24 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="size-12 text-white" />
                </div>
                {callStatus === 'connected' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-2 -right-2 size-8 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-slate-900"
                  >
                    <Activity className="size-4 text-white" />
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Caller Info */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{call.name}</h3>
              {call.company && (
                <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
                  <Building2 className="size-4" />
                  <span>{call.company}</span>
                </div>
              )}
              {call.phone && (
                <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
                  <Phone className="size-4" />
                  <span>{call.phone}</span>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-cyan-400 mt-3">
                <User className="size-4" />
                <span className="text-sm">Agent: {call.assignedAgent.name}</span>
              </div>
            </div>

            {/* Topic */}
            {call.topic && (
              <div className="bg-slate-800/50 rounded-lg p-3 mb-6 border border-slate-700">
                <p className="text-sm text-slate-300 text-center">
                  <span className="text-slate-500">Topic: </span>
                  {call.topic}
                </p>
              </div>
            )}

            {/* Call Duration */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 text-white">
                <Clock className="size-5" />
                <span className="text-2xl font-mono">{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Call Controls */}
            <div className="flex justify-center gap-4 mb-6">
              <Button
                size="lg"
                variant="outline"
                className={`size-14 rounded-full border-2 ${
                  isMuted 
                    ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30' 
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
                onClick={() => setIsMuted(!isMuted)}
                disabled={callStatus !== 'connected'}
              >
                {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className={`size-14 rounded-full border-2 ${
                  isPaused 
                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 hover:bg-yellow-500/30' 
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
                onClick={() => setIsPaused(!isPaused)}
                disabled={callStatus !== 'connected'}
              >
                {isPaused ? <Play className="size-5" /> : <Pause className="size-5" />}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className={`size-14 rounded-full border-2 ${
                  !isSpeakerOn 
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400 hover:bg-orange-500/30' 
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                disabled={callStatus !== 'connected'}
              >
                {isSpeakerOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
              </Button>
            </div>

            {/* End Call Button */}
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white h-14 rounded-full"
              onClick={handleEndCall}
            >
              <PhoneOff className="size-6 mr-2" />
              End Call
            </Button>

            {/* AI Agent Status */}
            {callStatus === 'connected' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="size-2 rounded-full bg-emerald-400"
                  />
                  <span className="text-sm">
                    {assistantSpeaking ? "AI speaking..." : "AI listening..."}
                  </span>
                </div>
                {voiceError && (
                  <p className="text-red-400 text-xs mt-2">{voiceError}</p>
                )}
              </motion.div>
            )}

            {/* Transcript window */}
            {transcripts.length > 0 && (
              <div className="mt-6 bg-slate-800/40 border border-slate-700 rounded-lg p-3 max-h-48 overflow-y-auto text-left space-y-2">
                {transcripts.slice(-6).map((t, idx) => (
                  <div key={`${t.messageId || idx}-${idx}`} className="text-sm">
                    <span className="font-semibold text-slate-200 mr-2">
                      {t.role === "assistant" ? "AI" : "You"}:
                    </span>
                    <span className="text-slate-300">{t.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
