import type { DocsScope } from "./types";
import { OAUTH_SCOPE_CATALOG } from "@/lib/auth/organizationPermissions";

export const OAUTH_SCOPES: DocsScope[] = [...OAUTH_SCOPE_CATALOG];

export function getScopeLabel(scopeId: string) {
  return OAUTH_SCOPES.find((scope) => scope.id === scopeId)?.label ?? scopeId;
}
