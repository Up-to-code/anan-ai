import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import { getMessageContent } from "./services/assistantService/threads";

export {
  _saveConversationStep,
  getRuntimeContextBundle,
  getThread,
  getThreadSafe,
  listMessages,
  listThreads,
  sendMessage,
} from "./assistantWorkspace";

export const _getMessageContent = internalQuery({
  args: { messageId: v.string() },
  handler: async (ctx, args) => {
    return getMessageContent(ctx, args.messageId);
  },
});
