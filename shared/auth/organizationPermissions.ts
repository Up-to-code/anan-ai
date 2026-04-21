export const ORGANIZATION_API_KEY_RESOURCES = ["clients", "properties", "deals", "brokers"] as const;
export const ORGANIZATION_API_KEY_ACTIONS = ["read", "create", "update", "delete"] as const;

export type OrganizationApiKeyResource = (typeof ORGANIZATION_API_KEY_RESOURCES)[number];
export type OrganizationApiKeyAction = (typeof ORGANIZATION_API_KEY_ACTIONS)[number];
export type OrganizationApiKeyPermission = {
  resource: OrganizationApiKeyResource;
  action: OrganizationApiKeyAction;
};

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
  {
    resource: "deals",
    label: "Deals",
    arabicLabel: "الصفقات",
  },
  {
    resource: "brokers",
    label: "Brokers",
    arabicLabel: "الوسطاء",
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

export const ORGANIZATION_API_KEY_ALLOWED_PERMISSIONS = [
  { resource: "clients", action: "read" },
  { resource: "clients", action: "create" },
  { resource: "clients", action: "update" },
  { resource: "clients", action: "delete" },
  { resource: "properties", action: "read" },
  { resource: "properties", action: "create" },
  { resource: "properties", action: "update" },
  { resource: "properties", action: "delete" },
  { resource: "deals", action: "read" },
  { resource: "deals", action: "create" },
  { resource: "deals", action: "update" },
  { resource: "deals", action: "delete" },
  { resource: "brokers", action: "read" },
] as const satisfies readonly OrganizationApiKeyPermission[];

const allowedPermissionKeySet = new Set(
  ORGANIZATION_API_KEY_ALLOWED_PERMISSIONS.map((permission) => `${permission.resource}:${permission.action}`),
);

export function isOrganizationApiKeyPermissionAllowed(permission: OrganizationApiKeyPermission) {
  return allowedPermissionKeySet.has(`${permission.resource}:${permission.action}`);
}

export function listOrganizationApiKeyAllowedActions(resource: OrganizationApiKeyResource) {
  return ORGANIZATION_API_KEY_ALLOWED_PERMISSIONS
    .filter((permission) => permission.resource === resource)
    .map((permission) => permission.action);
}

export const OAUTH_SCOPE_CATALOG = [
  { id: "offline_access", label: "Keep the organization connected when nobody is actively using Anan" },
  { id: "clients:read", label: "Read client records available to the connected organization" },
  { id: "clients:create", label: "Create clients for the connected organization" },
  { id: "clients:update_own", label: "Update clients that belong to the connected organization" },
  { id: "clients:read_own", label: "Read clients that belong to the connected organization" },
  { id: "properties:read", label: "Read properties available to the connected organization" },
  { id: "properties:create_own", label: "Create properties for the connected organization" },
  { id: "properties:update_own", label: "Update properties that belong to the connected organization" },
  { id: "properties:delete_own", label: "Delete properties that belong to the connected organization" },
  { id: "properties:read_own", label: "Read properties that belong to the connected organization" },
] as const;

export type OrganizationOAuthScopeId = (typeof OAUTH_SCOPE_CATALOG)[number]["id"];
export const OAUTH_SCOPE_IDS = OAUTH_SCOPE_CATALOG.map((scope) => scope.id) as readonly OrganizationOAuthScopeId[];
