import { v } from "convex/values";
import { internalAction } from "../../_generated/server";

function resolveDistinctId(
  providedDistinctId: string | undefined,
  properties: Record<string, unknown>,
) {
  if (providedDistinctId?.trim()) return providedDistinctId.trim();

  const userId = properties.userId;
  if (typeof userId === "string" && userId.trim()) return userId.trim();

  const threadId = properties.threadId;
  if (typeof threadId === "string" && threadId.trim()) return `thread:${threadId.trim()}`;

  const orderId = properties.orderId;
  if (typeof orderId === "string" && orderId.trim()) return `order:${orderId.trim()}`;

  const propertyId = properties.propertyId;
  if (typeof propertyId === "string" && propertyId.trim()) return `property:${propertyId.trim()}`;

  return undefined;
}

/**
 * WHY:   Convex actions and mutations need one safe bridge to emit backend analytics without duplicating fetch logic.
 * WHAT:  Sends a PostHog event using the env-configured project token and ingestion host.
 * HOW:   Resolves a stable distinct id, posts a minimal JSON payload, and swallows failures so product flows never break.
 */
export const captureEvent = internalAction({
  args: {
    event: v.string(),
    distinctId: v.optional(v.string()),
    properties: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim();
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
    if (!token || !host) return null;

    const properties =
      args.properties && typeof args.properties === "object" && !Array.isArray(args.properties)
        ? { ...(args.properties as Record<string, unknown>) }
        : {};

    const distinctId = resolveDistinctId(args.distinctId, properties);
    if (!distinctId) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    try {
      await fetch(`${host.replace(/\/$/, "")}/capture/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: token,
          event: args.event,
          distinct_id: distinctId,
          properties: {
            ...properties,
            distinct_id: distinctId,
            source: "convex",
          },
        }),
        signal: controller.signal,
      });
    } catch (error) {
      console.warn("[posthog] Backend capture failed (non-critical):", error);
    } finally {
      clearTimeout(timeout);
    }

    return null;
  },
});
