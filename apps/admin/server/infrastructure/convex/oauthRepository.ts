import { fetchAction, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type { OAuthApprovalResult, OAuthAuthorizationPrompt } from "@/server/contracts/oauth";

type OAuthApiRefs = {
  getAuthorizationPrompt: unknown;
  approveAuthorization: unknown;
};

const oauthApi = apiUnsafe["shared_logic/oauth/index"] as OAuthApiRefs;

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
    return fetchQuery(oauthApi.getAuthorizationPrompt as never, { flowId: flowId as never } as never, { token }) as Promise<OAuthAuthorizationPrompt>;
  },

  async approveAuthorization(token, flowId) {
    return fetchAction(oauthApi.approveAuthorization as never, { flowId: flowId as never } as never, { token }) as Promise<OAuthApprovalResult>;
  },
};
