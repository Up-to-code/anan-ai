import { apiUnsafe } from "@/lib/convexApi";

export type OAuthApiRefs = {
  getAuthorizationPrompt: unknown;
  approveAuthorization: unknown;
  listAuthorizedApps: unknown;
  getAuthorizedAppDetail: unknown;
  revokeAuthorizedApp: unknown;
};

export const oauthApi = apiUnsafe["shared_logic/oauth/index"] as OAuthApiRefs;
