import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireRole } from "../_core/security/accessPolicy";
import {
  listUsersService,
  getUserKnowledgeResearchService,
  getUserSearchLogsService,
  getUserAgentMemoryService,
  updateUserService,
} from "./services/usersService";

function paginateRows<T>(rows: T[], paginationOpts: { cursor: string | null; numItems: number }) {
  const offset = paginationOpts.cursor ? Number(paginationOpts.cursor) : 0;
  const page = rows.slice(offset, offset + paginationOpts.numItems);
  const nextOffset = offset + paginationOpts.numItems;

  return {
    page,
    isDone: nextOffset >= rows.length,
    continueCursor: nextOffset >= rows.length ? null : String(nextOffset),
  };
}

function buildUserKey(value: { authUserId?: string | null; externalUserId?: string | null; fallbackId: string }) {
  if (value.authUserId) {
    return `auth__${value.authUserId}`;
  }

  if (value.externalUserId) {
    return `channel__${value.externalUserId}`;
  }

  return `record__${value.fallbackId}`;
}

function resolveVerificationStatus(latestStatus?: string | null, roleStatus?: string | null) {
  return latestStatus ?? roleStatus ?? "none";
}

function buildOrganizationProjection(
  args: {
    brokerId?: string | null;
    redId?: string | null;
  },
  brokers: Array<{ _id: unknown; name: string; isVerified?: boolean | null; status?: string | null; slug?: string | null }>,
  developers: Array<{ _id: unknown; name: string; isVerified?: boolean | null; status?: string | null; slug?: string | null }>,
) {
  if (args.brokerId) {
    const broker = brokers.find((item) => String(item._id) === String(args.brokerId));
    return {
      id: String(args.brokerId),
      organizationKey: `broker__${String(args.brokerId)}`,
      ownerType: "broker" as const,
      name: broker?.name ?? "وسيط غير معروف",
      isVerified: broker?.isVerified === true,
      status: broker?.status ?? "pending",
      slug: broker?.slug ?? null,
    };
  }

  if (args.redId) {
    const developer = developers.find((item) => String(item._id) === String(args.redId));
    return {
      id: String(args.redId),
      organizationKey: `red__${String(args.redId)}`,
      ownerType: "red" as const,
      name: developer?.name ?? "مطور غير معروف",
      isVerified: developer?.isVerified === true,
      status: developer?.status ?? "pending",
      slug: developer?.slug ?? null,
    };
  }

  return null;
}

function extractOfferIdFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const candidate = metadata as { offerId?: string };
  return typeof candidate.offerId === "string" ? candidate.offerId : null;
}

/**
 * WHY:   The Arabic admin users section needs a joined all-users list instead of raw channel rows only.
 * WHAT:  Returns admin user rows enriched with profile, organization, and verification metadata.
 * HOW:   Joins `userProfiles`, `users`, memberships, organizations, and verification requests in memory before paginating.
 */
export const listAdminUsers = query({
  args: {
    paginationOpts: paginationOptsValidator,
    role: v.optional(
      v.union(
        v.literal("admin"),
        v.literal("broker"),
        v.literal("developer"),
        v.literal("user"),
        v.literal("RED"),
      ),
    ),
  },
  handler: async (ctx, { paginationOpts, role }) => {
    await requireRole(ctx, ["admin"]);

    const [profiles, users, brokers, developers, memberships, verificationRequests] = await Promise.all([
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
      ctx.db.query("organizationMemberships").collect(),
      ctx.db.query("verificationRequests").collect(),
    ]);

    const profileRows = profiles.map((profile) => {
      const latestRequest = verificationRequests
        .filter((request) => request.subjectProfileId === profile._id)
        .sort((left, right) => right.submittedAt - left.submittedAt)[0];
      const linkedBroker = profile.brokerId ? brokers.find((item) => item._id === profile.brokerId) : null;
      const linkedDeveloper = profile.REDId ? developers.find((item) => item._id === profile.REDId) : null;
      const orgMemberships = memberships.filter((item) => item.profileId === profile._id);

      return {
        userKey: buildUserKey({
          authUserId: profile.authUserId,
          externalUserId: null,
          fallbackId: String(profile._id),
        }),
        authUserId: profile.authUserId,
        externalUserId: null,
        name: profile.name ?? profile.email ?? "مستخدم أنان",
        email: profile.email ?? null,
        channel: null,
        role: profile.role ?? null,
        roleStatus: profile.roleStatus ?? null,
        requestedRole: profile.requestedRole ?? null,
        isActive: profile.isActive ?? true,
        organizationName: linkedBroker?.name ?? linkedDeveloper?.name ?? null,
        organizationType: linkedBroker ? "broker" : linkedDeveloper ? "red" : null,
        membershipsCount: orgMemberships.length,
        verificationStatus: resolveVerificationStatus(latestRequest?.currentStatus, profile.roleStatus),
      };
    });

    const matchedEmails = new Set(profileRows.map((item) => item.email).filter(Boolean));
    const channelRows = users
      .filter((user) => !user.email || !matchedEmails.has(user.email))
      .map((user) => ({
        userKey: buildUserKey({
          externalUserId: user.userId ?? null,
          authUserId: null,
          fallbackId: String(user._id),
        }),
        authUserId: null,
        externalUserId: user.userId ?? null,
        name: user.displayName ?? user.name ?? user.email ?? "مستخدم قناة",
        email: user.email ?? null,
        channel: user.channel ?? null,
        role: null,
        roleStatus: null,
        requestedRole: null,
        isActive: true,
        organizationName: null,
        organizationType: null,
        membershipsCount: 0,
        verificationStatus: "none",
      }));

    const rows = [...profileRows, ...channelRows]
      .filter((item) => !role || item.role === role)
      .sort((left, right) => left.name.localeCompare(right.name, "ar"));

    return paginateRows(rows, paginationOpts);
  },
});

/**
 * WHY:   The profiles tab needs a focused auth-profile view without channel-only user rows.
 * WHAT:  Returns user profile rows with role, organization, and verification status metadata.
 * HOW:   Reads `userProfiles`, joins organizations and verification requests, then paginates in memory.
 */
export const listAdminProfiles = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    await requireRole(ctx, ["admin"]);

    const [profiles, brokers, developers, verificationRequests] = await Promise.all([
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
      ctx.db.query("verificationRequests").collect(),
    ]);

    const rows = profiles
      .map((profile) => {
        const latestRequest = verificationRequests
          .filter((request) => request.subjectProfileId === profile._id)
          .sort((left, right) => right.submittedAt - left.submittedAt)[0];
        const organization = profile.brokerId
          ? brokers.find((item) => item._id === profile.brokerId)?.name
          : profile.REDId
            ? developers.find((item) => item._id === profile.REDId)?.name
            : null;

        return {
          id: String(profile._id),
          userKey: buildUserKey({ authUserId: profile.authUserId, externalUserId: null, fallbackId: String(profile._id) }),
          authUserId: profile.authUserId,
          name: profile.name ?? profile.email ?? "مستخدم أنان",
          email: profile.email ?? null,
          role: profile.role ?? null,
          roleStatus: profile.roleStatus ?? null,
          requestedRole: profile.requestedRole ?? null,
          organizationName: organization,
          verificationStatus: resolveVerificationStatus(latestRequest?.currentStatus, profile.roleStatus),
          isActive: profile.isActive ?? true,
        };
      })
      .sort((left, right) => left.name.localeCompare(right.name, "ar"));

    return paginateRows(rows, paginationOpts);
  },
});

/**
 * WHY:   The memberships tab needs a joined membership list without forcing the frontend to reconstruct organizations.
 * WHAT:  Returns organization memberships with profile and organization metadata.
 * HOW:   Joins `organizationMemberships` against `userProfiles`, `brokers`, and `RED`.
 */
export const listAdminMemberships = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    await requireRole(ctx, ["admin"]);

    const [memberships, profiles, brokers, developers] = await Promise.all([
      ctx.db.query("organizationMemberships").collect(),
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
    ]);

    const rows = memberships
      .map((membership) => {
        const profile = profiles.find((item) => item._id === membership.profileId);
        const organizationName = membership.ownerBrokerId
          ? brokers.find((item) => item._id === membership.ownerBrokerId)?.name
          : developers.find((item) => item._id === membership.ownerREDId)?.name;

        return {
          id: String(membership._id),
          organizationName: organizationName ?? "منظمة غير معروفة",
          ownerType: membership.ownerBrokerId ? "broker" : "red",
          role: membership.role,
          status: membership.status,
          createdAt: membership.createdAt,
          updatedAt: membership.updatedAt,
          profileName: profile?.name ?? profile?.email ?? "مستخدم أنان",
          profileEmail: profile?.email ?? null,
          userKey: profile
            ? buildUserKey({ authUserId: profile.authUserId, externalUserId: null, fallbackId: String(profile._id) })
            : null,
        };
      })
      .sort((left, right) => right.updatedAt - left.updatedAt);

    return paginateRows(rows, paginationOpts);
  },
});

/**
 * WHY:   The verification-state tab needs a user-centric review of profile and verification request state.
 * WHAT:  Returns profile-linked verification rows with latest request metadata.
 * HOW:   Joins `userProfiles` against the newest matching verification request for each profile.
 */
export const listAdminUserVerification = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    await requireRole(ctx, ["admin"]);

    const [profiles, verificationRequests] = await Promise.all([
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("verificationRequests").collect(),
    ]);

    const rows = profiles
      .map((profile) => {
        const latestRequest = verificationRequests
          .filter((request) => request.subjectProfileId === profile._id)
          .sort((left, right) => right.submittedAt - left.submittedAt)[0];

        return {
          id: String(profile._id),
          userKey: buildUserKey({ authUserId: profile.authUserId, externalUserId: null, fallbackId: String(profile._id) }),
          name: profile.name ?? profile.email ?? "مستخدم أنان",
          email: profile.email ?? null,
          role: profile.role ?? null,
          roleStatus: profile.roleStatus ?? null,
          latestRequestId: latestRequest ? String(latestRequest._id) : null,
          latestRequestStatus: latestRequest?.currentStatus ?? null,
          latestRequestSubmittedAt: latestRequest?.submittedAt ?? null,
        };
      })
      .sort((left, right) => left.name.localeCompare(right.name, "ar"));

    return paginateRows(rows, paginationOpts);
  },
});

/**
 * WHY:   The user detail route needs one read model that bundles profile, organizations, messages, activity, and verification data.
 * WHAT:  Returns the selected admin user detail payload using a stable route key with deep operational visibility.
 * HOW:   Resolves auth-profile or channel-user keys, then joins related organization, offer, inbox, notification, order, deal, and verification records.
 */
export const getAdminUserDetail = query({
  args: { userKey: v.string() },
  handler: async (ctx, { userKey }) => {
    await requireRole(ctx, ["admin"]);

    const [
      profiles,
      users,
      brokers,
      developers,
      memberships,
      verificationRequests,
      assistantThreads,
      assistantMessages,
      inboxMessages,
      knowledgeResearch,
      searchLogs,
      subscriptions,
      offers,
      conversationParticipants,
      conversations,
      notifications,
      orders,
      deals,
      properties,
    ] = await Promise.all([
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
      ctx.db.query("organizationMemberships").collect(),
      ctx.db.query("verificationRequests").collect(),
      ctx.db.query("assistantThreads").collect(),
      ctx.db.query("assistantMessages").collect(),
      ctx.db.query("inboxMessages").collect(),
      ctx.db.query("knowledgeResearch").collect(),
      ctx.db.query("searchLogs").collect(),
      ctx.db.query("subscriptions").collect(),
      ctx.db.query("offers").collect(),
      ctx.db.query("inboxConversationParticipants").collect(),
      ctx.db.query("inboxConversations").collect(),
      ctx.db.query("workspaceNotifications").collect(),
      ctx.db.query("orders").collect(),
      ctx.db.query("deals").collect(),
      ctx.db.query("properties").collect(),
    ]);

    let profile: (typeof profiles)[number] | null = null;
    let channelUser: (typeof users)[number] | null = null;

    if (userKey.startsWith("auth__")) {
      const authUserId = userKey.slice("auth__".length);
      profile = profiles.find((item) => item.authUserId === authUserId) ?? null;
      if (profile?.email) {
        channelUser = users.find((item) => item.email === profile?.email) ?? null;
      }
    } else if (userKey.startsWith("channel__")) {
      const externalUserId = userKey.slice("channel__".length);
      channelUser = users.find((item) => item.userId === externalUserId) ?? null;
      if (channelUser?.email) {
        profile = profiles.find((item) => item.email === channelUser?.email) ?? null;
      }
    } else if (userKey.startsWith("record__")) {
      const recordId = userKey.slice("record__".length);
      channelUser = users.find((item) => String(item._id) === recordId) ?? null;
    }

    if (!profile && !channelUser) {
      return null;
    }

    const organizations = [
      ...(profile?.brokerId
        ? [buildOrganizationProjection({ brokerId: String(profile.brokerId) }, brokers, developers)].filter(Boolean)
        : []),
      ...(profile?.REDId
        ? [buildOrganizationProjection({ redId: String(profile.REDId) }, brokers, developers)].filter(Boolean)
        : []),
    ];

    const profileMemberships = profile ? memberships.filter((item) => item.profileId === profile._id) : [];
    const userVerificationRequests = verificationRequests.filter(
      (request) =>
        (profile && request.subjectProfileId === profile._id) ||
        (profile?.brokerId && request.subjectBrokerId === profile.brokerId) ||
        (profile?.REDId && request.subjectREDId === profile.REDId),
    );

    const relevantUserIds = new Set<string>();
    if (profile?.authUserId) relevantUserIds.add(profile.authUserId);
    if (channelUser?.userId) relevantUserIds.add(channelUser.userId);

    const threadRows = assistantThreads.filter((thread) => relevantUserIds.has(thread.userId));
    const threadIds = new Set(threadRows.map((thread) => String(thread._id)));

    const participantRows = conversationParticipants.filter((item) => relevantUserIds.has(item.userId));
    const conversationIdSet = new Set(participantRows.map((item) => String(item.conversationId)));
    const relevantConversations = conversations.filter((item) => conversationIdSet.has(String(item._id)));
    const relevantAssistantMessages = assistantMessages.filter((message) => threadIds.has(String(message.threadId)));
    const relevantInboxMessages = inboxMessages.filter(
      (message) =>
        conversationIdSet.has(String(message.conversationId)) ||
        relevantUserIds.has(message.senderUserId) ||
        relevantUserIds.has(message.recipientUserId),
    );
    const relevantResearch = knowledgeResearch.filter((item) => relevantUserIds.has(item.userId));
    const relevantSearchLogs = searchLogs.filter((item) => item.userId && relevantUserIds.has(item.userId));
    const relevantNotifications = notifications.filter((item) => relevantUserIds.has(item.userId));

    const currentBrokerId = profile?.brokerId ? String(profile.brokerId) : null;
    const currentRedId = profile?.REDId ? String(profile.REDId) : null;
    const relevantOrders = orders.filter(
      (item) =>
        relevantUserIds.has(item.userId) ||
        (currentRedId ? String(item.REDId ?? "") === currentRedId : false),
    );
    const relevantDeals = deals.filter(
      (item) =>
        (currentBrokerId ? String(item.brokerId ?? "") === currentBrokerId : false) ||
        (currentRedId ? String(item.REDId ?? "") === currentRedId : false) ||
        (profile ? String(item.assignedTo ?? "") === String(profile._id) : false),
    );

    const subscription = currentBrokerId
      ? subscriptions.find((item) => String(item.ownerBrokerId ?? "") === currentBrokerId) ?? null
      : currentRedId
        ? subscriptions.find((item) => String(item.ownerREDId ?? "") === currentRedId) ?? null
        : null;
    const verified = organizations.length > 0
      ? organizations.some((item) => item && item.isVerified)
      : profile?.roleStatus !== "rejected";
    const hasActiveSubscription = !!subscription && (subscription.status === "active" || subscription.status === "trial");
    const actionModeEnabled = verified && hasActiveSubscription && subscription?.actionModeEnabled === true;

    const propertyTitleById = new Map(properties.map((item) => [String(item._id), item.title ?? "عقار"]));
    const conversationIdsByOfferId = new Map<string, Set<string>>();
    for (const message of inboxMessages) {
      const offerId = extractOfferIdFromMetadata(message.metadata);
      if (!offerId) {
        continue;
      }

      const current = conversationIdsByOfferId.get(offerId) ?? new Set<string>();
      current.add(String(message.conversationId));
      conversationIdsByOfferId.set(offerId, current);
    }

    const relevantOffers = offers.filter((offer) => {
      if (currentBrokerId && (String(offer.fromBrokerId ?? "") === currentBrokerId || String(offer.toBrokerId ?? "") === currentBrokerId)) {
        return true;
      }

      if (currentRedId && (String(offer.fromREDId ?? "") === currentRedId || String(offer.toREDId ?? "") === currentRedId)) {
        return true;
      }

      return false;
    });

    const offerRows = relevantOffers
      .map((offer) => {
        const sender = buildOrganizationProjection(
          {
            brokerId: offer.fromBrokerId ? String(offer.fromBrokerId) : null,
            redId: offer.fromREDId ? String(offer.fromREDId) : null,
          },
          brokers,
          developers,
        );
        const recipient = buildOrganizationProjection(
          {
            brokerId: offer.toBrokerId ? String(offer.toBrokerId) : null,
            redId: offer.toREDId ? String(offer.toREDId) : null,
          },
          brokers,
          developers,
        );
        const isSender =
          (currentBrokerId && sender?.ownerType === "broker" && sender.id === currentBrokerId) ||
          (currentRedId && sender?.ownerType === "red" && sender.id === currentRedId);
        const counterpart = isSender ? recipient : sender;
        const offerId = String(offer._id);
        const conversationIds = Array.from(conversationIdsByOfferId.get(offerId) ?? []);
        const relatedDeals = relevantDeals.filter((deal) => String(deal.offerId ?? "") === offerId);
        const relatedOrders = relevantOrders.filter((order) => order.threadId && conversationIds.includes(String(order.threadId)));

        return {
          id: offerId,
          role: isSender ? "sender" : "recipient",
          propertyTitle: propertyTitleById.get(String(offer.propertyId)) ?? "عقار",
          price: offer.price,
          status: offer.status,
          visibility: offer.visibility ?? "private",
          publicationState: offer.publicationState ?? "published",
          message: offer.message ?? offer.description ?? null,
          createdAt: offer._creationTime ?? 0,
          sender,
          recipient: recipient ?? {
            id: "marketplace",
            organizationKey: "marketplace__public",
            ownerType: "marketplace",
            name: "السوق العامة",
            isVerified: true,
            status: "active",
            slug: null,
          },
          counterpart,
          conversationIds,
          conversationCount: conversationIds.length,
          dealCount: relatedDeals.length,
          orderCount: relatedOrders.length,
        };
      })
      .sort((left, right) => right.createdAt - left.createdAt);

    const counterpartStats = new Map<
      string,
      {
        organizationKey: string;
        organizationName: string;
        ownerType: string;
        offersCount: number;
        acceptedOffersCount: number;
        conversationsCount: number;
        dealsCount: number;
        ordersCount: number;
      }
    >();

    for (const offer of offerRows) {
      if (!offer.counterpart) {
        continue;
      }

      const key = offer.counterpart.organizationKey;
      const current = counterpartStats.get(key) ?? {
        organizationKey: key,
        organizationName: offer.counterpart.name,
        ownerType: offer.counterpart.ownerType,
        offersCount: 0,
        acceptedOffersCount: 0,
        conversationsCount: 0,
        dealsCount: 0,
        ordersCount: 0,
      };
      current.offersCount += 1;
      if (offer.status === "accepted") {
        current.acceptedOffersCount += 1;
      }
      current.conversationsCount += offer.conversationCount;
      current.dealsCount += offer.dealCount;
      current.ordersCount += offer.orderCount;
      counterpartStats.set(key, current);
    }

    const conversationSummaries = participantRows
      .map((participant) => {
        const conversation = relevantConversations.find((item) => String(item._id) === String(participant.conversationId));
        const otherProfile = profiles.find((item) => item.authUserId === participant.otherUserId) ?? null;
        const otherChannelUser = users.find((item) => item.userId === participant.otherUserId || item.email === otherProfile?.email) ?? null;
        const messages = relevantInboxMessages
          .filter((item) => String(item.conversationId) === String(participant.conversationId))
          .sort((left, right) => right.createdAt - left.createdAt);

        return {
          id: String(participant.conversationId),
          otherUserId: participant.otherUserId,
          otherUserName: otherProfile?.name ?? otherChannelUser?.displayName ?? otherChannelUser?.name ?? otherProfile?.email ?? "مستخدم",
          otherUserRole: otherProfile?.role ?? null,
          unreadCount: participant.unreadCount,
          messagesCount: messages.length,
          lastMessagePreview: conversation?.lastMessagePreview ?? messages[0]?.body ?? "لا توجد رسائل",
          updatedAt: conversation?.updatedAt ?? messages[0]?.createdAt ?? 0,
        };
      })
      .sort((left, right) => right.updatedAt - left.updatedAt);

    const notificationRows = relevantNotifications
      .sort((left, right) => right.createdAt - left.createdAt)
      .slice(0, 10)
      .map((item) => ({
        id: String(item._id),
        type: item.type,
        title: item.title,
        summary: item.summary,
        href: item.href,
        severity: item.severity,
        readAt: item.readAt ?? null,
        createdAt: item.createdAt,
      }));
    const orderRows = relevantOrders
      .sort((left, right) => (right._creationTime ?? 0) - (left._creationTime ?? 0))
      .slice(0, 10)
      .map((item) => ({
        id: String(item._id),
        type: item.type,
        status: item.status,
        sourceChannel: item.sourceChannel ?? null,
        notes: item.notes ?? null,
        createdAt: item._creationTime ?? 0,
      }));
    const dealRows = relevantDeals
      .sort((left, right) => Number(String(right._creationTime ?? 0)) - Number(String(left._creationTime ?? 0)))
      .slice(0, 10)
      .map((item) => ({
        id: String(item._id),
        title: item.title,
        stage: item.stage,
        value: item.value ?? null,
        propertyId: item.propertyId ? String(item.propertyId) : null,
        offerId: item.offerId ? String(item.offerId) : null,
        createdAt: item._creationTime ?? 0,
      }));

    return {
      identity: {
        userKey,
        authUserId: profile?.authUserId ?? null,
        externalUserId: channelUser?.userId ?? null,
        name: profile?.name ?? channelUser?.displayName ?? channelUser?.name ?? profile?.email ?? channelUser?.email ?? "مستخدم أنان",
        email: profile?.email ?? channelUser?.email ?? null,
        channel: channelUser?.channel ?? null,
        role: profile?.role ?? null,
        roleStatus: profile?.roleStatus ?? null,
        requestedRole: profile?.requestedRole ?? null,
        isActive: profile?.isActive ?? true,
      },
      profile: profile
        ? {
            id: String(profile._id),
            brokerId: profile.brokerId ? String(profile.brokerId) : null,
            redId: profile.REDId ? String(profile.REDId) : null,
            showInOffersDirectory: profile.showInOffersDirectory ?? true,
          }
        : null,
      organizations,
      memberships: profileMemberships.map((membership) => ({
        id: String(membership._id),
        role: membership.role,
        status: membership.status,
        ownerType: membership.ownerBrokerId ? "broker" : "red",
        createdAt: membership.createdAt,
        organizationName: membership.ownerBrokerId
          ? brokers.find((item) => item._id === membership.ownerBrokerId)?.name ?? "منظمة غير معروفة"
          : developers.find((item) => item._id === membership.ownerREDId)?.name ?? "منظمة غير معروفة",
        organizationKey: membership.ownerBrokerId
          ? `broker__${String(membership.ownerBrokerId)}`
          : `red__${String(membership.ownerREDId)}`,
      })),
      metrics: {
        organizationsCount: organizations.length,
        membershipsCount: profileMemberships.length,
        sentOffersCount: offerRows.filter((item) => item.role === "sender").length,
        receivedOffersCount: offerRows.filter((item) => item.role === "recipient").length,
        publicAppliedOffersCount: offerRows.filter((item) => item.visibility === "public" && item.role === "recipient").length,
        conversationsCount: conversationSummaries.length,
        assistantThreadsCount: threadRows.length,
        assistantMessagesCount: relevantAssistantMessages.length,
        inboxMessagesCount: relevantInboxMessages.length,
        notificationsCount: relevantNotifications.length,
        ordersCount: relevantOrders.length,
        dealsCount: relevantDeals.length,
        verificationCount: userVerificationRequests.length,
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
      verificationRequests: userVerificationRequests.map((request) => ({
        id: String(request._id),
        requestType: request.requestType,
        currentStatus: request.currentStatus,
        title: request.title ?? request.requestType,
        submittedAt: request.submittedAt,
        reviewedAt: request.reviewedAt ?? null,
      })),
      messages: {
        conversationCount: conversationSummaries.length,
        assistantCount: relevantAssistantMessages.length,
        inboxCount: relevantInboxMessages.length,
        unreadConversationCount: conversationSummaries.filter((item) => item.unreadCount > 0).length,
        conversations: conversationSummaries.slice(0, 10),
        latestAssistantMessages: relevantAssistantMessages
          .sort((left, right) => right.createdAt - left.createdAt)
          .slice(0, 10),
        latestInboxMessages: relevantInboxMessages
          .sort((left, right) => right.createdAt - left.createdAt)
          .slice(0, 10),
      },
      notifications: {
        count: relevantNotifications.length,
        unreadCount: relevantNotifications.filter((item) => !item.readAt).length,
        recent: notificationRows,
      },
      orders: {
        count: relevantOrders.length,
        statusBreakdown: {
          new_lead: relevantOrders.filter((item) => item.status === "new_lead").length,
          contacted: relevantOrders.filter((item) => item.status === "contacted").length,
          qualified: relevantOrders.filter((item) => item.status === "qualified").length,
          offer_made: relevantOrders.filter((item) => item.status === "offer_made").length,
          under_contract: relevantOrders.filter((item) => item.status === "under_contract").length,
          closed_won: relevantOrders.filter((item) => item.status === "closed_won").length,
          closed_lost: relevantOrders.filter((item) => item.status === "closed_lost").length,
        },
        recent: orderRows,
      },
      deals: {
        count: relevantDeals.length,
        stageBreakdown: {
          new: relevantDeals.filter((item) => item.stage === "new").length,
          contacted: relevantDeals.filter((item) => item.stage === "contacted").length,
          negotiation: relevantDeals.filter((item) => item.stage === "negotiation").length,
          won: relevantDeals.filter((item) => item.stage === "won").length,
          lost: relevantDeals.filter((item) => item.stage === "lost").length,
        },
        recent: dealRows,
      },
      activity: {
        knowledgeResearchCount: relevantResearch.length,
        searchLogsCount: relevantSearchLogs.length,
        notificationsCount: relevantNotifications.length,
        ordersCount: relevantOrders.length,
        dealsCount: relevantDeals.length,
        latestResearch: relevantResearch.sort((left, right) => right.createdAt - left.createdAt).slice(0, 10),
        latestSearchLogs: relevantSearchLogs.sort((left, right) => (right._creationTime ?? 0) - (left._creationTime ?? 0)).slice(0, 10),
        latestNotifications: notificationRows,
        latestOrders: orderRows,
        latestDeals: dealRows,
      },
      access: {
        role: profile?.role ?? null,
        roleStatus: profile?.roleStatus ?? null,
        requestedRole: profile?.requestedRole ?? null,
        showInOffersDirectory: profile?.showInOffersDirectory ?? true,
        verified,
        hasActiveSubscription,
        actionModeEnabled,
        mode: actionModeEnabled ? "action" : "qa",
        subscription: subscription
          ? {
              ownerType: subscription.ownerType,
              planTier: subscription.planTier,
              status: subscription.status,
              actionModeEnabled: subscription.actionModeEnabled === true,
              startedAt: subscription.startedAt ?? null,
              expiresAt: subscription.expiresAt ?? null,
            }
          : null,
        organizationAccess: organizations,
      },
    };
  },
});

/**
 * WHY:   Existing admin screens still depend on the older raw channel-user list query.
 * WHAT:  Returns the previous channel-user pagination result filtered by channel.
 * HOW:   Delegates to the legacy service implementation for backward compatibility.
 */
export const listUsers = query({
  args: {
    paginationOpts: paginationOptsValidator,
    channel: v.optional(v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web"))),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return listUsersService(ctx, args);
  },
});

/**
 * WHY:   Existing admin loaders still need direct access to knowledge research rows by user id.
 * WHAT:  Returns recent knowledge research entries for a user.
 * HOW:   Delegates to the legacy users service helper.
 */
export const getUserKnowledgeResearch = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return getUserKnowledgeResearchService(ctx, { userId: args.userId, limit: args.limit ?? 20 });
  },
});

/**
 * WHY:   Existing admin loaders still need direct access to search logs by user id.
 * WHAT:  Returns recent search log entries for a user.
 * HOW:   Delegates to the legacy users service helper.
 */
export const getUserSearchLogs = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return getUserSearchLogsService(ctx, { userId: args.userId, limit: args.limit ?? 50 });
  },
});

/**
 * WHY:   Existing admin loaders still need direct access to agent-memory rows by user id.
 * WHAT:  Returns agent memory entries for a user.
 * HOW:   Delegates to the legacy users service helper.
 */
export const getUserAgentMemory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return getUserAgentMemoryService(ctx, args);
  },
});

/**
 * WHY:   Admin operators still need to patch editable channel-user fields.
 * WHAT:  Updates display name and channel for a channel user row.
 * HOW:   Delegates to the existing mutation helper.
 */
export const updateUser = mutation({
  args: {
    userId: v.string(),
    displayName: v.optional(v.string()),
    channel: v.optional(v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web"))),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return updateUserService(ctx, args);
  },
});
