"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ActionError = {
  message: string;
};

type UploadUrlAction = () => Promise<
  | { ok: true; data: { uploadUrl: string } }
  | { ok: false; error: ActionError }
>;

type TranscribeAction = (input: { storageId: string }) => Promise<
  | { ok: true; data: { text: string; languageCode?: string } }
  | { ok: false; error: ActionError }
>;

type VoiceVadPhase = "listening" | "capturing" | "silence_pending";
type MicrophoneSupportReason = "secure_origin" | "unsupported" | null;
type MicrophoneSupportState = {
  error: string | null;
  reason: MicrophoneSupportReason;
};

export type VoiceRecorderStateEvent = {
  type:
    | "support_checked"
    | "recording_started"
    | "speech_detected"
    | "silence_detected"
    | "recording_stopped"
    | "recording_cancelled"
    | "upload_started"
    | "upload_completed"
    | "transcription_completed"
    | "turn_dispatched"
    | "error";
  message?: string;
  data?: Record<string, unknown>;
};

type UseVoiceRecorderParams = {
  getUploadUrl: UploadUrlAction;
  transcribeFromStorage: TranscribeAction;
  onTranscriptReady: (text: string) => void | Promise<void>;
  onError?: (message: string) => void;
  onStateEvent?: (event: VoiceRecorderStateEvent) => void;
  maxDurationMs?: number;
  disabled?: boolean;
};

const DEFAULT_MAX_DURATION_MS = 180_000;
const METER_BARS = 12;
const SECURE_ORIGIN_ERROR = "Microphone access requires a secure origin (HTTPS or localhost).";
const AUTO_FINISH_SILENCE_MS = 700;
const NO_SPEECH_TIMEOUT_MS = 8_000;
const SPEECH_START_THRESHOLD = 0.075;
const SPEECH_CONTINUE_THRESHOLD = 0.045;
const SPEECH_START_FRAMES = 3;
const SPEECH_CONTINUE_FRAMES = 3;
const STOP_SETTLE_FALLBACK_MS = 1_200;

const HIGH_QUALITY_AUDIO_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    channelCount: { ideal: 1 },
    sampleRate: { ideal: 48_000 },
    sampleSize: { ideal: 16 },
    echoCancellation: { ideal: true },
    noiseSuppression: { ideal: true },
    autoGainControl: { ideal: true },
  },
};

function resolveRecorderMimeType() {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") {
    return undefined;
  }

  const candidates = [
    "audio/mp4",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
  ];

  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
}

function getMicrophoneSupportState(): MicrophoneSupportState {
  if (typeof window === "undefined") {
    return {
      error: null,
      reason: null,
    };
  }

  if (typeof navigator === "undefined") {
    return {
      error: "This browser does not expose microphone APIs.",
      reason: "unsupported",
    };
  }

  if (!window.isSecureContext) {
    return {
      error: SECURE_ORIGIN_ERROR,
      reason: "secure_origin",
    };
  }

  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
    return {
      error: "Microphone is not available in this browser or origin.",
      reason: "unsupported",
    };
  }

  if (typeof MediaRecorder === "undefined") {
    return {
      error: "Audio recording is not supported on this browser.",
      reason: "unsupported",
    };
  }

  return {
    error: null,
    reason: null,
  };
}

export function buildBarsFromFrequencyData(dataArray: ArrayLike<number>, bars = METER_BARS) {
  if (dataArray.length === 0) {
    return Array.from({ length: bars }, () => 0);
  }

  const bucketSize = Math.max(1, Math.floor(dataArray.length / bars));
  return Array.from({ length: bars }, (_, index) => {
    const start = index * bucketSize;
    const end = Math.min(start + bucketSize, dataArray.length);
    let sum = 0;
    for (let i = start; i < end; i += 1) {
      sum += dataArray[i] ?? 0;
    }
    const avg = sum / Math.max(1, end - start);
    return Math.min(1, Math.max(0, avg / 255));
  });
}

async function uploadAudioBlob(uploadUrl: string, blob: Blob) {
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": blob.type || "application/octet-stream",
    },
    body: blob,
  });

  if (!response.ok) {
    throw new Error("Failed to upload voice recording.");
  }

  const payload = (await response.json().catch(() => null)) as { storageId?: string } | null;
  const storageId = payload?.storageId?.trim();
  if (!storageId) {
    throw new Error("Upload response did not include storage id.");
  }

  return storageId;
}

/**
 * WHY:   Browser voice capture is much more reliable in explicit turn-taking mode than continuous VAD mode.
 * WHAT:  Records one user-controlled audio turn, uploads it, requests transcription, and reports diagnostic checkpoints.
 * HOW:   Uses MediaRecorder + AnalyserNode with explicit start/finish/cancel actions and a bounded max recording duration.
 */
export function useVoiceRecorder({
  getUploadUrl,
  transcribeFromStorage,
  onTranscriptReady,
  onError,
  onStateEvent,
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  disabled = false,
}: UseVoiceRecorderParams) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<
    "idle" | "recording" | "uploading" | "transcribing" | "sending" | "error"
  >("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: METER_BARS }, () => 0));
  const [supportError, setSupportError] = useState<string | null>(null);
  const [supportReason, setSupportReason] = useState<MicrophoneSupportReason>(null);
  const [vadPhase, setVadPhase] = useState<VoiceVadPhase>("listening");

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const recordStartedAtRef = useRef<number>(0);
  const durationIntervalRef = useRef<number | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);
  const noSpeechTimeoutRef = useRef<number | null>(null);
  const stopSettleTimeoutRef = useRef<number | null>(null);
  const stopPromiseRef = useRef<Promise<Blob> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const timeDomainDataRef = useRef<Uint8Array | null>(null);
  const recorderMimeTypeRef = useRef<string | undefined>(undefined);
  const speechDetectedRef = useRef(false);
  const speechFramesRef = useRef(0);
  const speechContinueFramesRef = useRef(0);
  const silenceStartedAtRef = useRef<number | null>(null);
  const autoStopTriggeredRef = useRef(false);
  const processingPhaseRef = useRef<"idle" | "recording" | "uploading" | "transcribing" | "sending" | "error">("idle");
  const vadPhaseRef = useRef<VoiceVadPhase>("listening");
  const finishRecordingRef = useRef<(() => Promise<boolean>) | null>(null);
  const cancelRecordingRef = useRef<(() => Promise<boolean>) | null>(null);
  const finalizeStoppedBlobRef = useRef<(() => void) | null>(null);
  const stopRequestedRef = useRef(false);
  const startRequestedRef = useRef(false);
  const isRecordingRef = useRef(false);
  const isTranscribingRef = useRef(false);
  const disabledRef = useRef(disabled);

  const emitStateEvent = useCallback(
    (event: VoiceRecorderStateEvent) => {
      onStateEvent?.(event);
    },
    [onStateEvent],
  );

  const emitError = useCallback(
    (message: string) => {
      onError?.(message);
      emitStateEvent({
        type: "error",
        message,
      });
    },
    [emitStateEvent, onError],
  );

  const resetLevels = useCallback(() => {
    setLevels(Array.from({ length: METER_BARS }, () => 0));
  }, []);

  const updateVadPhase = useCallback((nextPhase: VoiceVadPhase) => {
    if (vadPhaseRef.current === nextPhase) return;
    vadPhaseRef.current = nextPhase;
    setVadPhase(nextPhase);
  }, []);

  const resetVadState = useCallback(() => {
    speechDetectedRef.current = false;
    speechFramesRef.current = 0;
    speechContinueFramesRef.current = 0;
    silenceStartedAtRef.current = null;
    autoStopTriggeredRef.current = false;
    updateVadPhase("listening");
  }, [updateVadPhase]);

  const clearTimers = useCallback(() => {
    if (durationIntervalRef.current !== null) {
      window.clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (stopTimeoutRef.current !== null) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    if (noSpeechTimeoutRef.current !== null) {
      window.clearTimeout(noSpeechTimeoutRef.current);
      noSpeechTimeoutRef.current = null;
    }
    if (stopSettleTimeoutRef.current !== null) {
      window.clearTimeout(stopSettleTimeoutRef.current);
      stopSettleTimeoutRef.current = null;
    }
  }, []);

  const cleanupAudioGraph = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    analyserRef.current = null;
    frequencyDataRef.current = null;
    timeDomainDataRef.current = null;
    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext) {
      void audioContext.close().catch(() => undefined);
    }
  }, []);

  const cleanupStream = useCallback(() => {
    const stream = streamRef.current;
    streamRef.current = null;
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // no-op
        }
      });
    }

    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    stopPromiseRef.current = null;
    recorderMimeTypeRef.current = undefined;
    finalizeStoppedBlobRef.current = null;
    stopRequestedRef.current = false;
    startRequestedRef.current = false;
    isRecordingRef.current = false;
  }, []);

  const sampleLevels = useCallback(() => {
    const analyser = analyserRef.current;
    const frequencyData = frequencyDataRef.current;
    const timeDomainData = timeDomainDataRef.current;
    if (!analyser || !frequencyData || !timeDomainData) return;

    analyser.getByteFrequencyData(frequencyData as Uint8Array<ArrayBuffer>);
    setLevels(buildBarsFromFrequencyData(frequencyData));

    analyser.getByteTimeDomainData(timeDomainData as Uint8Array<ArrayBuffer>);
    let sumSquares = 0;
    for (let index = 0; index < timeDomainData.length; index += 1) {
      const centered = (timeDomainData[index] - 128) / 128;
      sumSquares += centered * centered;
    }
    const rms = Math.sqrt(sumSquares / Math.max(1, timeDomainData.length));
    const normalizedLevel = Math.min(1, rms * 8);

    if (processingPhaseRef.current === "recording") {
      const now = Date.now();

      if (!speechDetectedRef.current) {
        if (normalizedLevel >= SPEECH_START_THRESHOLD) {
          speechFramesRef.current += 1;
        } else {
          speechFramesRef.current = 0;
        }

        if (speechFramesRef.current >= SPEECH_START_FRAMES) {
          speechDetectedRef.current = true;
          speechFramesRef.current = 0;
          speechContinueFramesRef.current = 0;
          silenceStartedAtRef.current = null;
          if (noSpeechTimeoutRef.current !== null) {
            window.clearTimeout(noSpeechTimeoutRef.current);
            noSpeechTimeoutRef.current = null;
          }
          updateVadPhase("capturing");
          emitStateEvent({
            type: "speech_detected",
            data: {
              level: Number(normalizedLevel.toFixed(3)),
            },
          });
        } else {
          updateVadPhase("listening");
        }
      } else {
        if (autoStopTriggeredRef.current) {
          updateVadPhase("silence_pending");
          animationFrameRef.current = window.requestAnimationFrame(sampleLevels);
          return;
        }

        if (normalizedLevel >= SPEECH_CONTINUE_THRESHOLD) {
          speechContinueFramesRef.current += 1;
          if (speechContinueFramesRef.current >= SPEECH_CONTINUE_FRAMES) {
            silenceStartedAtRef.current = null;
            autoStopTriggeredRef.current = false;
            updateVadPhase("capturing");
          }
        } else {
          speechContinueFramesRef.current = 0;
        }

        if (speechContinueFramesRef.current >= SPEECH_CONTINUE_FRAMES) {
          animationFrameRef.current = window.requestAnimationFrame(sampleLevels);
          return;
        }

        if (silenceStartedAtRef.current === null) {
          silenceStartedAtRef.current = now;
        }

        const silenceMs = now - silenceStartedAtRef.current;
        updateVadPhase("silence_pending");

        if (silenceMs >= AUTO_FINISH_SILENCE_MS && !autoStopTriggeredRef.current) {
          autoStopTriggeredRef.current = true;
          emitStateEvent({
            type: "silence_detected",
            data: {
              silenceMs,
            },
          });
          void finishRecordingRef.current?.();
        }
      }
    }

    animationFrameRef.current = window.requestAnimationFrame(sampleLevels);
  }, [emitStateEvent, updateVadPhase]);

  const cancelRecording = useCallback(async () => {
    clearTimers();
    cleanupAudioGraph();
    setIsRecording(false);
    isRecordingRef.current = false;
    setElapsedMs(0);
    setProcessingPhase("idle");
    processingPhaseRef.current = "idle";
    resetLevels();
    resetVadState();

    const recorder = mediaRecorderRef.current;
    stopPromiseRef.current = null;
    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      try {
        recorder.stop();
      } catch {
        // no-op
      }
    }

    cleanupStream();
    emitStateEvent({
      type: "recording_cancelled",
    });
    return true;
  }, [cleanupAudioGraph, cleanupStream, clearTimers, emitStateEvent, resetLevels, resetVadState]);

  const finishRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) {
      return false;
    }
    if (stopRequestedRef.current) {
      return false;
    }
    stopRequestedRef.current = true;

    clearTimers();
    cleanupAudioGraph();

    if (recorder.state === "inactive") {
      cleanupStream();
      resetLevels();
      setIsRecording(false);
      setProcessingPhase("idle");
      processingPhaseRef.current = "idle";
      resetVadState();
      return false;
    }

    setIsRecording(false);
    isRecordingRef.current = false;
    setProcessingPhase("uploading");
    processingPhaseRef.current = "uploading";

    try {
      if (typeof recorder.requestData === "function") {
        try {
          recorder.requestData();
        } catch {
          // Safari may throw if it cannot flush interim chunks; stopping still proceeds.
        }
      }
      recorder.stop();
    } catch {
      cleanupStream();
      resetLevels();
      setProcessingPhase("error");
      processingPhaseRef.current = "error";
      resetVadState();
      emitError("Unable to stop the current recording.");
      return false;
    }

    stopSettleTimeoutRef.current = window.setTimeout(() => {
      finalizeStoppedBlobRef.current?.();
    }, STOP_SETTLE_FALLBACK_MS);

    const stopPromise = stopPromiseRef.current;
    if (!stopPromise) {
      cleanupStream();
      resetLevels();
      setProcessingPhase("error");
      processingPhaseRef.current = "error";
      resetVadState();
      emitError("Recording did not produce a final audio payload.");
      return false;
    }

    const blob = await stopPromise;
    const durationMs = Math.max(0, Date.now() - recordStartedAtRef.current);

    emitStateEvent({
      type: "recording_stopped",
      data: {
        durationMs,
        blobSize: blob.size,
        mimeType: blob.type || recorderMimeTypeRef.current || "unknown",
      },
    });

    if (!blob || blob.size === 0) {
      cleanupStream();
      resetLevels();
      setProcessingPhase("error");
      processingPhaseRef.current = "error";
      resetVadState();
      emitError("No audio was captured. Try speaking closer to the microphone.");
      return false;
    }

    setIsTranscribing(true);
    isTranscribingRef.current = true;
    try {
      emitStateEvent({ type: "upload_started" });
      const uploadActionResult = await getUploadUrl();
      if (!uploadActionResult.ok) {
        throw new Error(uploadActionResult.error.message || "Failed to get an upload URL.");
      }

      const storageId = await uploadAudioBlob(uploadActionResult.data.uploadUrl, blob);
      emitStateEvent({
        type: "upload_completed",
        data: { storageId },
      });

      setProcessingPhase("transcribing");
      processingPhaseRef.current = "transcribing";
      const transcriptActionResult = await transcribeFromStorage({ storageId });
      if (!transcriptActionResult.ok) {
        throw new Error(transcriptActionResult.error.message || "Failed to transcribe the recording.");
      }

      const transcript = transcriptActionResult.data.text.trim();
      if (!transcript) {
        throw new Error("The transcription completed without any recognizable speech.");
      }

      emitStateEvent({
        type: "transcription_completed",
        data: {
          transcript,
          transcriptPreview: transcript.slice(0, 180),
          languageCode: transcriptActionResult.data.languageCode,
        },
      });

      setProcessingPhase("sending");
      processingPhaseRef.current = "sending";
      await onTranscriptReady(transcript);
      emitStateEvent({
        type: "turn_dispatched",
        data: {
          transcriptLength: transcript.length,
        },
      });

      setElapsedMs(0);
      resetLevels();
      setProcessingPhase("idle");
      processingPhaseRef.current = "idle";
      resetVadState();
      return true;
    } catch (error) {
      setProcessingPhase("error");
      processingPhaseRef.current = "error";
      resetVadState();
      emitError(error instanceof Error ? error.message : "Voice processing failed.");
      return false;
    } finally {
      cleanupStream();
      setIsTranscribing(false);
      isTranscribingRef.current = false;
    }
  }, [
    cleanupAudioGraph,
    cleanupStream,
    clearTimers,
    emitError,
    emitStateEvent,
    getUploadUrl,
    onTranscriptReady,
    resetLevels,
    transcribeFromStorage,
  ]);

  const startRecording = useCallback(async () => {
    if (startRequestedRef.current || isRecordingRef.current) {
      return true;
    }
    if (disabledRef.current || isTranscribingRef.current) {
      return false;
    }
    startRequestedRef.current = true;

    const supportState = getMicrophoneSupportState();
    setSupportError(supportState.error);
    setSupportReason(supportState.reason);
    emitStateEvent({
      type: "support_checked",
      message: supportState.error ?? "Microphone supported.",
      data: {
        reason: supportState.reason,
      },
    });

    if (supportState.error) {
      setProcessingPhase("error");
      startRequestedRef.current = false;
      emitError(supportState.error);
      return false;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(HIGH_QUALITY_AUDIO_CONSTRAINTS);
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      streamRef.current = stream;
      recordedChunksRef.current = [];
      setElapsedMs(0);
      setIsRecording(true);
      isRecordingRef.current = true;
      setProcessingPhase("recording");
      processingPhaseRef.current = "recording";
      resetVadState();

      const mimeType = resolveRecorderMimeType();
      recorderMimeTypeRef.current = mimeType;
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      stopRequestedRef.current = false;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      stopPromiseRef.current = new Promise<Blob>((resolve) => {
        let settled = false;
        const finalize = () => {
          if (settled) return;
          settled = true;
          if (stopSettleTimeoutRef.current !== null) {
            window.clearTimeout(stopSettleTimeoutRef.current);
            stopSettleTimeoutRef.current = null;
          }
          finalizeStoppedBlobRef.current = null;
          resolve(new Blob(recordedChunksRef.current, { type: recorder.mimeType || recorderMimeTypeRef.current || "audio/webm" }));
        };
        finalizeStoppedBlobRef.current = finalize;
        recorder.onstop = finalize;
      });

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.72;
      source.connect(analyser);
      analyserRef.current = analyser;
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      timeDomainDataRef.current = new Uint8Array(analyser.fftSize);
      sampleLevels();

      recorder.start(250);
      recordStartedAtRef.current = Date.now();
      durationIntervalRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - recordStartedAtRef.current);
      }, 100);
      noSpeechTimeoutRef.current = window.setTimeout(() => {
        if (speechDetectedRef.current) {
          return;
        }
        const cancelPromise = cancelRecordingRef.current?.();
        if (!cancelPromise) {
          emitError("I did not hear a complete voice turn. Try again and speak naturally.");
          return;
        }
        void cancelPromise.then(() => {
          emitError("I did not hear a complete voice turn. Try again and speak naturally.");
        });
      }, NO_SPEECH_TIMEOUT_MS);
      stopTimeoutRef.current = window.setTimeout(() => {
        void finishRecording();
      }, maxDurationMs);

      emitStateEvent({
        type: "recording_started",
        data: {
          maxDurationMs,
          mimeType: recorder.mimeType || recorderMimeTypeRef.current || "default",
        },
      });

      startRequestedRef.current = false;
      return true;
    } catch {
      cleanupStream();
      cleanupAudioGraph();
      clearTimers();
      resetLevels();
      setProcessingPhase("error");
      processingPhaseRef.current = "error";
      resetVadState();
      startRequestedRef.current = false;
      emitError("Failed to access the microphone. Check your browser permissions and try again.");
      return false;
    }
  }, [
    cancelRecordingRef,
    cleanupAudioGraph,
    cleanupStream,
    clearTimers,
    emitError,
    emitStateEvent,
    finishRecording,
    maxDurationMs,
    resetLevels,
    resetVadState,
    sampleLevels,
  ]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    isTranscribingRef.current = isTranscribing;
  }, [isTranscribing]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    finishRecordingRef.current = finishRecording;
  }, [finishRecording]);

  useEffect(() => {
    cancelRecordingRef.current = cancelRecording;
  }, [cancelRecording]);

  useEffect(() => {
    const supportState = getMicrophoneSupportState();
    setSupportError(supportState.error);
    setSupportReason(supportState.reason);
  }, []);

  useEffect(() => {
    if (disabled && isRecording) {
      void cancelRecording();
    }
  }, [cancelRecording, disabled, isRecording]);

  useEffect(() => {
    return () => {
      clearTimers();
      cleanupAudioGraph();
      cleanupStream();
    };
  }, [cleanupAudioGraph, cleanupStream, clearTimers]);

  return {
    elapsedMs,
    isRecording,
    isMonitoring: isRecording,
    isTranscribing,
    processingPhase,
    levels,
    supportError,
    supportReason,
    vadPhase,
    currentSpeechActive: vadPhase === "capturing",
    startRecording,
    finishRecording,
    cancelRecording,
    startMonitoring: startRecording,
    stopMonitoring: cancelRecording,
  };
}
