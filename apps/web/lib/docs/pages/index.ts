import type { DocsPageDefinition, DocsPageKey } from "../types";
import { apiClientsPage } from "./apiClients";
import { apiKeysPage } from "./apiKeys";
import { apiPropertiesPage } from "./apiProperties";
import { errorsAndSecurityPage } from "./errorsAndSecurity";
import { gettingStartedPage } from "./gettingStarted";
import { oauthAuthorizationCodePkcePage } from "./oauthAuthorizationCodePkce";
import { oauthGetCredentialsPage } from "./oauthGetCredentials";
import { oauthOverviewPage } from "./oauthOverview";
import { scopesAndOrgPermissionsPage } from "./scopesAndOrgPermissions";

export const docsPages: Record<DocsPageKey, DocsPageDefinition> = {
  "getting-started": gettingStartedPage,
  "api-keys": apiKeysPage,
  "oauth-overview": oauthOverviewPage,
  "oauth-get-credentials": oauthGetCredentialsPage,
  "oauth-authorization-code-pkce": oauthAuthorizationCodePkcePage,
  "scopes-and-org-permissions": scopesAndOrgPermissionsPage,
  "api-clients": apiClientsPage,
  "api-properties": apiPropertiesPage,
  "errors-and-security": errorsAndSecurityPage,
};
