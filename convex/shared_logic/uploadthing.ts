import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { uploadthingFiles } from "../uploadthing";
import { requireOrganizationMembership } from "./agencies/repositories/membership";
import { getOwnerId } from "./agencies/repositories/core";

const uploadCategoryValidator = v.union(
  v.literal("propertyMedia"),
  v.literal("offerAttachments"),
  v.literal("crmDocuments"),
  v.literal("verificationDocuments"),
);

const uploadFileValidator = v.object({
  key: v.string(),
  url: v.string(),
  name: v.string(),
  size: v.optional(v.number()),
  mime: v.optional(v.string()),
});

function mapUploadCategoryToAssetCategory(category: "propertyMedia" | "offerAttachments" | "crmDocuments" | "verificationDocuments") {
  if (category === "propertyMedia") return "project_image" as const;
  if (category === "offerAttachments") return "offer_attachment" as const;
  if (category === "verificationDocuments") return "verification_document" as const;
  return "chat_attachment" as const;
}

function mapUploadCategoryToVisibilityScope(category: "propertyMedia" | "offerAttachments" | "crmDocuments" | "verificationDocuments") {
  if (category === "propertyMedia") return "public_project" as const;
  if (category === "verificationDocuments") return "project_private_share" as const;
  return "organization" as const;
}

function resolveAssetKind(mimeType: string) {
  return mimeType === "application/pdf" ? ("pdf" as const) : ("image" as const);
}

/**
 * WHY:   Every UploadThing completion needs a tenant-aware tracking write into Convex.
 * WHAT:  Records or updates a tracked file entry with tenant + ownership metadata.
 * HOW:   Resolves the current membership, derives a tenant folder, and upserts the file record.
 */
export const trackUploadthingFile = mutation({
  args: {
    file: uploadFileValidator,
    category: uploadCategoryValidator,
  },
  handler: async (ctx, args) => {
    const { owner, profile } = await requireOrganizationMembership(ctx);
    if (!owner.tenantOrgId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Tenant organization required" });
    }

    const folder = `tenant:${owner.tenantOrgId}`;
    const size = args.file.size ?? 0;
    const mimeType = args.file.mime ?? "application/octet-stream";

    await uploadthingFiles.upsertFile(ctx, {
      file: {
        key: args.file.key,
        url: args.file.url,
        name: args.file.name,
        size,
        mimeType,
        uploadedAt: Date.now(),
        fileType: args.category,
      },
      userId: profile.authUserId,
      options: {
        folder,
        tags: [args.category],
        access: { visibility: "public" },
        metadata: {
          tenantOrgId: owner.tenantOrgId,
          ownerType: owner.ownerType,
          ownerId: String(getOwnerId(owner)),
          category: args.category,
        },
      },
    });

    const existingAsset = await ctx.db
      .query("organizationAssets")
      .withIndex("key", (q) => q.eq("key", args.file.key))
      .collect();
    const match = existingAsset.find((asset) => asset.tenantOrgId === owner.tenantOrgId) ?? null;
    const assetPatch = {
      tenantOrgId: owner.tenantOrgId,
      uploaderAuthUserId: profile.authUserId,
      category: mapUploadCategoryToAssetCategory(args.category),
      kind: resolveAssetKind(mimeType),
      key: args.file.key,
      url: args.file.url,
      name: args.file.name,
      size,
      mime: mimeType,
      lifecycleState: "active" as const,
      visibilityScope: mapUploadCategoryToVisibilityScope(args.category),
      updatedAt: Date.now(),
      deletedAt: undefined,
      deletionReason: undefined,
      scheduledDeletionAt: undefined,
    };

    if (match) {
      await ctx.db.patch(match._id, assetPatch);
      return match._id;
    }

    return ctx.db.insert("organizationAssets", {
      ...assetPatch,
      createdAt: Date.now(),
    });
  },
});

/**
 * WHY:   Workspace views need a tenant-scoped listing of UploadThing files.
 * WHAT:  Lists tracked files for the current tenant with optional category filtering.
 * HOW:   Enforces membership, scopes to the tenant folder, and applies tag filters.
 */
export const listCurrentTenantFiles = query({
  args: {
    category: v.optional(uploadCategoryValidator),
    limit: v.optional(v.number()),
    includeExpired: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { owner, profile } = await requireOrganizationMembership(ctx);
    if (!owner.tenantOrgId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Tenant organization required" });
    }

    return uploadthingFiles.listAllFiles(ctx, {
      viewerUserId: profile.authUserId,
      folder: `tenant:${owner.tenantOrgId}`,
      tag: args.category,
      includeExpired: args.includeExpired,
      limit: args.limit ?? 50,
    });
  },
});
