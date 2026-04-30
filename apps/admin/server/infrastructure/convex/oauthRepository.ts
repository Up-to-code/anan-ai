import { createRepositoryRefs, actionRef, queryRef } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";
import type { OAuthApprovalResult, OAuthAuthorizationPrompt } from "@/server/contracts/oauth";

type OAuthApiRefs = {
  getAuthorizationPrompt: unknown;
  approveAuthorization: unknown;
};

const oauthApi = createRepositoryRefs<OAuthApiRefs>(apiUnsafe, "shared_logic/oauth/index");

export type OAuthRepository = {
  getAuthorizationPrompt(token: string, flowId: string): Promise<OAuthAuthorizationPrompt>;
  approveAuthorization(token: string, flowId: string): Promise<OAuthApprovalResult>;
};

/**
 * WHY:   Admin OAuth pages should use the same repository abstraction as the rest of the admin server layer.
 * WHAT:  Convex-backed OAuth repository for admin consent workflows.
 * HOW:   Delegates to the shared OAuth Convex entrypoints with the authenticated admin token.
 */
export const convexOAuthRepository: OAuthRepository = {
  async getAuthorizationPrompt(token, flowId) {
    return queryRef<OAuthAuthorizationPrompt>(token, oauthApi.getAuthorizationPrompt, { flowId });
  },

  async approveAuthorization(token, flowId) {
    return actionRef<OAuthApprovalResult>(token, oauthApi.approveAuthorization, { flowId });
  },
};
