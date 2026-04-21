import { query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";

/**
 * WHY:   Web and mobile clients need one provider-neutral way to read the authenticated Better Auth user.
 * WHAT:  Returns the current Better Auth user document when the Convex auth token is valid.
 * HOW:   Delegates to the Better Auth Convex component, returning null for signed-out callers.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return (await authComponent.safeGetAuthUser(ctx)) ?? null;
  },
});
