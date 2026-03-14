import { getOptionalSessionContext } from "@/server/auth/session";
import { toSessionUser } from "@/server/contracts/session";

export type { SessionUser } from "@/server/contracts/session";

/**
 * WHY:   Workspace and public layouts need one lightweight auth lookup for chrome-level decisions.
 * WHAT:  Returns the current token, projected user, and resolved role when a session exists.
 * HOW:   Reuses the optional session resolver and narrows the payload for UI callers.
 */
export async function getAuthenticatedSession() {
  const session = await getOptionalSessionContext();
  if (!session) {
    return { token: null, user: null, role: null };
  }

  return {
    token: session.token,
    user: toSessionUser(session.context),
    role: session.context.role ?? null,
  };
}

export function sanitizeInternalReturnTo(returnTo?: string | null, fallback = "/ws") {
  if (!returnTo) {
    return fallback;
  }

  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return fallback;
  }

  if (returnTo.startsWith("/signin")) {
    return fallback;
  }

  return returnTo;
}

export function buildWorkspaceSecurityAppsPath(clientId?: string) {
  const base = "/ws/me/security/apps";
  return clientId ? `${base}/${encodeURIComponent(clientId)}` : base;
}
