"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildBarsFromFrequencyData,
  DEFAULT_MAX_DURATION_MS,
  HIGH_QUALITY_AUDIO_CONSTRAINTS,
  METER_BARS,
  type UseVoiceRecorderParams,
  uploadAudioBlob,
} from "./useVoiceRecorder.shared";

export { buildBarsFromFrequencyData };

export const VOICE_ACTIVITY_THRESHOLD = 0.12;
export const VOICE_SILENCE_AUTOSTOP_MS = 1_000;

type ProcessingPhase =
  | "idle"
  | "waiting_for_permission"
  | "waiting_for_speech"
  | "recording"
  | "silence_countdown"
  | "uploading"
  | "transcribing"
  | "sending"
  | "error";

type MicrophonePermissionState = "unknown" | "unsupported" | "prompt" | "granted" | "denied";

type RecorderRefs = {
  streamRef: React.MutableRefObject<MediaStream | null>;
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  recordedChunksRef: React.MutableRefObject<BlobPart[]>;
  recordStartedAtRef: React.MutableRefObject<number>;
  durationIntervalRef: React.MutableRefObject<number | null>;
  stopTimeoutRef: React.MutableRefObject<number | null>;
  stopPromiseRef: React.MutableRefObject<Promise<Blob> | null>;
  animationFrameRef: React.MutableRefObject<number | null>;
  audioContextRef: React.MutableRefObject<AudioContext | null>;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  analyserDataRef: React.MutableRefObject<Uint8Array<ArrayBuffer> | null>;
  hasDetectedSpeechRef: React.MutableRefObject<boolean>;
  silenceStartedAtRef: React.MutableRefObject<number | null>;
  autoStopRequestedRef: React.MutableRefObject<boolean>;
  stopInFlightRef: React.MutableRefObject<boolean>;
};

export function resolveVoiceActivityPhase(args: {
  peakLevel: number;
  hasDetectedSpeech: boolean;
  silenceStartedAt: number | null;
  now: number;
  threshold?: number;
  silenceMs?: number;
}) {
  const threshold = args.threshold ?? VOICE_ACTIVITY_THRESHOLD;
  const silenceMs = args.silenceMs ?? VOICE_SILENCE_AUTOSTOP_MS;

  if (args.peakLevel >= threshold) {
    return {
      hasDetectedSpeech: true,
      silenceStartedAt: null,
      phase: "recording" as const,
      shouldAutoStop: false,
    };
  }

  if (!args.hasDetectedSpeech) {
    return {
      hasDetectedSpeech: false,
      silenceStartedAt: null,
      phase: "waiting_for_speech" as const,
      shouldAutoStop: false,
    };
  }

  const silenceStartedAt = args.silenceStartedAt ?? args.now;
  return {
    hasDetectedSpeech: true,
    silenceStartedAt,
    phase: "silence_countdown" as const,
    shouldAutoStop: args.now - silenceStartedAt >= silenceMs,
  };
}

function createEmptyLevels() {
  return Array.from({ length: METER_BARS }, () => 0);
}

function useRecorderRefs(): RecorderRefs {
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const recordStartedAtRef = useRef<number>(0);
  const durationIntervalRef = useRef<number | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);
  const stopPromiseRef = useRef<Promise<Blob> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const hasDetectedSpeechRef = useRef(false);
  const silenceStartedAtRef = useRef<number | null>(null);
  const autoStopRequestedRef = useRef(false);
  const stopInFlightRef = useRef(false);

  return useMemo(
    () => ({
      streamRef,
      mediaRecorderRef,
      recordedChunksRef,
      recordStartedAtRef,
      durationIntervalRef,
      stopTimeoutRef,
      stopPromiseRef,
      animationFrameRef,
      audioContextRef,
      analyserRef,
      analyserDataRef,
      hasDetectedSpeechRef,
      silenceStartedAtRef,
      autoStopRequestedRef,
      stopInFlightRef,
    }),
    [],
  );
}

function stopTracks(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      // noop
    }
  });
}

function clearTimers(refs: RecorderRefs) {
  if (refs.durationIntervalRef.current !== null) {
    window.clearInterval(refs.durationIntervalRef.current);
    refs.durationIntervalRef.current = null;
  }
  if (refs.stopTimeoutRef.current !== null) {
    window.clearTimeout(refs.stopTimeoutRef.current);
    refs.stopTimeoutRef.current = null;
  }
}

function resetVoiceDetection(refs: RecorderRefs) {
  refs.hasDetectedSpeechRef.current = false;
  refs.silenceStartedAtRef.current = null;
  refs.autoStopRequestedRef.current = false;
}

function cleanupAudioGraph(refs: RecorderRefs) {
  if (refs.animationFrameRef.current !== null) {
    window.cancelAnimationFrame(refs.animationFrameRef.current);
    refs.animationFrameRef.current = null;
  }
  refs.analyserRef.current = null;
  refs.analyserDataRef.current = null;
  const context = refs.audioContextRef.current;
  refs.audioContextRef.current = null;
  if (context) {
    void context.close().catch(() => undefined);
  }
}

function cleanupStream(refs: RecorderRefs) {
  const stream = refs.streamRef.current;
  refs.streamRef.current = null;
  stopTracks(stream);
  refs.mediaRecorderRef.current = null;
  refs.recordedChunksRef.current = [];
  refs.stopPromiseRef.current = null;
  refs.stopInFlightRef.current = false;
  resetVoiceDetection(refs);
}

function resetRecorderSession(args: {
  refs: RecorderRefs;
  resetLevels: () => void;
  setElapsedMs: React.Dispatch<React.SetStateAction<number>>;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTranscribing: React.Dispatch<React.SetStateAction<boolean>>;
  setProcessingPhase: React.Dispatch<React.SetStateAction<ProcessingPhase>>;
}) {
  clearTimers(args.refs);
  cleanupAudioGraph(args.refs);
  cleanupStream(args.refs);
  args.resetLevels();
  args.setElapsedMs(0);
  args.setIsRecording(false);
  args.setIsTranscribing(false);
  args.setProcessingPhase("idle");
}

function markError(
  setProcessingPhase: React.Dispatch<React.SetStateAction<ProcessingPhase>>,
  emitError: (message: string) => void,
  message: string,
) {
  setProcessingPhase("error");
  emitError(message);
}

function initializeRecorder(refs: RecorderRefs, recorder: MediaRecorder) {
  refs.mediaRecorderRef.current = recorder;
  refs.recordedChunksRef.current = [];
  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      refs.recordedChunksRef.current.push(event.data);
    }
  };
  refs.stopPromiseRef.current = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(refs.recordedChunksRef.current, { type: recorder.mimeType || "audio/webm" }));
    };
  });
}

function initializeAudioGraph(refs: RecorderRefs, stream: MediaStream) {
  const audioContext = new AudioContext();
  refs.audioContextRef.current = audioContext;
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.72;
  source.connect(analyser);
  refs.analyserRef.current = analyser;
  refs.analyserDataRef.current = new Uint8Array(analyser.frequencyBinCount);
}

/**
 * WHY:   Manual stop should terminate browser microphone capture immediately instead of waiting for upload/transcription.
 * WHAT:  Stops timers, level sampling, recorder capture, and media tracks exactly once for the active session.
 * HOW:   Uses a ref-based in-flight guard so manual stop and silence auto-stop cannot double-stop the same recorder.
 */
export function stopRecorderCapture(refs: Pick<
  RecorderRefs,
  "streamRef" | "mediaRecorderRef" | "stopInFlightRef" | "durationIntervalRef" | "stopTimeoutRef" | "animationFrameRef" | "audioContextRef" | "analyserRef" | "analyserDataRef"
>) {
  const recorder = refs.mediaRecorderRef.current;
  if (!recorder || refs.stopInFlightRef.current) {
    return { didStop: false };
  }

  refs.stopInFlightRef.current = true;
  clearTimers(refs as RecorderRefs);
  cleanupAudioGraph(refs as RecorderRefs);

  const stream = refs.streamRef.current;
  refs.streamRef.current = null;
  stopTracks(stream);

  if (recorder.state !== "inactive") {
    recorder.stop();
  }

  return { didStop: true };
}

async function getRecordingStream() {
  try {
    return await navigator.mediaDevices.getUserMedia(HIGH_QUALITY_AUDIO_CONSTRAINTS);
  } catch {
    return navigator.mediaDevices.getUserMedia({ audio: true });
  }
}

async function getMicrophonePermissionState(): Promise<MicrophonePermissionState> {
  if (typeof navigator === "undefined" || !("permissions" in navigator) || typeof navigator.permissions?.query !== "function") {
    return "unsupported";
  }

  try {
    const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
    if (result.state === "granted" || result.state === "prompt" || result.state === "denied") {
      return result.state;
    }
    return "unknown";
  } catch {
    return "unsupported";
  }
}

function scheduleRecordingTimers(
  refs: RecorderRefs,
  maxDurationMs: number,
  setElapsedMs: React.Dispatch<React.SetStateAction<number>>,
  stopRecording: () => Promise<void>,
) {
  refs.recordStartedAtRef.current = Date.now();
  refs.durationIntervalRef.current = window.setInterval(() => {
    setElapsedMs(Date.now() - refs.recordStartedAtRef.current);
  }, 100);
  refs.stopTimeoutRef.current = window.setTimeout(() => {
    void stopRecording();
  }, maxDurationMs);
}

async function resolveRecordedBlob(
  refs: RecorderRefs,
  onInvalid: (message: string) => void,
): Promise<Blob | null> {
  const stopPromise = refs.stopPromiseRef.current;
  if (!stopPromise) {
    onInvalid("تعذر إنهاء التسجيل الصوتي بشكل صحيح.");
    return null;
  }

  const blob = await stopPromise;
  if (!blob || blob.size === 0) {
    onInvalid("لم يتم التقاط أي صوت. حاول التحدث بالقرب من الميكروفون.");
    return null;
  }

  return blob;
}

async function transcribeBlob(
  blob: Blob,
  getUploadUrl: UseVoiceRecorderParams["getUploadUrl"],
  transcribeFromStorage: UseVoiceRecorderParams["transcribeFromStorage"],
) {
  const uploadActionResult = await getUploadUrl();
  if (!uploadActionResult.ok) {
    throw new Error(uploadActionResult.error.message || "تعذر تجهيز رفع الملف الصوتي.");
  }

  const storageId = await uploadAudioBlob(uploadActionResult.data.uploadUrl, blob);
  const transcriptActionResult = await transcribeFromStorage({ storageId });
  if (!transcriptActionResult.ok) {
    throw new Error(transcriptActionResult.error.message || "تعذر تفريغ الرسالة الصوتية.");
  }

  const transcript = transcriptActionResult.data.text.trim();
  if (!transcript) {
    throw new Error("لم نتمكن من استخراج نص واضح من التسجيل.");
  }

  return transcript;
}

function assignRecordingStream(refs: RecorderRefs, stream: MediaStream) {
  refs.streamRef.current = stream;
}

function sampleLevels(args: {
  refs: RecorderRefs;
  setLevels: React.Dispatch<React.SetStateAction<number[]>>;
  setProcessingPhase: React.Dispatch<React.SetStateAction<ProcessingPhase>>;
  stopRecording: () => Promise<void>;
}) {
  const analyser = args.refs.analyserRef.current;
  const dataArray = args.refs.analyserDataRef.current;
  if (!analyser || !dataArray) return;

  analyser.getByteFrequencyData(dataArray);
  const bars = buildBarsFromFrequencyData(dataArray);
  args.setLevels(bars);

  const peakLevel = Math.max(...bars, 0);
  const activity = resolveVoiceActivityPhase({
    peakLevel,
    hasDetectedSpeech: args.refs.hasDetectedSpeechRef.current,
    silenceStartedAt: args.refs.silenceStartedAtRef.current,
    now: Date.now(),
  });

  args.refs.hasDetectedSpeechRef.current = activity.hasDetectedSpeech;
  args.refs.silenceStartedAtRef.current = activity.silenceStartedAt;
  args.setProcessingPhase((current) => {
    if (current === "uploading" || current === "transcribing" || current === "sending") {
      return current;
    }
    return activity.phase;
  });

  if (activity.shouldAutoStop && !args.refs.autoStopRequestedRef.current) {
    args.refs.autoStopRequestedRef.current = true;
    void args.stopRecording();
    return;
  }

  args.refs.animationFrameRef.current = window.requestAnimationFrame(() => sampleLevels(args));
}

function useStopRecordingAction(args: {
  refs: RecorderRefs;
  emitError: (message: string) => void;
  resetLevels: () => void;
  getUploadUrl: UseVoiceRecorderParams["getUploadUrl"];
  transcribeFromStorage: UseVoiceRecorderParams["transcribeFromStorage"];
  onTranscriptReady: UseVoiceRecorderParams["onTranscriptReady"];
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTranscribing: React.Dispatch<React.SetStateAction<boolean>>;
  setProcessingPhase: React.Dispatch<React.SetStateAction<ProcessingPhase>>;
  setElapsedMs: React.Dispatch<React.SetStateAction<number>>;
  setIsPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    refs,
    emitError,
    resetLevels,
    getUploadUrl,
    transcribeFromStorage,
    onTranscriptReady,
    setIsRecording,
    setIsTranscribing,
    setProcessingPhase,
    setElapsedMs,
    setIsPanelOpen,
  } = args;

  return useCallback(async () => {
    const stopResult = stopRecorderCapture(refs);
    if (!stopResult.didStop) return;

    setIsRecording(false);
    setProcessingPhase("uploading");

    const blob = await resolveRecordedBlob(refs, (message) => {
      cleanupStream(refs);
      resetLevels();
      markError(setProcessingPhase, emitError, message);
    });
    if (!blob) return;

    setIsTranscribing(true);
    try {
      setProcessingPhase("transcribing");
      const transcript = await transcribeBlob(blob, getUploadUrl, transcribeFromStorage);
      setProcessingPhase("sending");
      await onTranscriptReady(transcript);
      setElapsedMs(0);
      resetLevels();
      setProcessingPhase("idle");
      setIsPanelOpen(false);
    } catch (error) {
      setIsPanelOpen(true);
      markError(
        setProcessingPhase,
        emitError,
        error instanceof Error ? error.message : "تعذر معالجة التسجيل الصوتي.",
      );
    } finally {
      cleanupStream(refs);
      setIsTranscribing(false);
    }
  }, [
    emitError,
    getUploadUrl,
    onTranscriptReady,
    refs,
    resetLevels,
    setElapsedMs,
    setIsPanelOpen,
    setIsRecording,
    setIsTranscribing,
    setProcessingPhase,
    transcribeFromStorage,
  ]);
}

function useCancelRecordingAction(args: {
  refs: RecorderRefs;
  resetLevels: () => void;
  setElapsedMs: React.Dispatch<React.SetStateAction<number>>;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTranscribing: React.Dispatch<React.SetStateAction<boolean>>;
  setProcessingPhase: React.Dispatch<React.SetStateAction<ProcessingPhase>>;
  setIsPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    refs,
    resetLevels,
    setElapsedMs,
    setIsRecording,
    setIsTranscribing,
    setProcessingPhase,
    setIsPanelOpen,
  } = args;

  return useCallback(() => {
    stopRecorderCapture(refs);
    resetRecorderSession({
      refs,
      resetLevels,
      setElapsedMs,
      setIsRecording,
      setIsTranscribing,
      setProcessingPhase,
    });
    setIsPanelOpen(false);
  }, [
    refs,
    resetLevels,
    setElapsedMs,
    setIsPanelOpen,
    setIsRecording,
    setIsTranscribing,
    setProcessingPhase,
  ]);
}

function useStartRecordingAction(args: {
  refs: RecorderRefs;
  disabled: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  maxDurationMs: number;
  emitError: (message: string) => void;
  resetLevels: () => void;
  stopRecording: () => Promise<void>;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTranscribing: React.Dispatch<React.SetStateAction<boolean>>;
  setProcessingPhase: React.Dispatch<React.SetStateAction<ProcessingPhase>>;
  setElapsedMs: React.Dispatch<React.SetStateAction<number>>;
  setLevels: React.Dispatch<React.SetStateAction<number[]>>;
  setIsPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPermissionState: React.Dispatch<React.SetStateAction<MicrophonePermissionState>>;
}) {
  const {
    refs,
    disabled,
    isRecording,
    isTranscribing,
    maxDurationMs,
    emitError,
    resetLevels,
    stopRecording,
    setIsRecording,
    setIsTranscribing,
    setProcessingPhase,
    setElapsedMs,
    setLevels,
    setIsPanelOpen,
    setPermissionState,
  } = args;

  return useCallback(async () => {
    if (disabled || isRecording || isTranscribing) return;

    try {
      setIsPanelOpen(true);
      setProcessingPhase("waiting_for_permission");
      const stream = await getRecordingStream();
      setPermissionState("granted");
      assignRecordingStream(refs, stream);
      resetVoiceDetection(refs);

      const recorder = new MediaRecorder(stream);
      initializeRecorder(refs, recorder);
      initializeAudioGraph(refs, stream);

      setElapsedMs(0);
      setIsRecording(true);
      refs.stopInFlightRef.current = false;
      setProcessingPhase("waiting_for_speech");
      sampleLevels({ refs, setLevels, setProcessingPhase, stopRecording });
      recorder.start(250);
      scheduleRecordingTimers(refs, maxDurationMs, setElapsedMs, stopRecording);
    } catch (error) {
      const nextPermissionState = await getMicrophonePermissionState();
      setPermissionState(nextPermissionState);
      resetRecorderSession({
        refs,
        resetLevels,
        setElapsedMs,
        setIsRecording,
        setIsTranscribing,
        setProcessingPhase,
      });
      setIsPanelOpen(true);
      markError(
        setProcessingPhase,
        emitError,
        nextPermissionState === "denied"
          ? "تم رفض إذن الميكروفون. اسمح به من المتصفح ثم اضغط إعادة المحاولة."
          : error instanceof DOMException && error.name === "NotFoundError"
            ? "لا يوجد ميكروفون متاح على هذا الجهاز حالياً."
            : "تعذر تشغيل الميكروفون حالياً. اضغط إعادة المحاولة لطلب الإذن مرة أخرى.",
      );
    }
  }, [
    disabled,
    emitError,
    isRecording,
    isTranscribing,
    maxDurationMs,
    refs,
    resetLevels,
    setElapsedMs,
    setIsPanelOpen,
    setPermissionState,
    setIsRecording,
    setIsTranscribing,
    setLevels,
    setProcessingPhase,
    stopRecording,
  ]);
}

/**
 * WHY:   Workspace chat voice input needs one reusable recorder/transcription state machine.
 * WHAT:  Handles microphone capture, bar-meter sampling, silence-aware auto-stop, upload, server transcription, and callback delivery.
 * HOW:   Uses MediaRecorder + AnalyserNode in the browser, waits for real speech, then auto-sends after ~1s of silence or a manual stop.
 */
export function useVoiceRecorder({
  getUploadUrl,
  transcribeFromStorage,
  onTranscriptReady,
  onError,
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  disabled = false,
}: UseVoiceRecorderParams) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<MicrophonePermissionState>("unknown");
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [levels, setLevels] = useState<number[]>(createEmptyLevels);
  const refs = useRecorderRefs();

  const resetLevels = useCallback(() => setLevels(createEmptyLevels()), []);
  const emitError = useCallback((message: string) => onError?.(message), [onError]);

  const stopRecording = useStopRecordingAction({
    refs,
    emitError,
    resetLevels,
    getUploadUrl,
    transcribeFromStorage,
    onTranscriptReady,
    setIsRecording,
    setIsTranscribing,
    setProcessingPhase,
    setElapsedMs,
    setIsPanelOpen,
  });

  const cancelRecording = useCancelRecordingAction({
    refs,
    resetLevels,
    setElapsedMs,
    setIsRecording,
    setIsTranscribing,
    setProcessingPhase,
    setIsPanelOpen,
  });

  const startRecording = useStartRecordingAction({
    refs,
    disabled,
    isRecording,
    isTranscribing,
    maxDurationMs,
    emitError,
    resetLevels,
    stopRecording,
    setIsRecording,
    setIsTranscribing,
    setProcessingPhase,
    setElapsedMs,
    setLevels,
    setIsPanelOpen,
    setPermissionState,
  });

  const requestMicrophonePermission = useCallback(async () => {
    setIsPanelOpen(true);
    setProcessingPhase("waiting_for_permission");
    try {
      const stream = await getRecordingStream();
      setPermissionState("granted");
      stopTracks(stream);
      setProcessingPhase("idle");
      await startRecording();
    } catch (error) {
      const nextPermissionState = await getMicrophonePermissionState();
      setPermissionState(nextPermissionState);
      setProcessingPhase("error");
      emitError(
        nextPermissionState === "denied"
          ? "تم رفض إذن الميكروفون. اسمح به من المتصفح ثم اضغط إعادة المحاولة."
          : "تعذر تشغيل الميكروفون حالياً. اضغط إعادة المحاولة لطلب الإذن مرة أخرى.",
      );
    }
  }, [emitError, startRecording]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
      return;
    }
    if (isTranscribing) {
      return;
    }
    await startRecording();
  }, [isRecording, isTranscribing, startRecording, stopRecording]);

  useEffect(() => {
    void getMicrophonePermissionState().then(setPermissionState);
  }, []);

  useEffect(() => {
    return () => {
      resetRecorderSession({
        refs,
        resetLevels,
        setElapsedMs,
        setIsRecording,
        setIsTranscribing,
        setProcessingPhase,
      });
    };
  }, [refs, resetLevels]);

  return {
    elapsedMs,
    isRecording,
    isPanelOpen,
    isTranscribing,
    permissionState,
    processingPhase,
    levels,
    startRecording,
    stopRecording,
    cancelRecording,
    requestMicrophonePermission,
    toggleRecording,
  };
}
