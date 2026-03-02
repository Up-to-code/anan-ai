import type { UserRole } from "@/_core/hooks/useRole";
import {
  getDashboardBasePath,
  isPathAllowedForRole as isPathAllowedForRoleByRouter,
} from "../router/paths";

/**
 * Returns the default redirect path for each role after sign-in.
 * Admin is never exposed; only backend/DB can set it.
 */
export function getRedirectPathByRole(role: UserRole | undefined): string {
  return getDashboardBasePath(role);
}

/**
 * Returns true if the path is valid for the given role.
 */
export function isPathAllowedForRole(
  path: string,
  role: UserRole | undefined
): boolean {
  return isPathAllowedForRoleByRouter(path, role);
}
