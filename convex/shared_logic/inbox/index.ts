export type {
  CollaborationAction,
  CollaborationActor,
  CollaborationRecipient,
  DealShareMetadata,
  EnsureOfferConversationStarterResult,
  FileShareMetadata,
  InviteEventMetadata,
  OfferCardMetadata,
  ProjectShareMetadata,
  RoleEventMetadata,
} from "./types";

export { ensureOfferConversationStarter, appendInboxOfferEvent } from "./offerEvents";
export { appendInboxCollaborationEvent } from "./collaborationEvents";

export {
  buildDirectConversationKey,
  getConversation,
  getInboxUnreadSummary,
  hasProjectShareAccess,
  listConversations,
  searchConversationTargets,
} from "./queries";

export {
  bootstrapOfferConversation,
  markConversationRead,
  resolveDirectConversation,
  setConversationArchived,
  sendConversationMessage,
} from "./mutations";
