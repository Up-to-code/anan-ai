import { v } from "convex/values";
import { requireRole } from "../../_core/security/accessPolicy";
import { buildTenantMembershipRows } from "./tenantMembership";
import { buildAdminUserActivityRows } from "./detail/activity";
import { buildConversationSummaries } from "./detail/conversations";
import { resolveAdminUserIdentity } from "./detail/identity";
import { buildAdminUserOfferInsights } from "./detail/offers";
import { filterAdminUserRelevantData } from "./detail/relevant";
import { loadAdminUserDetailSources } from "./detail/sources";

export const getAdminUserDetailArgs = { userKey: v.string() };

export async function getAdminUserDetailHandler(ctx: any, { userKey }: { userKey: string }) {
  await requireRole(ctx, ["admin"]);

  const sources = await loadAdminUserDetailSources(ctx);
  const tenantMemberships = await buildTenantMembershipRows(ctx, sources.tenantLinks);

  const identity = resolveAdminUserIdentity({
    brokers: sources.brokers,
    developers: sources.developers,
    profiles: sources.profiles,
    subscriptions: sources.subscriptions,
    tenantMemberships,
    userKey,
    users: sources.users,
    verificationRequests: sources.verificationRequests,
  });

  if (!identity) return null;

  const relevant = filterAdminUserRelevantData({
    assistantMessages: sources.assistantMessages,
    assistantThreads: sources.assistantThreads,
    conversationParticipants: sources.conversationParticipants,
    conversations: sources.conversations,
    currentBrokerId: identity.currentBrokerId,
    currentRedId: identity.currentRedId,
    deals: sources.deals,
    inboxMessages: sources.inboxMessages,
    knowledgeResearch: sources.knowledgeResearch,
    notifications: sources.notifications,
    orders: sources.orders,
    profile: identity.profile,
    relevantUserIds: identity.relevantUserIds,
    searchLogs: sources.searchLogs,
  });

  const { offerRows, counterpartStats } = buildAdminUserOfferInsights({
    brokers: sources.brokers,
    currentBrokerId: identity.currentBrokerId,
    currentRedId: identity.currentRedId,
    developers: sources.developers,
    inboxMessages: sources.inboxMessages,
    offers: sources.offers,
    properties: sources.properties,
    relevantDeals: relevant.relevantDeals,
    relevantOrders: relevant.relevantOrders,
  });

  const conversationSummaries = buildConversationSummaries({
    participantRows: relevant.participantRows,
    profiles: sources.profiles,
    relevantConversations: relevant.relevantConversations,
    relevantInboxMessages: relevant.relevantInboxMessages,
    users: sources.users,
  });

  const { dealRows, notificationRows, orderRows } = buildAdminUserActivityRows({
    relevantDeals: relevant.relevantDeals,
    relevantNotifications: relevant.relevantNotifications,
    relevantOrders: relevant.relevantOrders,
  });

  return {
    identity: {
      userKey,
      authUserId: identity.profile?.authUserId ?? null,
      externalUserId: identity.channelUser?.userId ?? null,
      name:
        identity.profile?.name ??
        identity.channelUser?.displayName ??
        identity.channelUser?.name ??
        identity.profile?.email ??
        identity.channelUser?.email ??
        "مستخدم عنان",
      email: identity.profile?.email ?? identity.channelUser?.email ?? null,
      channel: identity.channelUser?.channel ?? null,
      role: identity.profile?.role ?? null,
      roleStatus: identity.profile?.roleStatus ?? null,
      requestedRole: identity.profile?.requestedRole ?? null,
      isActive: identity.profile?.isActive ?? true,
    },
    profile: identity.profile
      ? {
          id: String(identity.profile._id),
          brokerId: identity.profile.brokerId ? String(identity.profile.brokerId) : null,
          redId: identity.profile.REDId ? String(identity.profile.REDId) : null,
          showInOffersDirectory: identity.profile.showInOffersDirectory ?? true,
        }
      : null,
    organizations: identity.organizations,
    memberships: identity.profileMemberships.map((membership) => ({
      id: `${membership.tenantOrgId}:${membership.member.userId}`,
      role: membership.member.role,
      status: membership.member.status ?? "active",
      ownerType: membership.ownerType,
      createdAt: membership.member.joinedAt ?? membership.member._creationTime,
      organizationName:
        membership.ownerType === "broker"
          ? sources.brokers.find((item: any) => String(item._id) === membership.ownerId)?.name ??
            "منظمة غير معروفة"
          : sources.developers.find((item: any) => String(item._id) === membership.ownerId)?.name ??
            "منظمة غير معروفة",
      organizationKey:
        membership.ownerType === "broker" ? `broker__${membership.ownerId}` : `red__${membership.ownerId}`,
    })),
    metrics: {
      organizationsCount: identity.organizations.length,
      membershipsCount: identity.profileMemberships.length,
      sentOffersCount: offerRows.filter((item) => item.role === "sender").length,
      receivedOffersCount: offerRows.filter((item) => item.role === "recipient").length,
      publicAppliedOffersCount: offerRows.filter((item) => item.visibility === "public" && item.role === "recipient").length,
      conversationsCount: conversationSummaries.length,
      assistantThreadsCount: relevant.threadRows.length,
      assistantMessagesCount: relevant.relevantAssistantMessages.length,
      inboxMessagesCount: relevant.relevantInboxMessages.length,
      notificationsCount: relevant.relevantNotifications.length,
      ordersCount: relevant.relevantOrders.length,
      dealsCount: relevant.relevantDeals.length,
      verificationCount: identity.userVerificationRequests.length,
    },
    offers: {
      summary: {
        sent: offerRows.filter((item) => item.role === "sender").length,
        received: offerRows.filter((item) => item.role === "recipient").length,
        publicApplied: offerRows.filter((item) => item.visibility === "public" && item.role === "recipient").length,
        pending: offerRows.filter((item) => item.status === "pending").length,
        accepted: offerRows.filter((item) => item.status === "accepted").length,
        rejected: offerRows.filter((item) => item.status === "rejected").length,
      },
      statusBreakdown: {
        pending: offerRows.filter((item) => item.status === "pending").length,
        accepted: offerRows.filter((item) => item.status === "accepted").length,
        rejected: offerRows.filter((item) => item.status === "rejected").length,
      },
      visibilityBreakdown: {
        public: offerRows.filter((item) => item.visibility === "public").length,
        private: offerRows.filter((item) => item.visibility !== "public").length,
      },
      recent: offerRows.slice(0, 10),
    },
    connections: {
      counterparts: Array.from(counterpartStats.values())
        .sort((left, right) => right.offersCount - left.offersCount)
        .slice(0, 10),
      recentHandoffs: offerRows.slice(0, 10).map((item) => ({
        offerId: item.id,
        propertyTitle: item.propertyTitle,
        status: item.status,
        visibility: item.visibility,
        role: item.role,
        counterpartName: item.counterpart?.name ?? "السوق العامة",
        counterpartType: item.counterpart?.ownerType ?? "marketplace",
        conversationCount: item.conversationCount,
        dealCount: item.dealCount,
        orderCount: item.orderCount,
        createdAt: item.createdAt,
      })),
    },
    verificationRequests: identity.userVerificationRequests.map((request: any) => ({
      id: String(request._id),
      requestType: request.requestType,
      currentStatus: request.currentStatus,
      title: request.title ?? request.requestType,
      submittedAt: request.submittedAt,
      reviewedAt: request.reviewedAt ?? null,
    })),
    messages: {
      conversationCount: conversationSummaries.length,
      assistantCount: relevant.relevantAssistantMessages.length,
      inboxCount: relevant.relevantInboxMessages.length,
      unreadConversationCount: conversationSummaries.filter((item) => item.unreadCount > 0).length,
      conversations: conversationSummaries.slice(0, 10),
      latestAssistantMessages: relevant.relevantAssistantMessages
        .sort((left, right) => right.createdAt - left.createdAt)
        .slice(0, 10),
      latestInboxMessages: relevant.relevantInboxMessages
        .sort((left, right) => right.createdAt - left.createdAt)
        .slice(0, 10),
    },
    notifications: {
      count: relevant.relevantNotifications.length,
      unreadCount: relevant.relevantNotifications.filter((item) => !item.readAt).length,
      recent: notificationRows,
    },
    orders: {
      count: relevant.relevantOrders.length,
      statusBreakdown: {
        new_lead: relevant.relevantOrders.filter((item) => item.status === "new_lead").length,
        contacted: relevant.relevantOrders.filter((item) => item.status === "contacted").length,
        qualified: relevant.relevantOrders.filter((item) => item.status === "qualified").length,
        offer_made: relevant.relevantOrders.filter((item) => item.status === "offer_made").length,
        under_contract: relevant.relevantOrders.filter((item) => item.status === "under_contract").length,
        closed_won: relevant.relevantOrders.filter((item) => item.status === "closed_won").length,
        closed_lost: relevant.relevantOrders.filter((item) => item.status === "closed_lost").length,
      },
      recent: orderRows,
    },
    deals: {
      count: relevant.relevantDeals.length,
      stageBreakdown: {
        new: relevant.relevantDeals.filter((item) => item.stage === "new").length,
        contacted: relevant.relevantDeals.filter((item) => item.stage === "contacted").length,
        negotiation: relevant.relevantDeals.filter((item) => item.stage === "negotiation").length,
        won: relevant.relevantDeals.filter((item) => item.stage === "won").length,
        lost: relevant.relevantDeals.filter((item) => item.stage === "lost").length,
      },
      recent: dealRows,
    },
    activity: {
      knowledgeResearchCount: relevant.relevantResearch.length,
      searchLogsCount: relevant.relevantSearchLogs.length,
      notificationsCount: relevant.relevantNotifications.length,
      ordersCount: relevant.relevantOrders.length,
      dealsCount: relevant.relevantDeals.length,
      latestResearch: relevant.relevantResearch.sort((left, right) => right.createdAt - left.createdAt).slice(0, 10),
      latestSearchLogs: relevant.relevantSearchLogs
        .sort((left, right) => (right._creationTime ?? 0) - (left._creationTime ?? 0))
        .slice(0, 10),
      latestNotifications: notificationRows,
      latestOrders: orderRows,
      latestDeals: dealRows,
    },
    access: {
      role: identity.profile?.role ?? null,
      roleStatus: identity.profile?.roleStatus ?? null,
      requestedRole: identity.profile?.requestedRole ?? null,
      showInOffersDirectory: identity.profile?.showInOffersDirectory ?? true,
      verified: identity.verified,
      hasActiveSubscription: identity.hasActiveSubscription,
      actionModeEnabled: identity.actionModeEnabled,
      mode: identity.actionModeEnabled ? "action" : "qa",
      subscription: identity.subscription
        ? {
            ownerType: identity.subscription.ownerType,
            planTier: identity.subscription.planTier,
            status: identity.subscription.status,
            actionModeEnabled: identity.subscription.actionModeEnabled === true,
            startedAt: identity.subscription.startedAt ?? null,
            expiresAt: identity.subscription.expiresAt ?? null,
          }
        : null,
      organizationAccess: identity.organizations,
    },
  };
}
