import type {
  AnanProStreamEvent,
  AnanProThread,
  AnanProThreadSummary,
  SendAnanProMessageInput,
  TranscribeVoiceFromStorageInput,
  TranscribeVoiceFromStorageResult,
} from "@/server/contracts/ananPro";
import type { UploadedFileReference } from "@/server/contracts/files";

export type RawAssistantThread = {
  _id: string;
  title?: string;
  updatedAt: number;
} | null;

export type RawAssistantMessage = {
  _id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    uiTurn?: unknown;
    meta?: unknown;
    inputMode?: "text" | "voice" | "attachment";
    attachments?: UploadedFileReference[];
  };
  createdAt: number;
};

export type AnanProRepository = {
  getThread(token: string, threadId?: string): Promise<AnanProThread | null>;
  listThreads(token: string, limit?: number): Promise<AnanProThreadSummary[]>;
  sendMessage(token: string, input: SendAnanProMessageInput): Promise<AnanProThread>;
  listStreamEvents(
    token: string,
    input: { sessionId: string; afterSeq?: number; limit?: number },
  ): Promise<AnanProStreamEvent[]>;
  cancelStreamSession(token: string, sessionId: string): Promise<{ ok: true; sessionId: string }>;
  getVoiceUploadUrl(token: string): Promise<string>;
  transcribeVoiceFromStorage(
    token: string,
    input: TranscribeVoiceFromStorageInput,
  ): Promise<TranscribeVoiceFromStorageResult>;
  finalizeUploadedFiles(
    token: string,
    input: {
      files: Array<{
        storageId: string;
        name: string;
        size?: number;
        mime?: string;
      }>;
    },
  ): Promise<UploadedFileReference[]>;
};
