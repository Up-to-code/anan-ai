import { v } from "convex/values";

/**
 * WHY:   `_core/schema/*` must stay independent from shared_logic to avoid cross-zone coupling.
 * WHAT:  Reusable Convex validators for UploadThing-backed file references used by multiple tables.
 * HOW:   Defines the shape once, then schemas import it directly from `_core`.
 */
export const uploadedFileReferenceValidator = v.object({
  key: v.string(),
  url: v.string(),
  name: v.string(),
  size: v.optional(v.number()),
  mime: v.optional(v.string()),
});

export const uploadedFileReferenceListValidator = v.array(uploadedFileReferenceValidator);

