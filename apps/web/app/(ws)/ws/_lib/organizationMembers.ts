import type { OrganizationSummary } from "@/server/contracts/organizations";
import type { OrganizationMemberDisplay } from "./entities";

type OrganizationMemberVisualTheme = {
  borderClassName: string;
  ringClassName: string;
  avatarClassName: string;
  roleClassName: string;
  accentDotClassName: string;
  accentLabel: string;
};

/**
 * WHY:   Workspace member cards should share the same Arabic role labels across settings and CRM.
 * WHAT:  Returns the display label for one normalized organization membership role.
 * HOW:   Maps the existing `OrganizationMemberDisplay["role"]` union to short UI-safe labels.
 */
export function getOrganizationMemberRoleLabel(role: OrganizationMemberDisplay["role"]): string {
  if (role === "manager") return "مدير";
  if (role === "viewer") return "مشاهد";
  return "عضو";
}

/**
 * WHY:   Shared member cards need a deterministic avatar fallback without duplicating name parsing in each page.
 * WHAT:  Builds a short initials label from the member name.
 * HOW:   Trims whitespace, keeps the first visible character, and falls back to `؟` for empty names.
 */
export function getOrganizationMemberInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "؟";
  return [...trimmed].slice(0, 1).join("").toUpperCase();
}

/**
 * WHY:   Broker and developer organizations should feel distinct while still using the same member card component.
 * WHAT:  Returns the visual accent tokens for a workspace organization type.
 * HOW:   Maps `broker` to a blue treatment and `red` to an indigo treatment used by the shared card shell.
 */
export function getOrganizationMemberTheme(
  organizationType: OrganizationSummary["type"] | null | undefined,
): OrganizationMemberVisualTheme {
  if (organizationType === "red") {
    return {
      borderClassName: "border-l-indigo-500 hover:border-indigo-200 dark:hover:border-indigo-500/40",
      ringClassName: "group-hover:ring-indigo-100 dark:group-hover:ring-indigo-500/30",
      avatarClassName:
        "bg-gradient-to-br from-indigo-50 to-slate-100 text-slate-500 dark:from-indigo-500/20 dark:to-slate-800 dark:text-slate-200",
      roleClassName:
        "border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300",
      accentDotClassName: "bg-indigo-500",
      accentLabel: "فريق التطوير",
    };
  }

  return {
    borderClassName: "border-l-blue-500 hover:border-blue-200 dark:hover:border-blue-500/40",
    ringClassName: "group-hover:ring-blue-100 dark:group-hover:ring-blue-500/30",
    avatarClassName:
      "bg-gradient-to-br from-blue-50 to-slate-100 text-slate-500 dark:from-blue-500/20 dark:to-slate-800 dark:text-slate-200",
    roleClassName:
      "border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
    accentDotClassName: "bg-blue-500",
    accentLabel: "فريق الوساطة",
  };
}
