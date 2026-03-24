import { createWorkspaceStreamControls } from "./workspaceStream";

export async function syncWorkspaceAssistantStream(args: {
  assistantText: string;
  isWorkspaceAssistant: boolean;
  streamSessionId?: string;
  workspaceStream: ReturnType<typeof createWorkspaceStreamControls>;
}) {
  if (!args.isWorkspaceAssistant || !args.streamSessionId) return;
  const streamed = args.workspaceStream.getStreamedText();
  if (!args.workspaceStream.didEmitAnyDelta() && args.assistantText) {
    await args.workspaceStream.emitDelta(args.assistantText);
    return;
  }
  if (args.assistantText.startsWith(streamed)) {
    const suffix = args.assistantText.slice(streamed.length);
    if (suffix) await args.workspaceStream.emitDelta(suffix);
    return;
  }
  if (args.assistantText !== streamed) {
    await args.workspaceStream.emitDelta(args.assistantText);
  }
}
