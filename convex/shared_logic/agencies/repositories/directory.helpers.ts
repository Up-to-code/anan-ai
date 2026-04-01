import type { QueryCtx } from "../../../_generated/server";
import type { AgenciesRepositoryCtx } from "./core";
import { normalizeDirectPair, normalizeEmail, normalizeUsername } from "./core";

export async function getUserImageByEmail(ctx: QueryCtx, email: string | null | undefined): Promise<string | null> {
  if (!email) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", email))
    .first();
  return user?.image ?? null;
}

export function resolveDirectoryMembershipState(
  existingMembership: { status?: string } | null | undefined,
  pendingInvite: unknown,
) {
  return (existingMembership?.status ?? "active") === "active"
    ? "member"
    : pendingInvite
      ? "pending-invite"
      : "not-member";
}

export async function findExactDirectoryProfile(ctx: AgenciesRepositoryCtx, normalized: string) {
  const email = normalized.includes("@") ? normalizeEmail(normalized) : null;
  const usernameLower = email ? null : normalizeUsername(normalized);
  if (usernameLower) {
    return ctx.db
      .query("userProfiles")
      .withIndex("usernameLower", (q) => q.eq("usernameLower", usernameLower))
      .first();
  }
  if (email) {
    return ctx.db
      .query("userProfiles")
      .withIndex("email", (q) => q.eq("email", email))
      .first();
  }
  return null;
}

export async function resolveDirectConversationId(ctx: AgenciesRepositoryCtx, leftUserId: string, rightUserId: string) {
  const directKey = normalizeDirectPair(leftUserId, rightUserId);
  const conversation = await ctx.db
    .query("inboxConversations")
    .withIndex("directKey", (q) => q.eq("directKey", directKey))
    .unique();
  return conversation?._id ?? null;
}

export async function countPublicPublishedOffersForOrg(
  ctx: AgenciesRepositoryCtx,
  role: "broker" | "developer",
  organizationId: any,
) {
  const packagesQuery = role === "broker"
    ? ctx.db.query("offerPackages").withIndex("fromBrokerId", (q) => q.eq("fromBrokerId", organizationId))
    : ctx.db.query("offerPackages").withIndex("fromREDId", (q) => q.eq("fromREDId", organizationId));
  const offerPackages = await packagesQuery.collect();
  const counts = await Promise.all(
    offerPackages.map(async (offerPackage) => {
      const offerCases = await ctx.db
        .query("offerCases")
        .withIndex("offerPackageId", (q) => q.eq("offerPackageId", offerPackage._id))
        .collect();
      return offerCases.filter((offerCase) => offerCase.type === "open_offer" && offerCase.stage === "open").length;
    }),
  );
  return counts.reduce((total, value) => total + value, 0);
}

export async function listPublicPublishedOffersForOrganization(
  ctx: AgenciesRepositoryCtx,
  role: "broker" | "developer",
  organizationId: any,
) {
  const packagesQuery = role === "broker"
    ? ctx.db.query("offerPackages").withIndex("fromBrokerId", (q) => q.eq("fromBrokerId", organizationId))
    : ctx.db.query("offerPackages").withIndex("fromREDId", (q) => q.eq("fromREDId", organizationId));
  const offerPackages = await packagesQuery.collect();
  const rows = await Promise.all(
    offerPackages.map(async (offerPackage) => {
      const openOfferCase = await ctx.db
        .query("offerCases")
        .withIndex("offerPackageId", (q) => q.eq("offerPackageId", offerPackage._id))
        .filter((q) =>
          q.and(
            q.eq(q.field("type"), "open_offer"),
            q.eq(q.field("stage"), "open"),
          ),
        )
        .first();
      if (!openOfferCase) {
        return null;
      }
      const property = offerPackage.propertyId ? await ctx.db.get(offerPackage.propertyId) : null;
      return {
        id: openOfferCase._id,
        price: offerPackage.askingPrice,
        status: "pending",
        description: openOfferCase.summary ?? offerPackage.summary,
        property: property ? {
          id: property._id,
          title: property.title,
          address: property.address,
          location: property.location,
        } : null,
      };
    }),
  );
  return rows.filter(Boolean);
}
