import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

function normalizeUrl(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/$/u, "") : null;
}

function deriveConvexSiteUrl(convexUrl: string | null) {
  if (!convexUrl) {
    return null;
  }

  try {
    const parsed = new URL(convexUrl);
    parsed.hostname = parsed.hostname.replace(/\.convex\.cloud$/u, ".convex.site");
    return parsed.toString().replace(/\/$/u, "");
  } catch {
    return null;
  }
}

const convexUrl = normalizeUrl(process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL)
  ?? "http://localhost:3210";
const convexSiteUrl = normalizeUrl(process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? process.env.CONVEX_SITE_URL)
  ?? deriveConvexSiteUrl(convexUrl)
  ?? "http://localhost:3211";

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl,
  convexSiteUrl,
});
