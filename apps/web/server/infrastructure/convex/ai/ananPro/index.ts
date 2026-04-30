import { actionRef, mutationRef, queryRef } from "@anan/convex-adapters/repository";
import { ananProApi } from "./api";
import { mapThreadMessages, resolveThreadTitle } from "./mappers";
import type { AnanProRepository, RawAssistantMessage, RawAssistantThread } from "./types";

export type { AnanProRepository } from "./types";

async function fetchThreadMessages(token: string, threadId: string) {
  return queryRef<RawAssistantMessage[]>(token, ananProApi.listMessages, { threadId });
}

async function fetchThreadSummary(token: string, threadId: string) {
  return queryRef<RawAssistantThread>(token, ananProApi.getThreadById, { threadId });
}

export const convexAnanProRepository: AnanProRepository = {
  async getThread(token, threadId) {
    if (threadId) {
      const messages = await fetchThreadMessages(token, threadId);

      if (messages.length === 0) {
        const thread = await fetchThreadSummary(token, threadId);
        if (!thread?._id) {
          return null;
        }
        return {
          id: thread._id,
          title: thread.title ?? null,
          messages: [],
        };
      }

      return {
        id: threadId,
        title: resolveThreadTitle(messages),
        messages: mapThreadMessages(messages),
      };
    }

    const { thread } = await queryRef<{ thread: RawAssistantThread }>(token, ananProApi.getThreadSafe);

    if (!thread?._id) {
      return null;
    }

    const messages = await fetchThreadMessages(token, thread._id);

    return {
      id: thread._id,
      title: thread?.title ?? null,
      messages: mapThreadMessages(messages),
    };
  },

  async listThreads(token, limit = 6) {
    const threads = await queryRef<Array<{ _id: string; title?: string; updatedAt: number }>>(
      token,
      ananProApi.listThreads,
      { limit },
    );

    return threads.map((thread) => ({
      id: thread._id,
      title: thread.title ?? null,
      updatedAt: thread.updatedAt,
    }));
  },

  async sendMessage(token, input) {
    const response = await actionRef<{ threadId: string }>(token, ananProApi.sendMessage, input);

    const messages = await fetchThreadMessages(token, response.threadId);

    return {
      id: response.threadId,
      title: messages[0]?.content.slice(0, 80) ?? "anan workspace",
      messages: mapThreadMessages(messages),
    };
  },

  async listStreamEvents(token, input) {
    return queryRef<Awaited<ReturnType<AnanProRepository["listStreamEvents"]>>>(
      token,
      ananProApi.listStreamEvents,
      input,
    );
  },

  async cancelStreamSession(token, sessionId) {
    return mutationRef<Awaited<ReturnType<AnanProRepository["cancelStreamSession"]>>>(
      token,
      ananProApi.cancelStreamSession,
      { sessionId },
    );
  },

  async getVoiceUploadUrl(token) {
    return mutationRef<Awaited<ReturnType<AnanProRepository["getVoiceUploadUrl"]>>>(
      token,
      ananProApi.generateVoiceUploadUrl,
    );
  },

  async transcribeVoiceFromStorage(token, input) {
    return actionRef<Awaited<ReturnType<AnanProRepository["transcribeVoiceFromStorage"]>>>(
      token,
      ananProApi.transcribeVoiceFromStorage,
      input,
    );
  },

  async finalizeUploadedFiles(token, input) {
    return mutationRef<Awaited<ReturnType<AnanProRepository["finalizeUploadedFiles"]>>>(
      token,
      ananProApi.finalizeUploadedFiles,
      input,
    );
  },
};
