import { fetchAction, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type { AnanProThread, AnanProThreadSummary, SendAnanProMessageInput } from "@/server/contracts/ananPro";

type AnanProApiRefs = {
  getThreadSafe: unknown;
  listMessages: unknown;
  listThreads: unknown;
  sendMessage: unknown;
};

const ananProApi = apiUnsafe["ai_zone/assistantPro"] as AnanProApiRefs;

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
  };
  createdAt: number;
};

export type AnanProRepository = {
  getThread(token: string, threadId?: string): Promise<AnanProThread | null>;
  listThreads(token: string, limit?: number): Promise<AnanProThreadSummary[]>;
  sendMessage(token: string, input: SendAnanProMessageInput): Promise<AnanProThread>;
};

export const convexAnanProRepository: AnanProRepository = {
  async getThread(token, threadId) {
    if (threadId) {
      const messages = (await fetchQuery(ananProApi.listMessages as never, { threadId } as never, {
        token,
      })) as RawAssistantMessage[];

      if (messages.length === 0) {
        return null;
      }

      return {
        id: threadId,
        title: messages.find((message) => message.role === "user")?.content.slice(0, 80) ?? "anan pro",
        messages: messages.map((message) => ({
          id: message._id,
          role: message.role,
          content: message.content,
          uiTurn: message.metadata?.uiTurn,
          createdAt: message.createdAt,
        })),
      };
    }

    const { thread } = (await fetchQuery(ananProApi.getThreadSafe as never, {} as never, {
      token,
    })) as { thread: RawAssistantThread };

    if (!thread?._id) {
      return null;
    }

    const messages = (await fetchQuery(ananProApi.listMessages as never, { threadId: thread._id } as never, {
      token,
    })) as RawAssistantMessage[];

    return {
      id: thread._id,
      title: thread?.title ?? null,
      messages: messages.map((message) => ({
        id: message._id,
        role: message.role,
        content: message.content,
        uiTurn: message.metadata?.uiTurn,
        createdAt: message.createdAt,
      })),
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

    const messages = (await fetchQuery(ananProApi.listMessages as never, { threadId: response.threadId } as never, {
      token,
    })) as RawAssistantMessage[];

    return {
      id: response.threadId,
      title: messages[0]?.content.slice(0, 80) ?? "anan pro",
      messages: messages.map((message) => ({
        id: message._id,
        role: message.role,
        content: message.content,
        uiTurn: message.metadata?.uiTurn,
        createdAt: message.createdAt,
      })),
    };
  },
};
