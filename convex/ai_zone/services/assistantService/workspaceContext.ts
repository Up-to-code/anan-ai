import type { Doc } from "../../../_generated/dataModel";
import type { WorkspaceProjectActionState } from "./types";

export function getLatestWorkspaceActionState(
  messages: Array<Doc<"assistantMessages">>
): WorkspaceProjectActionState | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.role !== "assistant") continue;

    const metadata = (message.metadata ?? {}) as {
      workspaceActionState?: WorkspaceProjectActionState;
      meta?: { workspaceActionState?: WorkspaceProjectActionState };
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
    return `- ${roleLabel}: ${message.content.slice(0, 240)}`;
  });

  return `[Recent Thread Context]\n${lines.join("\n")}`;
}

