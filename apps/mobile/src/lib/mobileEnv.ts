import Constants from "expo-constants";
import { resolveClerkPublishableKey, resolveConvexSiteUrl, resolveConvexUrl } from "@/lib/mobileEnv.shared";

/**
 * WHY:   Missing mobile auth env should fail with a repo-specific fix message instead of Clerk's generic runtime error.
 * WHAT:  Returns the resolved Clerk publishable key or throws a descriptive setup error.
 * HOW:   Reads Expo public env first, then checks the legacy key passed through Expo config extra.
 */
export function getMobileClerkPublishableKey() {
  const configExtra = Constants.expoConfig?.extra ?? {};
  const legacyClerkPublishableKey =
    typeof configExtra.clerkPublishableKey === "string" ? configExtra.clerkPublishableKey : null;

  const publishableKey = resolveClerkPublishableKey({
    expoPublicClerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    clerkPublishableKey: legacyClerkPublishableKey,
  });

  if (!publishableKey) {
    throw new Error(
      "Missing Clerk publishable key for apps/mobile. Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in the repo root .env.local. " +
        "For local compatibility, CLERK_PUBLISHABLE_KEY is also supported.",
    );
  }

  return publishableKey;
}

/**
 * WHY:   The shipped mobile app should block cleanly when the required Convex backend is missing or malformed.
 * WHAT:  Returns the mobile backend readiness state derived from EXPO_PUBLIC_CONVEX_URL.
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
    isReady: Boolean(convexUrl),
    reason: convexUrl ? null : rawConvexUrl ? ("invalid_convex_url" as const) : ("missing_convex_url" as const),
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
