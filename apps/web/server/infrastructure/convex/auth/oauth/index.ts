import { fetchAction, fetchQuery } from "convex/nextjs";
import { oauthApi } from "./api";
import type { OAuthRepository } from "./types";

export type { OAuthRepository } from "./types";

/**
 * WHY:   OAuth pages should use the same repository abstraction as the rest of the web server layer.
 * WHAT:  Convex-backed OAuth repository for the web-facing consent and connected-app flows.
 * HOW:   Delegates to the current thin public Convex OAuth entrypoints with the authenticated session token.
 */
export const convexOAuthRepository: OAuthRepository = {
  async getAuthorizationPrompt(token, flowId, tenantOrgId) {
    return fetchQuery(
      oauthApi.getAuthorizationPrompt as never,
      { flowId: flowId as never, tenantOrgId: tenantOrgId as never } as never,
      { token },
    ) as ReturnType<OAuthRepository["getAuthorizationPrompt"]>;
  },

  async approveAuthorization(token, flowId, tenantOrgId) {
    return fetchAction(
      oauthApi.approveAuthorization as never,
      { flowId: flowId as never, tenantOrgId: tenantOrgId as never } as never,
      { token },
    ) as ReturnType<OAuthRepository["approveAuthorization"]>;
  },

  async listAuthorizedApps(token) {
    return fetchQuery(oauthApi.listAuthorizedApps as never, {} as never, { token }) as ReturnType<OAuthRepository["listAuthorizedApps"]>;
  },

  async getAuthorizedAppDetail(token, clientId) {
    return fetchQuery(oauthApi.getAuthorizedAppDetail as never, { clientId } as never, { token }) as ReturnType<OAuthRepository["getAuthorizedAppDetail"]>;
  },

  async revokeAuthorizedApp(token, clientId) {
    await fetchAction(oauthApi.revokeAuthorizedApp as never, { clientId } as never, { token });
  },
};
