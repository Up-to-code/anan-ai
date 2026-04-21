import { resolveConvexSiteUrl, resolveConvexUrl } from "@/lib/mobileEnv.shared";

/**
 * WHY:   The shipped mobile app should block cleanly when the required Convex backend is missing or malformed.
 * WHAT:  Returns the mobile backend readiness state derived from EXPO_PUBLIC_CONVEX_URL and EXPO_PUBLIC_CONVEX_SITE_URL.
 * HOW:   Validates the raw env value and exposes a stable reason for the global blocking screen.
 */
export function getMobileBackendReadiness() {
  const rawConvexUrl = process.env.EXPO_PUBLIC_CONVEX_URL?.trim() ?? "";
  const convexUrl = resolveConvexUrl({
    expoPublicConvexUrl: process.env.EXPO_PUBLIC_CONVEX_URL,
  });
  const convexSiteUrl = resolveConvexSiteUrl({
    expoPublicConvexUrl: process.env.EXPO_PUBLIC_CONVEX_URL,
    expoPublicConvexSiteUrl: process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
  });

  return {
    convexUrl,
    convexSiteUrl,
    isReady: Boolean(convexUrl && convexSiteUrl),
    reason: convexUrl ? (convexSiteUrl ? null : ("missing_convex_site_url" as const)) : rawConvexUrl ? ("invalid_convex_url" as const) : ("missing_convex_url" as const),
  };
}

/**
 * WHY:   The mobile chat transport needs one stable helper to resolve the Convex-hosted stream endpoint.
 * WHAT:  Returns the OpenAI-compatible base path for the mobile assistant stream.
 * HOW:   Builds the route from the validated public Convex site URL and trims trailing slashes for client-safe concatenation.
 */
export function getMobileAssistantStreamBaseUrl() {
  const convexSiteUrl = resolveConvexSiteUrl({
    expoPublicConvexUrl: process.env.EXPO_PUBLIC_CONVEX_URL,
    expoPublicConvexSiteUrl: process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
  });

  if (!convexSiteUrl) return null;
  return `${convexSiteUrl}/api/mobile/assistant/stream`;
}
