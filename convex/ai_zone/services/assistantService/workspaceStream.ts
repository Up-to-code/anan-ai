import { ConvexError } from "convex/values";
import type { ActionCtx } from "../../../_generated/server";
import type { Id } from "../../../_generated/dataModel";
import { api, internal } from "../../../_generated/api";
import type {
  WorkspaceStreamPhase,
  WorkspaceStreamStatus,
} from "../../agents/anan_workspace/types";
import type { AssistantOwner } from "./types";

type StreamEvent = {
  eventType: "stage" | "delta" | "assistant_meta" | "thread" | "lifecycle" | "error";
  phase?: WorkspaceStreamPhase;
  status?: WorkspaceStreamStatus | "cancelled";
  teamId?: string;
  agentName?: string;
  delta?: string;
  threadId?: Id<"assistantThreads">;
  title?: string;
  meta?: unknown;
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
};

export type WorkspaceStreamControls = {
  emitLifecycle: (status: WorkspaceStreamStatus | "cancelled", details?: Record<string, unknown>) => Promise<void>;
  emitThread: (threadId: Id<"assistantThreads">) => Promise<void>;
  emitStage: (
    phase: WorkspaceStreamPhase,
    extra?: { status?: WorkspaceStreamStatus; teamId?: string; agentName?: string; details?: Record<string, unknown> }
  ) => Promise<void>;
  emitDelta: (delta: string) => Promise<void>;
  emitAssistantMeta: (meta: unknown) => Promise<void>;
  isCancelled: () => Promise<boolean>;
  getStreamedText: () => string;
  didEmitAnyDelta: () => boolean;
};

type WorkspaceStreamState = {
  streamSeq: number;
  streamedAssistantText: string;
  emittedAnyDelta: boolean;
};

function assertValidStreamEvent(event: StreamEvent) {
  if (event.eventType === "stage" && !event.phase) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Stage stream event is missing phase.",
    });
  }
  if (event.eventType === "delta" && typeof event.delta !== "string") {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Delta stream event is missing delta.",
    });
  }
}

function createAppendEvent(
  options: { ctx: ActionCtx; owner: AssistantOwner; streamSessionId?: string; enabled: boolean },
  state: WorkspaceStreamState
) {
  return async (event: StreamEvent) => {
    if (!options.enabled || !options.streamSessionId) return;
    assertValidStreamEvent(event);
    state.streamSeq += 1;
    await options.ctx.runMutation(internal.ai_zone.assistantWorkspace._appendStreamEvent, {
      sessionId: options.streamSessionId,
      seq: state.streamSeq,
      event: { ...event, timestamp: Date.now() },
      userId: options.owner.userId,
      ownerType: options.owner.ownerType,
      ownerBrokerId: options.owner.ownerBrokerId,
      ownerREDId: options.owner.ownerREDId,
    });
  };
}

function createEmitDelta(
  appendEvent: (event: StreamEvent) => Promise<void>,
  state: WorkspaceStreamState,
  options: { streamSessionId?: string; enabled: boolean }
): WorkspaceStreamControls["emitDelta"] {
  return async (delta) => {
    if (!options.enabled || !options.streamSessionId || !delta) return;
    state.streamedAssistantText += delta;
    state.emittedAnyDelta = true;
    await appendEvent({ eventType: "delta", delta });
  };
}

function createIsCancelled(
  ctx: ActionCtx,
  options: { streamSessionId?: string; enabled: boolean }
): WorkspaceStreamControls["isCancelled"] {
  return async () => {
    if (!options.enabled || !options.streamSessionId) return false;
    const state = (await ctx.runQuery(api.ai_zone.assistantWorkspace.isStreamCancelled, {
      sessionId: options.streamSessionId,
    })) as { cancelled?: boolean } | null;
    return Boolean(state?.cancelled);
  };
}

function createStreamEmitters(args: {
  appendEvent: (event: StreamEvent) => Promise<void>;
  options: { ctx: ActionCtx; streamSessionId?: string; enabled: boolean };
  state: WorkspaceStreamState;
}): Omit<WorkspaceStreamControls, "didEmitAnyDelta" | "getStreamedText"> {
  const emitStage: WorkspaceStreamControls["emitStage"] = async (phase, extra = {}) => {
    await args.appendEvent({
      eventType: "stage",
      phase,
      status: extra.status,
      teamId: extra.teamId,
      agentName: extra.agentName,
      details: extra.details,
    });
  };
  return {
    emitStage,
    emitDelta: createEmitDelta(args.appendEvent, args.state, args.options),
    emitLifecycle: async (status, details) => {
      await args.appendEvent({ eventType: "lifecycle", status, details });
    },
    emitThread: async (threadId) => {
      await args.appendEvent({ eventType: "thread", threadId });
    },
    emitAssistantMeta: async (meta) => {
      await args.appendEvent({ eventType: "assistant_meta", meta });
    },
    isCancelled: createIsCancelled(args.options.ctx, args.options),
  };
}

export function createWorkspaceStreamControls(options: {
  ctx: ActionCtx;
  owner: AssistantOwner;
  streamSessionId?: string;
  enabled: boolean;
}): WorkspaceStreamControls {
  const state: WorkspaceStreamState = {
    streamSeq: 0,
    streamedAssistantText: "",
    emittedAnyDelta: false,
  };
  const appendEvent = createAppendEvent(options, state);
  const emitters = createStreamEmitters({
    appendEvent,
    options,
    state,
  });
  return {
    didEmitAnyDelta: () => state.emittedAnyDelta,
    ...emitters,
    getStreamedText: () => state.streamedAssistantText,
  };
}
