import { listUIMessages, type AgentComponent } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import { v } from "convex/values";
import { components } from "../_generated/api";
import { requireRole } from "../_core/security/accessPolicy";

/** List threads for a user. Admin only. Proxies to agent component. */
export const listThreadsForUser = query({
  args: {
    userId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { userId, paginationOpts }) => {
    await requireRole(ctx, ["admin"]);
    const agent = components.agent as unknown as { threads?: { listThreadsByUserId?: (args: { userId: string; paginationOpts: unknown }) => Promise<unknown> } };
    if (!agent?.threads?.listThreadsByUserId) {
      return { page: [], isDone: true, continueCursor: null };
    }
    return ctx.runQuery(agent.threads.listThreadsByUserId as any, {
      userId,
      paginationOpts,
    });
  },
});

/** Get messages for a thread. Admin only. Uses listUIMessages from agent. */
export const getThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { threadId, paginationOpts }) => {
    await requireRole(ctx, ["admin"]);
    const agent = components.agent as unknown as AgentComponent;
    if (!agent) {
      return { page: [], isDone: true, continueCursor: null };
    }
    return listUIMessages(ctx as any, agent, {
      threadId,
      paginationOpts,
    });
  },
});
