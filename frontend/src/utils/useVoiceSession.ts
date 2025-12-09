import { useCallback, useEffect, useRef, useState } from "react";

type Transcript = {
  role: "assistant" | "user";
  text: string;
  messageId?: string;
};

type SessionInfo = {
  session_id: string;
  session_token: string;
  websocket_path: string;
};

type StartOptions = {
  agentId?: number;
  callerName?: string;
  callerNumber?: string;
  language?: string;
};

/**
 * Lightweight client for the /api/calls/sessions/live/public + /ws/calls/live/{id} pipeline.
 * Handles mic capture, audio ring buffer playback, assistant speech gating, and transcripts.
 */
export function useVoiceSession() {
  const [status, setStatus] = useState<"idle" | "connecting" | "live" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playbackQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const mutedRef = useRef(false);
  const micPausedRef = useRef(false);
  const speakerEnabledRef = useRef(true);
  const apiBase = (import.meta.env.VITE_API_BASE as string | undefined) || window.location.origin;

  const cleanupMedia = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
  }, []);

  const cleanupAudio = useCallback(() => {
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    playbackQueueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  const stopSession = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    cleanupMedia();
    cleanupAudio();
    setStatus("idle");
    setAssistantSpeaking(false);
  }, [cleanupAudio, cleanupMedia]);

  const playNext = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) {
      setAssistantSpeaking(false);
      isPlayingRef.current = false;
      return;
    }
    const next = playbackQueueRef.current.shift();
    if (!next) {
      setAssistantSpeaking(false);
      isPlayingRef.current = false;
      micPausedRef.current = false;
      return;
    }
    isPlayingRef.current = true;
    micPausedRef.current = true; // gate mic while assistant speaks
    setAssistantSpeaking(true);
    const source = ctx.createBufferSource();
    source.buffer = next;
    source.connect(ctx.destination);
    source.onended = () => {
      playNext();
    };
    source.start();
  }, []);

  const enqueuePlayback = useCallback(
    async (base64Audio: string) => {
      if (!speakerEnabledRef.current) return;
      const ctx = audioCtxRef.current || new AudioContext();
      audioCtxRef.current = ctx;

      const arrayBuffer = await fetch(`data:audio/mpeg;base64,${base64Audio}`).then((r) =>
        r.arrayBuffer()
      );
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      playbackQueueRef.current.push(audioBuffer);
      if (!isPlayingRef.current) {
        playNext();
      }
    },
    [playNext]
  );

  const startMic = useCallback(async (ws: WebSocket) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = async (evt) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      if (mutedRef.current || micPausedRef.current) return;
      if (!evt.data || evt.data.size === 0) return;
      const buffer = await evt.data.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      ws.send(
        JSON.stringify({
          type: "audio_chunk",
          data: b64,
          file_extension: ".webm",
        })
      );
    };

    recorder.start(300);
  }, []);

  const startSession = useCallback(
    async (opts: StartOptions = {}) => {
      try {
        setError(null);
        setStatus("connecting");
        setTranscripts([]);

        const res = await fetch(`${apiBase}/api/calls/sessions/live/public`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent_id: opts.agentId,
            caller_name: opts.callerName,
            caller_number: opts.callerNumber,
            language: opts.language,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || `HTTP ${res.status}`);
        }
        const data = (await res.json()) as SessionInfo;
        const wsUrl = new URL(data.websocket_path, apiBase);
        wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";
        wsUrl.searchParams.set("token", data.session_token);
        const ws = new WebSocket(wsUrl.toString());
        wsRef.current = ws;

        ws.onopen = async () => {
          setStatus("live");
          await startMic(ws);
        };

        ws.onmessage = async (evt) => {
          try {
            const payload = JSON.parse(evt.data);
            if (payload.type === "transcript") {
              setTranscripts((prev) => [...prev, { role: payload.role, text: payload.text, messageId: payload.message_id }]);
            }
            if (payload.type === "audio_chunk" && payload.data) {
              await enqueuePlayback(payload.data);
            }
            if (payload.type === "error" && payload.message) {
              setError(payload.message);
            }
          } catch (err) {
            console.warn("WS message parse error", err);
          }
        };

        ws.onclose = () => {
          stopSession();
        };

        ws.onerror = (evt) => {
          console.error("WebSocket error", evt);
          setError("WebSocket error");
          stopSession();
        };
      } catch (err: any) {
        console.error("startSession error", err);
        setError(err?.message || "Failed to start voice session");
        setStatus("error");
      }
    },
    [apiBase, enqueuePlayback, startMic, stopSession]
  );

  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted;
  }, []);

  const setMicActive = useCallback((active: boolean) => {
    micPausedRef.current = !active;
  }, []);

  const setSpeakerEnabled = useCallback((enabled: boolean) => {
    speakerEnabledRef.current = enabled;
    if (!enabled) {
      playbackQueueRef.current = [];
      setAssistantSpeaking(false);
      isPlayingRef.current = false;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return {
    status,
    error,
    transcripts,
    assistantSpeaking,
    startSession,
    stopSession,
    setMuted,
    setMicActive,
    setSpeakerEnabled,
  };
}
