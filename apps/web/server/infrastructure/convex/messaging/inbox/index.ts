import { fetchMutation, fetchQuery } from "convex/nextjs";
import { inboxApi } from "./api";
import type { InboxRepository } from "./types";

export type { InboxRepository } from "./types";

export const convexInboxRepository: InboxRepository = {
  async list(token, archived = false) {
    return fetchQuery(inboxApi.listConversations as never, { archived } as never, { token }) as ReturnType<InboxRepository["list"]>;
  },
  async getUnreadSummary(token) {
    return fetchQuery(inboxApi.getInboxUnreadSummary as never, {} as never, { token }) as ReturnType<InboxRepository["getUnreadSummary"]>;
  },
  async get(token, conversationId) {
    return fetchQuery(inboxApi.getConversation as never, { conversationId } as never, { token }) as ReturnType<InboxRepository["get"]>;
  },
  async hasProjectShareAccess(token, propertyId) {
    return fetchQuery(inboxApi.hasProjectShareAccess as never, { propertyId } as never, { token }) as ReturnType<InboxRepository["hasProjectShareAccess"]>;
  },
  async resolve(token, input) {
    return fetchMutation(inboxApi.resolveDirectConversation as never, input as never, { token }) as ReturnType<InboxRepository["resolve"]>;
  },
  async bootstrapOffer(token, input) {
    return fetchMutation(inboxApi.bootstrapOfferConversation as never, input as never, { token }) as ReturnType<InboxRepository["bootstrapOffer"]>;
  },
  async send(token, input) {
    return fetchMutation(inboxApi.sendConversationMessage as never, input as never, { token }) as ReturnType<InboxRepository["send"]>;
  },
  async markRead(token, input) {
    await fetchMutation(inboxApi.markConversationRead as never, input as never, { token });
  },
  async setArchived(token, input) {
    await fetchMutation(inboxApi.setConversationArchived as never, input as never, { token });
  },
  async searchTargets(token, query) {
    return fetchQuery(inboxApi.searchConversationTargets as never, { query } as never, { token }) as ReturnType<InboxRepository["searchTargets"]>;
  },
};
