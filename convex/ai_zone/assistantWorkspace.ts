import { ConvexError, v } from "convex/values";
import { action, internalMutation, mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import {
  createAssistantThread,
  getLatestThread,
  handleAssistantMessage,
  listRecentThreads,
  listThreadMessages,
  resolveAssistantOwner,
  resolveAssistantOwnerSafe,
  saveConversationStep,
} from "./services/assistantService";
import { transcribeStoredVoiceNote } from "./services/voiceTranscriptionService";
import { requireRole } from "../_core/security/accessPolicy";

const ASSISTANT_KIND = "anan_workspace" as const;
const ORCHESTRATOR_NAME = "anan_workspace_orchestrator";
const PROMPT_PREFIX =
  "[Anan Workspace Operator]\nYou are the internal workspace operator. Prioritize projects, offers, CRM, organizations, invitations, inbox, and actionable next steps. Only propose actions the current workspace role can perform. Summaries should be operational and approval-ready.";

type StreamEventType = "stage" | "delta" | "assistant_meta" | "thread" | "lifecycle" | "error";

type StreamEventRecord = Doc<"assistantStreamEvents">;

function inferStreamEventType(event: StreamEventRecord): StreamEventType {
  if (event.eventType) {
    return event.eventType;
  }
  if (typeof event.delta === "string" && event.delta.length > 0) return "delta";
  if (event.threadId) return "thread";
  if (event.code || event.message) return "error";
  if (event.meta !== undefined) return "assistant_meta";
  if (event.phase) return "stage";
  if (event.status) return "lifecycle";
  return "stage";
}

function assertTypedStreamEvent(args: {
  eventType?: StreamEventType;
  phase?: StreamEventRecord["phase"];
  status?: StreamEventRecord["status"];
  delta?: string;
  threadId?: StreamEventRecord["threadId"];
}) {
  if (!args.eventType) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "assistantStreamEvents.eventType is required.",
    });
  }

  if (args.eventType === "stage" && !args.phase) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Stage stream events must include phase.",
    });
  }

  if (args.eventType === "delta" && typeof args.delta !== "string") {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Delta stream events must include delta text.",
    });
  }

  if (args.eventType === "thread" && !args.threadId) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Thread stream events must include threadId.",
    });
  }
}

export const getThread = query({
  args: {},
  handler: async (ctx) => {
    const owner = await resolveAssistantOwner(ctx);
    const thread = await getLatestThread(ctx, owner, ASSISTANT_KIND);
    return { thread, owner };
  },
});

export const getThreadSafe = query({
  args: {},
  handler: async (ctx) => {
    const owner = await resolveAssistantOwnerSafe(ctx);
    if (!owner) return { thread: null, owner: null };
    const thread = await getLatestThread(ctx, owner, ASSISTANT_KIND);
    return { thread, owner };
  },
});

export const listMessages = query({
  args: {
    threadId: v.optional(v.id("assistantThreads")),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    return listThreadMessages(ctx, owner, args.threadId, ASSISTANT_KIND);
  },
});

export const listThreads = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    return listRecentThreads(ctx, owner, ASSISTANT_KIND, args.limit ?? 6);
  },
});

export const sendMessage = action({
  args: {
    message: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
    inputMode: v.optional(v.union(v.literal("text"), v.literal("voice"))),
    streamSessionId: v.optional(v.string()),
    regenerate: v.optional(v.boolean()),
    regenerateMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return handleAssistantMessage(ctx, {
      ...args,
      assistantKind: ASSISTANT_KIND,
      orchestratorName: ORCHESTRATOR_NAME,
      promptPrefix: PROMPT_PREFIX,
    });
  },
});

export const createThread = mutation({
  args: {
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    return createAssistantThread(ctx, {
      owner,
      assistantKind: ASSISTANT_KIND,
      orchestratorName: ORCHESTRATOR_NAME,
      title: args.title?.trim() ? args.title.trim() : "محادثة جديدة",
    });
  },
});

export const generateVoiceUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await resolveAssistantOwner(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

export const transcribeVoiceFromStorage = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return transcribeStoredVoiceNote(ctx, args.storageId);
  },
});

export const listStreamEvents = query({
  args: {
    sessionId: v.string(),
    afterSeq: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    const afterSeq = args.afterSeq ?? 0;
    const limit = Math.min(Math.max(args.limit ?? 32, 1), 128);
    const events = await ctx.db
      .query("assistantStreamEvents")
      .withIndex("sessionId_seq", (q) =>
        q.eq("sessionId", args.sessionId).gt("seq", afterSeq),
      )
      .collect();

    const authorized = events.filter((event) => {
      if (owner.ownerType === "broker") {
        return Boolean(owner.ownerBrokerId && event.ownerBrokerId && String(owner.ownerBrokerId) === String(event.ownerBrokerId));
      }
      if (owner.ownerType === "RED") {
        return Boolean(owner.ownerREDId && event.ownerREDId && String(owner.ownerREDId) === String(event.ownerREDId));
      }
      return event.userId === owner.userId;
    });

    return authorized
      .sort((a, b) => a.seq - b.seq)
      .slice(0, limit)
      .map((event) => ({
        seq: event.seq,
        eventType: inferStreamEventType(event),
        phase: event.phase,
        status: event.status,
        teamId: event.teamId,
        agentName: event.agentName,
        delta: event.delta,
        threadId: event.threadId ? String(event.threadId) : undefined,
        title: event.title,
        meta: event.meta,
        message: event.message,
        code: event.code,
        details: event.details,
        timestamp: event.createdAt,
      }));
  },
});

export const isStreamCancelled = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    const events = await ctx.db
      .query("assistantStreamEvents")
      .withIndex("sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const authorized = events.filter((event) => {
      if (owner.ownerType === "broker") {
        return Boolean(owner.ownerBrokerId && event.ownerBrokerId && String(owner.ownerBrokerId) === String(event.ownerBrokerId));
      }
      if (owner.ownerType === "RED") {
        return Boolean(owner.ownerREDId && event.ownerREDId && String(owner.ownerREDId) === String(event.ownerREDId));
      }
      return event.userId === owner.userId;
    });

    const latestLifecycle = authorized
      .filter((event) => inferStreamEventType(event) === "lifecycle")
      .sort((a, b) => b.seq - a.seq)[0];

    return {
      cancelled: latestLifecycle?.status === "cancelled",
      latestSeq: authorized.length > 0 ? Math.max(...authorized.map((event) => event.seq)) : 0,
    };
  },
});

export const cancelStreamSession = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const owner = await resolveAssistantOwner(ctx);
    const events = await ctx.db
      .query("assistantStreamEvents")
      .withIndex("sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const authorized = events.filter((event) => {
      if (owner.ownerType === "broker") {
        return Boolean(owner.ownerBrokerId && event.ownerBrokerId && String(owner.ownerBrokerId) === String(event.ownerBrokerId));
      }
      if (owner.ownerType === "RED") {
        return Boolean(owner.ownerREDId && event.ownerREDId && String(owner.ownerREDId) === String(event.ownerREDId));
      }
      return event.userId === owner.userId;
    });

    const nextSeq = (authorized.length > 0 ? Math.max(...authorized.map((event) => event.seq)) : 0) + 1;

    await insertAssistantStreamEvent(ctx, {
      sessionId: args.sessionId,
      seq: nextSeq,
      eventType: "lifecycle",
      status: "cancelled",
      details: { reason: "user_requested_stop" },
      createdAt: Date.now(),
      userId: owner.userId,
      ownerType: owner.ownerType,
      ownerBrokerId: owner.ownerBrokerId,
      ownerREDId: owner.ownerREDId,
    });

    return { ok: true as const, sessionId: args.sessionId };
  },
});

async function insertAssistantStreamEvent(
  ctx: any,
  args: {
    sessionId: string;
    seq: number;
    eventType: StreamEventType;
    phase?: StreamEventRecord["phase"];
    status?: StreamEventRecord["status"];
    teamId?: string;
    agentName?: string;
    delta?: string;
    threadId?: StreamEventRecord["threadId"];
    title?: string;
    meta?: unknown;
    message?: string;
    code?: string;
    details?: unknown;
    createdAt: number;
    userId: string;
    ownerType: StreamEventRecord["ownerType"];
    ownerBrokerId?: StreamEventRecord["ownerBrokerId"];
    ownerREDId?: StreamEventRecord["ownerREDId"];
  },
) {
  assertTypedStreamEvent({
    eventType: args.eventType,
    phase: args.phase,
    status: args.status,
    delta: args.delta,
    threadId: args.threadId,
  });

  if (args.eventType === "lifecycle" && !args.status) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Lifecycle stream events must include status.",
    });
  }

  await ctx.db.insert("assistantStreamEvents", {
    sessionId: args.sessionId,
    seq: args.seq,
    eventType: args.eventType,
    phase: args.phase,
    status: args.status,
    teamId: args.teamId,
    agentName: args.agentName,
    delta: args.delta,
    threadId: args.threadId,
    title: args.title,
    meta: args.meta,
    message: args.message,
    code: args.code,
    details: args.details,
    createdAt: args.createdAt,
    userId: args.userId,
    ownerType: args.ownerType,
    ownerBrokerId: args.ownerBrokerId,
    ownerREDId: args.ownerREDId,
  });
}

export const _appendStreamEvent = internalMutation({
  args: {
    sessionId: v.string(),
    seq: v.number(),
    event: v.object({
      eventType: v.union(
        v.literal("stage"),
        v.literal("delta"),
        v.literal("assistant_meta"),
        v.literal("thread"),
        v.literal("lifecycle"),
        v.literal("error"),
      ),
      phase: v.optional(v.union(
        v.literal("intent_started"),
        v.literal("intent_done"),
        v.literal("team_started"),
        v.literal("team_done"),
        v.literal("merge_started"),
        v.literal("merge_done"),
        v.literal("action_started"),
        v.literal("action_done"),
        v.literal("persist_started"),
        v.literal("persist_done"),
      )),
      status: v.optional(v.union(v.literal("running"), v.literal("completed"), v.literal("failed"), v.literal("cancelled"))),
      teamId: v.optional(v.string()),
      agentName: v.optional(v.string()),
      delta: v.optional(v.string()),
      threadId: v.optional(v.id("assistantThreads")),
      title: v.optional(v.string()),
      meta: v.optional(v.any()),
      message: v.optional(v.string()),
      code: v.optional(v.string()),
      details: v.optional(v.any()),
      timestamp: v.number(),
    }),
    userId: v.string(),
    ownerType: v.union(v.literal("broker"), v.literal("RED"), v.literal("user")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
  },
  handler: async (ctx, args) => {
    await insertAssistantStreamEvent(ctx, {
      sessionId: args.sessionId,
      seq: args.seq,
      eventType: args.event.eventType,
      phase: args.event.phase,
      status: args.event.status,
      teamId: args.event.teamId,
      agentName: args.event.agentName,
      delta: args.event.delta,
      threadId: args.event.threadId,
      title: args.event.title,
      meta: args.event.meta,
      message: args.event.message,
      code: args.event.code,
      details: args.event.details,
      createdAt: args.event.timestamp,
      userId: args.userId,
      ownerType: args.ownerType,
      ownerBrokerId: args.ownerBrokerId,
      ownerREDId: args.ownerREDId,
    });
    return { ok: true as const };
  },
});

async function purgeStreamEventsBatch(
  ctx: any,
  args: {
    mode: "legacyOnly" | "all";
    batchSize: number;
    dryRun: boolean;
  },
) {
  const events = await ctx.db.query("assistantStreamEvents").collect();
  const candidates = events
    .filter((event: StreamEventRecord) => (args.mode === "all" ? true : !event.eventType))
    .sort((a: StreamEventRecord, b: StreamEventRecord) => a.createdAt - b.createdAt);
  const batch = candidates.slice(0, args.batchSize);

  if (!args.dryRun) {
    for (const event of batch) {
      await ctx.db.delete(event._id);
    }
  }

  return {
    ok: true as const,
    mode: args.mode,
    dryRun: args.dryRun,
    batchSize: args.batchSize,
    matchedCount: candidates.length,
    selectedCount: batch.length,
    deletedCount: args.dryRun ? 0 : batch.length,
    remainingCountEstimate: Math.max(0, candidates.length - batch.length),
  };
}

export const _purgeStreamEvents = internalMutation({
  args: {
    mode: v.optional(v.union(v.literal("legacyOnly"), v.literal("all"))),
    batchSize: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return purgeStreamEventsBatch(ctx, {
      mode: args.mode ?? "all",
      batchSize: Math.min(Math.max(Math.floor(args.batchSize ?? 500), 1), 5_000),
      dryRun: args.dryRun ?? false,
    });
  },
});

export const purgeStreamEvents = mutation({
  args: {
    mode: v.optional(v.union(v.literal("legacyOnly"), v.literal("all"))),
    batchSize: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return purgeStreamEventsBatch(ctx, {
      mode: args.mode ?? "all",
      batchSize: Math.min(Math.max(Math.floor(args.batchSize ?? 500), 1), 5_000),
      dryRun: args.dryRun ?? false,
    });
  },
});

export const _saveConversationStep = internalMutation({
  args: {
    threadId: v.optional(v.id("assistantThreads")),
    userId: v.string(),
    ownerType: v.union(v.literal("broker"), v.literal("RED"), v.literal("user")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    userMessage: v.string(),
    userMessageMetadata: v.optional(v.any()),
    persistUserMessage: v.optional(v.boolean()),
    assistantMessage: v.string(),
    assistantMetadata: v.optional(v.any()),
    mode: v.union(v.literal("qa"), v.literal("action")),
  },
  handler: async (ctx, args) => {
    return saveConversationStep(ctx, {
      ...args,
      assistantKind: ASSISTANT_KIND,
      orchestratorName: ORCHESTRATOR_NAME,
    });
  },
});
