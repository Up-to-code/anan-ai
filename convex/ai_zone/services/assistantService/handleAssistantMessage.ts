import type { ActionCtx } from "../../../_generated/server";
import type { Doc, Id } from "../../../_generated/dataModel";
import { ConvexError } from "convex/values";
import { api, internal } from "../../../_generated/api";
import { orchestrate } from "../../agents/anan";
import { orchestrate as orchestrateWorkspace } from "../../agents/anan_workspace";
import type { WorkspaceStructuredOutput } from "../../agents/anan_workspace/types";
import { resolveWorkspaceAgUiTurn } from "../agUi";
import type { AssistantKind, AssistantOwner, WorkspaceProjectActionState } from "./types";
import { isPublicAssistantKind, isWorkspaceKind } from "./utils";
import { getLatestWorkspaceActionState } from "./workspaceContext";
import { normalizeWorkspaceStructuredOutput, buildProjectQuestions } from "./workspaceParsing";
import { maybeAutoCreateDraftAndAnnotate, resolveWorkspaceProjectActionState } from "./workspaceProjectAction";
import { appendQuestionsToAssistantText, enrichUiTurnWithWorkspaceState } from "./workspaceUi";
import { createWorkspaceStreamControls } from "./workspaceStream";
import { syncWorkspaceAssistantStream } from "./streamSync";
import { buildBasePrompt, buildKnowledgeContext, buildWorkspaceContextBlock, selectRegenerateSource } from "./promptComposer";

/**
 * Core orchestration logic: resolves context, gathers knowledge,
 * runs the multi-agent orchestrator, and persists the conversation step.
 */
export async function handleAssistantMessage(
  ctx: ActionCtx,
  args: {
    message: string;
    threadId?: Id<"assistantThreads">;
    startNewThread?: boolean;
    inputMode?: "text" | "voice";
    regenerate?: boolean;
    regenerateMessageId?: string;
    assistantKind?: AssistantKind;
    orchestratorName?: string;
    promptPrefix?: string;
    streamSessionId?: string;
    ownerOverride?: AssistantOwner;
    initialThreadOverride?: Doc<"assistantThreads"> | null;
    saveConversationStepMutationOverride?: unknown;
  }
): Promise<{
  ok: true;
  threadId: string;
  mode: "qa" | "action";
  output: string;
  messageId: string;
}> {
  const isWorkspaceAssistant = isWorkspaceKind(args.assistantKind);

  // 1. Resolve thread & owner via query
  let thread = args.initialThreadOverride ?? null;
  let owner = args.ownerOverride;

  if (!owner) {
    const resolved = await ctx.runQuery(
      isWorkspaceAssistant
        ? api.ai_zone.assistantWorkspace.getThread
        : api.ai_zone.assistant.getThread,
      {}
    );
    thread = resolved.thread;
    owner = resolved.owner;
  }

  if (!owner) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Assistant owner could not be resolved.",
    });
  }

  // Patch owner into stream controls now that we have it.
  const workspaceStream = createWorkspaceStreamControls({
    ctx,
    enabled: Boolean(isWorkspaceAssistant && args.streamSessionId),
    owner,
    streamSessionId: args.streamSessionId,
  });

  const shouldStartFreshWorkspaceThread = Boolean(
    isWorkspaceAssistant && args.startNewThread && !args.threadId,
  );

  let activeThreadId = (shouldStartFreshWorkspaceThread
    ? undefined
    : (args.threadId ?? thread?._id)) as
    | Id<"assistantThreads">
    | undefined;

  // 2. Get entitlement (determines qa vs action mode)
  const entitlement = await ctx.runQuery(
    isPublicAssistantKind(args.assistantKind)
      ? api.shared_logic.subscriptions.index.getAssistantEntitlementSafe
      : api.shared_logic.subscriptions.index.getAssistantEntitlement,
    {}
  );
  const mode = entitlement.mode;

  if (isWorkspaceAssistant && args.streamSessionId) {
    await workspaceStream.emitLifecycle("running", { streamSessionId: args.streamSessionId });
  }

  if (isWorkspaceAssistant && !activeThreadId) {
    const created = await ctx.runMutation(api.ai_zone.assistantWorkspace.createThread, {
      title: args.message.slice(0, 80),
    });
    activeThreadId = created.threadId as Id<"assistantThreads">;
  }

  if (isWorkspaceAssistant && activeThreadId) {
    await workspaceStream.emitThread(activeThreadId);
  }

  const existingMessages =
    isWorkspaceAssistant && activeThreadId
      ? ((await ctx.runQuery(api.ai_zone.assistantWorkspace.listMessages, {
          threadId: activeThreadId,
        })) as Array<Doc<"assistantMessages">>)
      : [];

  const previousActionState = isWorkspaceAssistant
    ? getLatestWorkspaceActionState(existingMessages)
    : null;

  const regenerateSource = selectRegenerateSource({
    existingMessages,
    regenerate: args.regenerate,
    regenerateMessageId: args.regenerateMessageId,
  });

  const effectiveUserMessage = regenerateSource?.content ?? args.message;

  // 3. Retrieve company knowledge for context
  const knowledge = await ctx.runQuery(
    api.shared_logic.knowledge.index.retrieveCompanyKnowledge,
    { query: effectiveUserMessage, limit: 3 }
  );

  const knowledgeContext = buildKnowledgeContext(knowledge);
  const workspaceContextBlock = buildWorkspaceContextBlock({
    existingMessages,
    isWorkspaceAssistant,
    previousActionState,
  });

  // 4. Build the prompt based on mode
  const basePrompt = buildBasePrompt({
    effectiveUserMessage,
    knowledgeContext,
    mode,
    promptPrefix: args.promptPrefix,
    workspaceContextBlock,
  });

  // 5. Map ownerType to orchestrator role
  const roleMap: Record<string, "user" | "broker" | "RED" | "admin"> = {
    broker: "broker",
    RED: "RED",
    user: "user",
  };

  // 6. Run the multi-agent orchestrator
  const result = isWorkspaceAssistant
    ? await orchestrateWorkspace({
        ctx,
        prompt: basePrompt,
        role: roleMap[owner.ownerType] ?? "user",
        userId: owner.userId,
        threadId: activeThreadId,
        ragContext: knowledgeContext || undefined,
        channel: "app",
        streamSessionId: args.streamSessionId,
        onStageEvent: (event) =>
          workspaceStream.emitStage(event.phase, {
            status: event.status,
            teamId: event.teamId,
            agentName: event.agentName,
            details: event.details,
          }),
        onTextDelta: workspaceStream.emitDelta,
        onStreamCancelledCheck: workspaceStream.isCancelled,
      })
    : await orchestrate({
        ctx,
        prompt: basePrompt,
        role: roleMap[owner.ownerType] ?? "user",
        userId: owner.userId,
        threadId: activeThreadId,
        ragContext: knowledgeContext || undefined,
        channel: "app",
      });

  let assistantText = result.output;
  const wasCancelled = Boolean((result as { cancelled?: boolean }).cancelled);

  const structuredOutput = isWorkspaceAssistant
    ? normalizeWorkspaceStructuredOutput(
        (result as { structured?: WorkspaceStructuredOutput }).structured
      )
    : { questions: [] };

  let workspaceActionState: WorkspaceProjectActionState | null = isWorkspaceAssistant
    ? resolveWorkspaceProjectActionState({
        message: effectiveUserMessage,
        previous: previousActionState,
        structured: structuredOutput,
      })
    : null;

  const createdResult = await maybeAutoCreateDraftAndAnnotate({
    actionState: workspaceActionState,
    assistantText,
    ctx,
    emitStage: (phase, payload) =>
      workspaceStream.emitStage(phase, {
        status: payload.status,
        details: payload.details,
      }),
    owner,
    wasCancelled,
  });
  workspaceActionState = createdResult.actionState;
  assistantText = createdResult.assistantText;

  if (workspaceActionState?.state === "collecting" && !wasCancelled) {
    const actionQuestions = buildProjectQuestions(workspaceActionState.missingFields);
    assistantText = appendQuestionsToAssistantText(assistantText, actionQuestions);
    structuredOutput.questions = actionQuestions;
  }

  if (wasCancelled) {
    structuredOutput.questions = [];
    assistantText = assistantText.trim()
      ? `${assistantText}\n\nتم إيقاف التوليد بناءً على طلبك.`
      : "تم إيقاف التوليد بناءً على طلبك.";
  }

  await syncWorkspaceAssistantStream({
    assistantText,
    isWorkspaceAssistant,
    streamSessionId: args.streamSessionId,
    workspaceStream,
  });

  let assistantUiTurn = isWorkspaceAssistant
    ? resolveWorkspaceAgUiTurn(effectiveUserMessage, assistantText)
    : null;

  if (isWorkspaceAssistant) {
    assistantUiTurn = enrichUiTurnWithWorkspaceState(
      assistantUiTurn,
      assistantText,
      workspaceActionState
    );
  }

  const assistantMetadata = (() => {
    if (!isWorkspaceAssistant) {
      return assistantUiTurn ? { uiTurn: assistantUiTurn } : undefined;
    }

    const questions = structuredOutput.questions;
    const actionCandidate = workspaceActionState ?? structuredOutput.actionCandidate;
    return {
      uiTurn: assistantUiTurn,
      meta: { questions, actionCandidate, workspaceActionState },
      workspaceActionState,
    };
  })();

  if (
    isWorkspaceAssistant &&
    args.streamSessionId &&
    assistantMetadata &&
    "meta" in assistantMetadata
  ) {
    await workspaceStream.emitAssistantMeta(assistantMetadata.meta);
  }

  const saveConversationStepMutation = isWorkspaceAssistant
    ? (args.saveConversationStepMutationOverride ??
      internal.ai_zone.assistantWorkspace._saveConversationStep)
    : (args.saveConversationStepMutationOverride ??
      internal.ai_zone.assistant._saveConversationStep);

  // 7. Persist the conversation step
  await workspaceStream.emitStage("persist_started", { status: "running" });
  const saved = await ctx.runMutation(saveConversationStepMutation as any, {
    threadId: activeThreadId,
    userId: owner.userId,
    ownerType: owner.ownerType,
    ownerBrokerId: owner.ownerBrokerId,
    ownerREDId: owner.ownerREDId,
    userMessage: effectiveUserMessage,
    userMessageMetadata: args.inputMode ? { inputMode: args.inputMode } : undefined,
    persistUserMessage: !(args.regenerate && regenerateSource),
    assistantMessage: assistantText,
    assistantMetadata,
    mode,
  });
  await workspaceStream.emitStage("persist_done", {
    status: "completed",
    details: { threadId: String(saved.threadId) },
  });

  if (isWorkspaceAssistant && args.streamSessionId) {
    await workspaceStream.emitLifecycle(wasCancelled ? "cancelled" : "completed", {
      threadId: String(saved.threadId),
      messageId: String(saved.assistantMessageId),
    });
  }

  return {
    ok: true,
    threadId: saved.threadId,
    mode,
    output: assistantText,
    messageId: saved.assistantMessageId,
  };
}
