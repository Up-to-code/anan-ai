import { getOptionalSessionContext } from "@/server/auth/session";
import { toSessionUser } from "@/server/contracts/session";
import { redirect } from "next/navigation";

export type { SessionUser } from "@/server/contracts/session";

function isAuthConfigurationError(error: unknown) {
  return Boolean(
    error
    && typeof error === "object"
    && "code" in error
    && error.code === "AUTH_CONFIGURATION_ERROR",
  );
}

/**
 * WHY:   Admin layouts and route guards need one lightweight auth lookup for chrome-level decisions.
 * WHAT:  Returns the current token, projected user, and resolved role when a session exists.
 * HOW:   Reuses the optional session resolver and narrows the payload for UI callers.
 */
export async function getAuthenticatedSession() {
  let session;
  try {
    session = await getOptionalSessionContext();
  } catch (error) {
    if (isAuthConfigurationError(error)) {
      return { token: null, user: null, role: null };
    }
    throw error;
  }
  if (!session) {
    return { token: null, user: null, role: null };
  }

  return {
    token: session.token,
    user: toSessionUser(session.context),
    role: session.context.role ?? null,
    isAdmin: session.context.isAdmin ?? false,
  };
}

/**
 * WHY:   Server-rendered admin pages should redirect cleanly to sign-in instead of throwing auth errors during parallel rendering.
 * WHAT:  Resolves the current admin session or redirects to the admin sign-in page.
 * HOW:   Reuses the lightweight authenticated-session lookup, then redirects when the session is missing or not admin.
 */
export async function requireAdminPageSession(returnTo = "/overview") {
  const session = await getAuthenticatedSession();

  if (!session.token || !session.user || !session.isAdmin) {
    redirect(`/signin?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return session;
}

/**
 * WHY:   Sign-in redirects should never bounce users to unsafe or irrelevant targets.
 * WHAT:  Sanitizes an internal return path for admin redirects.
 * HOW:   Accepts only local paths and strips sign-in loops.
 */
export function sanitizeInternalReturnTo(returnTo?: string | null, fallback = "/overview") {
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
