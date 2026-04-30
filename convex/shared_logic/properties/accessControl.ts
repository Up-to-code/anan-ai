import { ConvexError } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { requireEntitlements, type AccessContext } from "../../_core/security/accessPolicy";

type PropertyAccessCtx = QueryCtx | MutationCtx;
type PropertyDoc = Doc<"properties">;
type PropertyAccessReason = "owner" | "explicit_viewer" | "shared_viewer";

/**
 * WHY:   Shared project access rules must stay consistent across project details, assets, and viewer promotion.
 * WHAT:  Returns whether the authenticated user has an inbox-backed project share for one property.
 * HOW:   Loads the caller's inbox memberships, scans `project_share` messages, and matches the property id in metadata.
 */
export async function hasInboxProjectShareAccess(
  ctx: PropertyAccessCtx,
  authUserId: string,
  propertyId: Id<"properties">,
): Promise<boolean> {
  const memberships = await ctx.db
    .query("inboxConversationParticipants")
    .withIndex("userId", (q) => q.eq("userId", authUserId))
    .collect();

  for (const membership of memberships) {
    const messages = await ctx.db
      .query("inboxMessages")
      .withIndex("conversationId", (q) => q.eq("conversationId", membership.conversationId))
      .collect();

    const hasMatchingShare = messages.some((message) => {
      if (message.type !== "project_share") {
        return false;
      }

      const metadata = message.metadata as { propertyId?: string } | null | undefined;
      return metadata?.propertyId === propertyId;
    });

    if (hasMatchingShare) {
      return true;
    }
  }

  return false;
}

function isPropertyOwner(property: PropertyDoc, access: AccessContext) {
  return Boolean(
    (access.brokerId && property.brokerId === access.brokerId) ||
      (access.REDId && property.REDId === access.REDId),
  );
}

async function getExplicitViewerAccess(
  ctx: PropertyAccessCtx,
  propertyId: Id<"properties">,
  authUserId: string,
) {
  return ctx.db
    .query("propertyViewerAccess")
    .withIndex("propertyId_authUserId", (q) =>
      q.eq("propertyId", propertyId).eq("authUserId", authUserId),
    )
    .unique();
}

/**
 * WHY:   Property-facing Convex functions need a single server-side trust boundary instead of ad hoc checks.
 * WHAT:  Resolves the property plus the caller's authenticated access reason for one project read surface.
 * HOW:   Requires an authenticated role, then authorizes owner, explicit viewer, or optional inbox share access.
 */
export async function requirePropertyReadAccess(
  ctx: PropertyAccessCtx,
  args: {
    propertyId: Id<"properties">;
    allowInboxShare?: boolean;
  },
): Promise<{
  access: AccessContext;
  property: PropertyDoc;
  reason: PropertyAccessReason;
}> {
  const access = await requireEntitlements(ctx, ["workspace:broker", "workspace:developer", "workspace:user"]);
  const property = await ctx.db.get(args.propertyId);
  if (!property) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  }

  if (isPropertyOwner(property, access)) {
    return { access, property, reason: "owner" };
  }

  const explicitViewerAccess = await getExplicitViewerAccess(ctx, args.propertyId, access.authUserId);
  if (explicitViewerAccess?.status === "active") {
    return { access, property, reason: "explicit_viewer" };
  }

  if (args.allowInboxShare && (await hasInboxProjectShareAccess(ctx, access.authUserId, args.propertyId))) {
    return { access, property, reason: "shared_viewer" };
  }

  throw new ConvexError({ code: "FORBIDDEN", message: "Property access not granted" });
}

/**
 * WHY:   Owner-only project mutations should not duplicate broker/developer ownership checks in every file.
 * WHAT:  Resolves the property after requiring the current caller to be its broker or developer owner.
 * HOW:   Uses the shared role guard, loads the property, and compares owner ids against the linked profile.
 */
export async function requireOwnedPropertyAccess(
  ctx: PropertyAccessCtx,
  propertyId: Id<"properties">,
): Promise<{
  access: AccessContext;
  property: PropertyDoc;
}> {
  const access = await requireEntitlements(ctx, ["workspace:broker", "workspace:developer"]);
  const property = await ctx.db.get(propertyId);
  if (!property) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  }

  if (!isPropertyOwner(property, access)) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Cannot manage this property" });
  }

  return { access, property };
}
