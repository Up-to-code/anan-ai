import { actionRef, queryRef } from "@anan/convex-adapters/repository";
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
    return queryRef<Awaited<ReturnType<OAuthRepository["getAuthorizationPrompt"]>>>(
      token,
      oauthApi.getAuthorizationPrompt,
      { flowId, tenantOrgId },
    );
  },

  async approveAuthorization(token, flowId, tenantOrgId) {
    return actionRef<Awaited<ReturnType<OAuthRepository["approveAuthorization"]>>>(
      token,
      oauthApi.approveAuthorization,
      { flowId, tenantOrgId },
    );
  },

  async listAuthorizedApps(token) {
    return queryRef<Awaited<ReturnType<OAuthRepository["listAuthorizedApps"]>>>(token, oauthApi.listAuthorizedApps);
  },

  async getAuthorizedAppDetail(token, clientId) {
    return queryRef<Awaited<ReturnType<OAuthRepository["getAuthorizedAppDetail"]>>>(
      token,
      oauthApi.getAuthorizedAppDetail,
      { clientId },
    );
  },

  async revokeAuthorizedApp(token, clientId) {
    await actionRef(token, oauthApi.revokeAuthorizedApp, { clientId });
  },
};
