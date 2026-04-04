import { requireSessionContext } from "@/server/auth/session";
import {
  convexAnanProRepository,
  type AnanProRepository,
} from "@/server/infrastructure/convex/ai/ananPro";
import type {
  AnanProStreamEvent,
  SendAnanProMessageInput,
  TranscribeVoiceFromStorageInput,
} from "@/server/contracts/ananPro";
import type { UploadedFileReference } from "@/server/contracts/files";

type AnanProServiceDependencies = {
  requireSession: typeof requireSessionContext;
  repository: AnanProRepository;
};

const defaultDependencies: AnanProServiceDependencies = {
  requireSession: requireSessionContext,
  repository: convexAnanProRepository,
};

export async function getAnanProThread(
  threadId?: string,
  dependencies: AnanProServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.getThread(session.token, threadId);
}

export async function listAnanProThreads(
  limit = 6,
  dependencies: AnanProServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.listThreads(session.token, limit);
}

export async function sendAnanProMessage(
  input: SendAnanProMessageInput,
  dependencies: AnanProServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.sendMessage(session.token, input);
}

export async function listAnanProStreamEvents(
  input: { sessionId: string; afterSeq?: number; limit?: number },
  dependencies: AnanProServiceDependencies = defaultDependencies,
): Promise<AnanProStreamEvent[]> {
  const session = await dependencies.requireSession();
  return dependencies.repository.listStreamEvents(session.token, input);
}

export async function cancelAnanProStreamSession(
  sessionId: string,
  dependencies: AnanProServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.cancelStreamSession(session.token, sessionId);
}

export async function getAnanProVoiceUploadUrl(
  dependencies: AnanProServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.getVoiceUploadUrl(session.token);
}

export async function transcribeAnanProVoiceFromStorage(
  input: TranscribeVoiceFromStorageInput,
  dependencies: AnanProServiceDependencies = defaultDependencies,
) {
  const session = await dependencies.requireSession();
  return dependencies.repository.transcribeVoiceFromStorage(session.token, input);
}

export async function finalizeAnanProUploadedFiles(
  input: {
    files: Array<{
      storageId: string;
      name: string;
      size?: number;
      mime?: string;
    }>;
  },
  dependencies: AnanProServiceDependencies = defaultDependencies,
): Promise<UploadedFileReference[]> {
  const session = await dependencies.requireSession();
  return dependencies.repository.finalizeUploadedFiles(session.token, input);
}
