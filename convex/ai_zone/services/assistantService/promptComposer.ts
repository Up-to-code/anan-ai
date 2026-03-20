import type { Doc } from "../../../_generated/dataModel";
import { buildRecentThreadContext } from "./workspaceContext";
import type { WorkspaceProjectActionState } from "./types";

type KnowledgeItem = { title: string; category?: string | null; excerpt: string };

export function selectRegenerateSource(options: {
  existingMessages: Array<Doc<"assistantMessages">>;
  regenerate: boolean | undefined;
  regenerateMessageId: string | undefined;
}): Doc<"assistantMessages"> | null {
  const { existingMessages, regenerate, regenerateMessageId } = options;
  if (!regenerate) return null;
  if (regenerateMessageId) {
    return (
      existingMessages.find(
        (message) =>
          String(message._id) === regenerateMessageId && message.role === "user"
      ) ?? null
    );
  }
  return [...existingMessages].reverse().find((message) => message.role === "user") ?? null;
}

export function buildKnowledgeContext(knowledge: KnowledgeItem[]): string {
  if (knowledge.length === 0) return "";
  return `\n\n[Company Knowledge]\n${knowledge
    .map(
      (k) => `- ${k.title}${k.category ? ` (${k.category})` : ""}: ${k.excerpt}`
    )
    .join("\n")}`;
}

export function buildWorkspaceContextBlock(options: {
  isWorkspaceAssistant: boolean;
  existingMessages: Array<Doc<"assistantMessages">>;
  previousActionState: WorkspaceProjectActionState | null;
}): string {
  if (!options.isWorkspaceAssistant) return "";

  const recentContext = buildRecentThreadContext(options.existingMessages);
  const actionContext = options.previousActionState
    ? `[Open Action]\n${JSON.stringify({
        type: options.previousActionState.type,
        fields: options.previousActionState.fields,
        missingFields: options.previousActionState.missingFields,
        state: options.previousActionState.state,
      })}`
    : "";

  return [recentContext, actionContext]
    .filter((block) => block.length > 0)
    .join("\n\n");
}

export function buildBasePrompt(options: {
  mode: "qa" | "action";
  promptPrefix: string | undefined;
  effectiveUserMessage: string;
  knowledgeContext: string;
  workspaceContextBlock: string;
}): string {
  const prefix = options.promptPrefix ? `${options.promptPrefix}\n\n` : "";
  const workspaceBlock = options.workspaceContextBlock
    ? `\n\n${options.workspaceContextBlock}`
    : "";

  if (options.mode === "qa") {
    return `${prefix}${options.effectiveUserMessage}\n\n[Policy: QA-only mode. Answer questions only. Do not execute actions.]${options.knowledgeContext}${workspaceBlock}`;
  }

  return `${prefix}${options.effectiveUserMessage}${options.knowledgeContext}${workspaceBlock}`;
}

