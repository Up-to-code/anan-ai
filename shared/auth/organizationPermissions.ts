export {
  ORGANIZATION_API_KEY_ACTION_CATALOG,
  ORGANIZATION_API_KEY_ACTIONS,
  ORGANIZATION_API_KEY_ALLOWED_PERMISSIONS,
  ORGANIZATION_API_KEY_RESOURCE_CATALOG,
  ORGANIZATION_API_KEY_RESOURCES,
  diffScopes,
  formatScopeString,
  isOrganizationApiKeyPermissionAllowed,
  listOrganizationApiKeyAllowedActions,
  normalizeRequestedScopes,
  type OrganizationApiKeyAction,
  type OrganizationApiKeyPermission,
  type OrganizationApiKeyResource,
  type OrganizationOAuthScopeId,
} from "@anan/auth/scopes";

export { ORGANIZATION_OAUTH_SCOPE_CATALOG as OAUTH_SCOPE_CATALOG } from "@anan/auth/scopes";
export { ORGANIZATION_OAUTH_SCOPE_IDS as OAUTH_SCOPE_IDS } from "@anan/auth/scopes";
