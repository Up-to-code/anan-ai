import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";
import { tenants } from "../tenants";
import { cascadingDelete } from "../cascading";
import { api } from "../_generated/api";
import { auditLog } from "../auditLog";

function buildOrganizationKey(ownerType: "broker" | "red", id: string) {
  return `${ownerType}__${id}`;
}

function parseOrganizationKey(value: string) {
  if (value.startsWith("broker__")) {
    return { ownerType: "broker" as const, id: value.slice("broker__".length) };
  }

  if (value.startsWith("red__")) {
    return { ownerType: "red" as const, id: value.slice("red__".length) };
  }

  throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Invalid organization key" });
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
      organizationKey: buildOrganizationKey("broker", String(args.brokerId)),
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
      organizationKey: buildOrganizationKey("red", String(args.redId)),
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
 * WHY:   The organizations section needs a broker-focused list with verification, membership, and inventory summaries.
 * WHAT:  Returns broker organizations enriched with linked profiles, team members, inventory totals, and verification counts.
 * HOW:   Joins brokers against profiles, memberships, properties, and verification requests in memory.
 */
export const listBrokerOrganizations = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);

    const [brokers, profiles, tenantLinks, properties, verificationRequests] = await Promise.all([
      ctx.db.query("brokers").collect(),
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("tenantOrgLinks").collect(),
      ctx.db.query("properties").collect(),
      ctx.db.query("verificationRequests").collect(),
    ]);

    const tenantOrgIdByBrokerId = new Map<string, string>();
    for (const link of tenantLinks) {
      if (link.ownerBrokerId) {
        tenantOrgIdByBrokerId.set(String(link.ownerBrokerId), link.tenantOrgId);
      }
    }

    return Promise.all(
      brokers.map(async (broker) => {
        const tenantOrgId = tenantOrgIdByBrokerId.get(String(broker._id));
        const members = tenantOrgId ? await tenants.listMembers(ctx as never, tenantOrgId) : [];

        return {
          organizationKey: buildOrganizationKey("broker", String(broker._id)),
          id: String(broker._id),
          ownerType: "broker" as const,
          name: broker.name,
          slug: broker.slug,
          status: broker.status ?? "pending",
          isVerified: broker.isVerified === true,
          contactEmail: broker.contactEmail,
          linkedProfilesCount: profiles.filter((profile) => profile.brokerId === broker._id).length,
          membersCount: members.filter((member) => (member.status ?? "active") === "active").length,
          propertyCount: properties.filter((property) => property.brokerId === broker._id).length,
          pendingVerificationCount: verificationRequests.filter(
            (request) => request.subjectBrokerId === broker._id && (request.currentStatus === "new" || request.currentStatus === "in_review"),
          ).length,
        };
      }),
    );
  },
});

/**
 * WHY:   The organizations section also needs a RED/developer list using the same admin read model style.
 * WHAT:  Returns developer organizations enriched with linked profiles, team members, inventory totals, and verification counts.
 * HOW:   Joins RED organizations against profiles, memberships, properties, and verification requests in memory.
 */
export const listDeveloperOrganizations = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);

    const [developers, profiles, tenantLinks, properties, verificationRequests] = await Promise.all([
      ctx.db.query("RED").collect(),
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("tenantOrgLinks").collect(),
      ctx.db.query("properties").collect(),
      ctx.db.query("verificationRequests").collect(),
    ]);

    const tenantOrgIdByRedId = new Map<string, string>();
    for (const link of tenantLinks) {
      if (link.ownerREDId) {
        tenantOrgIdByRedId.set(String(link.ownerREDId), link.tenantOrgId);
      }
    }

    return Promise.all(
      developers.map(async (developer) => {
        const tenantOrgId = tenantOrgIdByRedId.get(String(developer._id));
        const members = tenantOrgId ? await tenants.listMembers(ctx as never, tenantOrgId) : [];

        return {
          organizationKey: buildOrganizationKey("red", String(developer._id)),
          id: String(developer._id),
          ownerType: "red" as const,
          name: developer.name,
          slug: developer.slug,
          status: developer.status ?? "pending",
          isVerified: developer.isVerified === true,
          contactEmail: developer.contactEmail,
          linkedProfilesCount: profiles.filter((profile) => profile.REDId === developer._id).length,
          membersCount: members.filter((member) => (member.status ?? "active") === "active").length,
          propertyCount: properties.filter((property) => property.REDId === developer._id).length,
          pendingVerificationCount: verificationRequests.filter(
            (request) => request.subjectREDId === developer._id && (request.currentStatus === "new" || request.currentStatus === "in_review"),
          ).length,
        };
      }),
    );
  },
});

/**
 * WHY:   Admin needs one joined membership list to audit who belongs to which organization.
 * WHAT:  Returns organization memberships with owner and profile metadata.
 * HOW:   Joins memberships against brokers, RED organizations, and user profiles.
 */
export const listOrganizationMemberships = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);

    const [tenantLinks, brokers, developers, profiles] = await Promise.all([
      ctx.db.query("tenantOrgLinks").collect(),
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
      ctx.db.query("userProfiles").collect(),
    ]);

    const rows = await Promise.all(
      tenantLinks.map(async (link) => {
        const ownerType = link.ownerType === "broker" ? "broker" : "red";
        const ownerId = link.ownerType === "broker" ? link.ownerBrokerId : link.ownerREDId;
        if (!ownerId) return [];

        const ownerRecord =
          ownerType === "broker"
            ? brokers.find((item) => item._id === ownerId)
            : developers.find((item) => item._id === ownerId);

        const members = await tenants.listMembers(ctx as never, link.tenantOrgId);
        return members.map((member) => {
          const profile = profiles.find((item) => item.authUserId === member.userId);
          return {
            id: `${link.tenantOrgId}:${member.userId}`,
            organizationKey: buildOrganizationKey(ownerType, String(ownerId)),
            organizationName: ownerRecord?.name ?? "منظمة غير معروفة",
            ownerType,
            authUserId: member.userId,
            role: member.role,
            status: member.status ?? "active",
            createdAt: member.joinedAt ?? member._creationTime,
            updatedAt: member.joinedAt ?? member._creationTime,
            profile: profile
              ? {
                  id: String(profile._id),
                  name: profile.name ?? profile.email ?? "مستخدم أنان",
                  email: profile.email ?? null,
                  role: profile.role ?? null,
                  roleStatus: profile.roleStatus ?? null,
                }
              : null,
          };
        });
      }),
    );

    return rows.flat();
  },
});

/**
 * WHY:   Admin needs invite auditing in the organizations section without drilling into each organization first.
 * WHAT:  Returns all team invites joined with owner names.
 * HOW:   Maps invite owner ids to broker/RED records and projects a stable admin list row.
 */
export const listOrganizationInvites = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);

    const [tenantLinks, brokers, developers] = await Promise.all([
      ctx.db.query("tenantOrgLinks").collect(),
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
    ]);

    const rows = await Promise.all(
      tenantLinks.map(async (link) => {
        const ownerType = link.ownerType === "broker" ? "broker" : "red";
        const ownerId = link.ownerType === "broker" ? link.ownerBrokerId : link.ownerREDId;
        if (!ownerId) return [];

        const ownerRecord =
          ownerType === "broker"
            ? brokers.find((item) => item._id === ownerId)
            : developers.find((item) => item._id === ownerId);

        const invitations = await tenants.listInvitations(ctx as never, link.tenantOrgId);
        return invitations.map((invite) => ({
          id: String(invite._id),
          organizationKey: buildOrganizationKey(ownerType, String(ownerId)),
          organizationName: ownerRecord?.name ?? "منظمة غير معروفة",
          ownerType,
          email: invite.inviteeIdentifier,
          role: invite.role,
          status: invite.status === "cancelled" ? "canceled" : invite.status,
          invitedBy: invite.inviterId ?? "",
          expiresAt: invite.expiresAt,
        }));
      }),
    );

    return rows.flat();
  },
});

/**
 * WHY:   Organization detail tabs need one joined record for the selected broker or developer organization.
 * WHAT:  Returns the organization summary plus members, invites, properties, offers, messages, access state, and verification history.
 * HOW:   Parses the route key, loads the correct owner document, and joins related team, collaboration, and operational tables in memory.
 */
export const getOrganizationDetail = query({
  args: { organizationKey: v.string() },
  handler: async (ctx, { organizationKey }) => {
    await requireRole(ctx, ["admin"]);

    const parsed = parseOrganizationKey(organizationKey);
    const [
      brokers,
      developers,
      tenantOrgLinks,
      properties,
      profiles,
      verificationRequests,
      subscriptions,
      offers,
      conversationParticipants,
      conversations,
      inboxMessages,
      notifications,
      orders,
      deals,
    ] = await Promise.all([
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
      ctx.db.query("tenantOrgLinks").collect(),
      ctx.db.query("properties").collect(),
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("verificationRequests").collect(),
      ctx.db.query("subscriptions").collect(),
      ctx.db.query("offers").collect(),
      ctx.db.query("inboxConversationParticipants").collect(),
      ctx.db.query("inboxConversations").collect(),
      ctx.db.query("inboxMessages").collect(),
      ctx.db.query("workspaceNotifications").collect(),
      ctx.db.query("orders").collect(),
      ctx.db.query("deals").collect(),
    ]);

    const organization =
      parsed.ownerType === "broker"
        ? brokers.find((item) => String(item._id) === parsed.id)
        : developers.find((item) => String(item._id) === parsed.id);

    if (!organization) {
      return null;
    }

    const isBroker = parsed.ownerType === "broker";
    const tenantLink = tenantOrgLinks.find((link) =>
      isBroker ? String(link.ownerBrokerId) === parsed.id : String(link.ownerREDId) === parsed.id,
    );
    const tenantMembers = tenantLink ? await tenants.listMembers(ctx as never, tenantLink.tenantOrgId) : [];
    const tenantInvites = tenantLink ? await tenants.listInvitations(ctx as never, tenantLink.tenantOrgId) : [];
    const organizationMemberships = tenantMembers;
    const organizationInvites = tenantInvites;
    const organizationProperties = properties.filter((property) =>
      isBroker ? String(property.brokerId) === parsed.id : String(property.REDId) === parsed.id,
    );
    const linkedProfiles = profiles.filter((profile) =>
      isBroker ? String(profile.brokerId) === parsed.id : String(profile.REDId) === parsed.id,
    );
    const organizationVerifications = verificationRequests.filter((request) =>
      isBroker ? String(request.subjectBrokerId) === parsed.id : String(request.subjectREDId) === parsed.id,
    );
    const authUserIds = new Set(linkedProfiles.map((item) => item.authUserId));
    const participantRows = conversationParticipants.filter((item) => authUserIds.has(item.userId));
    const conversationIdSet = new Set(participantRows.map((item) => String(item.conversationId)));
    const organizationConversations = conversations.filter((item) => conversationIdSet.has(String(item._id)));
    const organizationInboxMessages = inboxMessages.filter((item) => conversationIdSet.has(String(item.conversationId)));
    const organizationNotifications = notifications.filter((item) => authUserIds.has(item.userId));
    const organizationOrders = orders.filter((item) =>
      isBroker ? false : String(item.REDId ?? "") === parsed.id || authUserIds.has(item.userId),
    );
    const organizationDeals = deals.filter((item) =>
      isBroker ? String(item.brokerId ?? "") === parsed.id : String(item.REDId ?? "") === parsed.id,
    );
    const organizationSubscription = subscriptions.find((item) =>
      isBroker ? String(item.ownerBrokerId ?? "") === parsed.id : String(item.ownerREDId ?? "") === parsed.id,
    ) ?? null;
    const hasActiveSubscription = !!organizationSubscription && (organizationSubscription.status === "active" || organizationSubscription.status === "trial");
    const actionModeEnabled = organization.isVerified === true && hasActiveSubscription && organizationSubscription?.actionModeEnabled === true;

    const offerConversationIds = new Map<string, Set<string>>();
    for (const message of organizationInboxMessages) {
      const offerId = extractOfferIdFromMetadata(message.metadata);
      if (!offerId) {
        continue;
      }

      const current = offerConversationIds.get(offerId) ?? new Set<string>();
      current.add(String(message.conversationId));
      offerConversationIds.set(offerId, current);
    }

    const organizationOffers = offers
      .filter((offer) =>
        isBroker
          ? String(offer.fromBrokerId ?? "") === parsed.id || String(offer.toBrokerId ?? "") === parsed.id
          : String(offer.fromREDId ?? "") === parsed.id || String(offer.toREDId ?? "") === parsed.id,
      )
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
        const isSender = isBroker ? String(offer.fromBrokerId ?? "") === parsed.id : String(offer.fromREDId ?? "") === parsed.id;
        const counterpart = isSender ? recipient : sender;
        const offerId = String(offer._id);
        const conversationIds = Array.from(offerConversationIds.get(offerId) ?? []);
        const relatedDeals = organizationDeals.filter((deal) => String(deal.offerId ?? "") === offerId);
        const relatedOrders = organizationOrders.filter((order) => order.threadId && conversationIds.includes(String(order.threadId)));

        return {
          id: offerId,
          role: isSender ? "sender" : "recipient",
          propertyTitle: properties.find((item) => item._id === offer.propertyId)?.title ?? "عقار",
          price: offer.price,
          status: offer.status,
          visibility: offer.visibility ?? "private",
          publicationState: offer.publicationState ?? "published",
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
    for (const offer of organizationOffers) {
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
        const conversation = organizationConversations.find((item) => String(item._id) === String(participant.conversationId));
        const otherProfile = profiles.find((item) => item.authUserId === participant.otherUserId) ?? null;
        const messages = organizationInboxMessages
          .filter((item) => String(item.conversationId) === String(participant.conversationId))
          .sort((left, right) => right.createdAt - left.createdAt);

        return {
          id: String(participant.conversationId),
          otherUserId: participant.otherUserId,
          otherUserName: otherProfile?.name ?? otherProfile?.email ?? "مستخدم",
          otherUserRole: otherProfile?.role ?? null,
          unreadCount: participant.unreadCount,
          messagesCount: messages.length,
          lastMessagePreview: conversation?.lastMessagePreview ?? messages[0]?.body ?? "لا توجد رسائل",
          updatedAt: conversation?.updatedAt ?? messages[0]?.createdAt ?? 0,
        };
      })
      .sort((left, right) => right.updatedAt - left.updatedAt);

    return {
      organization: {
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
      },
      metrics: {
        membersCount: organizationMemberships.length,
        invitesCount: organizationInvites.length,
        propertiesCount: organizationProperties.length,
        linkedProfilesCount: linkedProfiles.length,
        offersCount: organizationOffers.length,
        conversationsCount: conversationSummaries.length,
        inboxMessagesCount: organizationInboxMessages.length,
        notificationsCount: organizationNotifications.length,
        ordersCount: organizationOrders.length,
        dealsCount: organizationDeals.length,
        verificationCount: organizationVerifications.length,
      },
      memberships: organizationMemberships.map((membership) => {
        const profile = profiles.find((item) => item.authUserId === membership.userId);
        return {
          id: String(membership._id),
          authUserId: membership.userId,
          role: membership.role,
          status: membership.status ?? "active",
          createdAt: membership.joinedAt ?? membership._creationTime,
          profileName: profile?.name ?? profile?.email ?? "مستخدم أنان",
          profileEmail: profile?.email ?? null,
        };
      }),
      invites: organizationInvites.map((invite) => ({
        id: String(invite._id),
        email: invite.inviteeIdentifier,
        role: invite.role,
        status: invite.status === "cancelled" ? "canceled" : invite.status,
        invitedBy: invite.inviterId ?? "",
        expiresAt: invite.expiresAt,
        acceptedAt: null,
      })),
      properties: organizationProperties.map((property) => ({
        id: String(property._id),
        title: property.title,
        status: property.status ?? null,
        price: property.price,
        address: property.address,
      })),
      linkedProfiles: linkedProfiles.map((profile) => ({
        id: String(profile._id),
        authUserId: profile.authUserId,
        name: profile.name ?? profile.email ?? "مستخدم أنان",
        email: profile.email ?? null,
        role: profile.role ?? null,
        roleStatus: profile.roleStatus ?? null,
        showInOffersDirectory: profile.showInOffersDirectory ?? true,
      })),
      offers: {
        summary: {
          sent: organizationOffers.filter((item) => item.role === "sender").length,
          received: organizationOffers.filter((item) => item.role === "recipient").length,
          pending: organizationOffers.filter((item) => item.status === "pending").length,
          accepted: organizationOffers.filter((item) => item.status === "accepted").length,
          rejected: organizationOffers.filter((item) => item.status === "rejected").length,
          public: organizationOffers.filter((item) => item.visibility === "public").length,
          private: organizationOffers.filter((item) => item.visibility !== "public").length,
        },
        statusBreakdown: {
          pending: organizationOffers.filter((item) => item.status === "pending").length,
          accepted: organizationOffers.filter((item) => item.status === "accepted").length,
          rejected: organizationOffers.filter((item) => item.status === "rejected").length,
        },
        visibilityBreakdown: {
          public: organizationOffers.filter((item) => item.visibility === "public").length,
          private: organizationOffers.filter((item) => item.visibility !== "public").length,
        },
        topCounterparts: Array.from(counterpartStats.values())
          .sort((left, right) => right.offersCount - left.offersCount)
          .slice(0, 10),
        recent: organizationOffers.slice(0, 10),
      },
      messages: {
        conversationCount: conversationSummaries.length,
        inboxCount: organizationInboxMessages.length,
        unreadConversationCount: conversationSummaries.filter((item) => item.unreadCount > 0).length,
        conversations: conversationSummaries.slice(0, 10),
        latestInboxMessages: organizationInboxMessages
          .sort((left, right) => right.createdAt - left.createdAt)
          .slice(0, 10)
          .map((item) => ({
            id: String(item._id),
            senderUserId: item.senderUserId,
            recipientUserId: item.recipientUserId,
            type: item.type,
            body: item.body,
            createdAt: item.createdAt,
          })),
      },
      subscription: organizationSubscription
        ? {
            ownerType: organizationSubscription.ownerType,
            planTier: organizationSubscription.planTier,
            status: organizationSubscription.status,
            actionModeEnabled: organizationSubscription.actionModeEnabled === true,
            startedAt: organizationSubscription.startedAt ?? null,
            expiresAt: organizationSubscription.expiresAt ?? null,
          }
        : null,
      orders: {
        count: organizationOrders.length,
        statusBreakdown: {
          new_lead: organizationOrders.filter((item) => item.status === "new_lead").length,
          contacted: organizationOrders.filter((item) => item.status === "contacted").length,
          qualified: organizationOrders.filter((item) => item.status === "qualified").length,
          offer_made: organizationOrders.filter((item) => item.status === "offer_made").length,
          under_contract: organizationOrders.filter((item) => item.status === "under_contract").length,
          closed_won: organizationOrders.filter((item) => item.status === "closed_won").length,
          closed_lost: organizationOrders.filter((item) => item.status === "closed_lost").length,
        },
        recent: organizationOrders
          .sort((left, right) => (right._creationTime ?? 0) - (left._creationTime ?? 0))
          .slice(0, 10)
          .map((item) => ({
            id: String(item._id),
            type: item.type,
            status: item.status,
            sourceChannel: item.sourceChannel ?? null,
            createdAt: item._creationTime ?? 0,
          })),
      },
      deals: {
        count: organizationDeals.length,
        stageBreakdown: {
          new: organizationDeals.filter((item) => item.stage === "new").length,
          contacted: organizationDeals.filter((item) => item.stage === "contacted").length,
          negotiation: organizationDeals.filter((item) => item.stage === "negotiation").length,
          won: organizationDeals.filter((item) => item.stage === "won").length,
          lost: organizationDeals.filter((item) => item.stage === "lost").length,
        },
        recent: organizationDeals
          .sort((left, right) => (right._creationTime ?? 0) - (left._creationTime ?? 0))
          .slice(0, 10)
          .map((item) => ({
            id: String(item._id),
            title: item.title,
            stage: item.stage,
            value: item.value ?? null,
            offerId: item.offerId ? String(item.offerId) : null,
            createdAt: item._creationTime ?? 0,
          })),
      },
      verificationRequests: organizationVerifications.map((request) => ({
        id: String(request._id),
        title: request.title ?? request.requestType,
        currentStatus: request.currentStatus,
        submittedAt: request.submittedAt,
        reviewedAt: request.reviewedAt ?? null,
      })),
      access: {
        verified: organization.isVerified === true,
        hasActiveSubscription,
        actionModeEnabled,
        mode: actionModeEnabled ? "action" : "qa",
        planTier: organizationSubscription?.planTier ?? null,
        subscriptionStatus: organizationSubscription?.status ?? null,
        linkedProfilesVisibleInOffersDirectory: linkedProfiles.filter((item) => item.showInOffersDirectory !== false).length,
      },
    };
  },
});

/**
 * WHY:   Admin tooling needs a safe way to remove broker organizations and related records.
 * WHAT:  Cascades deletion across subscriptions and tenant links for brokers.
 * HOW:   Uses the cascading delete component with batched processing.
 */
export const deleteBrokerOrganization = mutation({
  args: { brokerId: v.id("brokers") },
  handler: async (ctx, args) => {
    const access = await requireRole(ctx, ["admin"]);
    const broker = await ctx.db.get(args.brokerId);
    const result = await cascadingDelete.deleteWithCascadeBatched(ctx, "brokers", args.brokerId, {
      batchHandlerRef: api.cascading._cascadeBatchHandler,
      batchSize: 2000,
    });

    await auditLog.logChange(ctx, {
      action: "broker.deleted",
      actorId: access.authUserId,
      resourceType: "brokers",
      resourceId: args.brokerId,
      before: broker,
      after: null,
      generateDiff: false,
      severity: "warning",
      tags: ["organizations", "delete"],
    });

    return result;
  },
});

/**
 * WHY:   Admin tooling needs a safe way to remove RED organizations and related records.
 * WHAT:  Cascades deletion across subscriptions and tenant links for RED organizations.
 * HOW:   Uses the cascading delete component with batched processing.
 */
export const deleteDeveloperOrganization = mutation({
  args: { redId: v.id("RED") },
  handler: async (ctx, args) => {
    const access = await requireRole(ctx, ["admin"]);
    const red = await ctx.db.get(args.redId);
    const result = await cascadingDelete.deleteWithCascadeBatched(ctx, "RED", args.redId, {
      batchHandlerRef: api.cascading._cascadeBatchHandler,
      batchSize: 2000,
    });

    await auditLog.logChange(ctx, {
      action: "red.deleted",
      actorId: access.authUserId,
      resourceType: "RED",
      resourceId: args.redId,
      before: red,
      after: null,
      generateDiff: false,
      severity: "warning",
      tags: ["organizations", "delete"],
    });

    return result;
  },
});
