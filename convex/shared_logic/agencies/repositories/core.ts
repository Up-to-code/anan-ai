import { ConvexError, type GenericId } from "convex/values";
import type { Doc } from "../../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../../_generated/server";

export type AgenciesRepositoryCtx = QueryCtx | MutationCtx;
export type UserProfileRecord = Doc<"userProfiles">;
export type TeamInviteRecord = Doc<"teamInvites">;
export type OrganizationMembershipRecord = Doc<"organizationMemberships">;

export type OwnerContext =
  | {
      ownerType: "broker";
      ownerBrokerId: GenericId<"brokers">;
      authUserId: string;
    }
  | {
      ownerType: "RED";
      ownerREDId: GenericId<"RED">;
      authUserId: string;
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
 * HOW:   Prefers `brokerId`, falls back to `REDId`, and throws when no organization link exists.
 */
export function buildOwnerContextFromProfile(profile: UserProfileRecord): OwnerContext {
  if (profile.brokerId) {
    return {
      ownerType: "broker",
      ownerBrokerId: profile.brokerId,
      authUserId: profile.authUserId,
    };
  }

  if (profile.REDId) {
    return {
      ownerType: "RED",
      ownerREDId: profile.REDId,
      authUserId: profile.authUserId,
    };
  }

  throw new ConvexError({ code: "FORBIDDEN", message: "Organization owner profile required" });
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
