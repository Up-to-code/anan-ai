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
type ProcessingPhase = "idle" | "recording" | "uploading" | "transcribing" | "sending" | "error";
type RecorderRefs = { streamRef: React.MutableRefObject<MediaStream | null>; mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>; recordedChunksRef: React.MutableRefObject<BlobPart[]>; recordStartedAtRef: React.MutableRefObject<number>; durationIntervalRef: React.MutableRefObject<number | null>; stopTimeoutRef: React.MutableRefObject<number | null>; stopPromiseRef: React.MutableRefObject<Promise<Blob> | null>; animationFrameRef: React.MutableRefObject<number | null>; audioContextRef: React.MutableRefObject<AudioContext | null>; analyserRef: React.MutableRefObject<AnalyserNode | null>; analyserDataRef: React.MutableRefObject<Uint8Array<ArrayBuffer> | null> };
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
  };
}
function stopTracks(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      // no-op
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
}
function sampleLevels(refs: RecorderRefs, setLevels: React.Dispatch<React.SetStateAction<number[]>>) {
  const analyser = refs.analyserRef.current;
  const dataArray = refs.analyserDataRef.current;
  if (!analyser || !dataArray) return;
  analyser.getByteFrequencyData(dataArray);
  setLevels(buildBarsFromFrequencyData(dataArray));
  refs.animationFrameRef.current = window.requestAnimationFrame(() => sampleLevels(refs, setLevels));
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

function useStopRecordingAction(args: { refs: RecorderRefs; emitError: (message: string) => void; resetLevels: () => void; getUploadUrl: UseVoiceRecorderParams["getUploadUrl"]; transcribeFromStorage: UseVoiceRecorderParams["transcribeFromStorage"]; onTranscriptReady: UseVoiceRecorderParams["onTranscriptReady"]; setIsRecording: React.Dispatch<React.SetStateAction<boolean>>; setIsTranscribing: React.Dispatch<React.SetStateAction<boolean>>; setProcessingPhase: React.Dispatch<React.SetStateAction<ProcessingPhase>>; setElapsedMs: React.Dispatch<React.SetStateAction<number>> }) {
  return useCallback(async () => {
    const recorder = args.refs.mediaRecorderRef.current;
    if (!recorder) return;
    clearTimers(args.refs);
    cleanupAudioGraph(args.refs);
    if (recorder.state === "inactive") return;
    args.setIsRecording(false);
    args.setProcessingPhase("uploading");
    recorder.stop();
    const blob = await resolveRecordedBlob(args.refs, (message) => {
      cleanupStream(args.refs);
      args.resetLevels();
      markError(args.setProcessingPhase, args.emitError, message);
    });
    if (!blob) return;
    args.setIsTranscribing(true);
    try {
      args.setProcessingPhase("transcribing");
      const transcript = await transcribeBlob(blob, args.getUploadUrl, args.transcribeFromStorage);
      args.setProcessingPhase("sending");
      await args.onTranscriptReady(transcript);
      args.setElapsedMs(0);
      args.resetLevels();
      args.setProcessingPhase("idle");
    } catch (error) {
      markError(args.setProcessingPhase, args.emitError, error instanceof Error ? error.message : "تعذر معالجة التسجيل الصوتي.");
    } finally {
      cleanupStream(args.refs);
      args.setIsTranscribing(false);
    }
  }, [args]);
}

function useStartRecordingAction(args: { refs: RecorderRefs; disabled: boolean; isRecording: boolean; isTranscribing: boolean; maxDurationMs: number; emitError: (message: string) => void; resetLevels: () => void; stopRecording: () => Promise<void>; setIsRecording: React.Dispatch<React.SetStateAction<boolean>>; setProcessingPhase: React.Dispatch<React.SetStateAction<ProcessingPhase>>; setElapsedMs: React.Dispatch<React.SetStateAction<number>>; setLevels: React.Dispatch<React.SetStateAction<number[]>> }) {
  return useCallback(async () => {
    if (args.disabled || args.isRecording || args.isTranscribing) return;
    try {
      const stream = await getRecordingStream();
      args.refs.streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      initializeRecorder(args.refs, recorder);
      args.setElapsedMs(0);
      args.setIsRecording(true);
      args.setProcessingPhase("recording");
      initializeAudioGraph(args.refs, stream);
      sampleLevels(args.refs, args.setLevels);
      recorder.start(250);
      scheduleRecordingTimers(args.refs, args.maxDurationMs, args.setElapsedMs, args.stopRecording);
    } catch {
      cleanupStream(args.refs);
      cleanupAudioGraph(args.refs);
      clearTimers(args.refs);
      args.resetLevels();
      markError(args.setProcessingPhase, args.emitError, "فشل الوصول إلى الميكروفون. تأكد من منح الإذن للمتصفح.");
    }
  }, [args]);
}
/**
 * WHY:   Workspace chat voice input needs one reusable recorder/transcription state machine.
 * WHAT:  Handles microphone capture, bar-meter sampling, upload, server transcription, and callback delivery.
 * HOW:   Uses MediaRecorder + AnalyserNode in the browser, enforces a max duration, then delegates upload/transcribe to server actions.
 */
export function useVoiceRecorder({
  getUploadUrl,
  transcribeFromStorage,
  onTranscriptReady,
  onError,
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  disabled = false,
}: UseVoiceRecorderParams) {
  const [isRecording, setIsRecording] = useState(false), [isTranscribing, setIsTranscribing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>("idle"), [elapsedMs, setElapsedMs] = useState(0);
  const [levels, setLevels] = useState<number[]>(createEmptyLevels), refs = useRecorderRefs();
  const resetLevels = useCallback(() => setLevels(createEmptyLevels()), []), emitError = useCallback((message: string) => onError?.(message), [onError]);
  const stopRecording = useStopRecordingAction({ refs, emitError, resetLevels, getUploadUrl, transcribeFromStorage, onTranscriptReady, setIsRecording, setIsTranscribing, setProcessingPhase, setElapsedMs });
  const startRecording = useStartRecordingAction({ refs, disabled, isRecording, isTranscribing, maxDurationMs, emitError, resetLevels, stopRecording, setIsRecording, setProcessingPhase, setElapsedMs, setLevels });
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
      return;
    }
    await startRecording();
  }, [isRecording, startRecording, stopRecording]);
  useEffect(() => () => { clearTimers(refs); cleanupAudioGraph(refs); cleanupStream(refs); }, [refs]);
  return { elapsedMs, isRecording, isTranscribing, processingPhase, levels, startRecording, stopRecording, toggleRecording };
}
