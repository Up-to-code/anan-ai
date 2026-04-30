import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import { uploadthingFiles } from "../../uploadthing";
import { requireOrganizationMembership } from "../agencies/repositories/membership";
import { getOwnerId } from "../agencies/repositories/core";

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
  sha256: v.string(),
});

const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
type AllowedUploadMimeType = "image/jpeg" | "image/png" | "image/webp" | "application/pdf";

const TRUSTED_UPLOAD_HOST_SUFFIXES = [
  "ufs.sh",
  "utfs.io",
  "uploadthing.com",
];

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

function isTrustedUploadUrl(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return parsed.protocol === "https:" && TRUSTED_UPLOAD_HOST_SUFFIXES.some((host) => (
    parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
  ));
}

function assertTrustedUpload(args: {
  category: "propertyMedia" | "offerAttachments" | "crmDocuments" | "verificationDocuments";
  file: { key: string; url: string; name: string; size?: number; mime?: string; sha256: string };
}) {
  if (!args.file.key.trim() || args.file.key.length > 512) {
    throw new ConvexError({ code: "INVALID_UPLOAD", message: "Upload key is invalid" });
  }
  if (!isTrustedUploadUrl(args.file.url)) {
    throw new ConvexError({ code: "INVALID_UPLOAD", message: "Upload URL is not trusted" });
  }
  if (!args.file.name.trim() || args.file.name.length > 180) {
    throw new ConvexError({ code: "INVALID_UPLOAD", message: "Upload name is invalid" });
  }
  if (typeof args.file.size === "number" && (!Number.isFinite(args.file.size) || args.file.size < 0 || args.file.size > 32 * 1024 * 1024)) {
    throw new ConvexError({ code: "INVALID_UPLOAD", message: "Upload size is invalid" });
  }
  if (!args.file.mime || !ALLOWED_UPLOAD_MIME_TYPES.has(args.file.mime)) {
    throw new ConvexError({ code: "INVALID_UPLOAD", message: "Upload MIME type is not allowed" });
  }
  if (args.category === "propertyMedia" && args.file.mime === "application/pdf") {
    throw new ConvexError({ code: "INVALID_UPLOAD", message: "Property media must be an image" });
  }
  if (!/^[a-f0-9]{64}$/u.test(args.file.sha256)) {
    throw new ConvexError({ code: "INVALID_UPLOAD", message: "Upload checksum is invalid" });
  }
}

function resolveAssetKind(mimeType: string) {
  if (mimeType === "application/pdf") return "pdf" as const;
  if (mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp") return "image" as const;
  throw new ConvexError({ code: "INVALID_UPLOAD", message: "Upload MIME type is not allowed" });
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
    assertTrustedUpload(args);

    const folder = `tenant:${owner.tenantOrgId}`;
    const size = args.file.size ?? 0;
    const mimeType = args.file.mime as AllowedUploadMimeType | undefined;
    if (!mimeType) {
      throw new ConvexError({ code: "INVALID_UPLOAD", message: "Upload MIME type is required" });
    }

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
          sha256: args.file.sha256,
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
      sha256: args.file.sha256,
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
