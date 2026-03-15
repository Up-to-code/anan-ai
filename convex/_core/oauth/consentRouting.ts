const SOURCE_APPS = ["web", "admin", "mobile"] as const;

export type OAuthSourceApp = typeof SOURCE_APPS[number];

function normalizeBaseUrl(value?: string | null) {
  const trimmed = value?.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * WHY:   OAuth consent routing must honor the app that initiated authorization.
 * WHAT:  Normalizes the requested source app and validates it against the allowlist.
 * HOW:   Accepts only known app values and returns null for unknown or missing inputs.
 */
export function parseOAuthSourceApp(value?: string | null): OAuthSourceApp | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return SOURCE_APPS.includes(normalized as OAuthSourceApp) ? (normalized as OAuthSourceApp) : null;
}

/**
 * WHY:   The OAuth authorize endpoint must redirect users into the right app for consent.
 * WHAT:  Resolves the consent UI base URL for the requested source app.
 * HOW:   Uses app-specific env vars with a web fallback and the request origin as the final default.
 */
export function resolveOAuthConsentBaseUrl(request: Request, sourceApp: OAuthSourceApp | null) {
  const requestOrigin = new URL(request.url).origin;
  const webBaseUrl =
    normalizeBaseUrl(process.env.ANAN_WEB_URL ?? process.env.SITE_URL ?? requestOrigin) ?? requestOrigin;
  const adminBaseUrl = normalizeBaseUrl(process.env.ANAN_ADMIN_URL) ?? webBaseUrl;
  const mobileBaseUrl = normalizeBaseUrl(process.env.ANAN_MOBILE_URL) ?? webBaseUrl;

  if (sourceApp === "admin") {
    return adminBaseUrl;
  }

  if (sourceApp === "mobile") {
    return mobileBaseUrl;
  }

  return webBaseUrl;
}
