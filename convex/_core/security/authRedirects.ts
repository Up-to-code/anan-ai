/**
 * WHY:   Auth redirects must stay environment-safe while supporting local development defaults.
 * WHAT:  Helpers for normalizing base URLs and resolving allowed redirect origins.
 * HOW:   Normalizes inputs, merges optional allowlist envs, and adds localhost defaults outside production.
 */

export type AllowedOriginsOptions = {
  webBaseUrl: string | null;
  allowedOriginsEnv?: string | null;
  extraOrigins?: Array<string | null | undefined>;
  nodeEnv?: string | null;
  vercelEnv?: string | null;
};

/**
 * WHY:   Redirect origin comparison needs consistent URL shapes.
 * WHAT:  Normalizes a base URL by trimming, stripping trailing slashes, and ensuring a protocol.
 * HOW:   Treats bare domains as HTTPS and returns null for empty values.
 */
export function normalizeBaseUrl(value?: string | null) {
  const trimmed = value?.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * WHY:   Auth redirects should never default to production when running locally.
 * WHAT:  Builds the allowed redirect origins list from configured envs and safe defaults.
 * HOW:   Combines web base, optional extra origins, explicit allowlist, and appends localhost for non-production.
 */
export function resolveAllowedOrigins(options: AllowedOriginsOptions): string[] {
  const origins = new Set<string>();
  const isProduction =
    options.nodeEnv === "production" || options.vercelEnv === "production";

  if (options.webBaseUrl) {
    origins.add(options.webBaseUrl);
  }

  const extraOrigins = (options.extraOrigins ?? [])
    .map((entry) => normalizeBaseUrl(entry))
    .filter((entry): entry is string => Boolean(entry));

  for (const entry of extraOrigins) {
    origins.add(entry);
  }

  const allowlistOrigins = (options.allowedOriginsEnv ?? "")
    .split(",")
    .map((entry) => normalizeBaseUrl(entry))
    .filter((entry): entry is string => Boolean(entry));

  for (const entry of allowlistOrigins) {
    origins.add(entry);
  }

  if (!isProduction) {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
    origins.add("http://localhost:3001");
    origins.add("http://127.0.0.1:3001");
  }

  return Array.from(origins);
}
