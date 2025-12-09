import { useState, useEffect } from "react";
import { X, Phone, Mic, MicOff, Volume2, VolumeX, Grid3x3, Lightbulb } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface TestCallModalProps {
  agentName: string;
  onClose: () => void;
}

export function TestCallModal({ agentName, onClose }: TestCallModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);

  useEffect(() => {
    if (!isCallActive) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNumberClick = (num: string) => {
    if (phoneNumber.length < 17) {
      setPhoneNumber(prev => {
        const cleaned = (prev + num).replace(/\D/g, '');
        if (cleaned.length === 0) return '';
        if (cleaned.length <= 1) return `+${cleaned}`;
        if (cleaned.length <= 4) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1)}`;
        if (cleaned.length <= 7) return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
        return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
      });
    }
  };

  const handleStartCall = () => {
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setIsCallActive(true);
    setCallDuration(0);
    setShowKeypad(false);
    toast.success("Call initiated...");
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
    setPhoneNumber("");
    setShowKeypad(false);
    toast.success("Call ended");
  };

  const keypadButtons = [
    { num: '1', letters: '' },
    { num: '2', letters: 'ABC' },
    { num: '3', letters: 'DEF' },
    { num: '4', letters: 'GHI' },
    { num: '5', letters: 'JKL' },
    { num: '6', letters: 'MNO' },
    { num: '7', letters: 'PQRS' },
    { num: '8', letters: 'TUV' },
    { num: '9', letters: 'WXYZ' },
    { num: '*', letters: '' },
    { num: '0', letters: '' },
    { num: '#', letters: '' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-slate-900 dark:text-white text-lg mb-1">Test Agent</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Call with {agentName}</p>
        </div>

        <div className="px-6 py-5">{!isCallActive ? (
            /* Dialer Interface */
            <div className="space-y-4">
              {/* Phone Number Display */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-sm mb-2">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-center text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  readOnly
                />
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-3">
                {keypadButtons.map((btn) => (
                  <button
                    key={btn.num}
                    onClick={() => handleNumberClick(btn.num)}
                    className="h-16 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-all active:scale-95"
                  >
                    <span className="text-slate-900 dark:text-white text-xl">{btn.num}</span>
                    {btn.letters && (
                      <span className="text-slate-600 dark:text-slate-400 text-xs -mt-1">{btn.letters}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Start Call Button */}
              <button
                onClick={handleStartCall}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm shadow-lg shadow-emerald-600/30"
              >
                <Phone className="w-4 h-4" />
                Start Call
              </button>

              {/* Quick Tips */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-orange-400 text-xs mb-1.5">Quick Tips</p>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-xs">
                      <li>• Call connects within 10 seconds</li>
                      <li>• Fully recorded and transcribed</li>
                      <li>• Use controls to mute or enable speaker</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Active Call Interface */
            <div className="space-y-4">
              {/* Call Status */}
              <div className="text-center py-3">
                <p className="text-slate-900 dark:text-white text-base mb-1">{agentName}</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">05366</p>

                <div className="flex items-center justify-center gap-2 text-slate-900 dark:text-white">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-lg">{formatDuration(callDuration)}</span>
                </div>
              </div>

              {/* Touch-tone keypad label - only show when keypad is visible */}
              {showKeypad && (
                <p className="text-center text-slate-600 dark:text-slate-400 text-sm">Touch-tone keypad</p>
              )}

              {/* Number Pad - only show when showKeypad is true */}
              {showKeypad && (
                <div className="grid grid-cols-3 gap-3">
                  {keypadButtons.map((btn) => (
                    <button
                      key={btn.num}
                      onClick={() => handleNumberClick(btn.num)}
                      className="h-16 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-all active:scale-95"
                    >
                      <span className="text-slate-900 dark:text-white text-xl">{btn.num}</span>
                      {btn.letters && (
                        <span className="text-slate-600 dark:text-slate-400 text-xs -mt-1">{btn.letters}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Call Controls */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`flex flex-col items-center gap-1.5 py-4 rounded-lg transition-all ${
                    isMuted
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600'
                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  <span className="text-xs">Mute</span>
                </button>

                <button
                  onClick={() => setShowKeypad(!showKeypad)}
                  className={`flex flex-col items-center gap-1.5 py-4 rounded-lg transition-all ${
                    showKeypad
                      ? 'bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                  <span className="text-xs">Keypad</span>
                </button>

                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`flex flex-col items-center gap-1.5 py-4 rounded-lg transition-all ${
                    isSpeakerOn
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600'
                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  <span className="text-xs">Speaker</span>
                </button>
              </div>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors text-sm shadow-lg shadow-red-600/30"
              >
                <Phone className="w-4 h-4 rotate-[135deg]" />
                End Call
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}