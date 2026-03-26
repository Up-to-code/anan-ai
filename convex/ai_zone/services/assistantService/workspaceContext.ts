import type { Doc } from "../../../_generated/dataModel";
import type { WorkspaceActionState, WorkspaceUploadedFileReference } from "./types";

export function getLatestWorkspaceActionState(
  messages: Array<Doc<"assistantMessages">>
): WorkspaceActionState | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.role !== "assistant") continue;

    const metadata = (message.metadata ?? {}) as {
      workspaceActionState?: WorkspaceActionState;
      meta?: { workspaceActionState?: WorkspaceActionState };
    };
    const state = metadata.workspaceActionState ?? metadata.meta?.workspaceActionState;
    if (state?.type === "create_project") {
      return state;
    }
  }

  return null;
}

export function buildRecentThreadContext(
  messages: Array<Doc<"assistantMessages">>,
  limit = 6
): string {
  if (messages.length === 0) return "";

  const recent = messages.slice(-limit);
  const lines = recent.map((message) => {
    const roleLabel = message.role === "user" ? "User" : "Assistant";
    const metadata = (message.metadata ?? {}) as {
      attachments?: WorkspaceUploadedFileReference[];
    };
    const attachments = metadata.attachments?.length
      ? ` [attachments: ${metadata.attachments.map((file) => file.name).join(", ")}]`
      : "";
    return `- ${roleLabel}: ${message.content.slice(0, 240)}${attachments}`;
  });

  return `[Recent Thread Context]\n${lines.join("\n")}`;
}
