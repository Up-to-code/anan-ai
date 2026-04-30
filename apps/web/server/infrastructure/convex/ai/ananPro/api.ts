import { createRepositoryRefs } from "@anan/convex-adapters/repository";
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

export const ananProApi = createRepositoryRefs<AnanProApiRefs>(apiUnsafe, "ai_zone/assistantWorkspace");
