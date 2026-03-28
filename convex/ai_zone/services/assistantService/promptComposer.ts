import type { Doc } from "../../../_generated/dataModel";
import { buildRecentThreadContext } from "./workspaceContext";
import type { WorkspaceActionState, WorkspaceUploadedFileReference } from "./types";

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
  previousActionState: WorkspaceActionState | null;
}): string {
  if (!options.isWorkspaceAssistant) return "";

  const recentContext = buildRecentThreadContext(options.existingMessages);
  const actionContext = options.previousActionState
    ? `[Open Action]\n${JSON.stringify(
        options.previousActionState.type === "create_project"
          ? {
              type: options.previousActionState.type,
              fields: options.previousActionState.fields,
              missingFields: options.previousActionState.missingFields,
              state: options.previousActionState.state,
            }
          : options.previousActionState,
      )}`
    : "";

  return [recentContext, actionContext]
    .filter((block) => block.length > 0)
    .join("\n\n");
}

export function buildAttachmentContext(
  attachments: WorkspaceUploadedFileReference[] | undefined,
): string {
  if (!attachments || attachments.length === 0) {
    return "";
  }

  return `[Attached Files]\n${attachments
    .map((file, index) => {
      const details = [
        file.name,
        file.mime ? `mime=${file.mime}` : null,
        typeof file.size === "number" ? `size=${file.size}` : null,
      ].filter(Boolean);
      return `${index + 1}. ${details.join(" | ")}`;
    })
    .join("\n")}\nTreat attachments as real user-provided assets. If visual extraction is unavailable, acknowledge receipt honestly and ask for any missing details instead of inventing content.`;
}

export function buildBasePrompt(options: {
  mode: "qa" | "action";
  promptPrefix: string | undefined;
  effectiveUserMessage: string;
  knowledgeContext: string;
  workspaceContextBlock: string;
  attachmentContext?: string;
}): string {
  const prefix = options.promptPrefix ? `${options.promptPrefix}\n\n` : "";
  const workspaceBlock = options.workspaceContextBlock
    ? `\n\n${options.workspaceContextBlock}`
    : "";
  const attachmentBlock = options.attachmentContext
    ? `\n\n${options.attachmentContext}`
    : "";

  if (options.mode === "qa") {
    return `${prefix}${options.effectiveUserMessage}\n\n[Policy: QA-only mode. Answer questions only. Do not execute actions.]${options.knowledgeContext}${workspaceBlock}${attachmentBlock}`;
  }

  return `${prefix}${options.effectiveUserMessage}${options.knowledgeContext}${workspaceBlock}${attachmentBlock}`;
}
