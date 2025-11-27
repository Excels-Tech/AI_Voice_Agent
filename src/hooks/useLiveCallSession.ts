import { useCallback, useEffect, useRef, useState } from "react";
import {
  createLiveCallSession,
  getApiBase,
  LiveCallSessionResponse,
} from "../lib/api";

type ConnectionStatus = "idle" | "connecting" | "connected";
type MicrophoneStatus = "idle" | "ready" | "blocked";

type TranscriptToken = { text: string; isWord: boolean };

export interface TranscriptEntry {
  id: string;
  role: "user" | "assistant" | string;
  text: string;
  timestamp: number;
  tokens?: TranscriptToken[];
  highlightedWordIndex?: number;
}

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  // Faster conversion for larger buffers
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 0x8000) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000) as any);
  }
  return btoa(binary);
};

const base64ToBlob = (base64: string, mime = "audio/webm") => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
};

const tokenizeText = (text: string): TranscriptToken[] =>
  text.split(/(\s+)/).map((token) => ({
    text: token,
    isWord: /\S+/.test(token),
  }));

const countWordTokens = (tokens?: TranscriptToken[]) =>
  tokens?.reduce((count, token) => (token.isWord ? count + 1 : count), 0) ?? 0;

interface StartCallParams {
  phoneNumber: string;
  callerName?: string;
  language?: string;
}

export function useLiveCallSession(agentId?: number) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [microphoneStatus, setMicrophoneStatus] = useState<MicrophoneStatus>("idle");
  const [isRecordingUtterance, setIsRecordingUtterance] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<LiveCallSessionResponse | null>(null);
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(false);
  const [isAssistantAudioMuted, setIsAssistantAudioMuted] = useState(false);

  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const utteranceChunksRef = useRef<Blob[]>([]);
  const silenceTimeoutRef = useRef<number | null>(null);
  const audioPlayersRef = useRef<Set<HTMLAudioElement>>(new Set());

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const stopAllAssistantAudio = useCallback(() => {
    audioPlayersRef.current.forEach((player) => {
      try {
        player.pause();
        player.currentTime = 0;
        if (player.src) {
          URL.revokeObjectURL(player.src);
        }
      } catch (err) {
        console.warn("Failed to stop audio player", err);
      }
    });
    audioPlayersRef.current.clear();
  }, []);

  const updateTranscriptHighlight = useCallback((messageId: string, wordIndex: number) => {
    setTranscript((prev) =>
      prev.map((entry) =>
        entry.id === messageId
          ? { ...entry, highlightedWordIndex: wordIndex }
          : entry
      )
    );
  }, []);

  const cleanup = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    setIsRecordingUtterance(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    utteranceChunksRef.current = [];
    if (silenceTimeoutRef.current) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    stopAllAssistantAudio();
    setStatus("idle");
    setIsCallActive(false);
    setSessionInfo(null);
    setIsMicrophoneMuted(false);
    setIsAssistantAudioMuted(false);
  }, [stopAllAssistantAudio]);

  const handleAssistantAudio = useCallback(
    (payload: { data?: string; message_id?: string }) => {
      if (!payload?.data) return;
      if (isAssistantAudioMuted) {
        if (payload.message_id) {
          updateTranscriptHighlight(payload.message_id, -1);
        }
        return;
      }
      try {
        const blob = base64ToBlob(payload.data);
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioPlayersRef.current.add(audio);
        const cleanupPlayer = () => {
          audioPlayersRef.current.delete(audio);
          URL.revokeObjectURL(url);
          if (payload.message_id) {
            updateTranscriptHighlight(payload.message_id, -1);
          }
        };
        audio.onended = cleanupPlayer;
        audio.onpause = () => {
          if (audioPlayersRef.current.has(audio)) {
            cleanupPlayer();
          }
        };
        if (payload.message_id) {
          audio.addEventListener("loadedmetadata", () => {
            const entry = transcriptRef.current.find((t) => t.id === payload.message_id);
            const totalWords = countWordTokens(entry?.tokens);
            if (!totalWords) return;
            const handleTimeUpdate = () => {
              if (!audio.duration || !Number.isFinite(audio.duration) || audio.duration === 0) return;
              const progress = Math.min(1, audio.currentTime / audio.duration);
              const nextIndex = Math.min(totalWords - 1, Math.floor(progress * totalWords));
              updateTranscriptHighlight(payload.message_id!, nextIndex);
            };
            audio.addEventListener("timeupdate", handleTimeUpdate);
          });
        }
        audio.play().catch(() => {
          /* ignore autoplay errors */
        });
      } catch (err) {
        console.error("Failed to play assistant audio", err);
      }
    },
    [isAssistantAudioMuted, updateTranscriptHighlight],
  );

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      let parsed: any = null;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (parsed?.type) {
        case "connected":
          setStatus("connected");
          setIsCallActive(true);
          break;
        case "transcript":
          if (parsed.text) {
            const messageId = parsed.message_id || `${Date.now()}-${Math.random()}`;
            const tokens = parsed.role === "assistant" ? tokenizeText(parsed.text) : undefined;
            setTranscript((prev) => [
              ...prev,
              {
                id: messageId,
                role: parsed.role ?? "assistant",
                text: parsed.text,
                timestamp: Date.now(),
                tokens,
                highlightedWordIndex: tokens ? -1 : undefined,
              },
            ]);
          }
          break;
        case "audio_chunk":
          handleAssistantAudio(parsed);
          break;
        case "warning":
          setError(parsed.message ?? "Call warning");
          break;
        case "error":
          setError(parsed.message ?? "Call failed");
          break;
        case "ended":
          cleanup();
          break;
        default:
          break;
      }
    },
    [cleanup, handleAssistantAudio]
  );

  const ensureMicrophone = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicrophoneStatus("ready");
      return stream;
    } catch (err) {
      console.error("Microphone permission denied", err);
      setMicrophoneStatus("blocked");
      throw err;
    }
  }, []);

  const flushUtteranceChunks = useCallback(async () => {
    const chunks = utteranceChunksRef.current;
    utteranceChunksRef.current = [];
    if (!chunks.length || wsRef.current?.readyState !== WebSocket.OPEN) {
      return;
    }
    // Prefer Ogg/Opus if supported; fall back to webm
    const firstType = chunks[0]?.type || "";
    const mimeType = firstType.includes("ogg") ? "audio/ogg" : "audio/webm";
    const fileExtension = mimeType === "audio/ogg" ? ".ogg" : ".webm";
    const blob = new Blob(chunks, { type: mimeType });
    const base64 = await arrayBufferToBase64(await blob.arrayBuffer());
    wsRef.current?.send(
      JSON.stringify({
        type: "audio_chunk",
        data: base64,
        file_extension: fileExtension,
      }),
    );
    wsRef.current?.send(JSON.stringify({ type: "end_utterance" }));
  }, []);

  const startDurationTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    setCallDuration(0);
    timerRef.current = window.setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const startUtteranceRecording = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("Call is not connected yet");
      return;
    }
    if (isRecordingUtterance) return;

    const stream = await ensureMicrophone();
    // Try an Ogg/Opus mime first (widely accepted by Whisper); fall back to webm
    let recorder: MediaRecorder;
    const preferredTypes = ["audio/ogg;codecs=opus", "audio/webm;codecs=opus", "audio/webm"];
    let chosenType: string | undefined;
    for (const mime of preferredTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        recorder = new MediaRecorder(stream, { mimeType: mime });
        chosenType = mime;
        break;
      }
    }
    if (!chosenType) {
      recorder = new MediaRecorder(stream);
      chosenType = recorder.mimeType;
    }
    recorderRef.current = recorder;
    utteranceChunksRef.current = [];
    setIsRecordingUtterance(true);
    setIsMicrophoneMuted(false);

    const scheduleFlush = () => {
      if (silenceTimeoutRef.current) {
        window.clearTimeout(silenceTimeoutRef.current);
      }
      silenceTimeoutRef.current = window.setTimeout(() => {
        flushUtteranceChunks().catch((err) => {
          console.error("Failed to flush utterance chunk", err);
          setError("Failed to send audio");
        });
      }, 800);
    };

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size) {
        utteranceChunksRef.current.push(event.data);
        scheduleFlush();
      }
    };

    recorder.onstop = async () => {
      setIsRecordingUtterance(false);
      setIsMicrophoneMuted(false);
      if (silenceTimeoutRef.current) {
        window.clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      try {
        await flushUtteranceChunks();
      } catch (err) {
        console.error("Failed to send utterance chunk", err);
        setError("Failed to send audio");
      }
    };

    recorder.start(400);
  }, [ensureMicrophone, flushUtteranceChunks, isRecordingUtterance]);

  const stopUtteranceRecording = useCallback(() => {
    if (!recorderRef.current) return;
    try {
      if (recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    } catch (err) {
      console.error("Failed to stop recorder", err);
    } finally {
      recorderRef.current = null;
      if (silenceTimeoutRef.current) {
        window.clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    }
  }, []);

  const toggleMicrophoneMute = useCallback(() => {
    if (!recorderRef.current) {
      setIsMicrophoneMuted((prev) => !prev);
      return;
    }
    if (recorderRef.current.state === "inactive") return;
    try {
      if (isMicrophoneMuted) {
        recorderRef.current.resume();
        setIsMicrophoneMuted(false);
      } else {
        recorderRef.current.pause();
        setIsMicrophoneMuted(true);
      }
    } catch (err) {
      console.error("Failed to toggle microphone mute", err);
    }
  }, [isMicrophoneMuted]);

  const toggleAssistantAudioMute = useCallback(() => {
    setIsAssistantAudioMuted((prev) => {
      const next = !prev;
      if (next) {
        stopAllAssistantAudio();
      }
      return next;
    });
  }, [stopAllAssistantAudio]);

  const startCall = useCallback(
    async ({ phoneNumber, callerName, language }: StartCallParams) => {
      if (!agentId) {
        setError("Cannot start call: missing agent");
        return;
      }

      setIsStarting(true);
      setError(null);
      setTranscript([]);

      try {
        await ensureMicrophone();
        const payload = {
          agent_id: agentId,
          caller_number: phoneNumber,
          caller_name: callerName,
          language,
        };
        const session = await createLiveCallSession(payload);
        setSessionInfo(session);
        setStatus("connecting");

        const wsUrl = new URL(session.websocket_path, getApiBase());
        wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";
        wsUrl.searchParams.set("token", session.session_token);

        startDurationTimer();

        const ws = new WebSocket(wsUrl.toString());
        wsRef.current = ws;
        ws.onmessage = handleMessage;
        ws.onclose = () => cleanup();
        ws.onerror = (evt) => {
          console.error("WebSocket error", evt);
          setError("Call connection error");
          cleanup();
        };
      } catch (err: any) {
        console.error("Failed to start live call", err);
        setError(err?.message || "Failed to start call");
        cleanup();
      } finally {
        setIsStarting(false);
      }
    },
    [agentId, cleanup, ensureMicrophone, handleMessage, startDurationTimer]
  );

  const stopCall = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "hangup" }));
    }
    stopAllAssistantAudio();
    cleanup();
  }, [cleanup, stopAllAssistantAudio]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isCallActive,
    isStarting,
    callDuration,
    status,
    microphoneStatus,
    isRecordingUtterance,
    isMicrophoneMuted,
    transcript,
    error,
    sessionInfo,
    startCall,
    stopCall,
    startUtteranceRecording,
    stopUtteranceRecording,
    toggleMicrophoneMute,
    isAssistantAudioMuted,
    toggleAssistantAudioMute,
  };
}
