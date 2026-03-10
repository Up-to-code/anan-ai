import { v } from "convex/values";
import { internalMutation } from "../../../_generated/server";
import { enforceHttpRateLimit } from "../../lib/middleware/rateLimit";

/**
 * WHY:   OAuth endpoints are attractive brute-force targets and need centralized throttling.
 * WHAT:  Applies the shared HTTP token-bucket limiter to an OAuth-specific key.
 * HOW:   Delegates to the repo-wide rate-limit middleware so auth routes reuse the same protection primitive.
 */
export const enforceOAuthRateLimit = internalMutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    await enforceHttpRateLimit(ctx, { key: args.key });
    return { ok: true } as const;
  },
});
