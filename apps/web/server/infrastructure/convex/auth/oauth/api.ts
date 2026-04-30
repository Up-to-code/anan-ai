import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type OAuthApiRefs = {
  getAuthorizationPrompt: unknown;
  approveAuthorization: unknown;
  listAuthorizedApps: unknown;
  getAuthorizedAppDetail: unknown;
  revokeAuthorizedApp: unknown;
};

export const oauthApi = createRepositoryRefs<OAuthApiRefs>(apiUnsafe, "shared_logic/oauth/index");
