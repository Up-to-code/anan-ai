import { ConvexError } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { requireEntitlements, requireSession } from "../../_core/security/accessPolicy";

type OffersCtx = QueryCtx | MutationCtx;

async function getProfileByAuthUserId(ctx: OffersCtx, authUserId: string) {
  return ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q: any) => q.eq("authUserId", authUserId))
    .first();
}

/**
 * WHY:   Offer queries need an optional current-owner projection without forcing auth failures for bootstrap screens.
 * WHAT:  Returns the current active profile or null when the caller is anonymous or inactive.
 * HOW:   Resolves the auth identity, then loads the linked `userProfiles` row by `authUserId`.
 */
export async function getOptionalProfile(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const profile = await getProfileByAuthUserId(ctx, identity.subject);
  if (!profile || profile.isActive === false) return null;
  return { authUserId: identity.subject, profile };
}

/**
 * WHY:   Offer mutations should accept only broker or developer senders.
 * WHAT:  Resolves and validates the current sender role.
 * HOW:   Reuses the shared access policy and rejects inactive accounts.
 */
export async function requireSender(ctx: OffersCtx) {
  const access = await requireEntitlements(ctx, ["workspace:broker", "workspace:developer"]);
  if (access.profile?.isActive === false) {
    throw new ConvexError({
      code: "ACCOUNT_INACTIVE",
      message: "Account is deactivated",
    });
  }
  return access;
}

/**
 * WHY:   Publishing and applying should only be allowed for verified organizations.
 * WHAT:  Resolves the current sender and enforces broker/RED verification.
 * HOW:   Loads the linked organization document and checks `isVerified`.
 */
export async function requireVerifiedSender(ctx: MutationCtx) {
  const access = await requireSender(ctx);

  if (access.role === "broker") {
    const broker = await ctx.db.get(access.brokerId!);
    if (!broker?.isVerified) {
      throw new ConvexError({
        code: "VERIFICATION_REQUIRED",
        message: "Broker verification is required for this operation",
      });
    }
  }

  if (access.role === "developer") {
    const red = await ctx.db.get(access.REDId!);
    if (!red?.isVerified) {
      throw new ConvexError({
        code: "VERIFICATION_REQUIRED",
        message: "RED verification is required for this operation",
      });
    }
  }

  return access;
}

/**
 * WHY:   Offer state transitions must only be editable by the current sender or intended recipient.
 * WHAT:  Checks whether the current sender owns the given offer.
 * HOW:   Compares the current access context to the offer sender owner ids.
 */
export function isOfferOwner(
  offer: Doc<"offers">,
  access: Awaited<ReturnType<typeof requireSender>>,
) {
  return (
    (access.brokerId && offer.fromBrokerId === access.brokerId) ||
    (access.REDId && offer.fromREDId === access.REDId)
  );
}

/**
 * WHY:   Deal creation on accepted offers needs the authenticated subject for audit fields.
 * WHAT:  Resolves the required session subject for the current mutation caller.
 * HOW:   Delegates to the shared access-policy session helper.
 */
export async function requireOfferSession(ctx: MutationCtx) {
  return requireSession(ctx);
}

export type OfferOwnerId = Id<"brokers"> | Id<"RED">;
