import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Loader2,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
  AudioLines,
} from "lucide-react";
import { chatWithAgent, voiceChatWithAgent } from "../lib/api";
import { toast } from "sonner";

const DEFAULT_SPEECH_LANGUAGE = "en-US";
const LANGUAGE_CODE_PATTERN = /^[a-z]{2,3}(?:[-_][a-z]{2,4})?$/i;
const LANGUAGE_ALIASES: Record<string, string> = {
  "english": "en-US",
  "english (us)": "en-US",
  "english us": "en-US",
  "english (uk)": "en-GB",
  "english uk": "en-GB",
  "british english": "en-GB",
  "spanish": "es-ES",
  "spanish (mexico)": "es-MX",
  "spanish mexico": "es-MX",
  "spanish (latin america)": "es-MX",
  "french": "fr-FR",
  "german": "de-DE",
  "italian": "it-IT",
  "portuguese": "pt-PT",
  "portuguese (brazil)": "pt-BR",
  "portuguese brazil": "pt-BR",
  "japanese": "ja-JP",
  "korean": "ko-KR",
  "chinese": "zh-CN",
  "chinese (mandarin)": "zh-CN",
  "hindi": "hi-IN",
  "dutch": "nl-NL",
  "swedish": "sv-SE",
  "norwegian": "nb-NO",
};

function resolveSpeechLanguage(language?: string | null): string {
  if (!language) return DEFAULT_SPEECH_LANGUAGE;
  const trimmed = language.trim();
  if (!trimmed) return DEFAULT_SPEECH_LANGUAGE;

  const candidate = trimmed.replace(/_/g, "-");
  if (LANGUAGE_CODE_PATTERN.test(candidate)) {
    const [base, region] = candidate.split("-");
    if (region) {
      return `${base.toLowerCase()}-${region.toUpperCase()}`;
    }
    return base.toLowerCase();
  }

  const normalized = candidate.toLowerCase();
  if (LANGUAGE_ALIASES[normalized]) {
    return LANGUAGE_ALIASES[normalized];
  }

  const normalizedWithoutParens = normalized.replace(/\s*\([^)]*\)/g, "").trim();
  if (LANGUAGE_ALIASES[normalizedWithoutParens]) {
    return LANGUAGE_ALIASES[normalizedWithoutParens];
  }

  return DEFAULT_SPEECH_LANGUAGE;
}

type SpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
};

interface AgentChatModalProps {
  agent: { id: number; name: string };
  onClose: () => void;
}

type ChatMessage = { role: "user" | "assistant"; content: string; voice?: boolean };

export function AgentChatModal({ agent, onClose }: AgentChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `You're now connected to ${agent.name}. Ask anything to begin the conversation.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [voicePlaybackEnabled, setVoicePlaybackEnabled] = useState(true);
  const [voiceSupport, setVoiceSupport] = useState({
    recognition: false,
    synthesis: typeof window !== "undefined" && "speechSynthesis" in window,
  });
  const [mediaRecorderSupported, setMediaRecorderSupported] = useState(false);
  const [speechWarning, setSpeechWarning] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMediaRecorderSupported(
      typeof window !== "undefined" &&
        typeof window.MediaRecorder !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia
    );
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;
    if (!SpeechRecognition) return;
    setVoiceSupport((prev) => ({ ...prev, recognition: true }));
    const recognition = new SpeechRecognition();
    recognition.lang = resolveSpeechLanguage((agent as any)?.language);
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setInput(transcript);
      const isFinal = event.results[event.results.length - 1].isFinal;
      if (isFinal) {
        sendMessage(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      const message =
        event.error === "not-allowed"
          ? "Microphone permission denied. Allow access (try https://localhost)."
          : event.error === "no-speech"
            ? "No speech detected. Try again."
            : event.error || "Speech recognition error";
      setSpeechWarning(message);
      toast.error(message);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [agent]);

  useEffect(() => {
    if (!voiceSupport.synthesis || !voicePlaybackEnabled) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant" || lastMessage.voice) return;
    const utterance = new SpeechSynthesisUtterance(lastMessage.content);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [messages, voicePlaybackEnabled, voiceSupport.synthesis]);

  useEffect(() => {
    if (voicePlaybackEnabled) return;
    audioPlayerRef.current?.pause();
    audioPlayerRef.current = null;
    if (voiceSupport.synthesis) {
      window.speechSynthesis?.cancel();
    }
  }, [voicePlaybackEnabled, voiceSupport.synthesis]);

  const appendMessage = (message: ChatMessage) =>
    setMessages((prev) => [...prev, message]);

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text) return;
    appendMessage({ role: "user", content: text });
    if (!overrideText) setInput("");
    setIsSending(true);

    try {
      const history = [...messages, { role: "user", content: text }].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const response = await chatWithAgent(agent.id, {
        message: text,
        history,
      });
      appendMessage({ role: "assistant", content: response.reply });
    } catch (error: any) {
      toast.error(error?.message || "Failed to contact agent");
    } finally {
      setIsSending(false);
    }
  };

  const sendVoiceBlob = async (blob: Blob) => {
    setIsUploadingVoice(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await voiceChatWithAgent(agent.id, blob, history);

      if (response.transcript) {
        appendMessage({ role: "user", content: response.transcript });
      }

      appendMessage({ role: "assistant", content: response.reply, voice: !!response.audio });

      if (voicePlaybackEnabled && response.audio) {
        audioPlayerRef.current?.pause();
        audioPlayerRef.current = new Audio(`data:audio/mpeg;base64,${response.audio}`);
        audioPlayerRef.current.play().catch(() => {});
      }
    } catch (error: any) {
      toast.error(error?.message || "Voice upload failed");
    } finally {
      setIsUploadingVoice(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      return;
    }
    try {
      recognitionRef.current.start();
      setInput("");
      setSpeechWarning(null);
      setIsListening(true);
    } catch (error: any) {
      const message = error?.message || "Microphone error";
      toast.error(message);
      setSpeechWarning(message);
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        audioChunksRef.current = [];
        if (blob.size > 0) sendVoiceBlob(blob);
      };
      recorder.start();
      setIsRecording(true);
      setSpeechWarning(null);
    } catch (error: any) {
      const message = error?.message || "Failed to access microphone";
      setSpeechWarning(message);
      toast.error(message);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleClose = () => {
    recognitionRef.current?.stop();
    if (isRecording) stopRecording();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    audioPlayerRef.current?.pause();
    audioPlayerRef.current = null;
    window.speechSynthesis?.cancel();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chat with {agent.name}</CardTitle>
          <div className="flex items-center gap-2">
            {voiceSupport.synthesis && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setVoicePlaybackEnabled((prev) => !prev)}
                title={voicePlaybackEnabled ? "Mute agent audio" : "Enable agent audio"}
              >
                {voicePlaybackEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 gap-4">
          {(!voiceSupport.recognition || speechWarning) && (
            <Alert variant="warning">
              <AlertDescription>
                {speechWarning ||
                  "Chrome blocks the Web Speech API on insecure origins. Use https://localhost or the server-side recorder below."}
              </AlertDescription>
            </Alert>
          )}
          <div className="flex-1 border rounded-lg p-4 bg-slate-50 overflow-y-auto" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-white text-slate-900"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-end gap-2">
              <Textarea
                placeholder={`Ask ${agent.name} anything...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                className="min-h-[80px] resize-none"
              />
              {voiceSupport.recognition && (
                <Button
                  type="button"
                  variant={isListening ? "default" : "outline"}
                  onClick={toggleListening}
                  className="self-stretch"
                  title={isListening ? "Stop listening" : "Speak"}
                >
                  {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                </Button>
              )}
              <Button onClick={() => sendMessage()} disabled={isSending || !input.trim()} className="self-stretch">
                {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </div>

            {mediaRecorderSupported && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Button
                  type="button"
                  variant={isRecording ? "default" : "outline"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isUploadingVoice}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="size-4 mr-2" />
                      Stop recording
                    </>
                  ) : (
                    <>
                      <AudioLines className="size-4 mr-2" />
                      Speak (server-side)
                    </>
                  )}
                </Button>
                {isUploadingVoice && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="size-4 animate-spin" />
                    Processing voice message…
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
