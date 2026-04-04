import { apiUnsafe } from "@/lib/convexApi";

export type AnanProApiRefs = {
  getThreadSafe: unknown;
  getThreadById: unknown;
  listMessages: unknown;
  listThreads: unknown;
  listStreamEvents: unknown;
  cancelStreamSession: unknown;
  sendMessage: unknown;
  generateVoiceUploadUrl: unknown;
  transcribeVoiceFromStorage: unknown;
  finalizeUploadedFiles: unknown;
};

export const ananProApi = apiUnsafe["ai_zone/assistantWorkspace"] as AnanProApiRefs;
