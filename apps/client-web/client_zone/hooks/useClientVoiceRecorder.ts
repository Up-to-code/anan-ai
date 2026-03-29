"use client";

import { useAction, useMutation } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/convexApi";

type VoiceUploadSession = {
  guestId: string;
  channelSessionToken: string;
  expiresAt: number;
};

export type ClientVoicePermissionState = "unknown" | "unsupported" | "prompt" | "granted" | "denied";
export type ClientVoiceProcessingPhase =
  | "idle"
  | "waiting_for_permission"
  | "recording"
  | "uploading"
  | "transcribing"
  | "sending"
  | "error";

const VOICE_SESSION_STORAGE_KEY = "anan-client-public-voice-session";
const LEVEL_BAR_COUNT = 12;

function loadVoiceUploadSession() {
  if (typeof window === "undefined") return null as VoiceUploadSession | null;
  try {
    const value = window.sessionStorage.getItem(VOICE_SESSION_STORAGE_KEY);
    return value ? (JSON.parse(value) as VoiceUploadSession) : null;
  } catch {
    return null;
  }
}

function saveVoiceUploadSession(session: VoiceUploadSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(VOICE_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function createEmptyLevels() {
  return Array.from({ length: LEVEL_BAR_COUNT }, () => 0);
}

function buildLevelsFromFrequencyData(dataArray: Uint8Array, bars = LEVEL_BAR_COUNT) {
  if (dataArray.length === 0) {
    return createEmptyLevels();
  }

  const bucketSize = Math.max(1, Math.floor(dataArray.length / bars));
  return Array.from({ length: bars }, (_, index) => {
    const start = index * bucketSize;
    const end = Math.min(start + bucketSize, dataArray.length);
    let sum = 0;

    for (let cursor = start; cursor < end; cursor += 1) {
      sum += dataArray[cursor] ?? 0;
    }

    const average = sum / Math.max(1, end - start);
    return Math.min(1, Math.max(0, average / 255));
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
 * WHY:   The buyer assistant needs one browser-safe voice recorder that can transcribe and submit speech like a normal chat turn.
 * WHAT:  Manages microphone permission, recording, upload, transcription, and transcript handoff for the public client assistant.
 * HOW:   Records with `MediaRecorder`, uploads audio to Convex storage through the public guest session, then delegates the transcript back to the caller.
 */
export function useClientVoiceRecorder({
  disabled = false,
  onTranscriptReady,
}: {
  disabled?: boolean;
  onTranscriptReady: (transcript: string) => Promise<void> | void;
}) {
  const bootstrapPublicSession = useMutation(api.ai_zone.assistantPublic.bootstrapSession);
  const generateVoiceUploadUrl = useMutation(api.ai_zone.assistantPublic.generateVoiceUploadUrl);
  const transcribeVoiceFromStorage = useAction(api.ai_zone.assistantPublic.transcribeVoiceFromStorage);

  const [permissionState, setPermissionState] = useState<ClientVoicePermissionState>("unknown");
  const [processingPhase, setProcessingPhase] = useState<ClientVoiceProcessingPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => createEmptyLevels());

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const durationIntervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const stopResolverRef = useRef<((blob: Blob) => void) | null>(null);

  const isRecording = processingPhase === "recording";
  const isBusy = processingPhase !== "idle" && processingPhase !== "error";

  const cleanupAudioGraph = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
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

  const stopTracks = useCallback(() => {
    if (!mediaStreamRef.current) return;
    mediaStreamRef.current.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // no-op
      }
    });
    mediaStreamRef.current = null;
  }, []);

  const resetRecorderState = useCallback(() => {
    if (durationIntervalRef.current !== null) {
      window.clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    cleanupAudioGraph();
    stopTracks();
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    stopResolverRef.current = null;
    setElapsedMs(0);
    setLevels(createEmptyLevels());
  }, [cleanupAudioGraph, stopTracks]);

  const ensureVoiceUploadSession = useCallback(async () => {
    const stored = loadVoiceUploadSession();
    if (stored?.guestId && stored.channelSessionToken && stored.expiresAt > Date.now()) {
      return stored;
    }

    const bootstrapped = await bootstrapPublicSession({
      guestId: stored?.guestId,
    });
    const nextSession = {
      guestId: bootstrapped.guestId,
      channelSessionToken: bootstrapped.channelSessionToken,
      expiresAt: bootstrapped.expiresAt,
    };
    saveVoiceUploadSession(nextSession);
    return nextSession;
  }, [bootstrapPublicSession]);

  const sampleLevels = useCallback(() => {
    const analyser = analyserRef.current;
    const data = analyserDataRef.current;
    if (!analyser || !data) return;

    analyser.getByteFrequencyData(data);
    setLevels(buildLevelsFromFrequencyData(data));
    animationFrameRef.current = requestAnimationFrame(sampleLevels);
  }, []);

  const startRecording = useCallback(async () => {
    if (disabled || isBusy) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setPermissionState("unsupported");
      setProcessingPhase("error");
      setErrorMessage("التسجيل الصوتي غير مدعوم في هذا المتصفح.");
      return;
    }

    setErrorMessage(null);
    setProcessingPhase("waiting_for_permission");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: { ideal: 1 },
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: { ideal: true },
        },
      });

      mediaStreamRef.current = stream;
      setPermissionState("granted");

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : undefined,
      });
      recordedChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        stopResolverRef.current?.(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setProcessingPhase("recording");

      const context = new AudioContext();
      audioContextRef.current = context;
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.76;
      source.connect(analyser);
      analyserRef.current = analyser;
      analyserDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      sampleLevels();

      const startedAt = Date.now();
      setElapsedMs(0);
      durationIntervalRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - startedAt);
      }, 120);
    } catch {
      setPermissionState("denied");
      setProcessingPhase("error");
      setErrorMessage("لم نتمكن من الوصول إلى الميكروفون.");
      resetRecorderState();
    }
  }, [disabled, isBusy, resetRecorderState, sampleLevels]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    resetRecorderState();
    setProcessingPhase("idle");
    setErrorMessage(null);
  }, [resetRecorderState]);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    const blobPromise = new Promise<Blob>((resolve) => {
      stopResolverRef.current = resolve;
    });

    recorder.stop();
    stopTracks();
    cleanupAudioGraph();
    if (durationIntervalRef.current !== null) {
      window.clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    try {
      const blob = await blobPromise;
      setProcessingPhase("uploading");
      const session = await ensureVoiceUploadSession();
      const uploadUrl = await generateVoiceUploadUrl({
        guestId: session.guestId,
        channelSessionToken: session.channelSessionToken,
      });
      const storageId = await uploadAudioBlob(uploadUrl, blob);

      setProcessingPhase("transcribing");
      const transcript = await transcribeVoiceFromStorage({
        guestId: session.guestId,
        channelSessionToken: session.channelSessionToken,
        storageId: storageId as never,
      });
      const text = transcript.text.trim();
      if (!text) {
        throw new Error("وصلنا التسجيل لكن بدون نص قابل للإرسال.");
      }

      setProcessingPhase("sending");
      await onTranscriptReady(text);
      resetRecorderState();
      setProcessingPhase("idle");
      setErrorMessage(null);
    } catch (error) {
      resetRecorderState();
      setProcessingPhase("error");
      setErrorMessage(error instanceof Error ? error.message : "تعذر معالجة التسجيل الصوتي.");
    }
  }, [
    cleanupAudioGraph,
    ensureVoiceUploadSession,
    generateVoiceUploadUrl,
    onTranscriptReady,
    resetRecorderState,
    stopTracks,
    transcribeVoiceFromStorage,
  ]);

  useEffect(() => {
    return () => {
      cancelRecording();
    };
  }, [cancelRecording]);

  return useMemo(
    () => ({
      permissionState,
      processingPhase,
      errorMessage,
      elapsedMs,
      levels,
      isRecording,
      isBusy,
      startRecording,
      stopRecording,
      cancelRecording,
    }),
    [
      permissionState,
      processingPhase,
      errorMessage,
      elapsedMs,
      levels,
      isRecording,
      isBusy,
      startRecording,
      stopRecording,
      cancelRecording,
    ],
  );
}
