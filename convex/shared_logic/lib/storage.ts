import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Generate a pre-signed URL for uploading a file to Convex storage.
 */
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

/**
 * Get the public URL for a given storageId.
 */
export const getUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, { storageId }) => {
        return await ctx.storage.getUrl(storageId);
    },
});
