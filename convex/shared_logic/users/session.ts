import { query } from "../../_generated/server";

export const getSessionUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("authUserId", (q) => q.eq("authUserId", identity.subject))
            .first();
        const activeFlag = (profile as { isActive?: boolean } | null)?.isActive;
        if (activeFlag === false) {
            return null;
        }

        // Match the Better Auth session user structure expected by the frontend
        return {
            id: identity.subject,
            name: identity.name,
            email: identity.email,
            image: identity.pictureUrl,
            isActive: true,
            // ... role is pulled separately on the frontend via useRole ...
        };
    },
});
