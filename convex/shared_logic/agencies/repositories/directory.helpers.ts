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
  const offersQuery = role === "broker"
    ? ctx.db.query("offers").withIndex("fromBrokerId", (q) => q.eq("fromBrokerId", organizationId))
    : ctx.db.query("offers").withIndex("fromREDId", (q) => q.eq("fromREDId", organizationId));
  const offers = await offersQuery.collect();
  return offers.filter((offer) => offer.publicationState === "published" && offer.visibility === "public").length;
}

export async function listPublicPublishedOffersForOrganization(
  ctx: AgenciesRepositoryCtx,
  role: "broker" | "developer",
  organizationId: any,
) {
  const offersQuery = role === "broker"
    ? ctx.db.query("offers").withIndex("fromBrokerId", (q) => q.eq("fromBrokerId", organizationId))
    : ctx.db.query("offers").withIndex("fromREDId", (q) => q.eq("fromREDId", organizationId));
  const publishedOffers = await offersQuery.collect();
  return Promise.all(
    publishedOffers
      .filter((offer) => offer.publicationState === "published" && offer.visibility === "public")
      .map(async (offer) => {
        const property = await ctx.db.get(offer.propertyId);
        return {
          id: offer._id,
          price: offer.price,
          status: offer.status,
          description: offer.description,
          property: property ? {
            id: property._id,
            title: property.title,
            address: property.address,
            location: property.location,
          } : null,
        };
      }),
  );
}
