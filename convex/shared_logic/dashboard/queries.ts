import { query } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Get the user profile which contains the brokerId and REDId links for an authenticated user.
 */
export const getUserProfile = query({
    args: { authUserId: v.string() },
    handler: async (ctx, { authUserId }) => {
        if (!authUserId) return null;
        return await ctx.db
            .query("userProfiles")
            .withIndex("authUserId", (q) => q.eq("authUserId", authUserId))
            .first();
    },
});

/**
 * Get a specific Broker record.
 */
export const getBroker = query({
    args: { brokerId: v.union(v.id("brokers"), v.null()) },
    handler: async (ctx, { brokerId }) => {
        if (!brokerId) return null;
        return await ctx.db.get(brokerId);
    },
});

/**
 * Get a specific Real Estate Developer (RED) record.
 */
export const getRED = query({
    args: { redId: v.union(v.id("RED"), v.null()) },
    handler: async (ctx, { redId }) => {
        if (!redId) return null;
        return await ctx.db.get(redId);
    },
});
/**
 * List all active Brokers.
 */
export const listBrokers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("brokers")
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();
    },
});

/**
 * List all active Real Estate Developers.
 */
export const listREDs = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("RED")
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();
    },
});

/**
 * Get unified property detail with ownership check.
 */
export const getPropertyDetail = query({
    args: { id: v.id("properties") },
    handler: async (ctx, { id }) => {
        const identity = await ctx.auth.getUserIdentity();
        const property = await ctx.db.get(id);
        if (!property) return null;

        if (!identity) return { ...property, isOwner: false };

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("authUserId", (q) => q.eq("authUserId", identity.subject))
            .first();

        const isOwner = (property.brokerId && property.brokerId === profile?.brokerId) ||
            (property.REDId && property.REDId === profile?.REDId);

        return { ...property, isOwner };
    },
});
