import type { DetailCollections, ParsedOrganization, ScopedOrganizationData } from "./getOrganizationDetail.types";
function sortByCreatedAtDescending<T extends { _creationTime?: number | null }>(items: T[]) {
  return [...items].sort((left, right) => (right._creationTime ?? 0) - (left._creationTime ?? 0));
}
function buildOrganizationSummary(parsed: ParsedOrganization, organizationKey: string, organization: any) {
  return {
    id: parsed.id,
    organizationKey,
    ownerType: parsed.ownerType,
    name: organization.name,
    slug: organization.slug,
    status: organization.status ?? "pending",
    isVerified: organization.isVerified === true,
    contactEmail: organization.contactEmail ?? null,
    phone: organization.phone ?? null,
    description: organization.description ?? null,
    website: organization.website ?? null,
  };
}
function buildOrganizationMetrics(args: {
  memberships: any[];
  invites: any[];
  scoped: ScopedOrganizationData;
  offersCount: number;
  conversationsCount: number;
}) {
  return {
    membersCount: args.memberships.length,
    invitesCount: args.invites.length,
    propertiesCount: args.scoped.organizationProperties.length,
    linkedProfilesCount: args.scoped.linkedProfiles.length,
    offersCount: args.offersCount,
    conversationsCount: args.conversationsCount,
    inboxMessagesCount: args.scoped.organizationInboxMessages.length,
    notificationsCount: args.scoped.organizationNotifications.length,
    ordersCount: args.scoped.organizationOrders.length,
    dealsCount: args.scoped.organizationDeals.length,
    verificationCount: args.scoped.organizationVerifications.length,
  };
}
function buildMemberships(memberships: any[], profiles: any[]) {
  return memberships.map((membership) => {
    const profile = profiles.find((item) => item.authUserId === membership.userId);
    return {
      id: String(membership._id),
      authUserId: membership.userId,
      role: membership.role,
      status: membership.status ?? "active",
      createdAt: membership.joinedAt ?? membership._creationTime,
      profileName: profile?.name ?? profile?.email ?? "مستخدم عنان",
      profileEmail: profile?.email ?? null,
    };
  });
}
function buildInvites(invites: any[]) {
  return invites.map((invite) => ({
    id: String(invite._id),
    email: invite.inviteeIdentifier,
    role: invite.role,
    status: invite.status === "cancelled" ? "canceled" : invite.status,
    invitedBy: invite.inviterId ?? "",
    expiresAt: invite.expiresAt,
    acceptedAt: null,
  }));
}
function buildProperties(properties: any[]) {
  return properties.map((property) => ({
    id: String(property._id),
    title: property.title,
    status: property.status ?? null,
    price: property.price,
    address: property.address,
  }));
}
function buildLinkedProfiles(profiles: any[]) {
  return profiles.map((profile) => ({
    id: String(profile._id),
    authUserId: profile.authUserId,
    name: profile.name ?? profile.email ?? "مستخدم عنان",
    email: profile.email ?? null,
    role: profile.role ?? null,
    roleApprovalStatus: profile.roleApprovalStatus ?? null,
    showInOffersDirectory: profile.showInOffersDirectory ?? true,
  }));
}
function countOffersByStatus(offers: any[]) {
  return {
    pending: offers.filter((item) => item.status === "pending").length,
    accepted: offers.filter((item) => item.status === "accepted").length,
    rejected: offers.filter((item) => item.status === "rejected").length,
  };
}
function countOffersByVisibility(offers: any[]) {
  return {
    public: offers.filter((item) => item.visibility === "public").length,
    private: offers.filter((item) => item.visibility !== "public").length,
  };
}
function buildOffersSection(organizationOffers: any[], counterpartStats: Map<string, any>) {
  const statusBreakdown = countOffersByStatus(organizationOffers);
  const visibilityBreakdown = countOffersByVisibility(organizationOffers);
  return {
    summary: {
      sent: organizationOffers.filter((item) => item.role === "sender").length,
      received: organizationOffers.filter((item) => item.role === "recipient").length,
      pending: statusBreakdown.pending,
      accepted: statusBreakdown.accepted,
      rejected: statusBreakdown.rejected,
      public: visibilityBreakdown.public,
      private: visibilityBreakdown.private,
    },
    statusBreakdown,
    visibilityBreakdown,
    topCounterparts: Array.from(counterpartStats.values())
      .sort((left, right) => right.offersCount - left.offersCount)
      .slice(0, 10),
    recent: organizationOffers.slice(0, 10),
  };
}
function buildMessagesSection(args: {
  organizationInboxMessages: any[];
  conversationSummaries: any[];
}) {
  const latestInboxMessages = [...args.organizationInboxMessages]
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, 10)
    .map((item) => ({
      id: String(item._id),
      senderUserId: item.senderUserId,
      recipientUserId: item.recipientUserId,
      type: item.type,
      body: item.body,
      createdAt: item.createdAt,
    }));
  return {
    conversationCount: args.conversationSummaries.length,
    inboxCount: args.organizationInboxMessages.length,
    unreadConversationCount: args.conversationSummaries.filter((item) => item.unreadCount > 0).length,
    conversations: args.conversationSummaries.slice(0, 10),
    latestInboxMessages,
  };
}
function buildSubscriptionSection(organizationSubscription: any | null) {
  if (!organizationSubscription) {
    return null;
  }
  return {
    ownerType: organizationSubscription.ownerType,
    planTier: organizationSubscription.planTier,
    status: organizationSubscription.status,
    actionModeEnabled: organizationSubscription.actionModeEnabled === true,
    startedAt: organizationSubscription.startedAt ?? null,
    expiresAt: organizationSubscription.expiresAt ?? null,
  };
}
export function buildOrdersSection(organizationOrders: any[]) {
  const statusCounts: Record<string, number> = {};
  for (const item of organizationOrders) {
    statusCounts[item.status] = (statusCounts[item.status] ?? 0) + 1;
  }
  return {
    count: organizationOrders.length,
    statusBreakdown: {
      new_lead: statusCounts.new_lead ?? 0,
      contacted: statusCounts.contacted ?? 0,
      qualified: statusCounts.qualified ?? 0,
      offer_made: statusCounts.offer_made ?? 0,
      under_contract: statusCounts.under_contract ?? 0,
      closed_won: statusCounts.closed_won ?? 0,
      closed_lost: statusCounts.closed_lost ?? 0,
    },
    recent: sortByCreatedAtDescending(organizationOrders)
      .slice(0, 10)
      .map((item) => ({
        id: String(item._id),
        type: item.type,
        status: item.status,
        sourceChannel: item.sourceChannel ?? null,
        createdAt: item._creationTime ?? 0,
      })),
  };
}
export function buildDealsSection(organizationDeals: any[]) {
  const stageCounts: Record<string, number> = {};
  for (const item of organizationDeals) {
    stageCounts[item.stage] = (stageCounts[item.stage] ?? 0) + 1;
  }
  return {
    count: organizationDeals.length,
    stageBreakdown: {
      new: stageCounts.new ?? 0,
      contacted: stageCounts.contacted ?? 0,
      negotiation: stageCounts.negotiation ?? 0,
      won: stageCounts.won ?? 0,
      lost: stageCounts.lost ?? 0,
    },
    recent: sortByCreatedAtDescending(organizationDeals)
      .slice(0, 10)
      .map((item) => ({
        id: String(item._id),
        title: item.title,
        stage: item.stage,
        value: item.value ?? null,
        offerId: item.offerId ? String(item.offerId) : null,
        createdAt: item._creationTime ?? 0,
      })),
  };
}
function buildVerificationRequestsSection(organizationVerifications: any[]) {
  return organizationVerifications.map((request) => ({
    id: String(request._id),
    title: request.title ?? request.requestType,
    currentStatus: request.currentStatus,
    submittedAt: request.submittedAt,
    reviewedAt: request.reviewedAt ?? null,
  }));
}
function buildAccessSection(args: {
  organization: any;
  hasActiveSubscription: boolean;
  actionModeEnabled: boolean;
  organizationSubscription: any | null;
  linkedProfiles: any[];
}) {
  return {
    verified: args.organization.isVerified === true,
    hasActiveSubscription: args.hasActiveSubscription,
    actionModeEnabled: args.actionModeEnabled,
    mode: args.actionModeEnabled ? "action" : "qa",
    planTier: args.organizationSubscription?.planTier ?? null,
    subscriptionStatus: args.organizationSubscription?.status ?? null,
    linkedProfilesVisibleInOffersDirectory: args.linkedProfiles.filter((item) => item.showInOffersDirectory !== false)
      .length,
  };
}
export function buildOrganizationDetailResponse(args: { parsed: ParsedOrganization; organizationKey: string; organization: any; collections: DetailCollections; scoped: ScopedOrganizationData; memberships: any[]; invites: any[]; organizationOffers: any[]; counterpartStats: Map<string, any>; conversationSummaries: any[]; hasActiveSubscription: boolean; actionModeEnabled: boolean; }) {
  const organization = buildOrganizationSummary(args.parsed, args.organizationKey, args.organization);
  return { organization, ...buildOrganizationSections(args) };
}
function buildOrganizationSections(args: { organization: any; collections: DetailCollections; scoped: ScopedOrganizationData; memberships: any[]; invites: any[]; organizationOffers: any[]; counterpartStats: Map<string, any>; conversationSummaries: any[]; hasActiveSubscription: boolean; actionModeEnabled: boolean; }) {
  const { metrics, messages, access } = buildOrganizationComputedSections(args);
  return {
    metrics,
    memberships: buildMemberships(args.memberships, args.collections.profiles),
    invites: buildInvites(args.invites),
    properties: buildProperties(args.scoped.organizationProperties),
    linkedProfiles: buildLinkedProfiles(args.scoped.linkedProfiles),
    offers: buildOffersSection(args.organizationOffers, args.counterpartStats),
    messages,
    subscription: buildSubscriptionSection(args.scoped.organizationSubscription),
    orders: buildOrdersSection(args.scoped.organizationOrders),
    deals: buildDealsSection(args.scoped.organizationDeals),
    verificationRequests: buildVerificationRequestsSection(args.scoped.organizationVerifications),
    access,
  };
}
function buildOrganizationComputedSections(args: { organization: any; scoped: ScopedOrganizationData; memberships: any[]; invites: any[]; organizationOffers: any[]; conversationSummaries: any[]; hasActiveSubscription: boolean; actionModeEnabled: boolean; }) {
  const metrics = buildOrganizationMetrics({
    memberships: args.memberships,
    invites: args.invites,
    scoped: args.scoped,
    offersCount: args.organizationOffers.length,
    conversationsCount: args.conversationSummaries.length,
  });
  const messages = buildMessagesSection({
    organizationInboxMessages: args.scoped.organizationInboxMessages,
    conversationSummaries: args.conversationSummaries,
  });
  const access = buildAccessSection({
    organization: args.organization,
    hasActiveSubscription: args.hasActiveSubscription,
    actionModeEnabled: args.actionModeEnabled,
    organizationSubscription: args.scoped.organizationSubscription,
    linkedProfiles: args.scoped.linkedProfiles,
  });
  return { metrics, messages, access };
}
