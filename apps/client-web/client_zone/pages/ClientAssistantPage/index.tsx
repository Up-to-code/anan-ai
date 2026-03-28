import { ChatShell } from "@/client_zone/components/chat/ChatShell";

/**
 * WHY:   The simplified client experience now starts directly in a chat surface.
 * WHAT:  Renders the shared ChatGPT-style shell used by the home and compatibility routes.
 * HOW:   Delegates layout and thread orchestration to `ChatShell`.
 */
export function ClientAssistantPage({
  mode = "default",
  initialPrompt,
  initialThreadId,
}: {
  mode?: "default" | "search" | "loans";
  initialPrompt?: string | null;
  initialThreadId?: string | null;
}) {
  return <ChatShell mode={mode} initialPrompt={initialPrompt} initialThreadId={initialThreadId} />;
}
