import type { UserRole } from "@/_core/hooks/useRole";
import { stripLocalePrefix } from "../../shared_logic/i18n/config";

export type DashboardRolePath = "broker" | "red" | "user";

export function toDashboardRolePath(role: UserRole | undefined): DashboardRolePath | null {
  switch (role) {
    case "broker":
      return "broker";
    case "RED":
      return "red";
    case "normal":
      return "user";
    default:
      return null;
  }
}

export function getDashboardBasePath(role: UserRole | undefined): string {
  if (role === "admin") return "/admin";
  const rolePath = toDashboardRolePath(role);
  return rolePath ? `/dashboard/${rolePath}` : "/dashboard";
}

export function isPathAllowedForRole(path: string, role: UserRole | undefined): boolean {
  if (!role) return false;

  const normalized = stripLocalePrefix(path);
  if (normalized === "/dashboard/verification") return true;

  if (role === "admin") return normalized.startsWith("/admin");
  if (role === "broker") return normalized.startsWith("/dashboard/broker");
  if (role === "RED") return normalized.startsWith("/dashboard/red");
  if (role === "normal") return normalized.startsWith("/dashboard/user");
  if (role === "user") return normalized === "/dashboard";

  return false;
}
