import type { DocsScope } from "./types";

export const OAUTH_SCOPES: DocsScope[] = [
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
];

export function getScopeLabel(scopeId: string) {
  return OAUTH_SCOPES.find((scope) => scope.id === scopeId)?.label ?? scopeId;
}
