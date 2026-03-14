"use client";

import type { AnanProThread } from "@/server/contracts/ananPro";
import WorkspaceAssistantCanvas from "./WorkspaceAssistantCanvas";
import { useWorkspaceAssistant } from "./useWorkspaceAssistant";

type WorkspaceDashboardProps = {
  initialThread: AnanProThread | null;
  initialSelectedThreadId?: string | null;
};

/**
 * WHY:   `/ws` is the operator's primary assistant surface and needs durable thread history inside the same workspace page.
 * WHAT:  Composes the thread rail plus the active assistant canvas for creating, reopening, and continuing Anan Pro conversations.
 * HOW:   Delegates all fetch/state orchestration to `useWorkspaceAssistant` and keeps this file focused on layout wiring only.
 */
export default function WorkspaceDashboard({
  initialThread,
  initialSelectedThreadId = null,
}: WorkspaceDashboardProps) {
  const assistant = useWorkspaceAssistant({
    initialThread,
    initialSelectedThreadId,
  });

  return (
    <div className="min-h-[calc(100svh-7rem)] bg-stone-50">
      <div className="flex min-h-[calc(100svh-7rem)] flex-col">
        <WorkspaceAssistantCanvas
          thread={assistant.thread}
          value={assistant.value}
          sendError={assistant.sendError}
          isLoadingThread={assistant.isLoadingThread}
          isSending={assistant.isSending}
          onChange={assistant.setValue}
          onSend={assistant.handleSend}
        />
      </div>
    </div>
  );
}
