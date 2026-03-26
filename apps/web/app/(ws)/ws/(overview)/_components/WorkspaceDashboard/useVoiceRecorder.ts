"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  | "waiting_for_speech"
  | "recording"
  | "silence_countdown"
  | "uploading"
  | "transcribing"
  | "sending"
  | "error";

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
  return {
    streamRef: useRef<MediaStream | null>(null),
    mediaRecorderRef: useRef<MediaRecorder | null>(null),
    recordedChunksRef: useRef<BlobPart[]>([]),
    recordStartedAtRef: useRef<number>(0),
    durationIntervalRef: useRef<number | null>(null),
    stopTimeoutRef: useRef<number | null>(null),
    stopPromiseRef: useRef<Promise<Blob> | null>(null),
    animationFrameRef: useRef<number | null>(null),
    audioContextRef: useRef<AudioContext | null>(null),
    analyserRef: useRef<AnalyserNode | null>(null),
    analyserDataRef: useRef<Uint8Array<ArrayBuffer> | null>(null),
    hasDetectedSpeechRef: useRef(false),
    silenceStartedAtRef: useRef<number | null>(null),
    autoStopRequestedRef: useRef(false),
  };
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
  resetVoiceDetection(refs);
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

async function getRecordingStream() {
  try {
    return await navigator.mediaDevices.getUserMedia(HIGH_QUALITY_AUDIO_CONSTRAINTS);
  } catch {
    return navigator.mediaDevices.getUserMedia({ audio: true });
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
  } = args;

  return useCallback(async () => {
    const recorder = refs.mediaRecorderRef.current;
    if (!recorder) return;

    clearTimers(refs);
    cleanupAudioGraph(refs);

    if (recorder.state === "inactive") return;

    setIsRecording(false);
    setProcessingPhase("uploading");
    recorder.stop();

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
    } catch (error) {
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
    setIsRecording,
    setIsTranscribing,
    setProcessingPhase,
    transcribeFromStorage,
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
  setProcessingPhase: React.Dispatch<React.SetStateAction<ProcessingPhase>>;
  setElapsedMs: React.Dispatch<React.SetStateAction<number>>;
  setLevels: React.Dispatch<React.SetStateAction<number[]>>;
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
    setProcessingPhase,
    setElapsedMs,
    setLevels,
  } = args;

  return useCallback(async () => {
    if (disabled || isRecording || isTranscribing) return;

    try {
      const stream = await getRecordingStream();
      assignRecordingStream(refs, stream);
      resetVoiceDetection(refs);

      const recorder = new MediaRecorder(stream);
      initializeRecorder(refs, recorder);
      initializeAudioGraph(refs, stream);

      setElapsedMs(0);
      setIsRecording(true);
      setProcessingPhase("waiting_for_speech");
      sampleLevels({ refs, setLevels, setProcessingPhase, stopRecording });
      recorder.start(250);
      scheduleRecordingTimers(refs, maxDurationMs, setElapsedMs, stopRecording);
    } catch {
      cleanupStream(refs);
      cleanupAudioGraph(refs);
      clearTimers(refs);
      resetLevels();
      markError(setProcessingPhase, emitError, "فشل الوصول إلى الميكروفون. تأكد من منح الإذن للمتصفح.");
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
    setIsRecording,
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
    setProcessingPhase,
    setElapsedMs,
    setLevels,
  });

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
      return;
    }
    await startRecording();
  }, [isRecording, startRecording, stopRecording]);

  useEffect(() => {
    return () => {
      clearTimers(refs);
      cleanupAudioGraph(refs);
      cleanupStream(refs);
    };
  }, [refs]);

  return {
    elapsedMs,
    isRecording,
    isTranscribing,
    processingPhase,
    levels,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
