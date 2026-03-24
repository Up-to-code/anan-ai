"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MainAssistantThread } from "@/server/contracts/mainAssistant";
import { useVoiceRecorder, type VoiceRecorderStateEvent } from "@/hooks/useVoiceRecorder";

export type VoiceSessionState = "ready" | "listening" | "capturing" | "processing" | "speaking" | "error";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string } };

type VoiceSessionActions = {
  bootstrapAssistant: () => Promise<ActionResult<MainAssistantThread | null>>;
  sendAssistantMessage: (input: {
    message: string;
    threadId?: string;
    inputMode?: "text" | "voice";
  }) => Promise<
    ActionResult<{
      thread: MainAssistantThread;
      assistantMessageId: string;
      assistantText: string;
    }>
  >;
  getVoiceUploadUrl: () => Promise<ActionResult<{ uploadUrl: string }>>;
  transcribeVoiceFromStorage: (input: { storageId: string }) => Promise<ActionResult<{ text: string; languageCode?: string }>>;
  synthesizeAssistantVoice: (input: {
    messageId: string;
    text: string;
  }) => Promise<ActionResult<{ audioUrl?: string; voiceUnavailableReason?: string }>>;
};

type UseVoiceSessionParams = {
  initialThread: MainAssistantThread | null;
  actions: VoiceSessionActions;
};

type PlaybackOutcome = "played" | "autoplay_blocked_skipped" | "error";

export type VoiceSessionDebugEvent = {
  id: string;
  at: number;
  source: "session" | "recorder";
  event: string;
  summary: string;
  data?: Record<string, unknown>;
};

const MAX_DEBUG_EVENTS = 32;
const AUTO_REARM_AFTER_PLAYBACK_MS = 1_100;
const AUTO_REARM_AFTER_INTERRUPT_MS = 220;

function patchAssistantAudio(
  thread: MainAssistantThread | null,
  messageId: string,
  patch: {
    audioUrl?: string;
    audioStatus?: "idle" | "loading" | "ready" | "error";
  },
) {
  if (!thread) return null;
  return {
    ...thread,
    messages: thread.messages.map((message) => {
      if (message.id !== messageId) return message;
      return {
        ...message,
        ...patch,
      };
    }),
  };
}

function summarizeRecorderEvent(event: VoiceRecorderStateEvent) {
  if (event.type === "support_checked") {
    return event.message ?? "Checked microphone support.";
  }
  if (event.type === "recording_started") {
    return "Listening for speech.";
  }
  if (event.type === "speech_detected") {
    return "Speech detected.";
  }
  if (event.type === "silence_detected") {
    return "Silence detected. Finishing the turn.";
  }
  if (event.type === "recording_stopped") {
    const durationMs = event.data?.durationMs;
    return typeof durationMs === "number"
      ? `Recording stopped after ${Math.round(durationMs)}ms.`
      : "Recording stopped.";
  }
  if (event.type === "recording_cancelled") {
    return "Recording cancelled.";
  }
  if (event.type === "upload_started") {
    return "Uploading audio.";
  }
  if (event.type === "upload_completed") {
    return "Audio uploaded.";
  }
  if (event.type === "transcription_completed") {
    return "Transcription completed.";
  }
  if (event.type === "turn_dispatched") {
    return "Voice turn sent to the assistant.";
  }
  return event.message ?? "Recorder error.";
}

function isRecoverableTurnError(message: string) {
  return /did not hear a complete voice turn|no audio was captured/i.test(message);
}

/**
 * WHY:   The public assistant needs one continuous voice-session controller rather than one tap per turn.
 * WHAT:  Manages listen -> capture -> process -> speak cycles, auto-rearms listening between turns, and keeps playback interruption safe.
 * HOW:   Coordinates the recorder, assistant send flow, playback lifecycle, and one-shot listening rearm timers inside a single hook.
 */
export function useVoiceSession({ initialThread, actions }: UseVoiceSessionParams) {
  const {
    bootstrapAssistant,
    sendAssistantMessage,
    getVoiceUploadUrl,
    transcribeVoiceFromStorage,
    synthesizeAssistantVoice,
  } = actions;

  const [thread, setThread] = useState<MainAssistantThread | null>(initialThread);
  const [draft, setDraft] = useState("");
  const [isHydrating, setIsHydrating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [shouldAutoArmListening, setShouldAutoArmListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phaseOverride, setPhaseOverride] = useState<"thinking" | "speaking" | "error" | null>(null);
  const [statusHint, setStatusHint] = useState<string | null>(null);
  const [playbackOutcome, setPlaybackOutcome] = useState<PlaybackOutcome>("played");
  const [latestAudioKey, setLatestAudioKey] = useState<string | null>(null);
  const [playbackStopKey, setPlaybackStopKey] = useState<string | null>(null);
  const [debugEvents, setDebugEvents] = useState<VoiceSessionDebugEvent[]>([]);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [voiceReplyUnavailableReason, setVoiceReplyUnavailableReason] = useState<string | null>(null);

  const isSendingRef = useRef(false);
  const isSessionActiveRef = useRef(isSessionActive);
  const phaseOverrideRef = useRef(phaseOverride);
  const listeningRearmTimeoutRef = useRef<number | null>(null);
  const interruptingPlaybackRef = useRef(false);
  const armingListeningRef = useRef(false);
  const turnInFlightRef = useRef(false);
  const activeTurnRequestIdRef = useRef<string | null>(null);
  const startRecordingRef = useRef<(() => Promise<boolean>) | null>(null);

  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  useEffect(() => {
    phaseOverrideRef.current = phaseOverride;
  }, [phaseOverride]);

  const pushDebugEvent = useCallback(
    (
      source: VoiceSessionDebugEvent["source"],
      event: string,
      summary: string,
      data?: Record<string, unknown>,
    ) => {
      setDebugEvents((current) => {
        const next: VoiceSessionDebugEvent = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          at: Date.now(),
          source,
          event,
          summary,
          data,
        };
        return [...current.slice(-(MAX_DEBUG_EVENTS - 1)), next];
      });
    },
    [],
  );

  const clearListeningRearm = useCallback(() => {
    if (listeningRearmTimeoutRef.current !== null) {
      window.clearTimeout(listeningRearmTimeoutRef.current);
      listeningRearmTimeoutRef.current = null;
    }
  }, []);

  const queueListeningRearm = useCallback(
    (delayMs = 0) => {
      clearListeningRearm();
      if (!isSessionActiveRef.current) {
        return;
      }
      if (delayMs <= 0) {
        setShouldAutoArmListening(true);
        return;
      }
      listeningRearmTimeoutRef.current = window.setTimeout(() => {
        listeningRearmTimeoutRef.current = null;
        if (!isSessionActiveRef.current) {
          return;
        }
        setShouldAutoArmListening(true);
      }, delayMs);
    },
    [clearListeningRearm],
  );

  const armPlaybackFallback = useCallback(
    (assistantMessageId: string, summary: string) => {
      setThread((current) =>
        patchAssistantAudio(current, assistantMessageId, {
          audioStatus: "ready",
        }),
      );
      setLatestAudioKey(`${assistantMessageId}-${Date.now()}`);
      setPlaybackOutcome("played");
      setPhaseOverride("speaking");
      setVoiceReplyUnavailableReason(null);
      setStatusHint("Reply playback is starting.");
      pushDebugEvent("session", "voice_fallback_armed", summary, {
        assistantMessageId,
        mode: "browser_speech",
      });
    },
    [pushDebugEvent],
  );

  const processUserTurn = useCallback(
    async (message: string, inputMode: "text" | "voice") => {
      const nextMessage = message.trim();
      if (!nextMessage) return false;
      if (isSendingRef.current || turnInFlightRef.current) {
        pushDebugEvent("session", "turn_skipped", "A turn is already in flight; skipping duplicate submit.", {
          inputMode,
          length: nextMessage.length,
        });
        return false;
      }

      clearListeningRearm();
      setShouldAutoArmListening(false);
      turnInFlightRef.current = true;
      const turnRequestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      activeTurnRequestIdRef.current = turnRequestId;
      isSendingRef.current = true;
      setIsSending(true);
      setError(null);
      setVoiceReplyUnavailableReason(null);
      setPhaseOverride("thinking");
      setStatusHint(inputMode === "voice" ? "Processing your voice turn..." : "Sending your message...");
      pushDebugEvent("session", "send_requested", `Sending ${inputMode} turn.`, {
        threadId: thread?.id ?? null,
        length: nextMessage.length,
      });

      try {
        const sendResult = await sendAssistantMessage({
          message: nextMessage,
          threadId: thread?.id,
          inputMode,
        });

        if (activeTurnRequestIdRef.current !== turnRequestId) {
          turnInFlightRef.current = false;
          return false;
        }

        if (!sendResult.ok) {
          turnInFlightRef.current = false;
          activeTurnRequestIdRef.current = null;
          setError(sendResult.error.message);
          setPlaybackOutcome("error");
          setPhaseOverride("error");
          setStatusHint("The assistant could not process this turn.");
          setIsSessionActive(false);
          pushDebugEvent("session", "send_failed", sendResult.error.message);
          return false;
        }

        setThread(sendResult.data.thread);
        setThread((current) =>
          patchAssistantAudio(current, sendResult.data.assistantMessageId, {
            audioStatus: "loading",
          }),
        );
        pushDebugEvent("session", "assistant_saved", "Assistant text reply saved.", {
          assistantMessageId: sendResult.data.assistantMessageId,
          outputLength: sendResult.data.assistantText.length,
          threadId: sendResult.data.thread.id,
        });

        const synthResult = await synthesizeAssistantVoice({
          messageId: sendResult.data.assistantMessageId,
          text: sendResult.data.assistantText,
        });

        if (activeTurnRequestIdRef.current !== turnRequestId) {
          turnInFlightRef.current = false;
          return false;
        }

        if (!synthResult.ok) {
          armPlaybackFallback(
            sendResult.data.assistantMessageId,
            `Voice synthesis failed. Falling back to browser speech. ${synthResult.error.message}`,
          );
          return true;
        }

        if (!synthResult.data.audioUrl) {
          armPlaybackFallback(
            sendResult.data.assistantMessageId,
            synthResult.data.voiceUnavailableReason ?? "Server voice unavailable. Falling back to browser speech.",
          );
          return true;
        }

        setThread((current) =>
          patchAssistantAudio(current, sendResult.data.assistantMessageId, {
            audioUrl: synthResult.data.audioUrl,
            audioStatus: "ready",
          }),
        );

        setLatestAudioKey(`${sendResult.data.assistantMessageId}-${Date.now()}`);
        setPlaybackOutcome("played");
        setPhaseOverride("speaking");
        setStatusHint("Reply playback is starting.");
        pushDebugEvent("session", "voice_synthesis_ready", "Voice reply ready.", {
          assistantMessageId: sendResult.data.assistantMessageId,
        });
        return true;
      } catch (processingError) {
        const messageText =
          processingError instanceof Error ? processingError.message : "Voice session failed.";
        turnInFlightRef.current = false;
        activeTurnRequestIdRef.current = null;
        setError(messageText);
        setPlaybackOutcome("error");
        setPhaseOverride("error");
        setStatusHint("The assistant could not complete this turn.");
        setIsSessionActive(false);
        pushDebugEvent("session", "send_failed", messageText);
        return false;
      } finally {
        isSendingRef.current = false;
        setIsSending(false);
      }
    },
    [armPlaybackFallback, clearListeningRearm, pushDebugEvent, sendAssistantMessage, synthesizeAssistantVoice, thread?.id],
  );

  const voiceRecorder = useVoiceRecorder({
    getUploadUrl: getVoiceUploadUrl,
    transcribeFromStorage: transcribeVoiceFromStorage,
    onTranscriptReady: async (transcript) => {
      if (turnInFlightRef.current) {
        pushDebugEvent("session", "transcript_skipped", "Dropped duplicate transcript while turn is in flight.", {
          transcriptLength: transcript.length,
        });
        return;
      }
      setLastTranscript(transcript);
      pushDebugEvent("session", "transcript_ready", "Transcript received from the recorder.", {
        transcriptPreview: transcript.slice(0, 180),
        transcriptLength: transcript.length,
      });
      await processUserTurn(transcript, "voice");
    },
    onError: (message) => {
      clearListeningRearm();
      setShouldAutoArmListening(false);
      setPlaybackOutcome("error");
      turnInFlightRef.current = false;
      activeTurnRequestIdRef.current = null;

      if (isRecoverableTurnError(message)) {
        setError(null);
        setPhaseOverride(null);
        setIsSessionActive(false);
        setStatusHint(message);
        pushDebugEvent("session", "voice_turn_empty", message);
        return;
      }

      setError(message);
      setPhaseOverride("error");
      setIsSessionActive(false);
    },
    onStateEvent: (event) => {
      const transcriptPreview = event.data?.transcriptPreview;
      if (typeof transcriptPreview === "string" && transcriptPreview.trim()) {
        setLastTranscript(transcriptPreview);
      }
      pushDebugEvent("recorder", event.type, summarizeRecorderEvent(event), event.data);
    },
    disabled: isHydrating || isSending || phaseOverride === "thinking" || phaseOverride === "speaking",
  });

  useEffect(() => {
    startRecordingRef.current = voiceRecorder.startRecording;
  }, [voiceRecorder.startRecording]);

  useEffect(() => {
    if (initialThread) return;
    let disposed = false;
    setIsHydrating(true);
    void bootstrapAssistant().then((result) => {
      if (disposed) return;
      if (!result.ok) {
        setError(result.error.message);
        setPhaseOverride("error");
        pushDebugEvent("session", "bootstrap_failed", result.error.message);
      } else {
        setThread(result.data);
        pushDebugEvent("session", "bootstrap_ready", "Assistant session bootstrapped.", {
          threadId: result.data?.id ?? null,
        });
      }
      setIsHydrating(false);
    });
    return () => {
      disposed = true;
    };
  }, [bootstrapAssistant, initialThread, pushDebugEvent]);

  useEffect(() => {
    if (!isSessionActive || !shouldAutoArmListening) return;
    if (isHydrating || isSending) return;
    if (phaseOverride === "thinking" || phaseOverride === "speaking" || phaseOverride === "error") return;
    if (voiceRecorder.isRecording || voiceRecorder.processingPhase !== "idle") return;
    if (armingListeningRef.current) return;
    if (turnInFlightRef.current) return;

    let cancelled = false;
    armingListeningRef.current = true;
    setShouldAutoArmListening(false);

    void (async () => {
      setError(null);
      setVoiceReplyUnavailableReason(null);
      setPlaybackOutcome("played");
      setPhaseOverride(null);
      setStatusHint("Listening for your voice...");
      const startRecording = startRecordingRef.current;
      const started = startRecording ? await startRecording() : false;
      armingListeningRef.current = false;
      if (cancelled) return;

      if (!started) {
        setShouldAutoArmListening(false);
        setIsSessionActive(false);
        setStatusHint("Tap the circle to try again.");
        pushDebugEvent("session", "voice_turn_start_failed", "Voice turn could not start.");
        return;
      }

      pushDebugEvent("session", "voice_turn_started", "Voice turn recording started.");
    })();

    return () => {
      cancelled = true;
      armingListeningRef.current = false;
    };
  }, [
    isHydrating,
    isSending,
    isSessionActive,
    phaseOverride,
    pushDebugEvent,
    shouldAutoArmListening,
    voiceRecorder.isRecording,
    voiceRecorder.processingPhase,
  ]);

  useEffect(() => {
    return () => {
      clearListeningRearm();
      armingListeningRef.current = false;
    };
  }, [clearListeningRearm]);

  const latestAssistantMessage = useMemo(
    () => [...(thread?.messages ?? [])].reverse().find((message) => message.role === "assistant"),
    [thread],
  );

  const sessionState: VoiceSessionState = useMemo(() => {
    if (phaseOverride === "speaking") return "speaking";
    if (phaseOverride === "error") return "error";
    if (
      phaseOverride === "thinking" ||
      voiceRecorder.processingPhase === "uploading" ||
      voiceRecorder.processingPhase === "transcribing" ||
      voiceRecorder.processingPhase === "sending"
    ) {
      return "processing";
    }
    if (voiceRecorder.isRecording && voiceRecorder.vadPhase === "capturing") return "capturing";
    if (voiceRecorder.isRecording) return "listening";
    return "ready";
  }, [phaseOverride, voiceRecorder.isRecording, voiceRecorder.processingPhase, voiceRecorder.vadPhase]);

  useEffect(() => {
    if (phaseOverride === "error") {
      return;
    }

    if (phaseOverride === "speaking") {
      setStatusHint("Speaking now. Tap to interrupt.");
      return;
    }

    if (phaseOverride === "thinking") {
      setStatusHint("Thinking through your request...");
      return;
    }

    if (voiceRecorder.processingPhase === "recording") {
      if (voiceRecorder.vadPhase === "capturing") {
        setStatusHint("Keep speaking. I will answer when you pause.");
        return;
      }
      if (voiceRecorder.vadPhase === "silence_pending") {
        setStatusHint("Got it. Finishing your turn...");
        return;
      }
      setStatusHint("Listening. Start speaking when you are ready.");
      return;
    }

    if (voiceRecorder.processingPhase === "uploading") {
      setStatusHint("Uploading your voice...");
      return;
    }

    if (voiceRecorder.processingPhase === "transcribing") {
      setStatusHint("Converting your voice to text...");
      return;
    }

    if (voiceRecorder.processingPhase === "sending") {
      setStatusHint("Preparing the reply...");
      return;
    }

    if (isSessionActive) {
      setStatusHint("Tap to end the session.");
      return;
    }

    setStatusHint("Tap once to start talking.");
  }, [isSessionActive, phaseOverride, voiceRecorder.processingPhase, voiceRecorder.vadPhase]);

  const startSession = useCallback(() => {
    clearListeningRearm();
    armingListeningRef.current = false;
    interruptingPlaybackRef.current = false;
    turnInFlightRef.current = false;
    activeTurnRequestIdRef.current = null;
    setError(null);
    setVoiceReplyUnavailableReason(null);
    setPlaybackOutcome("played");
    setPhaseOverride(null);
    setIsSessionActive(true);
    setShouldAutoArmListening(true);
    setStatusHint("Listening for your voice...");
    pushDebugEvent("session", "voice_session_enabled", "Voice session enabled.");
  }, [clearListeningRearm, pushDebugEvent]);

  const finishVoiceTurn = useCallback(async () => {
    clearListeningRearm();
    setShouldAutoArmListening(false);
    setError(null);
    setPhaseOverride(null);
    setStatusHint("Finishing your recording...");
    pushDebugEvent("session", "voice_turn_stopping", "Finishing voice turn recording.");
    return voiceRecorder.finishRecording();
  }, [clearListeningRearm, pushDebugEvent, voiceRecorder]);

  const stopSession = useCallback(async () => {
    clearListeningRearm();
    armingListeningRef.current = false;
    interruptingPlaybackRef.current = false;
    turnInFlightRef.current = false;
    activeTurnRequestIdRef.current = null;
    setShouldAutoArmListening(false);
    setIsSessionActive(false);
    setVoiceReplyUnavailableReason(null);

    if (voiceRecorder.isRecording) {
      await voiceRecorder.cancelRecording();
      setPhaseOverride(null);
      setStatusHint("Tap once to start talking.");
    } else if (phaseOverrideRef.current !== "thinking" && phaseOverrideRef.current !== "speaking") {
      setPhaseOverride(null);
      setStatusHint("Tap once to start talking.");
    } else {
      setStatusHint("Finishing the current reply...");
    }

    pushDebugEvent("session", "voice_session_disabled", "Voice session ended.");
  }, [clearListeningRearm, pushDebugEvent, voiceRecorder]);

  const interruptPlaybackToListening = useCallback(() => {
    clearListeningRearm();
    armingListeningRef.current = false;
    interruptingPlaybackRef.current = true;
    setPlaybackStopKey(`stop-${Date.now()}`);
    setStatusHint(
      isSessionActiveRef.current
        ? "Stopping the reply and returning to listening..."
        : "Stopping the reply...",
    );
    pushDebugEvent("session", "audio_interrupt_requested", "Reply playback interruption requested.");
  }, [clearListeningRearm, pushDebugEvent]);

  const toggleVoiceTurn = useCallback(async () => {
    if (isHydrating) return;

    if (phaseOverrideRef.current === "speaking") {
      interruptPlaybackToListening();
      return;
    }

    if (isSessionActiveRef.current) {
      await stopSession();
      return;
    }

    if (isSendingRef.current) return;
    startSession();
  }, [interruptPlaybackToListening, isHydrating, startSession, stopSession]);

  const manualSendText = useCallback(async () => {
    const message = draft.trim();
    if (!message) return;
    clearListeningRearm();
    setShouldAutoArmListening(false);
    setDraft("");
    await processUserTurn(message, "text");
  }, [clearListeningRearm, draft, processUserTurn]);

  const onAudioPlay = useCallback(() => {
    setError(null);
    setVoiceReplyUnavailableReason(null);
    setStatusHint("Speaking now. Tap to interrupt.");
    setPlaybackOutcome("played");
    setPhaseOverride("speaking");
    pushDebugEvent("session", "audio_play", "Reply playback started.");
  }, [pushDebugEvent]);

  const onAudioPause = useCallback(() => {
    if (!interruptingPlaybackRef.current) {
      return;
    }
    interruptingPlaybackRef.current = false;
    turnInFlightRef.current = false;
    activeTurnRequestIdRef.current = null;
    setPlaybackOutcome("played");
    setPhaseOverride(null);
    setVoiceReplyUnavailableReason(null);
    setError(null);
    if (isSessionActiveRef.current) {
      setStatusHint("Listening for your next turn...");
      queueListeningRearm(AUTO_REARM_AFTER_INTERRUPT_MS);
      pushDebugEvent("session", "audio_interrupted", "Reply playback interrupted. Listening rearmed.");
      return;
    }
    setStatusHint("Tap once to start talking.");
  }, [pushDebugEvent, queueListeningRearm]);

  const onAudioEnded = useCallback(() => {
    interruptingPlaybackRef.current = false;
    turnInFlightRef.current = false;
    activeTurnRequestIdRef.current = null;
    setPhaseOverride(null);
    if (isSessionActiveRef.current) {
      setStatusHint("Listening for your next turn...");
      queueListeningRearm(AUTO_REARM_AFTER_PLAYBACK_MS);
      pushDebugEvent("session", "audio_end", "Reply playback ended. Listening rearm queued.");
      return;
    }
    setStatusHint("Tap once to start talking.");
    pushDebugEvent("session", "audio_end", "Reply playback ended.");
  }, [pushDebugEvent, queueListeningRearm]);

  const onAudioAutoplayBlocked = useCallback(() => {
    clearListeningRearm();
    turnInFlightRef.current = false;
    activeTurnRequestIdRef.current = null;
    setError("Automatic playback was blocked by the browser.");
    setStatusHint("The reply is ready, but playback was blocked.");
    setPlaybackOutcome("autoplay_blocked_skipped");
    setPhaseOverride(null);
    setIsSessionActive(false);
    setShouldAutoArmListening(false);
    pushDebugEvent("session", "audio_autoplay_blocked", "Reply autoplay was blocked.");
  }, [clearListeningRearm, pushDebugEvent]);

  const onPlaybackUnavailable = useCallback(
    (reason?: string) => {
      clearListeningRearm();
      turnInFlightRef.current = false;
      activeTurnRequestIdRef.current = null;
      const message = reason?.trim() || "Voice playback is unavailable in this browser.";
      setPhaseOverride(null);
      setPlaybackOutcome("error");
      setVoiceReplyUnavailableReason(message);
      setStatusHint("Reply ready in text, but voice playback is unavailable.");
      setIsSessionActive(false);
      setShouldAutoArmListening(false);
      pushDebugEvent("session", "voice_playback_unavailable", message);
    },
    [clearListeningRearm, pushDebugEvent],
  );

  const replayLatestAudio = useCallback(() => {
    if (!latestAssistantMessage?.id || latestAssistantMessage.audioStatus !== "ready") return;
    setLatestAudioKey(`${latestAssistantMessage.id}-${Date.now()}`);
    pushDebugEvent("session", "audio_replay_requested", "Voice reply replay requested.", {
      assistantMessageId: latestAssistantMessage.id,
    });
  }, [latestAssistantMessage?.audioStatus, latestAssistantMessage?.id, pushDebugEvent]);

  const clearError = useCallback(() => {
    setPhaseOverride(null);
    setError(null);
    setVoiceReplyUnavailableReason(null);
  }, []);

  const latestPlaybackFallbackText = useMemo(() => {
    if (!latestAssistantMessage) return undefined;
    if (latestAssistantMessage.audioUrl) return undefined;
    if (latestAssistantMessage.audioStatus !== "ready") return undefined;
    return latestAssistantMessage.content;
  }, [latestAssistantMessage]);

  return {
    thread,
    draft,
    setDraft,
    isHydrating,
    isSending,
    isSessionActive,
    isVoiceRecording: voiceRecorder.isRecording,
    sessionState,
    statusHint,
    playbackOutcome,
    playbackStopKey,
    error,
    clearError,
    latestAssistantMessage,
    latestAudioUrl: latestAssistantMessage?.audioUrl,
    latestAudioStatus: latestAssistantMessage?.audioStatus,
    latestAudioKey,
    latestPlaybackFallbackText,
    levels: voiceRecorder.levels,
    elapsedMs: voiceRecorder.elapsedMs,
    canUseVoice: !voiceRecorder.supportError,
    voiceUnavailableReason: voiceRecorder.supportError,
    voiceSupportReason: voiceRecorder.supportReason,
    voiceReplyUnavailableReason,
    processingPhase: voiceRecorder.processingPhase,
    vadPhase: voiceRecorder.vadPhase,
    isMonitoring: voiceRecorder.isMonitoring,
    debugEvents,
    lastTranscript,
    startSession,
    finishVoiceTurn,
    toggleVoiceTurn,
    stopSession,
    manualSendText,
    onAudioPlay,
    onAudioPause,
    onAudioEnded,
    onAudioAutoplayBlocked,
    onPlaybackUnavailable,
    replayLatestAudio,
  };
}
