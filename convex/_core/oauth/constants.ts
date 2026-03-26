import {
  OAUTH_SCOPE_CATALOG,
  OAUTH_SCOPE_IDS,
  type OrganizationOAuthScopeId,
} from "../../../shared/auth/organizationPermissions";

/**
 * WHY:   OAuth scopes and token lifetimes must stay centralized to keep auth behavior consistent.
 * WHAT:  Defines the supported v1 delegated scopes, display labels, and security-related TTLs.
 * HOW:   Shared by HTTP handlers, consent UI queries, token issuance, and delegated resource guards.
 */
export const OAUTH_SCOPE_REGISTRY = OAUTH_SCOPE_IDS;

export type OAuthScope = OrganizationOAuthScopeId;

export const OAUTH_SCOPE_LABELS: Record<OAuthScope, string> = Object.fromEntries(
  OAUTH_SCOPE_CATALOG.map((scope) => [scope.id, scope.label]),
) as Record<OAuthScope, string>;

export const OAUTH_CONSENT_VERSION = 1;
export const AUTHORIZATION_CODE_TTL_MS = 10 * 60 * 1000;
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const FLOW_STATE_TTL_MS = 10 * 60 * 1000;

/**
 * WHY:   Scope parsing must deduplicate and reject unsupported values before persistence.
 * WHAT:  Normalizes a raw scope string or array into a unique sorted scope list.
 * HOW:   Trims values, filters empties, and only keeps scopes from the fixed registry.
 */
export function normalizeRequestedScopes(input: string | string[] | undefined): OAuthScope[] {
  const raw = Array.isArray(input)
    ? input.flatMap((value) => value.split(/\s+/))
    : (input ?? "").split(/\s+/);
  const supported = new Set<OAuthScope>(OAUTH_SCOPE_REGISTRY);
  return [...new Set(raw.map((value) => value.trim()).filter(Boolean))]
    .filter((value): value is OAuthScope => supported.has(value as OAuthScope))
    .sort() as OAuthScope[];
}

/**
 * WHY:   Consent comparisons need a stable way to detect newly requested scopes.
 * WHAT:  Returns the scopes that are requested now but were not previously granted.
 * HOW:   Uses a set lookup against the stored authorization scope list.
 */
export function diffScopes(
  requestedScopes: readonly string[],
  grantedScopes: readonly string[],
): string[] {
  const granted = new Set(grantedScopes);
  return requestedScopes.filter((scope) => !granted.has(scope));
}

/**
 * WHY:   HTTP handlers and DB services both need a compact scope string for tokens.
 * WHAT:  Converts a scope list into the RFC-style space-delimited representation.
 * HOW:   Joins scopes using a single space after normalizing ordering upstream.
 */
export function formatScopeString(scopes: readonly string[]): string {
  return scopes.join(" ");
}
