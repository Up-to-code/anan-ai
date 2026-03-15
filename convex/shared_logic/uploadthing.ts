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

    return uploadthingFiles.upsertFile(ctx, {
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
