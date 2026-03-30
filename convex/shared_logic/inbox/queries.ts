import { ConvexError, v } from "convex/values";
import { query } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import { requireRole } from "../../_core/security/accessPolicy";
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
  args: {},
  handler: async (ctx) => {
    const access = await requireRole(ctx, ["user", "broker", "developer", "admin"]);
    const memberships = await ctx.db
      .query("inboxConversationParticipants")
      .withIndex("userId", (q) => q.eq("userId", access.authUserId))
      .collect();

    const summaries = await Promise.all(
      memberships.map((membership) => mapConversationSummary(ctx, membership))
    );

    return summaries
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getConversation = query({
  args: {
    conversationId: v.id("inboxConversations"),
  },
  handler: async (ctx, { conversationId }) => {
    const access = await requireRole(ctx, ["user", "broker", "developer", "admin"]);
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
      .withIndex("conversationId", (q) => q.eq("conversationId", conversationId))
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
    const access = await requireRole(ctx, ["user", "broker", "developer", "admin"]);
    const memberships = await ctx.db
      .query("inboxConversationParticipants")
      .withIndex("userId", (q) => q.eq("userId", access.authUserId))
      .collect();

    return {
      unreadCount: memberships.reduce((sum, item) => sum + item.unreadCount, 0),
    };
  },
});

export const hasProjectShareAccess = query({
  args: {
    propertyId: v.id("properties"),
  },
  handler: async (ctx, { propertyId }) => {
    const access = await requireRole(ctx, ["user", "broker", "developer", "admin"]);
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
    REDId: profile.REDId ?? undefined,
  });

  const userImage = await getUserImageByEmail(ctx, profile.email);
  return [
    {
      id: profile.authUserId,
      name: profile.name ?? profile.email ?? "مستخدم عنان",
      email: profile.email ?? null,
      username: profile.username ?? null,
      image: userImage,
      role: profile.role === "RED" ? "developer" : profile.role ?? "user",
      brokerId: profile.brokerId ?? null,
      redId: profile.REDId ?? null,
      organizationName,
      organizationType: profile.brokerId ? "broker" : profile.REDId ? "developer" : null,
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
  return Boolean(profile.brokerId || profile.REDId);
}

function resolveCollaboratorRole(profile: any) {
  return profile.role === "RED" ? "developer" : profile.role ?? "user";
}

function resolveOrganizationType(profile: any) {
  return profile.brokerId ? "broker" : profile.REDId ? "developer" : null;
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
    redId: profile.REDId ?? null,
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
  const organizationName = await getOrganizationNameByOwner(ctx, {
    brokerId: profile.brokerId ?? undefined,
    REDId: profile.REDId ?? undefined,
  });
  const haystack = buildHaystack(profile, organizationName, role);
  if (!haystack.some((entry) => entry.includes(normalizedQuery))) {
    return null;
  }

  const [membershipState, conversationId, userImage] = await Promise.all([
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
  if (access.REDId) {
    return buildOwnerContext({
      ownerType: "RED",
      ownerREDId: access.REDId,
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
    const access = await requireRole(ctx, ["user", "broker", "developer", "admin"]);
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
        .withIndex("roleStatus", (q) => q.eq("roleStatus", "approved"))
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

      hydrated.push(...pageResults);

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
