import { fetchAction, fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type {
  AnanProThread,
  AnanProThreadSummary,
  SendAnanProMessageInput,
  AnanProStreamEvent,
  TranscribeVoiceFromStorageInput,
  TranscribeVoiceFromStorageResult,
} from "@/server/contracts/ananPro";

type AnanProApiRefs = {
  getThreadSafe: unknown;
  getThreadById: unknown;
  listMessages: unknown;
  listThreads: unknown;
  listStreamEvents: unknown;
  cancelStreamSession: unknown;
  sendMessage: unknown;
  generateVoiceUploadUrl: unknown;
  transcribeVoiceFromStorage: unknown;
};

const ananProApi = apiUnsafe["ai_zone/assistantWorkspace"] as AnanProApiRefs;

type RawAssistantThread = {
  _id: string;
  title?: string;
  updatedAt: number;
} | null;

type RawAssistantMessage = {
  _id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    uiTurn?: unknown;
    meta?: unknown;
    inputMode?: "text" | "voice";
  };
  createdAt: number;
};

function mapThreadMessages(messages: RawAssistantMessage[]) {
  return messages.map((message) => ({
    id: message._id,
    role: message.role,
    content: message.content,
    uiTurn: message.metadata?.uiTurn,
    meta: message.metadata?.meta,
    inputMode: message.metadata?.inputMode,
    createdAt: message.createdAt,
  }));
}

function resolveThreadTitle(messages: RawAssistantMessage[]) {
  return messages.find((message) => message.role === "user")?.content.slice(0, 80) ?? "anan workspace";
}

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
};

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
    }) as Promise<AnanProStreamEvent[]>;
  },

  async cancelStreamSession(token, sessionId) {
    return fetchMutation(ananProApi.cancelStreamSession as never, { sessionId } as never, {
      token,
    }) as Promise<{ ok: true; sessionId: string }>;
  },

  async getVoiceUploadUrl(token) {
    return fetchMutation(ananProApi.generateVoiceUploadUrl as never, {} as never, {
      token,
    }) as Promise<string>;
  },

  async transcribeVoiceFromStorage(token, input) {
    return fetchAction(ananProApi.transcribeVoiceFromStorage as never, input as never, {
      token,
    }) as Promise<TranscribeVoiceFromStorageResult>;
  },
};
