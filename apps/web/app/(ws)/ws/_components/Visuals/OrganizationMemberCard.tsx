import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrganizationSummary } from "@/server/contracts/organizations";
import type { OrganizationMemberDisplay } from "../../_lib/entities";
import {
  getOrganizationMemberInitials,
  getOrganizationMemberRoleLabel,
  getOrganizationMemberTheme,
} from "../../_lib/organizationMembers";

/**
 * Simplified member card — clean row layout with avatar, name, email, role, and optional footer.
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
      dir="rtl"
      className={cn(
        "rounded-2xl border border-border bg-card p-4 transition-all hover:bg-muted/30",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black",
            theme.avatarClassName,
          )}
        >
          {avatarLabel}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[14px] font-bold text-foreground">{member.name}</h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                isActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {member.statusLabel}
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground" dir="ltr">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{member.email}</span>
          </p>
        </div>

        {/* Role */}
        <span className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
          {roleLabel}
        </span>
      </div>

      {footer ? <div className="mt-3 border-t border-border pt-3">{footer}</div> : null}
    </article>
  );
}
