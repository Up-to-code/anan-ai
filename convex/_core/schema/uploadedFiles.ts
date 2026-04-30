import { v } from "convex/values";
import {
  positiveFileSizeValidator,
  sha256HexValidator,
  trustedUploadUrlValidator,
  verifiedUploadMimeValidator,
} from "./securityValidators";

/**
 * WHY:   `_core/schema/*` must stay independent from shared_logic to avoid cross-zone coupling.
 * WHAT:  Reusable Convex validators for UploadThing-backed file references used by multiple tables.
 * HOW:   Defines the shape once, then schemas import it directly from `_core`.
 */
export const legacyUploadedFileReferenceValidator = v.object({
  key: v.string(),
  url: v.string(),
  name: v.string(),
  size: v.optional(v.number()),
  mime: v.optional(v.string()),
  sha256: v.optional(v.string()),
});

export const verifiedUploadedFileReferenceValidator = v.object({
  key: v.string(),
  url: trustedUploadUrlValidator,
  name: v.string(),
  size: positiveFileSizeValidator,
  mime: verifiedUploadMimeValidator,
  sha256: sha256HexValidator,
  visibilityScope: v.union(
    v.literal("organization"),
    v.literal("project_private_share"),
    v.literal("public_project"),
  ),
});

export const uploadedFileReferenceValidator = v.union(
  verifiedUploadedFileReferenceValidator,
  legacyUploadedFileReferenceValidator,
);

export const uploadedFileReferenceListValidator = v.array(uploadedFileReferenceValidator);
