import type {
  BootstrapOfferConversationInput,
  BootstrapOfferConversationResult,
  ConversationDetail,
  ConversationSummary,
  MarkConversationReadInput,
  ResolveDirectConversationInput,
  SetConversationArchivedInput,
  SendConversationMessageInput,
  UserConversationTarget,
} from "@/server/contracts/inbox";

export type InboxRepository = {
  list(token: string, archived?: boolean): Promise<ConversationSummary[]>;
  getUnreadSummary(token: string): Promise<{ unreadCount: number }>;
  get(token: string, conversationId: string): Promise<ConversationDetail>;
  hasProjectShareAccess(token: string, propertyId: string): Promise<boolean>;
  resolve(token: string, input: ResolveDirectConversationInput): Promise<string>;
  bootstrapOffer(token: string, input: BootstrapOfferConversationInput): Promise<BootstrapOfferConversationResult>;
  send(token: string, input: SendConversationMessageInput): Promise<{ conversationId: string; messageId: string }>;
  markRead(token: string, input: MarkConversationReadInput): Promise<void>;
  setArchived(token: string, input: SetConversationArchivedInput): Promise<void>;
  searchTargets(token: string, query: string): Promise<UserConversationTarget[]>;
};
