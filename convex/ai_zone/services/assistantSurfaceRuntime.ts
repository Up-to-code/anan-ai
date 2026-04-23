import type { ActionCtx } from "../../_generated/server";
import { orchestrate as orchestrateDefault } from "../agents/anan";
import { orchestrate as orchestrateWorkspace } from "../agents/anan_workspace";
import type {
  WorkspaceStreamStageEvent,
  WorkspaceStructuredOutput,
} from "../agents/anan_workspace/types";

type AssistantRole = "user" | "broker" | "RED" | "admin";

type PromptBudgetMeta = {
  contextTokens: number;
  memoryTokens: number;
  ragTokens: number;
  historyTokens: number;
  totalContextTokens: number;
  budgetCap: number;
  cacheHit: boolean;
  includedBlocks: string[];
  droppedBlocks: string[];
};

export type AssistantSurfaceRuntimeInput = {
  surface: "default" | "workspace";
  ctx: ActionCtx;
  prompt: string;
  intentPrompt?: string;
  role: AssistantRole;
  userId: string;
  threadId?: string;
  channel?: "app" | "whatsapp" | "web";
  ragContext?: string;
  promptBudgetMeta?: PromptBudgetMeta;
  streamSessionId?: string;
  onStageEvent?: (event: WorkspaceStreamStageEvent) => void | Promise<void>;
  onTextDelta?: (delta: string) => void | Promise<void>;
  onStreamCancelledCheck?: () => boolean | Promise<boolean>;
};

export type AssistantSurfaceRuntimeResult = {
  output: string;
  cancelled?: boolean;
  structured?: WorkspaceStructuredOutput;
  runtime: "anan-native";
};

function isArabicText(text: string) {
  return /[\u0600-\u06ff]/.test(text);
}

function maybeHandleDeterministicDefaultTurn(prompt: string) {
  const normalized = prompt.trim().toLowerCase();
  if (!normalized) return null;

  const isGreeting =
    /^(hi|hello|hey|good morning|good evening|السلام عليكم|اهلا|أهلا|مرحبا|صباح الخير|مساء الخير)[\s!.؟?]*$/i.test(
      prompt.trim(),
    );

  if (!isGreeting) return null;

  return isArabicText(prompt)
    ? "أهلاً، أنا مساعد Etijah. أقدر أساعدك تفهم المنصة أو تبدأ بحثك العقاري خطوة بخطوة."
    : "Hi, I’m Etijah’s assistant. I can help you understand the platform or start your property search step by step.";
}

/**
 * WHY:   Assistant callers need one stable runtime entrypoint while the implementation stays native to Anan.
 * WHAT:  Routes public/default traffic to `anan` and workspace traffic to `anan_workspace`.
 * HOW:   Preserves the old surface contract but delegates to the repo's declarative Convex orchestrators.
 */
export async function runAssistantSurfaceRuntime(
  input: AssistantSurfaceRuntimeInput,
): Promise<AssistantSurfaceRuntimeResult> {
  const intentPrompt = input.intentPrompt ?? input.prompt;

  if (input.surface === "workspace") {
    const result = await orchestrateWorkspace({
      ctx: input.ctx,
      prompt: input.prompt,
      intentPrompt,
      role: input.role,
      userId: input.userId,
      threadId: input.threadId,
      channel: input.channel,
      ragContext: input.ragContext,
      streamSessionId: input.streamSessionId,
      onStageEvent: input.onStageEvent,
      onTextDelta: input.onTextDelta,
      onStreamCancelledCheck: input.onStreamCancelledCheck,
    });

    return {
      output: result.output,
      cancelled: result.cancelled,
      structured: result.structured,
      runtime: "anan-native",
    };
  }

  const deterministicOutput = maybeHandleDeterministicDefaultTurn(intentPrompt);
  if (deterministicOutput) {
    return {
      output: deterministicOutput,
      runtime: "anan-native",
    };
  }

  const result = await orchestrateDefault({
    ctx: input.ctx,
    prompt: input.prompt,
    intentPrompt,
    role: input.role,
    userId: input.userId,
    threadId: input.threadId,
    channel: input.channel,
    ragContext: input.ragContext,
    promptBudgetMeta: input.promptBudgetMeta,
  });

  return {
    output: result.output,
    runtime: "anan-native",
  };
}
