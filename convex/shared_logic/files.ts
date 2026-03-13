import { v } from "convex/values";

/**
 * WHY:   Property, offer, and CRM persistence now share one uploaded-file metadata shape.
 * WHAT:  Exports reusable Convex validators for UploadThing-backed file references.
 * HOW:   Keeps the database schema aligned with the web contract while avoiding per-table duplication.
 */
export const uploadedFileReferenceValidator = v.object({
  key: v.string(),
  url: v.string(),
  name: v.string(),
  size: v.optional(v.number()),
  mime: v.optional(v.string()),
});

export const uploadedFileReferenceListValidator = v.array(uploadedFileReferenceValidator);
