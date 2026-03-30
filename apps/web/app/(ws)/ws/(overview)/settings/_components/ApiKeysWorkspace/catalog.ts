import type { LucideIcon } from "lucide-react";
import { Eye, FilePenLine, Home, PlusCircle, ReceiptText, Trash2, Users } from "lucide-react";
import {
  ORGANIZATION_API_KEY_ACTION_CATALOG,
  ORGANIZATION_API_KEY_RESOURCE_CATALOG,
  listOrganizationApiKeyAllowedActions,
  type OrganizationApiKeyAction,
  type OrganizationApiKeyPermission,
  type OrganizationApiKeyResource,
} from "@/lib/auth/organizationPermissions";

const resourceIcons: Record<OrganizationApiKeyResource, LucideIcon> = {
  clients: Users,
  properties: Home,
  deals: ReceiptText,
  brokers: Users,
};

const actionIcons: Record<OrganizationApiKeyAction, LucideIcon> = {
  read: Eye,
  create: PlusCircle,
  update: FilePenLine,
  delete: Trash2,
};

export const permissionCatalog = ORGANIZATION_API_KEY_RESOURCE_CATALOG.map((entry) => ({
  ...entry,
  label: entry.arabicLabel,
  icon: resourceIcons[entry.resource],
  allowedActions: listOrganizationApiKeyAllowedActions(entry.resource),
}));

export const actionCatalog = ORGANIZATION_API_KEY_ACTION_CATALOG.map((entry) => ({
  ...entry,
  label: entry.arabicLabel,
  icon: actionIcons[entry.action],
}));

export function permissionKey(permission: OrganizationApiKeyPermission) {
  return `${permission.resource}:${permission.action}`;
}

export function permissionLabel(permission: OrganizationApiKeyPermission) {
  const resourceLabel = permissionCatalog.find((entry) => entry.resource === permission.resource)?.label ?? permission.resource;
  const actionLabel = actionCatalog.find((entry) => entry.action === permission.action)?.label ?? permission.action;
  return `${resourceLabel} · ${actionLabel}`;
}

export function buildPresetPermissions(preset: "read" | "write" | "full") {
  if (preset === "read") {
    return permissionCatalog
      .filter((resource) => resource.allowedActions.includes("read"))
      .map((resource) => ({ resource: resource.resource, action: "read" })) as OrganizationApiKeyPermission[];
  }
  if (preset === "write") {
    return permissionCatalog.flatMap((resource) =>
      resource.allowedActions
        .filter((action) => action === "read" || action === "create" || action === "update")
        .map((action) => ({ resource: resource.resource, action })),
    ) as OrganizationApiKeyPermission[];
  }
  return permissionCatalog.flatMap((resource) =>
    resource.allowedActions.map((action) => ({ resource: resource.resource, action })),
  ) as OrganizationApiKeyPermission[];
}

export function formatApiKeyDate(value?: number) {
  if (!value) return "لم يُستخدم";
  return new Date(value).toLocaleDateString("ar-EG");
}
