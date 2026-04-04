import type { RawAssistantMessage } from "./types";

export function mapThreadMessages(messages: RawAssistantMessage[]) {
  return messages.map((message) => ({
    id: message._id,
    role: message.role,
    content: message.content,
    uiTurn: message.metadata?.uiTurn,
    meta: message.metadata?.meta,
    inputMode: message.metadata?.inputMode,
    attachments: message.metadata?.attachments,
    createdAt: message.createdAt,
  }));
}

export function resolveThreadTitle(messages: RawAssistantMessage[]) {
  return messages.find((message) => message.role === "user")?.content.slice(0, 80) ?? "anan workspace";
}
