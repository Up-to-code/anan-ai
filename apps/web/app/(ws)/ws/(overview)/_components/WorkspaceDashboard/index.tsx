"use client";

import type { AnanProThread } from "@/server/contracts/ananPro";
import WorkspaceAssistantCanvas from "./WorkspaceAssistantCanvas";
import {
  useWorkspaceAssistant,
  type AssistantInitialRouteState,
} from "./useWorkspaceAssistant";

import type { SessionUser } from "@/server/contracts/session";

type WorkspaceDashboardProps = {
  initialThread: AnanProThread | null;
  initialRouteState?: AssistantInitialRouteState;
  user: SessionUser;
};

export default function WorkspaceDashboard({
  initialThread,
  initialRouteState = {
    requestedThreadId: null,
    unavailableThreadId: null,
  },
  user,
}: WorkspaceDashboardProps) {
  const assistant = useWorkspaceAssistant({
    initialThread,
    initialRouteState,
  });

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="flex min-h-0 flex-1 flex-col">
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
          unavailableThreadId={assistant.unavailableThreadId}
          onResetUnavailableThread={assistant.handleResetUnavailableThread}
          onChange={assistant.setValue}
          onSend={assistant.handleSend}
        />
      </div>
    </div>
  );
}
