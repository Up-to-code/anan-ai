import { ConvexError } from "convex/values";
import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "../../../_generated/api";
import type { MutationCtx } from "../../../_generated/server";

const rateLimiter = new RateLimiter(components.rateLimiter, {
  httpIngressPerKey: {
    kind: "token bucket",
    rate: 30,
    period: MINUTE,
    capacity: 60,
  },
});

export async function enforceHttpRateLimit(
  ctx: MutationCtx,
  params: { key: string; count?: number },
): Promise<void> {
  const key = params.key.trim();
  if (!key) {
    throw new ConvexError({ code: "RATE_LIMIT_KEY_REQUIRED", message: "Rate limit key is required" });
  }

  const status = await rateLimiter.limit(ctx, "httpIngressPerKey", {
    key,
    count: params.count ?? 1,
  });

  if (!status.ok) {
    throw new ConvexError({
      code: "RATE_LIMITED",
      message: "Too many requests",
      retryAfter: status.retryAfter,
    });
  }
}
