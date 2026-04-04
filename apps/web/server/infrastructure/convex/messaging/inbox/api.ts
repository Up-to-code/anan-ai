import { apiUnsafe } from "@/lib/convexApi";

export type InboxApiRefs = {
  listConversations: unknown;
  getInboxUnreadSummary: unknown;
  getConversation: unknown;
  hasProjectShareAccess: unknown;
  resolveDirectConversation: unknown;
  bootstrapOfferConversation: unknown;
  sendConversationMessage: unknown;
  markConversationRead: unknown;
  setConversationArchived: unknown;
  searchConversationTargets: unknown;
};

export const inboxApi = apiUnsafe["shared_logic/inbox"] as InboxApiRefs;
