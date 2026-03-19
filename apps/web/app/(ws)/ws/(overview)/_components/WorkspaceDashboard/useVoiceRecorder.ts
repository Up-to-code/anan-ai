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

type UseVoiceRecorderParams = {
  getUploadUrl: UploadUrlAction;
  transcribeFromStorage: TranscribeAction;
  onTranscriptReady: (text: string) => void | Promise<void>;
  onError?: (message: string) => void;
  maxDurationMs?: number;
  disabled?: boolean;
};

const DEFAULT_MAX_DURATION_MS = 300_000;
const METER_BARS = 12;

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

export function buildBarsFromFrequencyData(dataArray: Uint8Array, bars = METER_BARS) {
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
    throw new Error("تعذر رفع التسجيل الصوتي.");
  }

  const payload = (await response.json().catch(() => null)) as { storageId?: string } | null;
  const storageId = payload?.storageId?.trim();
  if (!storageId) {
    throw new Error("تعذر تجهيز الملف الصوتي للتفريغ.");
  }

  return storageId;
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
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<"idle" | "recording" | "uploading" | "transcribing" | "sending" | "error">("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: METER_BARS }, () => 0));

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
  const analyserDataRef = useRef<Uint8Array | null>(null);

  const resetLevels = useCallback(() => {
    setLevels(Array.from({ length: METER_BARS }, () => 0));
  }, []);

  const emitError = useCallback(
    (message: string) => {
      onError?.(message);
    },
    [onError],
  );

  const clearTimers = useCallback(() => {
    if (durationIntervalRef.current !== null) {
      window.clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (stopTimeoutRef.current !== null) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
  }, []);

  const cleanupAudioGraph = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    analyserRef.current = null;
    analyserDataRef.current = null;
    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context) {
      void context.close().catch(() => undefined);
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
  }, []);

  const sampleLevels = useCallback(() => {
    const analyser = analyserRef.current;
    const dataArray = analyserDataRef.current;
    if (!analyser || !dataArray) return;

    analyser.getByteFrequencyData(dataArray);
    setLevels(buildBarsFromFrequencyData(dataArray));
    animationFrameRef.current = window.requestAnimationFrame(sampleLevels);
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) {
      return;
    }

    clearTimers();
    cleanupAudioGraph();

    const recorder = mediaRecorderRef.current;
    if (recorder.state === "inactive") {
      return;
    }
    setIsRecording(false);
    setProcessingPhase("uploading");
    recorder.stop();

    const stopPromise = stopPromiseRef.current;
    if (!stopPromise) {
      cleanupStream();
      resetLevels();
      setProcessingPhase("error");
      emitError("تعذر إنهاء التسجيل الصوتي بشكل صحيح.");
      return;
    }

    const blob = await stopPromise;
    if (!blob || blob.size === 0) {
      cleanupStream();
      resetLevels();
      setProcessingPhase("error");
      emitError("لم يتم التقاط أي صوت. حاول التحدث بالقرب من الميكروفون.");
      return;
    }

    setIsTranscribing(true);
    try {
      const uploadActionResult = await getUploadUrl();
      if (!uploadActionResult.ok) {
        throw new Error(uploadActionResult.error.message || "تعذر تجهيز رفع الملف الصوتي.");
      }

      const storageId = await uploadAudioBlob(uploadActionResult.data.uploadUrl, blob);
      setProcessingPhase("transcribing");
      const transcriptActionResult = await transcribeFromStorage({ storageId });
      if (!transcriptActionResult.ok) {
        throw new Error(transcriptActionResult.error.message || "تعذر تفريغ الرسالة الصوتية.");
      }

      const transcript = transcriptActionResult.data.text.trim();
      if (!transcript) {
        throw new Error("لم نتمكن من استخراج نص واضح من التسجيل.");
      }

      setProcessingPhase("sending");
      await onTranscriptReady(transcript);
      setElapsedMs(0);
      resetLevels();
      setProcessingPhase("idle");
    } catch (error) {
      setProcessingPhase("error");
      emitError(error instanceof Error ? error.message : "تعذر معالجة التسجيل الصوتي.");
    } finally {
      cleanupStream();
      setIsTranscribing(false);
    }
  }, [
    cleanupAudioGraph,
    cleanupStream,
    clearTimers,
    emitError,
    getUploadUrl,
    onTranscriptReady,
    resetLevels,
    transcribeFromStorage,
  ]);

  const startRecording = useCallback(async () => {
    if (disabled || isRecording || isTranscribing) {
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(HIGH_QUALITY_AUDIO_CONSTRAINTS);
      } catch {
        // Graceful fallback for browsers that reject advanced constraints.
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];
      setElapsedMs(0);
      setIsRecording(true);
      setProcessingPhase("recording");

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      stopPromiseRef.current = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(recordedChunksRef.current, { type: recorder.mimeType || "audio/webm" }));
        };
      });

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.72;
      source.connect(analyser);
      analyserRef.current = analyser;
      analyserDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      sampleLevels();

      recorder.start(250);
      recordStartedAtRef.current = Date.now();
      durationIntervalRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - recordStartedAtRef.current);
      }, 100);
      stopTimeoutRef.current = window.setTimeout(() => {
        void stopRecording();
      }, maxDurationMs);
    } catch {
      cleanupStream();
      cleanupAudioGraph();
      clearTimers();
      resetLevels();
      setProcessingPhase("error");
      emitError("فشل الوصول إلى الميكروفون. تأكد من منح الإذن للمتصفح.");
    }
  }, [
    cleanupAudioGraph,
    cleanupStream,
    clearTimers,
    disabled,
    emitError,
    isRecording,
    isTranscribing,
    maxDurationMs,
    resetLevels,
    sampleLevels,
    stopRecording,
  ]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
      return;
    }
    await startRecording();
  }, [isRecording, startRecording, stopRecording]);

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
    isTranscribing,
    processingPhase,
    levels,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
