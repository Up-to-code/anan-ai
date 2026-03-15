import { query } from "../../../_generated/server";
import { v } from "convex/values";
import {
  findProfileByAuthUserId,
  normalizeDirectPair,
  normalizeEmail,
  normalizeUsername,
  resolveTenantOrgIdForOwner,
  type AgenciesRepositoryCtx,
  type OwnerContext,
} from "./core";
import { requireOrganizationMembership } from "./membership";
import { listTeamInvitesForOwner } from "./invites";
import { tenants } from "../../../tenants";

async function listOffersDirectoryProfilesForOwner(
  ctx: AgenciesRepositoryCtx,
  args: { owner: OwnerContext; role: "broker" | "developer"; currentAuthUserId: string },
) {
  const tenantOrgId = await resolveTenantOrgIdForOwner(ctx, args.owner);
  const [profiles, invites] = await Promise.all([
    ctx.db
      .query("userProfiles")
      .withIndex("roleStatus", (q) => q.eq("roleStatus", "approved"))
      .collect(),
    listTeamInvitesForOwner(ctx, args.owner),
  ]);

  const directory = await Promise.all(
    profiles.map(async (profile) => {
      if (profile.authUserId === args.currentAuthUserId) {
        return null;
      }

      const isBroker = Boolean(profile.brokerId);
      const isDeveloper = Boolean(profile.REDId);
      if (profile.isActive === false || profile.showInOffersDirectory === false) {
        return null;
      }
      if (args.role === "broker" && !isBroker) {
        return null;
      }
      if (args.role === "developer" && !isDeveloper) {
        return null;
      }

      const organization = profile.brokerId
        ? await ctx.db.get(profile.brokerId)
        : profile.REDId
          ? await ctx.db.get(profile.REDId)
          : null;
      if (!organization) {
        return null;
      }

      const existingMembership = await tenants.getMember(ctx as never, tenantOrgId, profile.authUserId);
      const pendingInvite = invites.find(
        (invite) => invite.status === "pending" && normalizeEmail(invite.email) === normalizeEmail(profile.email ?? ""),
      );
      const directKey = normalizeDirectPair(args.currentAuthUserId, profile.authUserId);
      const conversation = await ctx.db
        .query("inboxConversations")
        .withIndex("directKey", (q) => q.eq("directKey", directKey))
        .unique();

      return {
        id: String(profile._id),
        authUserId: profile.authUserId,
        email: profile.email ?? "",
        name: profile.name ?? profile.email ?? "مستخدم أنان",
        username: profile.username ?? undefined,
        role: isBroker ? "broker" : "developer",
        organizationName: organization.name,
        organizationSlug: organization.slug,
        membershipState: (existingMembership?.status ?? "active") === "active"
          ? "member"
          : pendingInvite
            ? "pending-invite"
            : "not-member",
        canMessage: true,
        conversationId: conversation?._id ?? null,
      } as const;
    }),
  );

  return directory
    .filter((profile): profile is NonNullable<typeof profile> => Boolean(profile))
    .sort((left, right) => left.name.localeCompare(right.name, "ar"));
}

/**
 * WHY:   Offer collaboration flows need the current organization's partner directory with membership and messaging context.
 * WHAT:  Lists approved broker/developer profiles visible to the current organization.
 * HOW:   Resolves the current membership context and delegates to the shared offers-directory projection helper.
 */
export const listOffersDirectoryProfiles = query({
  args: {
    role: v.union(v.literal("broker"), v.literal("developer")),
  },
  handler: async (ctx, args) => {
    const { owner, profile } = await requireOrganizationMembership(ctx);
    return listOffersDirectoryProfilesForOwner(ctx, {
      owner,
      role: args.role,
      currentAuthUserId: profile.authUserId,
    });
  },
});

/**
 * WHY:   Team invite and direct-message flows need an exact directory lookup against email or username.
 * WHAT:  Searches the organization directory for one exact-match user.
 * HOW:   Resolves the current organization context, looks up the profile by exact email/username, and projects membership + conversation metadata.
 */
export const searchOrganizationDirectoryExact = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const current = await requireOrganizationMembership(ctx);
    const tenantOrgId = await resolveTenantOrgIdForOwner(ctx, current.owner);
    const normalized = args.query.trim();
    if (!normalized) {
      return [];
    }

    const email = normalized.includes("@") ? normalizeEmail(normalized) : null;
    const usernameLower = email ? null : normalizeUsername(normalized);

    let profile = null;
    if (usernameLower) {
      profile = await ctx.db
        .query("userProfiles")
        .withIndex("usernameLower", (q) => q.eq("usernameLower", usernameLower))
        .first();
    } else if (email) {
      profile = await ctx.db
        .query("userProfiles")
        .withIndex("email", (q) => q.eq("email", email))
        .first();
    }

    if (!profile || profile.isActive === false || profile.authUserId === current.profile.authUserId) {
      return [];
    }

    const existingMembership = await tenants.getMember(ctx as never, tenantOrgId, profile.authUserId);
    const invites = await listTeamInvitesForOwner(ctx, current.owner);
    const pendingInvite = invites.find((invite) => invite.status === "pending" && normalizeEmail(invite.email) === normalizeEmail(profile.email ?? ""));
    const directKey = normalizeDirectPair(current.profile.authUserId, profile.authUserId);
    const conversation = await ctx.db
      .query("inboxConversations")
      .withIndex("directKey", (q) => q.eq("directKey", directKey))
      .unique();

    return [{
      id: profile._id,
      authUserId: profile.authUserId,
      email: profile.email ?? "",
      name: profile.name ?? profile.email ?? "مستخدم أنان",
      username: profile.username,
      membershipState: (existingMembership?.status ?? "active") === "active"
        ? "member"
        : pendingInvite
          ? "pending-invite"
          : "not-member",
      canMessage: true,
      conversationId: conversation?._id ?? null,
    }] as const;
  },
});
