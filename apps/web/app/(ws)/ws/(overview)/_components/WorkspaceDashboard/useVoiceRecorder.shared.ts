export type ActionError = {
  message: string;
};

export type UploadUrlAction = () => Promise<
  | { ok: true; data: { uploadUrl: string } }
  | { ok: false; error: ActionError }
>;

export type TranscribeAction = (input: { storageId: string }) => Promise<
  | { ok: true; data: { text: string; languageCode?: string } }
  | { ok: false; error: ActionError }
>;

export type UseVoiceRecorderParams = {
  getUploadUrl: UploadUrlAction;
  transcribeFromStorage: TranscribeAction;
  onTranscriptReady: (text: string) => void | Promise<void>;
  onError?: (message: string) => void;
  maxDurationMs?: number;
  disabled?: boolean;
};

export const DEFAULT_MAX_DURATION_MS = 300_000;
export const METER_BARS = 12;

export const HIGH_QUALITY_AUDIO_CONSTRAINTS: MediaStreamConstraints = {
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

export async function uploadBlobToStorage(uploadUrl: string, blob: Blob, errorMessages?: {
  uploadFailed?: string;
  missingStorageId?: string;
}) {
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": blob.type || "application/octet-stream",
    },
    body: blob,
  });

  if (!response.ok) {
    throw new Error(errorMessages?.uploadFailed ?? "تعذر رفع الملف.");
  }

  const payload = (await response.json().catch(() => null)) as { storageId?: string } | null;
  const storageId = payload?.storageId?.trim();
  if (!storageId) {
    throw new Error(errorMessages?.missingStorageId ?? "تعذر تجهيز الملف المرفوع.");
  }

  return storageId;
}

export async function uploadAudioBlob(uploadUrl: string, blob: Blob) {
  return uploadBlobToStorage(uploadUrl, blob, {
    uploadFailed: "تعذر رفع التسجيل الصوتي.",
    missingStorageId: "تعذر تجهيز الملف الصوتي للتفريغ.",
  });
}
