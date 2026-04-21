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
      roleApprovalStatus: identity.profile?.roleApprovalStatus ?? null,
      requestedRole: identity.profile?.requestedRole ?? null,
      isActive: identity.profile?.isActive ?? true,
    },
    profile: identity.profile
      ? {
          id: String(identity.profile._id),
          brokerId: identity.profile.brokerId ? String(identity.profile.brokerId) : null,
          developerId: identity.profile.developerId ? String(identity.profile.developerId) : null,
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
      sentOffersCount: 0,
      receivedOffersCount: 0,
      publicAppliedOffersCount: 0,
      conversationsCount: conversationSummaries.length,
      assistantThreadsCount: relevant.threadRows.length,
      assistantMessagesCount: relevant.relevantAssistantMessages.length,
      inboxMessagesCount: relevant.relevantInboxMessages.length,
      notificationsCount: relevant.relevantNotifications.length,
      ordersCount: relevant.relevantOrders.length,
      dealsCount: relevant.relevantDeals.length,
      verificationCount: identity.userVerificationRequests.length,
    },
    offers: (() => {
      const roleCounts: Record<string, number> = {};
      const statusCounts: Record<string, number> = {};
      const visibilityCounts: Record<string, number> = {};
      for (const item of offerRows) {
        roleCounts[item.role] = (roleCounts[item.role] ?? 0) + 1;
        statusCounts[item.status] = (statusCounts[item.status] ?? 0) + 1;
        if (item.visibility === "public") visibilityCounts.public = (visibilityCounts.public ?? 0) + 1;
        else visibilityCounts.private = (visibilityCounts.private ?? 0) + 1;
      }
      return {
        summary: {
          sent: roleCounts.sender ?? 0,
          received: roleCounts.recipient ?? 0,
          publicApplied: offerRows.filter((item) => item.visibility === "public" && item.role === "recipient").length,
          pending: statusCounts.pending ?? 0,
          accepted: statusCounts.accepted ?? 0,
          rejected: statusCounts.rejected ?? 0,
        },
        statusBreakdown: {
          pending: statusCounts.pending ?? 0,
          accepted: statusCounts.accepted ?? 0,
          rejected: statusCounts.rejected ?? 0,
        },
        visibilityBreakdown: {
          public: visibilityCounts.public ?? 0,
          private: visibilityCounts.private ?? 0,
        },
        recent: offerRows.slice(0, 10),
      };
    })(),
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
    orders: (() => {
      const statusCounts: Record<string, number> = {};
      for (const item of relevant.relevantOrders) {
        statusCounts[item.status] = (statusCounts[item.status] ?? 0) + 1;
      }
      return {
        count: relevant.relevantOrders.length,
        statusBreakdown: {
          new_lead: statusCounts.new_lead ?? 0,
          contacted: statusCounts.contacted ?? 0,
          qualified: statusCounts.qualified ?? 0,
          offer_made: statusCounts.offer_made ?? 0,
          under_contract: statusCounts.under_contract ?? 0,
          closed_won: statusCounts.closed_won ?? 0,
          closed_lost: statusCounts.closed_lost ?? 0,
        },
        recent: orderRows,
      };
    })(),
    deals: (() => {
      const stageCounts: Record<string, number> = {};
      for (const item of relevant.relevantDeals) {
        stageCounts[item.stage] = (stageCounts[item.stage] ?? 0) + 1;
      }
      return {
        count: relevant.relevantDeals.length,
        stageBreakdown: {
          new: stageCounts.new ?? 0,
          contacted: stageCounts.contacted ?? 0,
          negotiation: stageCounts.negotiation ?? 0,
          won: stageCounts.won ?? 0,
          lost: stageCounts.lost ?? 0,
        },
        recent: dealRows,
      };
    })(),
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
      roleApprovalStatus: identity.profile?.roleApprovalStatus ?? null,
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
