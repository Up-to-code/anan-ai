import {
  projectAuthenticatedSession,
  sanitizeInternalReturnTo as sanitizeReturnTo,
} from "@anan/web-foundation/auth-session";
import { getOptionalSessionContext } from "@/server/auth/session";

export type { SessionUser } from "@/server/contracts/session";

export function getAuthenticatedSession() {
  return projectAuthenticatedSession(getOptionalSessionContext);
}

export function sanitizeInternalReturnTo(returnTo?: string | null, fallback = "/ws") {
  return sanitizeReturnTo(returnTo, fallback);
}

export function buildWorkspaceSecurityAppsPath(clientId?: string) {
  const base = "/ws/me/security/apps";
  return clientId ? `${base}/${encodeURIComponent(clientId)}` : base;
}

export function buildWorkspaceOrganizationAppsPath(source?: "legacy-account-apps") {
  const params = new URLSearchParams({ tab: "apps" });
  if (source) {
    params.set("source", source);
  }
  return `/ws/settings?${params.toString()}`;
}
