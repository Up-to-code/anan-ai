type ConvexEnvSources = {
  expoPublicConvexUrl?: string | null;
  expoPublicConvexSiteUrl?: string | null;
};

function normalizeEnvValue(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
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

/**
 * WHY:   Mobile streaming routes need the public Convex site origin rather than the query websocket origin.
 * WHAT:  Resolves the supported mobile Convex site URL from Expo public env or the main Convex URL.
 * HOW:   Prefers EXPO_PUBLIC_CONVEX_SITE_URL and otherwise derives the `.convex.site` host from the configured Convex URL.
 */
export function resolveConvexSiteUrl(sources: ConvexEnvSources) {
  const explicitSiteUrl = normalizeEnvValue(sources.expoPublicConvexSiteUrl);
  if (explicitSiteUrl) {
    try {
      const parsed = new URL(explicitSiteUrl);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        return null;
      }
      return parsed.toString().replace(/\/$/, "");
    } catch {
      return null;
    }
  }

  const convexUrl = resolveConvexUrl(sources);
  if (!convexUrl) return null;

  try {
    const parsed = new URL(convexUrl);
    parsed.hostname = parsed.hostname.replace(/\.convex\.cloud$/u, ".convex.site");
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}
