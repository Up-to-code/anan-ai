import { fetchAction, fetchMutation, fetchQuery } from "convex/nextjs";
import { ananProApi } from "./api";
import { mapThreadMessages, resolveThreadTitle } from "./mappers";
import type { AnanProRepository, RawAssistantMessage, RawAssistantThread } from "./types";

export type { AnanProRepository } from "./types";

async function fetchThreadMessages(token: string, threadId: string) {
  return (await fetchQuery(ananProApi.listMessages as never, { threadId } as never, {
    token,
  })) as RawAssistantMessage[];
}

async function fetchThreadSummary(token: string, threadId: string) {
  return (await fetchQuery(ananProApi.getThreadById as never, { threadId } as never, {
    token,
  })) as RawAssistantThread;
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

    const { thread } = (await fetchQuery(ananProApi.getThreadSafe as never, {} as never, {
      token,
    })) as { thread: RawAssistantThread };

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
    const threads = (await fetchQuery(ananProApi.listThreads as never, { limit } as never, {
      token,
    })) as Array<{ _id: string; title?: string; updatedAt: number }>;

    return threads.map((thread) => ({
      id: thread._id,
      title: thread.title ?? null,
      updatedAt: thread.updatedAt,
    }));
  },

  async sendMessage(token, input) {
    const response = (await fetchAction(ananProApi.sendMessage as never, input as never, {
      token,
    })) as { threadId: string };

    const messages = await fetchThreadMessages(token, response.threadId);

    return {
      id: response.threadId,
      title: messages[0]?.content.slice(0, 80) ?? "anan workspace",
      messages: mapThreadMessages(messages),
    };
  },

  async listStreamEvents(token, input) {
    return fetchQuery(ananProApi.listStreamEvents as never, input as never, {
      token,
    }) as ReturnType<AnanProRepository["listStreamEvents"]>;
  },

  async cancelStreamSession(token, sessionId) {
    return fetchMutation(ananProApi.cancelStreamSession as never, { sessionId } as never, {
      token,
    }) as ReturnType<AnanProRepository["cancelStreamSession"]>;
  },

  async getVoiceUploadUrl(token) {
    return fetchMutation(ananProApi.generateVoiceUploadUrl as never, {} as never, {
      token,
    }) as ReturnType<AnanProRepository["getVoiceUploadUrl"]>;
  },

  async transcribeVoiceFromStorage(token, input) {
    return fetchAction(ananProApi.transcribeVoiceFromStorage as never, input as never, {
      token,
    }) as ReturnType<AnanProRepository["transcribeVoiceFromStorage"]>;
  },

  async finalizeUploadedFiles(token, input) {
    return fetchMutation(ananProApi.finalizeUploadedFiles as never, input as never, {
      token,
    }) as ReturnType<AnanProRepository["finalizeUploadedFiles"]>;
  },
};
