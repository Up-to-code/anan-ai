import { normalizeBaseUrl } from "./authRedirects";

type ResolveIssuerOptions = {
  env?: Record<string, string | undefined>;
  allowTestDefault?: boolean;
};

const TEST_CONVEX_ISSUER = "https://test.convex.site";
const EXAMPLE_CONVEX_ISSUER = "https://example.convex.site";

/**
 * WHY:   Convex token verification must use one deterministic issuer resolver across runtime and auth config.
 * WHAT:  Resolves and validates the Convex auth issuer domain from environment.
 * HOW:   Normalizes `CONVEX_SITE_URL`, blocks placeholder domains, and only falls back in test mode.
 */
export function resolveConvexAuthIssuer(options: ResolveIssuerOptions = {}): string {
  const env = options.env ?? process.env;
  const normalized = normalizeBaseUrl(env.CONVEX_SITE_URL);

  if (normalized && normalized !== EXAMPLE_CONVEX_ISSUER) {
    return normalized;
  }

  const isTest = env.NODE_ENV === "test";
  if (isTest && options.allowTestDefault !== false) {
    return TEST_CONVEX_ISSUER;
  }

  throw new Error(
    "CONVEX_SITE_URL must be set to the active Convex deployment URL for auth issuer verification.",
  );
}

