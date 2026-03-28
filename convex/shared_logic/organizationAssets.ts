import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireOrganizationMembership } from "./agencies/repositories/membership";
import { requirePropertyReadAccess } from "./propertyAccessControl";

const organizationAssetCategoryValidator = v.union(
  v.literal("project_image"),
  v.literal("project_document"),
  v.literal("chat_attachment"),
  v.literal("offer_attachment"),
  v.literal("verification_document"),
);

const organizationAssetKindValidator = v.union(v.literal("image"), v.literal("pdf"));

const organizationAssetLifecycleStateValidator = v.union(
  v.literal("active"),
  v.literal("archived"),
  v.literal("pending_delete"),
  v.literal("deleted"),
);

const organizationAssetVisibilityScopeValidator = v.union(
  v.literal("organization"),
  v.literal("project_private_share"),
  v.literal("public_project"),
);

const attachedEntityTypeValidator = v.optional(
  v.union(v.literal("project"), v.literal("conversation"), v.literal("offer")),
);

function normalizeAssetKind(mime: string) {
  if (mime === "application/pdf") {
    return "pdf" as const;
  }
  return "image" as const;
}

async function requireTenantContext(ctx: any) {
  const { owner, profile } = await requireOrganizationMembership(ctx);
  if (!owner.tenantOrgId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Tenant organization required" });
  }

  return {
    owner,
    profile,
    tenantOrgId: owner.tenantOrgId,
  };
}

/**
 * WHY:   Organization uploads need an app-owned registry for lifecycle, linkage, and future retention workflows.
 * WHAT:  Upserts one asset row scoped to the current tenant organization.
 * HOW:   Matches by storage key inside the tenant and updates linkage metadata when the same file is reused.
 */
export const upsertOrganizationAsset = mutation({
  args: {
    key: v.string(),
    url: v.string(),
    name: v.string(),
    size: v.number(),
    mime: v.string(),
    category: organizationAssetCategoryValidator,
    visibilityScope: organizationAssetVisibilityScopeValidator,
    attachedEntityType: attachedEntityTypeValidator,
    attachedEntityId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { profile, tenantOrgId } = await requireTenantContext(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query("organizationAssets")
      .withIndex("key", (q) => q.eq("key", args.key))
      .collect();
    const match = existing.find((asset) => asset.tenantOrgId === tenantOrgId) ?? null;

    const patch = {
      uploaderAuthUserId: profile.authUserId,
      category: args.category,
      kind: normalizeAssetKind(args.mime),
      key: args.key,
      url: args.url,
      name: args.name,
      size: args.size,
      mime: args.mime,
      lifecycleState: "active" as const,
      attachedEntityType: args.attachedEntityType,
      attachedEntityId: args.attachedEntityId,
      visibilityScope: args.visibilityScope,
      updatedAt: now,
      deletedAt: undefined,
      deletionReason: undefined,
      scheduledDeletionAt: undefined,
    };

    if (match) {
      await ctx.db.patch(match._id, patch);
      return match._id;
    }

    return ctx.db.insert("organizationAssets", {
      tenantOrgId,
      createdAt: now,
      ...patch,
    });
  },
});

/**
 * WHY:   Project and workspace screens need a future-safe query for organization-owned assets.
 * WHAT:  Lists tenant-scoped assets with optional entity and lifecycle filters.
 * HOW:   Enforces membership and filters in memory after a tenant-indexed read.
 */
export const listOrganizationAssets = query({
  args: {
    attachedEntityType: attachedEntityTypeValidator,
    attachedEntityId: v.optional(v.string()),
    lifecycleState: v.optional(organizationAssetLifecycleStateValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { tenantOrgId } = await requireTenantContext(ctx);
    const assets = await ctx.db
      .query("organizationAssets")
      .withIndex("tenantOrgId", (q) => q.eq("tenantOrgId", tenantOrgId))
      .collect();

    return assets
      .filter((asset) => (args.lifecycleState ? asset.lifecycleState === args.lifecycleState : true))
      .filter((asset) => (args.attachedEntityType ? asset.attachedEntityType === args.attachedEntityType : true))
      .filter((asset) => (args.attachedEntityId ? asset.attachedEntityId === args.attachedEntityId : true))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, args.limit ?? 100);
  },
});

/**
 * WHY:   Project saves and inbox share flows need a single way to link already uploaded files to business entities.
 * WHAT:  Attaches a set of known storage keys to a project, conversation, or offer.
 * HOW:   Looks up tenant-owned asset rows by key and patches their linkage metadata in place.
 */
export const attachOrganizationAssets = mutation({
  args: {
    keys: v.array(v.string()),
    attachedEntityType: v.union(v.literal("project"), v.literal("conversation"), v.literal("offer")),
    attachedEntityId: v.string(),
    visibilityScope: organizationAssetVisibilityScopeValidator,
  },
  handler: async (ctx, args) => {
    const { tenantOrgId } = await requireTenantContext(ctx);
    const now = Date.now();
    const assets = await ctx.db
      .query("organizationAssets")
      .withIndex("tenantOrgId", (q) => q.eq("tenantOrgId", tenantOrgId))
      .collect();

    const keyed = new Set(args.keys);
    await Promise.all(
      assets
        .filter((asset) => keyed.has(asset.key))
        .map((asset) =>
          ctx.db.patch(asset._id, {
            attachedEntityType: args.attachedEntityType,
            attachedEntityId: args.attachedEntityId,
            visibilityScope: args.visibilityScope,
            lifecycleState: "active",
            updatedAt: now,
          }),
        ),
    );
  },
});

/**
 * WHY:   Entity deletion should preserve uploaded files for recovery and delayed cleanup workflows.
 * WHAT:  Marks all tenant-owned assets attached to one entity as pending delete.
 * HOW:   Tenant-scopes the lookup, then patches lifecycle timestamps without deleting blobs immediately.
 */
export const markEntityAssetsPendingDelete = mutation({
  args: {
    attachedEntityType: v.union(v.literal("project"), v.literal("conversation"), v.literal("offer")),
    attachedEntityId: v.string(),
    deletionReason: v.optional(v.string()),
    scheduledDeletionAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { tenantOrgId } = await requireTenantContext(ctx);
    const assets = await ctx.db
      .query("organizationAssets")
      .withIndex("attachedEntity", (q) =>
        q.eq("attachedEntityType", args.attachedEntityType).eq("attachedEntityId", args.attachedEntityId),
      )
      .collect();
    const now = Date.now();

    await Promise.all(
      assets
        .filter((asset) => asset.tenantOrgId === tenantOrgId)
        .map((asset) =>
          ctx.db.patch(asset._id, {
            lifecycleState: "pending_delete",
            scheduledDeletionAt: args.scheduledDeletionAt ?? now + 1000 * 60 * 60 * 24 * 30,
            deletionReason: args.deletionReason ?? "entity_deleted",
            updatedAt: now,
          }),
        ),
    );
  },
});

/**
 * WHY:   Shared project details need a read path for attached project assets beyond inline media references.
 * WHAT:  Returns active asset rows attached to a single project for an authorized user.
 * HOW:   Allows owners and explicit/shared viewers, then filters out non-project attachments.
 */
export const listProjectAssetsForViewer = query({
  args: {
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    await requirePropertyReadAccess(ctx, {
      propertyId: args.propertyId,
      allowInboxShare: true,
    });

    const propertyAssets = await ctx.db
      .query("organizationAssets")
      .withIndex("attachedEntity", (q) =>
        q.eq("attachedEntityType", "project").eq("attachedEntityId", args.propertyId),
      )
      .collect();

    return propertyAssets.filter((asset) => asset.lifecycleState === "active");
  },
});
