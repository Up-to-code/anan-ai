import type {
  OAuthApprovalResult,
  OAuthAuthorizationPrompt,
  OAuthAuthorizedAppDetail,
  OAuthAuthorizedAppSummary,
} from "@/server/contracts/oauth";

/**
 * WHY: OAuth pages should use the same repository abstraction as the rest of the web server layer.
 * WHAT: Defines the consent and connected-app operations exposed to the domain layer.
 * HOW: Each method accepts the current auth token and returns stable OAuth DTOs.
 */
export type OAuthRepository = {
  getAuthorizationPrompt(token: string, flowId: string, tenantOrgId?: string): Promise<OAuthAuthorizationPrompt>;
  approveAuthorization(token: string, flowId: string, tenantOrgId: string): Promise<OAuthApprovalResult>;
  listAuthorizedApps(token: string): Promise<OAuthAuthorizedAppSummary[]>;
  getAuthorizedAppDetail(token: string, clientId: string): Promise<OAuthAuthorizedAppDetail | null>;
  revokeAuthorizedApp(token: string, clientId: string): Promise<void>;
};
