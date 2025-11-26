import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { X, Play, Volume2, Maximize2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VideoDemoProps {
  onClose: () => void;
}

export function VideoDemo({ onClose }: VideoDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl bg-slate-900 border-slate-700">
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors z-10"
          >
            <X className="size-4 text-white" />
          </button>

          <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-t-lg flex items-center justify-center relative overflow-hidden">
            {/* Video Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              {!isPlaying ? (
                <div className="text-center">
                  <button
                    onClick={() => {
                      setIsPlaying(true);
                      toast.success("Playing demo video...");
                    }}
                    className="size-24 rounded-full bg-blue-600 flex items-center justify-center mb-4 mx-auto cursor-pointer hover:bg-blue-700 transition-colors hover:scale-110 transform"
                  >
                    <Play className="size-12 text-white ml-2" />
                  </button>
                  <h3 className="text-white mb-2">VoiceAI Platform Demo</h3>
                  <p className="text-slate-400">See how AI voice agents work in real-time</p>
                </div>
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-pulse mb-4">
                      <div className="size-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
                        <Volume2 className="size-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-white mb-2">Demo Video Playing...</h3>
                    <p className="text-slate-400">Duration: 3:24</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls */}
            {isPlaying && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-4 text-white">
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      toast.success("Paused");
                    }}
                    className="p-2 hover:bg-white/20 rounded"
                  >
                    <Play className="size-5" />
                  </button>
                  <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-1/3 rounded-full" />
                  </div>
                  <span className="text-sm">1:08 / 3:24</span>
                  <button className="p-2 hover:bg-white/20 rounded">
                    <Volume2 className="size-5" />
                  </button>
                  <button className="p-2 hover:bg-white/20 rounded">
                    <Maximize2 className="size-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-700">
            <h4 className="text-white mb-3">What you'll learn:</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <div className="size-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                <p className="text-slate-300">Create an AI voice agent in under 3 minutes</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="size-2 bg-green-500 rounded-full mt-2 shrink-0" />
                <p className="text-slate-300">See real-time call handling and transcription</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="size-2 bg-purple-500 rounded-full mt-2 shrink-0" />
                <p className="text-slate-300">Automatic sentiment analysis and lead scoring</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="size-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                <p className="text-slate-300">Integration with CRM and automation tools</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
