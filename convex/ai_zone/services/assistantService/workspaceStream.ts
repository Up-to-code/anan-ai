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

export function createWorkspaceStreamControls(options: {
  ctx: ActionCtx;
  owner: AssistantOwner;
  streamSessionId?: string;
  enabled: boolean;
}): WorkspaceStreamControls {
  const { ctx, owner, streamSessionId, enabled } = options;

  let streamSeq = 0;
  let streamedAssistantText = "";
  let emittedAnyDelta = false;

  const appendEvent = async (event: StreamEvent) => {
    if (!enabled || !streamSessionId) return;

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

    streamSeq += 1;
    await ctx.runMutation(internal.ai_zone.assistantWorkspace._appendStreamEvent, {
      sessionId: streamSessionId,
      seq: streamSeq,
      event: { ...event, timestamp: Date.now() },
      userId: owner.userId,
      ownerType: owner.ownerType,
      ownerBrokerId: owner.ownerBrokerId,
      ownerREDId: owner.ownerREDId,
    });
  };

  const emitStage: WorkspaceStreamControls["emitStage"] = async (phase, extra = {}) => {
    await appendEvent({
      eventType: "stage",
      phase,
      status: extra.status,
      teamId: extra.teamId,
      agentName: extra.agentName,
      details: extra.details,
    });
  };

  const emitDelta: WorkspaceStreamControls["emitDelta"] = async (delta) => {
    if (!enabled || !streamSessionId || !delta) return;
    streamedAssistantText += delta;
    emittedAnyDelta = true;
    await appendEvent({ eventType: "delta", delta });
  };

  const emitLifecycle: WorkspaceStreamControls["emitLifecycle"] = async (status, details) => {
    await appendEvent({ eventType: "lifecycle", status, details });
  };

  const emitThread: WorkspaceStreamControls["emitThread"] = async (threadId) => {
    await appendEvent({ eventType: "thread", threadId });
  };

  const emitAssistantMeta: WorkspaceStreamControls["emitAssistantMeta"] = async (meta) => {
    await appendEvent({ eventType: "assistant_meta", meta });
  };

  const isCancelled = async () => {
    if (!enabled || !streamSessionId) return false;
    const state = (await ctx.runQuery(api.ai_zone.assistantWorkspace.isStreamCancelled, {
      sessionId: streamSessionId,
    })) as { cancelled?: boolean } | null;
    return Boolean(state?.cancelled);
  };

  return {
    didEmitAnyDelta: () => emittedAnyDelta,
    emitAssistantMeta,
    emitDelta,
    emitLifecycle,
    emitStage,
    emitThread,
    getStreamedText: () => streamedAssistantText,
    isCancelled,
  };
}

