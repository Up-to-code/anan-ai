type ClerkEnvSources = {
  expoPublicClerkPublishableKey?: string | null;
  clerkPublishableKey?: string | null;
};

type ConvexEnvSources = {
  expoPublicConvexUrl?: string | null;
};

function normalizeEnvValue(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

/**
 * WHY:   Mobile auth setup should prefer Expo's public env contract while preserving a local compatibility fallback.
 * WHAT:  Resolves the Clerk publishable key from the supported mobile env sources.
 * HOW:   Prefers EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY, then falls back to CLERK_PUBLISHABLE_KEY exposed through app config.
 */
export function resolveClerkPublishableKey(sources: ClerkEnvSources) {
  return normalizeEnvValue(sources.expoPublicClerkPublishableKey) ?? normalizeEnvValue(sources.clerkPublishableKey);
}

/**
 * WHY:   Mobile buyer routes must not boot unless a valid public Convex URL is configured.
 * WHAT:  Resolves the supported mobile Convex URL from Expo public env.
 * HOW:   Trims the raw value, validates the URL shape, and normalizes the trailing slash away.
 */
export function resolveConvexUrl(sources: ConvexEnvSources) {
  const candidate = normalizeEnvValue(sources.expoPublicConvexUrl);
  if (!candidate) return null;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}
