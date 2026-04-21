import type { ActionCtx } from "../../../_generated/server";
import { ConvexError } from "convex/values";
import { api, internal } from "../../../_generated/api";
import type { WorkspaceStructuredOutput } from "../../agents/anan_workspace/types";
import { runAssistantSurfaceRuntime } from "../../openMultiAgent";
import { resolveWorkspaceAgUiTurn } from "../agUi";
import type {
  AssistantKind,
  AssistantMessageRecord,
  AssistantOwner,
  AssistantThreadRecord,
  WorkspaceActionState,
  WorkspaceProjectActionState,
} from "./types";
import { isPublicAssistantKind, isWorkspaceKind } from "./utils";
import { getLatestWorkspaceActionState } from "./workspaceContext";
import { normalizeWorkspaceStructuredOutput, buildProjectQuestions } from "./workspaceParsing";
import { maybeAutoCreateDraftAndAnnotate, resolveWorkspaceProjectActionState } from "./workspaceProjectAction";
import { appendQuestionsToAssistantText, enrichUiTurnWithWorkspaceState } from "./workspaceUi";
import { createWorkspaceStreamControls } from "./workspaceStream";
import { syncWorkspaceAssistantStream } from "./streamSync";
import { buildAttachmentContext, buildBasePrompt, buildKnowledgeContext, buildWorkspaceContextBlock, selectRegenerateSource } from "./promptComposer";
import type { WorkspaceUploadedFileReference } from "./types";
import { maybeHandleWorkspaceDirectCommand } from "./workspaceCommandRouter";

/**
 * Core orchestration logic: resolves context, gathers knowledge,
 * runs the multi-agent orchestrator, and persists the conversation step.
 */
export async function handleAssistantMessage(
  ctx: ActionCtx,
  args: {
    message: string;
    threadId?: string;
    startNewThread?: boolean;
    inputMode?: "text" | "voice" | "attachment";
    attachments?: WorkspaceUploadedFileReference[];
    userMessageMetadata?: Record<string, unknown>;
    regenerate?: boolean;
    regenerateMessageId?: string;
    assistantKind?: AssistantKind;
    orchestratorName?: string;
    promptPrefix?: string;
    streamSessionId?: string;
    ownerOverride?: AssistantOwner;
    initialThreadOverride?: AssistantThreadRecord | null;
    runtimeContextOverride?: {
      thread?: AssistantThreadRecord | null;
      owner: AssistantOwner;
      entitlement?: { mode: "qa" | "action" };
      existingMessages?: Array<AssistantMessageRecord>;
      regenerateSource?: AssistantMessageRecord | null;
      effectiveUserMessage?: string;
      knowledge?: Array<{ title: string; category?: string | null; excerpt: string }>;
      compiledBuyerContext?: {
        compiledPromptContext: string;
        promptBudgetMeta: unknown;
      } | null;
    };
    saveConversationStepMutationOverride?: unknown;
  }
): Promise<{
  ok: true;
  threadId: string;
  mode: "qa" | "action";
  output: string;
  messageId: string;
  userMessageId?: string;
  promptBudgetMeta?: unknown;
}> {
  const isWorkspaceAssistant = isWorkspaceKind(args.assistantKind);
  let runtimeContext = args.runtimeContextOverride ?? null;

  if (!runtimeContext && !isPublicAssistantKind(args.assistantKind)) {
    runtimeContext = await ctx.runQuery(
      isWorkspaceAssistant
        ? api.ai_zone.assistantWorkspace.getRuntimeContextBundle
        : api.ai_zone.assistant.getRuntimeContextBundle,
      {
        threadId: args.threadId,
        message: args.message,
        regenerate: args.regenerate,
        regenerateMessageId: args.regenerateMessageId,
      },
    );
  }

  // 1. Resolve thread & owner via query
  let thread = runtimeContext?.thread ?? args.initialThreadOverride ?? null;
  let owner = runtimeContext?.owner ?? args.ownerOverride;

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
  const routedTeamIds: string[] = [];
  const routedAgentNames: string[] = [];

  const shouldStartFreshWorkspaceThread = Boolean(
    isWorkspaceAssistant && args.startNewThread && !args.threadId,
  );

  let activeThreadId = (shouldStartFreshWorkspaceThread
    ? undefined
    : (args.threadId ?? thread?._id)) as string | undefined;

  // 2. Get entitlement (determines qa vs action mode)
  const entitlement = runtimeContext?.entitlement ?? await ctx.runQuery(
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
      title: args.message.trim().slice(0, 80) || (args.attachments?.length ? "محادثة مرفقات جديدة" : "محادثة جديدة"),
    });
    activeThreadId = created.threadId;
  }

  if (isWorkspaceAssistant && activeThreadId) {
    await workspaceStream.emitThread(activeThreadId);
  }

  const existingMessages = runtimeContext?.existingMessages ?? (
    isWorkspaceAssistant && activeThreadId
      ? ((await ctx.runQuery(api.ai_zone.assistantWorkspace.listMessages, {
          threadId: activeThreadId,
        })) as Array<AssistantMessageRecord>)
      : isPublicAssistantKind(args.assistantKind) && activeThreadId
        ? ((await ctx.runQuery(internal.ai_zone.assistantPublic._listMessagesForOwner, {
            userId: owner.userId,
            threadId: activeThreadId,
          })) as Array<AssistantMessageRecord>)
        : []
  );

  const previousActionState = isWorkspaceAssistant
    ? getLatestWorkspaceActionState(existingMessages)
    : null;

  const regenerateSource = runtimeContext?.regenerateSource ?? selectRegenerateSource({
    existingMessages,
    regenerate: args.regenerate,
    regenerateMessageId: args.regenerateMessageId,
  });

  const effectiveUserMessage =
    runtimeContext?.effectiveUserMessage ?? regenerateSource?.content ?? args.message;

  const compiledBuyerContext = runtimeContext?.compiledBuyerContext ?? (
    isPublicAssistantKind(args.assistantKind)
      ? await ctx.runMutation(
          internal.shared_logic.buyerContext.getCompiledBuyerContextInternal,
          {
            channel: "web",
            userId: owner.userId,
            message: effectiveUserMessage,
            threadId: activeThreadId,
          },
        )
      : null
  );

  // 3. Retrieve company knowledge for context
  const knowledge = compiledBuyerContext
    ? []
    : runtimeContext?.knowledge ?? await ctx.runQuery(
        api.shared_logic.knowledge.index.retrieveCompanyKnowledge,
        { query: effectiveUserMessage, limit: 3 }
      );

  const knowledgeContext = buildKnowledgeContext(knowledge);
  const workspaceContextBlock = buildWorkspaceContextBlock({
    existingMessages,
    isWorkspaceAssistant,
    previousActionState,
  });
  const attachmentContext = buildAttachmentContext(args.attachments);

  // 5. Map ownerType to orchestrator role
  const roleMap: Record<string, "user" | "broker" | "RED" | "admin"> = {
    broker: "broker",
    RED: "RED",
    user: "user",
  };

  // 4. Build the prompt based on mode
  const basePrompt = buildBasePrompt({
    effectiveUserMessage,
    knowledgeContext,
    buyerContextBlock: compiledBuyerContext?.compiledPromptContext,
    mode,
    promptPrefix: args.promptPrefix,
    workspaceContextBlock,
    attachmentContext,
  });

  if (compiledBuyerContext?.promptBudgetMeta) {
    try {
      await ctx.runMutation(
        internal.ai_zone.agents.shared.tokenTrackerActions.trackTokenUsageInternal,
        {
          agentName: "anan_public_buyer_context_compiler",
          teamName: "team_knowledge",
          promptVersion: "buyer_context_v1",
          modelName: "internal_context_compiler",
          inputTokens: compiledBuyerContext.promptBudgetMeta.totalContextTokens,
          outputTokens: 0,
          userId: owner.userId,
          threadId: activeThreadId,
          channel: "web",
          role: roleMap[owner.ownerType] ?? "user",
          errorOccurred: false,
          contextTokens: compiledBuyerContext.promptBudgetMeta.contextTokens,
          memoryTokens: compiledBuyerContext.promptBudgetMeta.memoryTokens,
          ragTokens: compiledBuyerContext.promptBudgetMeta.ragTokens,
          historyTokens: compiledBuyerContext.promptBudgetMeta.historyTokens,
          cacheHit: compiledBuyerContext.promptBudgetMeta.cacheHit,
        },
      );
    } catch (error) {
      console.warn("[assistantService] Public buyer context tracking failed (non-critical):", error);
    }
  }

  // 6. Run the multi-agent orchestrator
  const directWorkspaceCommand = isWorkspaceAssistant
    ? await maybeHandleWorkspaceDirectCommand({
        ctx,
        message: effectiveUserMessage,
        owner,
        previousActionState,
      })
    : null;

  const result = directWorkspaceCommand
    ? {
        output: directWorkspaceCommand.assistantText,
        structured: { questions: [] },
      }
    : await runAssistantSurfaceRuntime({
        surface: isWorkspaceAssistant ? "workspace" : "default",
        ctx,
        prompt: basePrompt,
        role: roleMap[owner.ownerType] ?? "user",
        userId: owner.userId,
        threadId: activeThreadId,
        ragContext: knowledgeContext || undefined,
        channel: isPublicAssistantKind(args.assistantKind) ? "web" : "app",
        promptBudgetMeta: compiledBuyerContext?.promptBudgetMeta,
        streamSessionId: args.streamSessionId,
        onStageEvent: (event) => {
          if (event.teamId && !routedTeamIds.includes(event.teamId)) {
            routedTeamIds.push(event.teamId);
          }
          if (event.agentName && !routedAgentNames.includes(event.agentName)) {
            routedAgentNames.push(event.agentName);
          }
          return workspaceStream.emitStage(event.phase, {
            status: event.status,
            teamId: event.teamId,
            agentName: event.agentName,
            details: event.details,
          });
        },
        onTextDelta: workspaceStream.emitDelta,
        onStreamCancelledCheck: workspaceStream.isCancelled,
      });

  let assistantText = result.output;
  const wasCancelled = Boolean((result as { cancelled?: boolean }).cancelled);

  const structuredOutput = isWorkspaceAssistant
    ? normalizeWorkspaceStructuredOutput(
        (result as { structured?: WorkspaceStructuredOutput }).structured
      )
    : { questions: [] };

  let workspaceActionState: WorkspaceActionState | null = isWorkspaceAssistant
    ? directWorkspaceCommand
      ? directWorkspaceCommand.actionState
      : resolveWorkspaceProjectActionState({
          message: effectiveUserMessage,
          previous: previousActionState?.type === "create_project" ? previousActionState : null,
          structured: structuredOutput,
        })
    : null;

  const createdResult =
    workspaceActionState?.type === "create_project"
      ? await maybeAutoCreateDraftAndAnnotate({
          actionState: workspaceActionState as WorkspaceProjectActionState | null,
          assistantText,
          ctx,
          emitStage: (phase, payload) =>
            workspaceStream.emitStage(phase, {
              status: payload.status,
              details: payload.details,
            }),
          owner,
          wasCancelled,
        })
      : { actionState: workspaceActionState, assistantText };
  workspaceActionState = createdResult.actionState;
  assistantText = createdResult.assistantText;

  if (workspaceActionState?.type === "create_project" && workspaceActionState.state === "collecting" && !wasCancelled) {
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
    ? directWorkspaceCommand?.uiTurn ?? resolveWorkspaceAgUiTurn({
        assistantText,
        ownerType: owner.ownerType,
        actionState: workspaceActionState,
        attachments: args.attachments,
      })
    : null;

  if (isWorkspaceAssistant && !directWorkspaceCommand) {
    assistantUiTurn = resolveWorkspaceAgUiTurn({
      assistantText,
      ownerType: owner.ownerType,
      actionState: workspaceActionState,
      attachments: args.attachments,
    });
  }

  if (isWorkspaceAssistant && !directWorkspaceCommand) {
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
      meta: {
        questions,
        actionCandidate,
        workspaceActionState,
        attachments: args.attachments,
        directWorkspaceCommand: directWorkspaceCommand?.meta,
        routing: {
          assistantLabel: "وكيل عنان",
          agentName: routedAgentNames[0],
          primaryTeamId: routedTeamIds[0],
          teamIds: routedTeamIds,
        },
      },
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
  const mergedUserMessageMetadata = {
    ...(typeof args.userMessageMetadata === "object" && args.userMessageMetadata
      ? args.userMessageMetadata
      : {}),
    ...(
      args.inputMode || (args.attachments?.length ?? 0) > 0
        ? {
            inputMode: args.inputMode,
            attachments: args.attachments,
          }
        : {}
    ),
  };

  // 7. Persist the conversation step
  await workspaceStream.emitStage("persist_started", { status: "running" });
  const saved = await ctx.runMutation(saveConversationStepMutation as any, {
    threadId: activeThreadId,
    userId: owner.userId,
    ownerType: owner.ownerType,
    ownerBrokerId: owner.ownerBrokerId,
    ownerREDId: owner.ownerREDId,
    userMessage: effectiveUserMessage,
    userMessageMetadata:
      Object.keys(mergedUserMessageMetadata).length > 0
        ? mergedUserMessageMetadata
        : undefined,
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
    userMessageId: saved.userMessageId ?? undefined,
    promptBudgetMeta: compiledBuyerContext?.promptBudgetMeta,
  };
}
