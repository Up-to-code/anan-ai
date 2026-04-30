import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { resolveAssistantOwner } from "./services/assistantService/owner";
type StreamEventType = "stage" | "delta" | "assistant_meta" | "thread" | "lifecycle" | "error";
type StreamEventRecord = Doc<"assistantStreamEvents">;
type InsertStreamEventArgs = {
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
};

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
function filterEventsByOwner(
  owner: Awaited<ReturnType<typeof resolveAssistantOwner>>,
  events: StreamEventRecord[],
) {
  return events.filter((event) => {
    if (owner.ownerType === "broker") {
      return Boolean(owner.ownerBrokerId && event.ownerBrokerId && String(owner.ownerBrokerId) === String(event.ownerBrokerId));
    }
    if (owner.ownerType === "RED") {
      return Boolean(owner.ownerREDId && event.ownerREDId && String(owner.ownerREDId) === String(event.ownerREDId));
    }
    return event.userId === owner.userId;
  });
}

function assertLifecycleStatus(args: {
  eventType: StreamEventType;
  status?: StreamEventRecord["status"];
}) {
  if (args.eventType !== "lifecycle" || args.status) {
    return;
  }
  throw new ConvexError({
    code: "INVALID_ARGUMENT",
    message: "Lifecycle stream events must include status.",
  });
}

function toStreamEventInsertPayload(args: InsertStreamEventArgs) {
  return {
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
  };
}

async function insertAssistantStreamEvent(
  ctx: any,
  args: InsertStreamEventArgs,
) {
  assertTypedStreamEvent({
    eventType: args.eventType,
    phase: args.phase,
    status: args.status,
    delta: args.delta,
    threadId: args.threadId,
  });
  assertLifecycleStatus({ eventType: args.eventType, status: args.status });
  await ctx.db.insert("assistantStreamEvents", toStreamEventInsertPayload(args));
}

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
      .withIndex("sessionId_seq", (q) => q.eq("sessionId", args.sessionId).gt("seq", afterSeq))
      .collect();

    return filterEventsByOwner(owner, events)
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
    const authorized = filterEventsByOwner(owner, events);
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
    const authorized = filterEventsByOwner(owner, events);
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
      threadId: v.optional(v.string()),
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
