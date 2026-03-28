const LOCAL_DEV_URL = "http://localhost:3000";

function normalizeAbsoluteUrl(value?: string | null) {
  if (!value?.trim()) return null;

  const normalized = value.trim().startsWith("http") ? value.trim() : `https://${value.trim()}`;

  try {
    return new URL(normalized);
  } catch {
    return null;
  }
}

/**
 * WHY:   Metadata and SEO routes need one canonical public origin across local and hosted environments.
 * WHAT:  Resolves the client web base URL from deployment env vars with a localhost fallback.
 * HOW:   Prefers explicit site env vars, then Vercel hostnames, and finally local development.
 */
export function getClientWebBaseUrl() {
  return (
    normalizeAbsoluteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeAbsoluteUrl(process.env.SITE_URL) ??
    normalizeAbsoluteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeAbsoluteUrl(process.env.VERCEL_URL) ??
    new URL(LOCAL_DEV_URL)
  );
}
