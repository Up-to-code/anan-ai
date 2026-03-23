import { query } from "../../../_generated/server";
import { v } from "convex/values";
import {
  findProfileByAuthUserId,
  normalizeDirectPair,
  normalizeEmail,
  resolveTenantOrgIdForOwner,
  type AgenciesRepositoryCtx,
  type OwnerContext,
} from "./core";
import { requireOrganizationMembership } from "./membership";
import { listTeamInvitesForOwner } from "./invites";
import { tenants } from "../../../tenants";
import {
  countPublicPublishedOffersForOrg,
  findExactDirectoryProfile,
  getUserImageByEmail,
  listPublicPublishedOffersForOrganization,
  resolveDirectoryMembershipState,
  resolveDirectConversationId,
} from "./directory.helpers";

function canIncludeProfile(profile: any, role: "broker" | "developer", currentAuthUserId: string) {
  if (profile.authUserId === currentAuthUserId) return false;
  if (profile.isActive === false || profile.showInOffersDirectory === false) return false;
  if (role === "broker") return Boolean(profile.brokerId);
  return Boolean(profile.REDId);
}

async function resolveProfileOrganization(ctx: AgenciesRepositoryCtx, profile: any): Promise<any | null> {
  if (profile.brokerId) return ctx.db.get(profile.brokerId as any);
  if (profile.REDId) return ctx.db.get(profile.REDId as any);
  return null;
}

function toDirectoryProfile(args: {
  profile: any;
  organization: any;
  userImage: string | null;
  orgLogoUrl: string | null;
  membershipState: "member" | "pending-invite" | "not-member";
  conversationId: any;
}) {
  return {
    id: String(args.profile._id),
    authUserId: args.profile.authUserId,
    email: args.profile.email ?? "",
    name: args.profile.name ?? args.profile.email ?? "مستخدم عنان",
    username: args.profile.username ?? undefined,
    image: args.userImage,
    role: args.profile.brokerId ? "broker" : "developer",
    organizationName: args.organization.name,
    organizationSlug: args.organization.slug,
    organizationLogo: args.orgLogoUrl ?? null,
    membershipState: args.membershipState,
    canMessage: true,
    conversationId: args.conversationId ?? null,
  } as const;
}

async function buildOffersDirectoryProfile(args: {
  ctx: AgenciesRepositoryCtx;
  profile: any;
  role: "broker" | "developer";
  currentAuthUserId: string;
  tenantOrgId: string;
  invites: any[];
}) {
  if (!canIncludeProfile(args.profile, args.role, args.currentAuthUserId)) return null;
  const organization = await resolveProfileOrganization(args.ctx, args.profile);
  if (!organization) return null;

  const [existingMembership, orgLogoUrl, userImage] = await Promise.all([
    tenants.getMember(args.ctx as never, args.tenantOrgId, args.profile.authUserId),
    organization.logoId ? args.ctx.storage.getUrl(organization.logoId) : null,
    getUserImageByEmail(args.ctx, args.profile.email ?? ""),
  ]);
  const pendingInvite = args.invites.find(
    (invite) => invite.status === "pending" && normalizeEmail(invite.email) === normalizeEmail(args.profile.email ?? ""),
  );
  const directKey = normalizeDirectPair(args.currentAuthUserId, args.profile.authUserId);
  const conversation = await args.ctx.db
    .query("inboxConversations")
    .withIndex("directKey", (q) => q.eq("directKey", directKey))
    .unique();

  return toDirectoryProfile({
    profile: args.profile,
    organization,
    userImage,
    orgLogoUrl,
    membershipState: resolveDirectoryMembershipState(existingMembership, pendingInvite),
    conversationId: conversation?._id,
  });
}

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
    profiles.map((profile) =>
      buildOffersDirectoryProfile({
        ctx,
        profile,
        role: args.role,
        currentAuthUserId: args.currentAuthUserId,
        tenantOrgId,
        invites,
      }),
    ),
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
    const profile = await findExactDirectoryProfile(ctx, normalized);

    if (!profile || profile.isActive === false || profile.authUserId === current.profile.authUserId) {
      return [];
    }

    const existingMembership = await tenants.getMember(ctx as never, tenantOrgId, profile.authUserId);
    const invites = await listTeamInvitesForOwner(ctx, current.owner);
    const pendingInvite = invites.find((invite) => invite.status === "pending" && normalizeEmail(invite.email) === normalizeEmail(profile.email ?? ""));
    const conversationId = await resolveDirectConversationId(ctx, current.profile.authUserId, profile.authUserId);

    return [{
      id: profile._id,
      authUserId: profile.authUserId,
      email: profile.email ?? "",
      name: profile.name ?? profile.email ?? "مستخدم عنان",
      username: profile.username,
      membershipState: resolveDirectoryMembershipState(existingMembership, pendingInvite),
      canMessage: true,
      conversationId,
    }] as const;
  },
});

/**
 * WHY:   Pivoting the directory to be organization-centric as requested.
 * WHAT:  Lists active organizations (Brokers/REDs) with their public published offer counts.
 * HOW:   Iterates over active orgs of a specific role, queries their published offers, and resolves logos from storage.
 */
export const listOfferOrganizationsDirectory = query({
  args: {
    role: v.union(v.literal("broker"), v.literal("developer")),
  },
  handler: async (ctx, args) => {
    await requireOrganizationMembership(ctx);

    const table = args.role === "broker" ? "brokers" : "RED";
    const organizations = await ctx.db
      .query(table as any)
      .withIndex("status", (q) => q.eq("status", "active"))
      .collect();

    const results = await Promise.all(
      organizations.map(async (org: any) => {
        const publicPublishedCount = await countPublicPublishedOffersForOrg(ctx, args.role, org._id);
        const logoUrl = org.logoId ? await ctx.storage.getUrl(org.logoId) : null;
        return {
          id: String(org._id),
          name: org.name,
          slug: org.slug,
          logo: logoUrl,
          offerCount: publicPublishedCount,
        };
      })
    );

    return results.sort((a, b) => b.offerCount - a.offerCount || a.name.localeCompare(b.name, "ar"));
  },
});

/**
 * WHY:   Detail view for an organization in the directory.
 * WHAT:  Returns the organization profile including their public published offers.
 * HOW:   Queries by slug, resolves the logo, and fetches all public-visibility published offers.
 */
export const getOrganizationPublicProfile = query({
  args: {
    type: v.union(v.literal("broker"), v.literal("developer")),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const table = args.type === "broker" ? "brokers" : "RED";
    const organization = await ctx.db
      .query(table as any)
      .withIndex("slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!organization) return null;

    const [logoUrl, publicPublishedOffers] = await Promise.all([
      organization.logoId ? ctx.storage.getUrl(organization.logoId) : null,
      listPublicPublishedOffersForOrganization(ctx, args.type, organization._id),
    ]);

    return {
      id: organization._id,
      name: organization.name,
      slug: organization.slug,
      logo: logoUrl,
      description: organization.description,
      website: organization.website,
      contactEmail: organization.contactEmail,
      offers: publicPublishedOffers,
    };
  },
});
