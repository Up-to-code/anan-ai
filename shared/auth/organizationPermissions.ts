export const ORGANIZATION_API_KEY_RESOURCES = ["clients", "properties"] as const;
export const ORGANIZATION_API_KEY_ACTIONS = ["read", "create", "update", "delete"] as const;

export type OrganizationApiKeyResource = (typeof ORGANIZATION_API_KEY_RESOURCES)[number];
export type OrganizationApiKeyAction = (typeof ORGANIZATION_API_KEY_ACTIONS)[number];

export const ORGANIZATION_API_KEY_RESOURCE_CATALOG = [
  {
    resource: "clients",
    label: "Clients",
    arabicLabel: "العملاء",
  },
  {
    resource: "properties",
    label: "Properties",
    arabicLabel: "العقارات",
  },
] as const satisfies ReadonlyArray<{
  resource: OrganizationApiKeyResource;
  label: string;
  arabicLabel: string;
}>;

export const ORGANIZATION_API_KEY_ACTION_CATALOG = [
  {
    action: "read",
    label: "Read",
    arabicLabel: "قراءة",
  },
  {
    action: "create",
    label: "Create",
    arabicLabel: "إنشاء",
  },
  {
    action: "update",
    label: "Update",
    arabicLabel: "تحديث",
  },
  {
    action: "delete",
    label: "Delete",
    arabicLabel: "حذف",
  },
] as const satisfies ReadonlyArray<{
  action: OrganizationApiKeyAction;
  label: string;
  arabicLabel: string;
}>;

export const OAUTH_SCOPE_CATALOG = [
  { id: "openid", label: "Confirm your Anan identity" },
  { id: "profile", label: "Read your basic profile information" },
  { id: "email", label: "Read your verified email address" },
  { id: "offline_access", label: "Stay connected when you are not actively using Anan" },
  { id: "clients:read", label: "Read client records you can access" },
  { id: "clients:create", label: "Create clients on your behalf" },
  { id: "clients:update_own", label: "Update clients that belong to your account" },
  { id: "clients:read_own", label: "Read clients that belong to your account" },
  { id: "properties:read", label: "Read properties you can access" },
  { id: "properties:create_own", label: "Create properties that belong to your account" },
  { id: "properties:update_own", label: "Update properties that belong to your account" },
  { id: "properties:delete_own", label: "Delete properties that belong to your account" },
  { id: "properties:read_own", label: "Read properties that belong to your account" },
] as const;

export type OrganizationOAuthScopeId = (typeof OAUTH_SCOPE_CATALOG)[number]["id"];
export const OAUTH_SCOPE_IDS = OAUTH_SCOPE_CATALOG.map((scope) => scope.id) as readonly OrganizationOAuthScopeId[];

