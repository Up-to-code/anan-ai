/**
 * Text pipeline – normalize intent, produce ProcessedInput for the deterministic buyer flow.
 */
import type { ChannelType } from "../../../../shared_logic/lib/middleware/channelDetect";

export type ProcessedInput = {
  channelType: ChannelType;
  userId: string;
  text: string;
  threadId?: string;
  displayName?: string;
  messageType:
    | "text"
    | "image"
    | "audio"
    | "video"
    | "document"
    | "interactive_button_reply"
    | "interactive_list_reply";
  interactiveReplyId?: string;
  interactiveReplyTitle?: string;
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
  messageType: ProcessedInput["messageType"];
  interactiveReplyId?: string;
  interactiveReplyTitle?: string;
}): ProcessedInput {
  const normalized = params.text.replace(/\s+/g, " ").trim();
  return {
    channelType: params.channelType,
    userId: params.userId,
    text: normalized,
    threadId: params.threadId,
    displayName: params.displayName,
    messageType: params.messageType,
    interactiveReplyId: params.interactiveReplyId,
    interactiveReplyTitle: params.interactiveReplyTitle,
  };
}
