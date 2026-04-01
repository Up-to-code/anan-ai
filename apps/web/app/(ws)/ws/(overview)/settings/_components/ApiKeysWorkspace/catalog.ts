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
import {
  formatLocaleDateTime,
  type AppLocale,
} from "@/lib/locale";

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

const basePermissionCatalog = ORGANIZATION_API_KEY_RESOURCE_CATALOG.map((entry) => ({
  ...entry,
  icon: resourceIcons[entry.resource],
  allowedActions: listOrganizationApiKeyAllowedActions(entry.resource),
}));

const baseActionCatalog = ORGANIZATION_API_KEY_ACTION_CATALOG.map((entry) => ({
  ...entry,
  icon: actionIcons[entry.action],
}));

const frenchResourceLabels: Record<OrganizationApiKeyResource, string> = {
  clients: "Clients",
  properties: "Projets",
  deals: "Opportunités",
  brokers: "Courtiers",
};

const frenchActionLabels: Record<OrganizationApiKeyAction, string> = {
  read: "Lecture",
  create: "Création",
  update: "Mise à jour",
  delete: "Suppression",
};

function localizeResourceLabel(locale: AppLocale, resource: typeof basePermissionCatalog[number]) {
  if (locale === "ar") return resource.arabicLabel;
  if (locale === "fr") return frenchResourceLabels[resource.resource];
  return resource.label;
}

function localizeActionLabel(locale: AppLocale, action: typeof baseActionCatalog[number]) {
  if (locale === "ar") return action.arabicLabel;
  if (locale === "fr") return frenchActionLabels[action.action];
  return action.label;
}

export function getPermissionCatalog(locale: AppLocale) {
  return basePermissionCatalog.map((entry) => ({
    ...entry,
    label: localizeResourceLabel(locale, entry),
  }));
}

export function getActionCatalog(locale: AppLocale) {
  return baseActionCatalog.map((entry) => ({
    ...entry,
    label: localizeActionLabel(locale, entry),
  }));
}

export function permissionKey(permission: OrganizationApiKeyPermission) {
  return `${permission.resource}:${permission.action}`;
}

export function permissionLabel(permission: OrganizationApiKeyPermission, locale: AppLocale = "ar") {
  const resourceLabel = getPermissionCatalog(locale).find((entry) => entry.resource === permission.resource)?.label ?? permission.resource;
  const actionLabel = getActionCatalog(locale).find((entry) => entry.action === permission.action)?.label ?? permission.action;
  return `${resourceLabel} · ${actionLabel}`;
}

export function buildPresetPermissions(preset: "read" | "write" | "full") {
  if (preset === "read") {
    return basePermissionCatalog
      .filter((resource) => resource.allowedActions.includes("read"))
      .map((resource) => ({ resource: resource.resource, action: "read" })) as OrganizationApiKeyPermission[];
  }
  if (preset === "write") {
    return basePermissionCatalog.flatMap((resource) =>
      resource.allowedActions
        .filter((action) => action === "read" || action === "create" || action === "update")
        .map((action) => ({ resource: resource.resource, action })),
    ) as OrganizationApiKeyPermission[];
  }
  return basePermissionCatalog.flatMap((resource) =>
    resource.allowedActions.map((action) => ({ resource: resource.resource, action })),
  ) as OrganizationApiKeyPermission[];
}

export function formatApiKeyDate(value: number | undefined, locale: AppLocale, fallback: string) {
  if (!value) return fallback;
  return formatLocaleDateTime(locale, value, { dateStyle: "medium" });
}
