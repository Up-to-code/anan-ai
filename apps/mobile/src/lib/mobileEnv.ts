import Constants from "expo-constants";
import { resolveClerkPublishableKey, resolveConvexUrl } from "@/lib/mobileEnv.shared";

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

  return {
    convexUrl,
    isReady: Boolean(convexUrl),
    reason: convexUrl ? null : rawConvexUrl ? ("invalid_convex_url" as const) : ("missing_convex_url" as const),
  };
}
