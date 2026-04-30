import { mutationRef, queryRef, voidMutationRef } from "@anan/convex-adapters/repository";
import { inboxApi } from "./api";
import type { InboxRepository } from "./types";

export type { InboxRepository } from "./types";

export const convexInboxRepository: InboxRepository = {
  async list(token, archived = false) {
    return queryRef<Awaited<ReturnType<InboxRepository["list"]>>>(token, inboxApi.listConversations, { archived });
  },
  async getUnreadSummary(token) {
    return queryRef<Awaited<ReturnType<InboxRepository["getUnreadSummary"]>>>(token, inboxApi.getInboxUnreadSummary);
  },
  async get(token, conversationId) {
    return queryRef<Awaited<ReturnType<InboxRepository["get"]>>>(token, inboxApi.getConversation, { conversationId });
  },
  async hasProjectShareAccess(token, propertyId) {
    return queryRef<Awaited<ReturnType<InboxRepository["hasProjectShareAccess"]>>>(
      token,
      inboxApi.hasProjectShareAccess,
      { propertyId },
    );
  },
  async resolve(token, input) {
    return mutationRef<Awaited<ReturnType<InboxRepository["resolve"]>>>(token, inboxApi.resolveDirectConversation, input);
  },
  async bootstrapOffer(token, input) {
    return mutationRef<Awaited<ReturnType<InboxRepository["bootstrapOffer"]>>>(token, inboxApi.bootstrapOfferConversation, input);
  },
  async send(token, input) {
    return mutationRef<Awaited<ReturnType<InboxRepository["send"]>>>(token, inboxApi.sendConversationMessage, input);
  },
  async markRead(token, input) {
    await voidMutationRef(token, inboxApi.markConversationRead, input);
  },
  async setArchived(token, input) {
    await voidMutationRef(token, inboxApi.setConversationArchived, input);
  },
  async searchTargets(token, query) {
    return queryRef<Awaited<ReturnType<InboxRepository["searchTargets"]>>>(
      token,
      inboxApi.searchConversationTargets,
      { query },
    );
  },
};
