"use client";

import type { AnanProThread } from "@/server/contracts/ananPro";
import WorkspaceAssistantCanvas from "./WorkspaceAssistantCanvas";
import { useWorkspaceAssistant } from "./useWorkspaceAssistant";

import type { SessionUser } from "@/server/contracts/session";

type WorkspaceDashboardProps = {
  initialThread: AnanProThread | null;
  initialSelectedThreadId?: string | null;
  user: SessionUser;
};

export default function WorkspaceDashboard({
  initialThread,
  initialSelectedThreadId = null,
  user,
}: WorkspaceDashboardProps) {
  const assistant = useWorkspaceAssistant({
    initialThread,
    initialSelectedThreadId,
  });

  return (
    <div className="h-[calc(100dvh-7rem)] overflow-hidden bg-white">
      <div className="flex h-full flex-col">
        <WorkspaceAssistantCanvas
          user={user}
          thread={assistant.thread}
          value={assistant.value}
          sendError={assistant.sendError}
          isLoadingThread={assistant.isLoadingThread}
          isSending={assistant.isSending}
          isVoiceRecording={assistant.isVoiceRecording}
          isVoiceTranscribing={assistant.isVoiceTranscribing}
          voiceProcessingPhase={assistant.voiceProcessingPhase}
          canRegenerate={assistant.canRegenerate}
          liveAssistantMotionState={assistant.liveAssistantMotionState}
          liveStageLabel={assistant.liveStageLabel}
          voiceElapsedMs={assistant.voiceElapsedMs}
          voiceLevels={assistant.voiceLevels}
          onToggleVoiceRecording={assistant.toggleVoiceRecording}
          onStopStreaming={assistant.handleStopStreaming}
          onRegenerate={assistant.handleRegenerate}
          onChange={assistant.setValue}
          onSend={assistant.handleSend}
        />
      </div>
    </div>
  );
}
