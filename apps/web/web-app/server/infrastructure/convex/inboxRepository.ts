import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type {
  BootstrapOfferConversationInput,
  BootstrapOfferConversationResult,
  ConversationDetail,
  ConversationSummary,
  MarkConversationReadInput,
  ResolveDirectConversationInput,
  SendConversationMessageInput,
  UserConversationTarget,
} from "@/server/contracts/inbox";

type InboxApiRefs = {
  listConversations: unknown;
  getConversation: unknown;
  resolveDirectConversation: unknown;
  bootstrapOfferConversation: unknown;
  sendConversationMessage: unknown;
  markConversationRead: unknown;
  searchConversationTargets: unknown;
};

const inboxApi = apiUnsafe["shared_logic/inbox"] as InboxApiRefs;

export type InboxRepository = {
  list(token: string): Promise<ConversationSummary[]>;
  get(token: string, conversationId: string): Promise<ConversationDetail>;
  resolve(token: string, input: ResolveDirectConversationInput): Promise<string>;
  bootstrapOffer(token: string, input: BootstrapOfferConversationInput): Promise<BootstrapOfferConversationResult>;
  send(token: string, input: SendConversationMessageInput): Promise<{ conversationId: string; messageId: string }>;
  markRead(token: string, input: MarkConversationReadInput): Promise<void>;
  searchTargets(token: string, query: string): Promise<UserConversationTarget[]>;
};

export const convexInboxRepository: InboxRepository = {
  async list(token) {
    return fetchQuery(inboxApi.listConversations as never, {} as never, { token }) as Promise<ConversationSummary[]>;
  },
  async get(token, conversationId) {
    return fetchQuery(inboxApi.getConversation as never, { conversationId } as never, { token }) as Promise<ConversationDetail>;
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
  async searchTargets(token, query) {
    return fetchQuery(inboxApi.searchConversationTargets as never, { query } as never, { token }) as Promise<UserConversationTarget[]>;
  },
};
