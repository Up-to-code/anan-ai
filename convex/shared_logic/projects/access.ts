import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import { requireOwnedPropertyAccess, requirePropertyReadAccess } from "../propertyAccessControl";

/**
 * WHY:   Private project visibility needs a first-class viewer list that owners can manage after chat sharing.
 * WHAT:  Returns the explicit viewer access list for one owner-managed property.
 * HOW:   Verifies ownership, then joins access rows with user profile basics for settings UI rendering.
 */
export const listPropertyViewers = query({
  args: {
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    await requireOwnedPropertyAccess(ctx, args.propertyId);
    const rows = await ctx.db
      .query("propertyViewerAccess")
      .withIndex("propertyId", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    const activeRows = rows.filter((row) => row.status === "active");
    return Promise.all(
      activeRows.map(async (row) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("authUserId", (q: any) => q.eq("authUserId", row.authUserId))
          .unique();
        return {
          authUserId: row.authUserId,
          name: profile?.name ?? profile?.email ?? "عضو عنان",
          email: profile?.email ?? null,
          accessSource: row.accessSource,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }),
    );
  },
});

/**
 * WHY:   Shared project routes should recognize explicit viewer access independently from chat history.
 * WHAT:  Returns whether the current authenticated user has active explicit viewer access to a property.
 * HOW:   Looks up the property viewer row by `propertyId + authUserId`.
 */
export const hasExplicitProjectViewerAccess = query({
  args: {
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    try {
      const result = await requirePropertyReadAccess(ctx, {
        propertyId: args.propertyId,
        allowInboxShare: false,
      });
      return result.reason === "explicit_viewer";
    } catch (error) {
      if (
        error instanceof ConvexError &&
        error.data &&
        typeof error.data === "object" &&
        "code" in error.data &&
        error.data.code === "FORBIDDEN"
      ) {
        return false;
      }
      throw error;
    }
  },
});

/**
 * WHY:   Inbox-shared private projects should become manageable from project settings after the first successful open.
 * WHAT:  Promotes the current user into the property's explicit active viewer list after server-side share validation.
 * HOW:   Requires the viewer to already be an owner or to hold an inbox-backed `project_share`, then upserts a `chat_share` row.
 */
export const promoteCurrentUserToProjectViewer = mutation({
  args: {
    propertyId: v.id("properties"),
    sharedByAuthUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { access, reason } = await requirePropertyReadAccess(ctx, {
      propertyId: args.propertyId,
      allowInboxShare: true,
    });
    if (reason === "owner") {
      return { alreadyOwner: true, promoted: false } as const;
    }

    const existing = await ctx.db
      .query("propertyViewerAccess")
      .withIndex("propertyId_authUserId", (q) =>
        q.eq("propertyId", args.propertyId).eq("authUserId", access.authUserId),
      )
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "active",
        accessSource: "chat_share",
        sharedByAuthUserId: args.sharedByAuthUserId ?? existing.sharedByAuthUserId,
        lastPromotedAt: now,
        updatedAt: now,
      });
      return { alreadyOwner: false, promoted: true } as const;
    }

    await ctx.db.insert("propertyViewerAccess", {
      propertyId: args.propertyId,
      authUserId: access.authUserId,
      sharedByAuthUserId: args.sharedByAuthUserId,
      accessSource: "chat_share",
      status: "active",
      createdAt: now,
      updatedAt: now,
      lastPromotedAt: now,
    });
    return { alreadyOwner: false, promoted: true } as const;
  },
});

/**
 * WHY:   Private project settings need a revocation control for explicit viewer access.
 * WHAT:  Marks a viewer row as revoked for an owner-managed property.
 * HOW:   Validates ownership, then patches the matching property-viewer record if present.
 */
export const revokePropertyViewer = mutation({
  args: {
    propertyId: v.id("properties"),
    viewerAuthUserId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireOwnedPropertyAccess(ctx, args.propertyId);
    const existing = await ctx.db
      .query("propertyViewerAccess")
      .withIndex("propertyId_authUserId", (q) =>
        q.eq("propertyId", args.propertyId).eq("authUserId", args.viewerAuthUserId),
      )
      .unique();
    if (!existing) {
      return { ok: true } as const;
    }

    await ctx.db.patch(existing._id, {
      status: "revoked",
      updatedAt: Date.now(),
    });
    return { ok: true } as const;
  },
});
