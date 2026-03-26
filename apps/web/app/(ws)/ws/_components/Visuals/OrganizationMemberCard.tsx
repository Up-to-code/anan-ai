import { Building2, Mail, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrganizationSummary } from "@/server/contracts/organizations";
import type { OrganizationMemberDisplay } from "../../_lib/entities";
import {
  getOrganizationMemberInitials,
  getOrganizationMemberRoleLabel,
  getOrganizationMemberTheme,
} from "../../_lib/organizationMembers";

/**
 * WHY:   Current-organization member screens need one reusable card instead of repeating bespoke team-member markup.
 * WHAT:  Renders a member-focused card with initials, email, role, status, organization accent, and optional actions.
 * HOW:   Uses the existing `OrganizationMemberDisplay` payload plus organization type to keep styling shared across settings and CRM.
 */
export default function OrganizationMemberCard({
  member,
  organizationType,
  footer,
  className,
}: {
  member: OrganizationMemberDisplay;
  organizationType: OrganizationSummary["type"] | null | undefined;
  footer?: React.ReactNode;
  className?: string;
}) {
  const theme = getOrganizationMemberTheme(organizationType);
  const roleLabel = getOrganizationMemberRoleLabel(member.role);
  const avatarLabel = getOrganizationMemberInitials(member.name);
  const isActive = member.statusLabel === "نشط";

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-slate-200/60 border-l-[3px] bg-white shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-950",
        "hover:-translate-y-0.5 hover:shadow-lg",
        theme.borderClassName,
        className,
      )}
    >
      <div className="space-y-4 p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl text-lg font-black ring-2 ring-slate-100 transition-shadow dark:ring-slate-800",
                theme.avatarClassName,
                theme.ringClassName,
              )}
            >
              {avatarLabel}
            </div>
            <span
              className={cn(
                "absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-white dark:border-slate-950",
                theme.accentDotClassName,
              )}
            >
              {organizationType === "red" ? (
                <Building2 className="h-2.5 w-2.5" />
              ) : (
                <Users className="h-2.5 w-2.5" />
              )}
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{member.name}</h3>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold",
                  theme.roleClassName,
                )}
              >
                {organizationType === "red" ? <Building2 className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                {roleLabel}
              </span>
            </div>

            <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {theme.accentLabel}
            </p>

            <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400" dir="ltr">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{member.email}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest",
              isActive
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            {isActive ? <ShieldCheck className="h-3 w-3" /> : null}
            {member.statusLabel}
          </span>
          {member.username ? (
            <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:border-slate-700 dark:text-slate-400">
              @{member.username}
            </span>
          ) : null}
        </div>

        {footer ? <div className="border-t border-slate-100 pt-4 dark:border-slate-800">{footer}</div> : null}
      </div>
    </article>
  );
}
