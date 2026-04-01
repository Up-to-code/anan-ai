import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
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

type InboxApiRefs = {
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

const inboxApi = apiUnsafe["shared_logic/inbox"] as InboxApiRefs;

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

export const convexInboxRepository: InboxRepository = {
  async list(token, archived = false) {
    return fetchQuery(inboxApi.listConversations as never, { archived } as never, { token }) as Promise<ConversationSummary[]>;
  },
  async getUnreadSummary(token) {
    return fetchQuery(inboxApi.getInboxUnreadSummary as never, {} as never, { token }) as Promise<{ unreadCount: number }>;
  },
  async get(token, conversationId) {
    return fetchQuery(inboxApi.getConversation as never, { conversationId } as never, { token }) as Promise<ConversationDetail>;
  },
  async hasProjectShareAccess(token, propertyId) {
    return fetchQuery(inboxApi.hasProjectShareAccess as never, { propertyId } as never, { token }) as Promise<boolean>;
  },
  async resolve(token, input) {
    return fetchMutation(inboxApi.resolveDirectConversation as never, input as never, { token }) as Promise<string>;
  },
  async bootstrapOffer(token, input) {
    return fetchMutation(inboxApi.bootstrapOfferConversation as never, input as never, { token }) as Promise<BootstrapOfferConversationResult>;
  },
  async send(token, input) {
    return fetchMutation(inboxApi.sendConversationMessage as never, input as never, { token }) as Promise<{
      conversationId: string;
      messageId: string;
    }>;
  },
  async markRead(token, input) {
    await fetchMutation(inboxApi.markConversationRead as never, input as never, { token });
  },
  async setArchived(token, input) {
    await fetchMutation(inboxApi.setConversationArchived as never, input as never, { token });
  },
  async searchTargets(token, query) {
    return fetchQuery(inboxApi.searchConversationTargets as never, { query } as never, { token }) as Promise<UserConversationTarget[]>;
  },
};
