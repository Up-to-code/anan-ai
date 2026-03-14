import { fetchAction, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type {
  OAuthApprovalResult,
  OAuthAuthorizationPrompt,
  OAuthAuthorizedAppDetail,
  OAuthAuthorizedAppSummary,
} from "@/server/contracts/oauth";

type OAuthApiRefs = {
  getAuthorizationPrompt: unknown;
  approveAuthorization: unknown;
  listAuthorizedApps: unknown;
  getAuthorizedAppDetail: unknown;
  revokeAuthorizedApp: unknown;
};

const oauthApi = (apiUnsafe["shared_logic/oauth/index"]) as OAuthApiRefs;

export type OAuthRepository = {
  getAuthorizationPrompt(token: string, flowId: string): Promise<OAuthAuthorizationPrompt>;
  approveAuthorization(token: string, flowId: string): Promise<OAuthApprovalResult>;
  listAuthorizedApps(token: string): Promise<OAuthAuthorizedAppSummary[]>;
  getAuthorizedAppDetail(token: string, clientId: string): Promise<OAuthAuthorizedAppDetail | null>;
  revokeAuthorizedApp(token: string, clientId: string): Promise<void>;
};

/**
 * WHY:   OAuth pages should use the same repository abstraction as the rest of the web server layer.
 * WHAT:  Convex-backed OAuth repository for the web-facing consent and connected-app flows.
 * HOW:   Delegates to the current thin public Convex OAuth entrypoints with the authenticated session token.
 */
export const convexOAuthRepository: OAuthRepository = {
  async getAuthorizationPrompt(token, flowId) {
    return fetchQuery(oauthApi.getAuthorizationPrompt as never, { flowId: flowId as never } as never, { token }) as Promise<OAuthAuthorizationPrompt>;
  },

  async approveAuthorization(token, flowId) {
    return fetchAction(oauthApi.approveAuthorization as never, { flowId: flowId as never } as never, { token }) as Promise<OAuthApprovalResult>;
  },

  async listAuthorizedApps(token) {
    return fetchQuery(oauthApi.listAuthorizedApps as never, {} as never, { token }) as Promise<OAuthAuthorizedAppSummary[]>;
  },

  async getAuthorizedAppDetail(token, clientId) {
    return fetchQuery(oauthApi.getAuthorizedAppDetail as never, { clientId } as never, { token }) as Promise<OAuthAuthorizedAppDetail | null>;
  },

  async revokeAuthorizedApp(token, clientId) {
    await fetchAction(oauthApi.revokeAuthorizedApp as never, { clientId } as never, { token });
  },
};
