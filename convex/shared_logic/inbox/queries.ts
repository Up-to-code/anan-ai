import { ConvexError, v } from "convex/values";
import { query } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import { requireEntitlements } from "../../_core/security/accessPolicy";
import { buildOwnerContext, resolveTenantOrgIdForOwner } from "../agencies/repositories/core";
import { tenants } from "../../tenants";
import { mapConversationSummary, getConversationParticipant, mapConversationMessage } from "./conversations";
import { getOrganizationNameByOwner, getUserImageByEmail } from "./profiles";
import { normalizeComparableText, normalizeDirectPair, normalizeSearchQuery } from "./utils";
import { hasInboxProjectShareAccess } from "../propertyAccessControl";

export const buildDirectConversationKey = query({
  args: {
    currentUserId: v.string(),
    targetUserId: v.string(),
  },
  handler: async (_ctx, args) =>
    normalizeDirectPair(args.currentUserId, args.targetUserId).directKey,
});

export const listConversations = query({
  args: {
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, { archived }) => {
    const access = await requireEntitlements(ctx, ["workspace:user", "workspace:broker", "workspace:developer"]);
    const memberships = await ctx.db
      .query("inboxConversationParticipants")
      .withIndex("userId", (q) => q.eq("userId", access.authUserId))
      .collect();
    const shouldShowArchived = archived === true;
    const filteredMemberships = memberships.filter((membership) =>
      shouldShowArchived ? Boolean(membership.archivedAt) : !membership.archivedAt,
    );

    const summaries = await Promise.all(
      filteredMemberships.map((membership) => mapConversationSummary(ctx, membership))
    );

    return summaries
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  },
});

export const getConversation = query({
  args: {
    conversationId: v.id("inboxConversations"),
  },
  handler: async (ctx, { conversationId }) => {
    const access = await requireEntitlements(ctx, ["workspace:user", "workspace:broker", "workspace:developer"]);
    const membership = await getConversationParticipant(
      ctx,
      conversationId,
      access.authUserId
    );
    if (!membership) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Conversation not found" });
    }

    const summary = await mapConversationSummary(
      ctx,
      membership as Doc<"inboxConversationParticipants">
    );
    const otherParticipantMembership = await getConversationParticipant(
      ctx,
      conversationId,
      membership.otherUserId,
    );
    const messages = await ctx.db
      .query("inboxMessages")
      .withIndex("conversationId_createdAt", (q) => q.eq("conversationId", conversationId))
      .collect();

    return {
      ...summary,
      otherParticipantLastReadAt: otherParticipantMembership?.lastReadAt ?? null,
      messages: messages.map(mapConversationMessage),
    };
  },
});

export const getInboxUnreadSummary = query({
  args: {},
  handler: async (ctx) => {
    const access = await requireEntitlements(ctx, ["workspace:user", "workspace:broker", "workspace:developer"]);
    const memberships = await ctx.db
      .query("inboxConversationParticipants")
      .withIndex("userId", (q) => q.eq("userId", access.authUserId))
      .collect();

    return {
      unreadCount: memberships.reduce((sum, item) => sum + (item.archivedAt ? 0 : item.unreadCount), 0),
    };
  },
});

export const hasProjectShareAccess = query({
  args: {
    propertyId: v.id("properties"),
  },
  handler: async (ctx, { propertyId }) => {
    const access = await requireEntitlements(ctx, ["workspace:user", "workspace:broker", "workspace:developer"]);
    return hasInboxProjectShareAccess(ctx, access.authUserId, propertyId);
  },
});

type MembershipState = "member" | "pending-invite" | "not-member";

async function searchTargetsAsUser(ctx: any, access: any, normalizedQuery: string) {
  const profile = normalizedQuery.includes("@")
    ? await ctx.db
        .query("userProfiles")
        .withIndex("email", (q: any) => q.eq("email", normalizedQuery))
        .first()
    : await ctx.db
        .query("userProfiles")
        .withIndex("usernameLower", (q: any) => q.eq("usernameLower", normalizedQuery))
        .first();

  if (!profile || profile.authUserId === access.authUserId || profile.isActive === false) {
    return [];
  }

  const organizationName = await getOrganizationNameByOwner(ctx, {
    brokerId: profile.brokerId ?? undefined,
    developerId: profile.developerId ?? undefined,
  });

  const userImage = await getUserImageByEmail(ctx, profile.email);
  return [
    {
      id: profile.authUserId,
      name: profile.name ?? profile.email ?? "مستخدم عنان",
      email: profile.email ?? null,
      username: profile.username ?? null,
      image: userImage,
      role: profile.role ?? "user",
      brokerId: profile.brokerId ?? null,
      redId: profile.developerId ?? null,
      organizationName,
      organizationType: profile.brokerId ? "broker" : profile.developerId ? "developer" : null,
      membershipState: null,
      conversationId: null,
    },
  ];
}

function buildHaystack(profile: any, organizationName: string | null, role: string) {
  return [
    normalizeComparableText(profile.name),
    normalizeComparableText(profile.email),
    normalizeComparableText(profile.username),
    normalizeComparableText(organizationName),
    normalizeComparableText(role),
  ];
}

function matchesNormalizedQuery(haystack: string[], normalizedQuery: string) {
  return haystack.some((entry) => entry.includes(normalizedQuery));
}

async function resolveMembershipState(params: {
  ctx: any;
  tenantOrgId: string | null;
  invites: any[];
  profile: any;
}): Promise<MembershipState> {
  const { ctx, tenantOrgId, invites, profile } = params;
  if (!tenantOrgId) {
    return "not-member";
  }

  const membership = await tenants.getMember(ctx as never, tenantOrgId, profile.authUserId);
  const pendingInvite = invites.find(
    (invite) =>
      invite.status === "pending" &&
      normalizeComparableText(invite.inviteeIdentifier) === normalizeComparableText(profile.email)
  );

  return (membership?.status ?? "active") === "active"
    ? "member"
    : pendingInvite
      ? "pending-invite"
      : "not-member";
}

async function resolveConversationId(ctx: any, access: any, profile: any) {
  const directKey = normalizeDirectPair(access.authUserId, profile.authUserId).directKey;
  const conversation = await ctx.db
    .query("inboxConversations")
    .withIndex("directKey", (q: any) => q.eq("directKey", directKey))
    .unique();
  return conversation?._id ?? null;
}

function isEligibleCollaboratorProfile(profile: any, access: any) {
  if (profile.authUserId === access.authUserId || profile.isActive === false) {
    return false;
  }
  return Boolean(profile.brokerId || profile.developerId);
}

function resolveCollaboratorRole(profile: any) {
  return profile.role ?? "user";
}

function resolveOrganizationType(profile: any) {
  return profile.brokerId ? "broker" : profile.developerId ? "developer" : null;
}

function buildCollaboratorTarget(args: {
  profile: any;
  role: string;
  userImage: string | null;
  organizationName: string | null;
  membershipState: MembershipState;
  conversationId: string | null;
}) {
  const { profile, role, userImage, organizationName, membershipState, conversationId } = args;
  return {
    id: profile.authUserId,
    name: profile.name ?? profile.email ?? "مستخدم عنان",
    email: profile.email ?? null,
    username: profile.username ?? null,
    image: userImage,
    role,
    brokerId: profile.brokerId ?? null,
    redId: profile.developerId ?? null,
    organizationName,
    organizationType: resolveOrganizationType(profile),
    membershipState,
    conversationId,
  };
}

async function hydrateCollaboratorTarget(params: { ctx: any; access: any; profile: any; normalizedQuery: string; tenantOrgId: string | null; invites: any[] }) {
  const { ctx, access, profile, normalizedQuery, tenantOrgId, invites } = params;
  if (!isEligibleCollaboratorProfile(profile, access)) {
    return null;
  }

  const role = resolveCollaboratorRole(profile);
  const baseHaystack = buildHaystack(profile, null, role);
  if (!matchesNormalizedQuery(baseHaystack, normalizedQuery)) {
    const organizationName = await getOrganizationNameByOwner(ctx, {
      brokerId: profile.brokerId ?? undefined,
      developerId: profile.developerId ?? undefined,
    });
    const fullHaystack = buildHaystack(profile, organizationName, role);
    if (!matchesNormalizedQuery(fullHaystack, normalizedQuery)) {
      return null;
    }

    const [membershipState, conversationId, userImage] = await Promise.all([
      resolveMembershipState({ ctx, invites, profile, tenantOrgId }),
      resolveConversationId(ctx, access, profile),
      getUserImageByEmail(ctx, profile.email),
    ]);
    return buildCollaboratorTarget({ profile, role, userImage, organizationName, membershipState, conversationId });
  }

  const [organizationName, membershipState, conversationId, userImage] = await Promise.all([
    getOrganizationNameByOwner(ctx, {
      brokerId: profile.brokerId ?? undefined,
      developerId: profile.developerId ?? undefined,
    }),
    resolveMembershipState({ ctx, invites, profile, tenantOrgId }),
    resolveConversationId(ctx, access, profile),
    getUserImageByEmail(ctx, profile.email),
  ]);
  return buildCollaboratorTarget({ profile, role, userImage, organizationName, membershipState, conversationId });
}

function resolveWorkspaceOwner(access: any) {
  if (access.brokerId) {
    return buildOwnerContext({
      ownerType: "broker",
      ownerBrokerId: access.brokerId,
      authUserId: access.authUserId,
    });
  }
  if (access.developerId) {
    return buildOwnerContext({
      ownerType: "RED",
      ownerREDId: access.developerId,
      authUserId: access.authUserId,
    });
  }
  return null;
}

export const searchConversationTargets = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, { query: searchQuery }) => {
    const access = await requireEntitlements(ctx, ["workspace:user", "workspace:broker", "workspace:developer"]);
    const normalizedQuery = normalizeSearchQuery(searchQuery);
    if (!normalizedQuery) {
      return [];
    }

    if (access.role !== "broker" && access.role !== "developer") {
      return searchTargetsAsUser(ctx, access, normalizedQuery);
    }

    const owner = resolveWorkspaceOwner(access);
    const tenantOrgId = owner ? await resolveTenantOrgIdForOwner(ctx, owner) : null;
    const invites = tenantOrgId ? await tenants.listInvitations(ctx as never, tenantOrgId) : [];

    const maxProfilesToScan = 1_000;
    const pageSize = 200;
    let scannedProfiles = 0;
    let cursor: string | null = null;
    const hydrated = [] as Array<Awaited<ReturnType<typeof hydrateCollaboratorTarget>>>;

    while (scannedProfiles < maxProfilesToScan) {
      const page = await ctx.db
        .query("userProfiles")
        .withIndex("roleApprovalStatus", (q) => q.eq("roleApprovalStatus", "approved"))
        .paginate({ numItems: pageSize, cursor });

      scannedProfiles += page.page.length;

      const pageResults = await Promise.all(
        page.page.map(async (profile: any) =>
          hydrateCollaboratorTarget({
            access,
            ctx,
            invites,
            normalizedQuery,
            profile,
            tenantOrgId,
          })
        )
      );

      hydrated.push(...pageResults.filter(Boolean));

      if (page.isDone || !page.continueCursor) {
        break;
      }
      cursor = page.continueCursor;
    }

    return hydrated
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((left, right) => left.name.localeCompare(right.name, "ar"))
      .slice(0, 20);
  },
});
