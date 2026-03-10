/**
 * Text pipeline – normalize intent, produce ProcessedInput for agent.
 */
import type { ChannelType } from "../../../../shared_logic/lib/middleware/channelDetect";

export type ProcessedInput = {
  channelType: ChannelType;
  userId: string;
  text: string;
  threadId?: string;
  displayName?: string;
};

/**
 * Normalize raw text (trim, collapse whitespace).
 * Extend with intent parsing when needed.
 */
export function processTextPipeline(params: {
  text: string;
  channelType: ChannelType;
  userId: string;
  threadId?: string;
  displayName?: string;
}): ProcessedInput {
  const normalized = params.text.replace(/\s+/g, " ").trim();
  return {
    channelType: params.channelType,
    userId: params.userId,
    text: normalized,
    threadId: params.threadId,
    displayName: params.displayName,
  };
}
