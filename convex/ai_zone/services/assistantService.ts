/**
 * assistantService.ts — AI Zone Service Layer
 *
 * All complex DB logic, identity resolution, and orchestration for the
 * AI assistant live in service modules under `services/assistantService/*`.
 * This file remains the stable import surface for thin controllers.
 */

export type { AssistantOwner } from "./assistantService/types";

export { resolveAssistantOwner, resolveAssistantOwnerSafe } from "./assistantService/owner";

export {
  getLatestThread,
  getMessageContent,
  listRecentThreads,
  listThreadMessages,
} from "./assistantService/threads";

export { handleAssistantMessage } from "./assistantService/handleAssistantMessage";

export { createAssistantThread, saveConversationStep } from "./assistantService/persistence";
