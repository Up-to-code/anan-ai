import { internalMutation, internalQuery } from "../../_generated/server";
import { v } from "convex/values";

/**
 * WHY:   Generic storage upload URLs should only be issued to trusted server-side callers.
 * WHAT:  Generates a pre-signed URL for uploading a file to Convex storage.
 * HOW:   Exposes `ctx.storage.generateUploadUrl()` as an internal-only mutation.
 */
export const generateUploadUrl = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * WHY:   Generic storage URL lookups are infrastructure helpers and should stay off the public API surface.
 * WHAT:  Returns the public URL for a given storage id.
 * HOW:   Exposes `ctx.storage.getUrl()` as an internal-only query.
 */
export const getUrl = internalQuery({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});
