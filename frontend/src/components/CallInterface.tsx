import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Pause,
  Play,
  X,
  User,
  Signal,
  Circle
} from "lucide-react";
import { toast } from "sonner";

interface CallInterfaceProps {
  agentName: string;
  phoneNumber: string;
  onClose: () => void;
}

export function CallInterface({ agentName, phoneNumber, onClose }: CallInterfaceProps) {
  const [isCallActive, setIsCallActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [transcript, setTranscript] = useState([
    { id: 1, speaker: 'agent', text: 'Hello! Thanks for calling. How can I help you today?', timestamp: '00:01' },
    { id: 2, speaker: 'user', text: 'Hi, I want to test the AI voice agent.', timestamp: '00:04' },
    { id: 3, speaker: 'agent', text: 'Absolutely! I\'m happy to help you test my capabilities. What would you like to know?', timestamp: '00:07' }
  ]);

  useEffect(() => {
    if (!isCallActive || isPaused) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isCallActive, isPaused]);

  useEffect(() => {
    // Simulate new transcript messages
    const transcriptInterval = setInterval(() => {
      if (isCallActive && !isPaused && callDuration > 10 && callDuration % 8 === 0) {
        const newMessages = [
          'That sounds great! Tell me more about that.',
          'I understand. Let me help you with that.',
          'Perfect! Is there anything else you\'d like to know?',
          'I\'m here to assist you with any questions you might have.'
        ];
        const randomMessage = newMessages[Math.floor(Math.random() * newMessages.length)];
        setTranscript(prev => [...prev, {
          id: prev.length + 1,
          speaker: Math.random() > 0.5 ? 'agent' : 'user',
          text: randomMessage,
          timestamp: formatDuration(callDuration)
        }]);
      }
    }, 1000);

    return () => clearInterval(transcriptInterval);
  }, [callDuration, isCallActive, isPaused]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    toast.success("Call ended. Recording saved to Call Logs.");
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? "Microphone unmuted" : "Microphone muted");
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast.info(isSpeakerOn ? "Speaker off" : "Speaker on");
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? "Call resumed" : "Call paused");
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 z-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Call Interface */}
      <div className="relative w-full max-w-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Call Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Connection Quality Indicator */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Signal className={`w-4 h-4 ${
                connectionQuality === 'excellent' ? 'text-emerald-400' :
                connectionQuality === 'good' ? 'text-amber-400' : 'text-red-400'
              }`} />
              <span className="text-white/80 text-sm capitalize">{connectionQuality} connection</span>
            </div>
            {isCallActive && (
              <div className="flex items-center gap-2">
                <Circle className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                <span className="text-white/80 text-sm">Recording</span>
              </div>
            )}
          </div>

          {/* Agent Info & Duration */}
          <div className="text-center mb-12">
            {/* Avatar */}
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                <User className="w-16 h-16 text-white" />
              </div>
              {/* Animated ring for active call */}
              {isCallActive && !isPaused && (
                <>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-ping opacity-75"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-pulse"></div>
                </>
              )}
            </div>

            {/* Agent Name & Number */}
            <h2 className="text-white mb-2">{agentName}</h2>
            <p className="text-white/60 mb-4">{phoneNumber}</p>

            {/* Call Duration */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-white/60">Duration</span>
              <span className="text-white font-mono">{formatDuration(callDuration)}</span>
            </div>

            {isPaused && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full">
                <Pause className="w-4 h-4 text-amber-400" />
                <span className="text-amber-200 text-sm">Call Paused</span>
              </div>
            )}
          </div>

          {/* Live Transcript */}
          <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 max-h-48 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-sm">Live Transcript</span>
            </div>
            <div className="space-y-3">
              {transcript.map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                  <span className="text-white/40 text-xs mt-1">{message.timestamp}</span>
                  <div className="flex-1">
                    <span className={`text-sm ${
                      message.speaker === 'agent' ? 'text-indigo-300' : 'text-emerald-300'
                    }`}>
                      {message.speaker === 'agent' ? 'Agent' : 'You'}:
                    </span>
                    <span className="text-white/90 text-sm ml-2">{message.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`p-5 rounded-full transition-all duration-300 ${
                isMuted
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
                  : 'bg-white/10 hover:bg-white/20 border border-white/20'
              }`}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Pause/Resume Button */}
            <button
              onClick={togglePause}
              className="p-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
            >
              {isPaused ? (
                <Play className="w-6 h-6 text-white" />
              ) : (
                <Pause className="w-6 h-6 text-white" />
              )}
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="p-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-2xl shadow-red-500/50 transition-all duration-300 hover:scale-110"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>

            {/* Speaker Button */}
            <button
              onClick={toggleSpeaker}
              className={`p-5 rounded-full transition-all duration-300 ${
                !isSpeakerOn
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/50'
                  : 'bg-white/10 hover:bg-white/20 border border-white/20'
              }`}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-6 h-6 text-white" />
              ) : (
                <VolumeX className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Add to Conference */}
            <button
              className="p-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
            >
              <Phone className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Control Labels */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-white/40 text-xs w-16 text-center">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
            <span className="text-white/40 text-xs w-16 text-center">
              {isPaused ? 'Resume' : 'Pause'}
            </span>
            <span className="text-white/40 text-xs w-20 text-center">End Call</span>
            <span className="text-white/40 text-xs w-16 text-center">
              {isSpeakerOn ? 'Speaker' : 'Speaker'}
            </span>
            <span className="text-white/40 text-xs w-16 text-center">Add</span>
          </div>
        </div>

        {/* Call Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <p className="text-white/60 text-sm mb-1">Quality</p>
            <p className="text-white capitalize">{connectionQuality}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <p className="text-white/60 text-sm mb-1">Latency</p>
            <p className="text-white">24ms</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <p className="text-white/60 text-sm mb-1">Bitrate</p>
            <p className="text-white">128kbps</p>
          </div>
        </div>
      </div>
    </div>
  );
}
