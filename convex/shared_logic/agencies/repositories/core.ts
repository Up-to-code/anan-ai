import { ConvexError, type GenericId } from "convex/values";
import type { Doc } from "../../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../../_generated/server";

export type AgenciesRepositoryCtx = QueryCtx | MutationCtx;
export type UserProfileRecord = Doc<"userProfiles">;
export type OrganizationMembershipRecord = {
  id: string;
  ownerType: "broker" | "RED";
  ownerId: string;
  authUserId: string;
  profileId: string;
  role: "manager" | "member" | "viewer";
  tenantRole?: string;
  status: "active" | "inactive";
  createdAt: number;
  updatedAt: number;
};
export type TenantOrgLinkRecord = Doc<"tenantOrgLinks">;

export type OwnerContext =
  | {
      ownerType: "broker";
      ownerBrokerId: GenericId<"brokers">;
      authUserId: string;
      tenantOrgId?: string;
    }
  | {
      ownerType: "RED";
      ownerREDId: GenericId<"RED">;
      authUserId: string;
      tenantOrgId?: string;
    };

/**
 * WHY:   Several repository flows need to know when they are allowed to write fallback membership records.
 * WHAT:  Narrows a mixed query/mutation context to a mutation context.
 * HOW:   Detects the presence of `db.insert`, which only exists on mutation contexts.
 */
export function isMutationCtx(ctx: AgenciesRepositoryCtx): ctx is MutationCtx {
  return typeof (ctx.db as MutationCtx["db"]).insert === "function";
}

/**
 * WHY:   Email comparisons must be stable across invites, memberships, and directory search.
 * WHAT:  Returns a normalized lowercase email string.
 * HOW:   Trims whitespace and lowercases the value.
 */
export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/**
 * WHY:   Directory username search should be exact and case-insensitive.
 * WHAT:  Returns a normalized lowercase username string.
 * HOW:   Trims whitespace and lowercases the value.
 */
export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

/**
 * WHY:   Direct inbox conversations need a deterministic key regardless of sender/recipient ordering.
 * WHAT:  Returns the canonical direct-pair key for two auth user ids.
 * HOW:   Sorts the two ids after trimming and joins them with a stable separator.
 */
export function normalizeDirectPair(userA: string, userB: string) {
  const [first, second] = [userA.trim(), userB.trim()].sort();
  return `${first}__${second}`;
}

/**
 * WHY:   Most organization flows need the persisted profile row instead of the transient auth/session view.
 * WHAT:  Loads a profile by `authUserId`.
 * HOW:   Queries the `userProfiles.authUserId` index and returns the first match.
 */
export async function findProfileByAuthUserId(ctx: AgenciesRepositoryCtx, authUserId: string) {
  return ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q) => q.eq("authUserId", authUserId))
    .first();
}

/**
 * WHY:   Organization-scoped operations need a single owner representation independent of broker vs developer storage tables.
 * WHAT:  Builds the normalized owner context from raw mutation/query arguments.
 * HOW:   Validates the required owner id based on `ownerType` and returns the typed owner shape.
 */
export function buildOwnerContext(args: {
  ownerType: "broker" | "RED";
  ownerBrokerId?: GenericId<"brokers">;
  ownerREDId?: GenericId<"RED">;
  authUserId?: string;
}): OwnerContext {
  if (args.ownerType === "broker") {
    if (!args.ownerBrokerId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Broker owner required" });
    }
    return {
      ownerType: "broker",
      ownerBrokerId: args.ownerBrokerId,
      authUserId: args.authUserId ?? "",
    };
  }

  if (!args.ownerREDId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Developer owner required" });
  }

  return {
    ownerType: "RED",
    ownerREDId: args.ownerREDId,
    authUserId: args.authUserId ?? "",
  };
}

/**
 * WHY:   Current-user organization flows should infer ownership directly from the persisted profile record.
 * WHAT:  Converts a profile's broker/developer linkage into an owner context.
 * HOW:   Prefers `brokerId`, falls back to `developerId`, and throws when no organization link exists.
 */
export function buildOwnerContextFromProfile(profile: UserProfileRecord): OwnerContext {
  if (profile.brokerId) {
    return {
      ownerType: "broker",
      ownerBrokerId: profile.brokerId,
      authUserId: profile.authUserId,
      tenantOrgId: profile.currentTenantOrgId,
    };
  }

  if ((profile as any).developerId) {
    return {
      ownerType: "RED",
      ownerREDId: (profile as any).developerId,
      authUserId: profile.authUserId,
      tenantOrgId: profile.currentTenantOrgId,
    };
  }

  throw new ConvexError({ code: "FORBIDDEN", message: "Organization owner profile required" });
}

export async function findTenantOrgLinkByTenantOrgId(
  ctx: AgenciesRepositoryCtx,
  tenantOrgId: string,
): Promise<TenantOrgLinkRecord | null> {
  return ctx.db
    .query("tenantOrgLinks")
    .withIndex("tenantOrgId", (q) => q.eq("tenantOrgId", tenantOrgId))
    .first();
}

export async function findTenantOrgLinkByOwner(
  ctx: AgenciesRepositoryCtx,
  owner: OwnerContext,
): Promise<TenantOrgLinkRecord | null> {
  if (owner.ownerType === "broker") {
    return ctx.db
      .query("tenantOrgLinks")
      .withIndex("ownerBrokerId", (q) => q.eq("ownerBrokerId", owner.ownerBrokerId))
      .first();
  }
  return ctx.db
    .query("tenantOrgLinks")
    .withIndex("ownerREDId", (q) => q.eq("ownerREDId", owner.ownerREDId))
    .first();
}

export async function resolveTenantOrgIdForOwner(
  ctx: AgenciesRepositoryCtx,
  owner: OwnerContext,
): Promise<string> {
  if (owner.tenantOrgId) return owner.tenantOrgId;
  const link = await findTenantOrgLinkByOwner(ctx, owner);
  if (!link) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Tenant organization required" });
  }
  return link.tenantOrgId;
}

async function resolveTenantOrgIdFromCurrentTenantLink(
  ctx: AgenciesRepositoryCtx,
  currentTenantOrgId: string | undefined
) {
  if (!currentTenantOrgId) return null;
  const link = await findTenantOrgLinkByTenantOrgId(ctx, currentTenantOrgId);
  return link?.tenantOrgId ?? null;
}

async function maybePatchProfileTenantOrgId(
  ctx: AgenciesRepositoryCtx,
  profile: UserProfileRecord,
  tenantOrgId: string
) {
  if (!isMutationCtx(ctx) || profile.currentTenantOrgId === tenantOrgId) return;
  await ctx.db.patch(profile._id, { currentTenantOrgId: tenantOrgId, updatedAt: Date.now() });
}

async function resolveTenantOrgIdFromProfileOwner(
  ctx: AgenciesRepositoryCtx,
  profile: UserProfileRecord
) {
  if (!profile.brokerId && !(profile as any).developerId) return null;
  const owner = buildOwnerContextFromProfile(profile);
  const link = await findTenantOrgLinkByOwner(ctx, owner);
  if (!link) return null;
  await maybePatchProfileTenantOrgId(ctx, profile, link.tenantOrgId);
  return link.tenantOrgId;
}

export async function resolveTenantOrgIdForProfile(
  ctx: AgenciesRepositoryCtx,
  profile: UserProfileRecord,
): Promise<string> {
  const linkedTenantOrgId = await resolveTenantOrgIdFromCurrentTenantLink(ctx, profile.currentTenantOrgId);
  if (linkedTenantOrgId) return linkedTenantOrgId;
  const ownerTenantOrgId = await resolveTenantOrgIdFromProfileOwner(ctx, profile);
  if (ownerTenantOrgId) return ownerTenantOrgId;
  throw new ConvexError({ code: "FORBIDDEN", message: "Tenant organization required" });
}

export async function resolveOwnerContextFromProfile(
  ctx: AgenciesRepositoryCtx,
  profile: UserProfileRecord,
): Promise<OwnerContext> {
  const tenantOrgId = await resolveTenantOrgIdForProfile(ctx, profile);
  const link = await findTenantOrgLinkByTenantOrgId(ctx, tenantOrgId);
  if (!link) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Tenant organization link required" });
  }

  if (link.ownerType === "broker") {
    if (!link.ownerBrokerId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Broker organization link required" });
    }
    return {
      ownerType: "broker",
      ownerBrokerId: link.ownerBrokerId,
      authUserId: profile.authUserId,
      tenantOrgId: link.tenantOrgId,
    };
  }

  if (!link.ownerREDId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Developer organization link required" });
  }

  return {
    ownerType: "RED",
    ownerREDId: link.ownerREDId,
    authUserId: profile.authUserId,
    tenantOrgId: link.tenantOrgId,
  };
}

/**
 * WHY:   Web/admin adapters need the raw owner id independent of organization type.
 * WHAT:  Returns the broker or developer id for a normalized owner context.
 * HOW:   Switches on `ownerType`.
 */
export function getOwnerId(owner: OwnerContext) {
  return owner.ownerType === "broker" ? owner.ownerBrokerId : owner.ownerREDId;
}

/**
 * WHY:   Multiple organization flows need the owner record itself for summary projections and validation.
 * WHAT:  Loads the broker or developer document for the given owner context.
 * HOW:   Reads from the corresponding table based on `ownerType`.
 */
export async function getOrganizationRecord(ctx: AgenciesRepositoryCtx, owner: OwnerContext) {
  return owner.ownerType === "broker"
    ? ctx.db.get(owner.ownerBrokerId)
    : ctx.db.get(owner.ownerREDId);
}
