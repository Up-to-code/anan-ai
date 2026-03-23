/**
 * WHY:   Auth redirects should never bounce users to arbitrary external URLs.
 * WHAT:  Normalizes a requested return path into a safe internal route.
 * HOW:   Accepts only local absolute paths and falls back to `/app` for anything unsafe.
 */
export function sanitizeInternalReturnTo(returnTo?: string | null, fallback = "/app") {
  if (!returnTo) return fallback;
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return fallback;
  if (returnTo.startsWith("/signin")) return fallback;
  return returnTo;
}
