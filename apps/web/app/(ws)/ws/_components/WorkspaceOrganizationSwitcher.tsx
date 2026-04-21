"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, RefreshCw } from "lucide-react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type OrganizationSummary = {
  id: string;
  name: string;
  slug?: string | null;
};

/**
 * WHY:   The workspace navbar needs a custom org switcher that matches Anan's workspace chrome.
 * WHAT:  Lists the current user's Better Auth organizations and switches the active org on demand.
 * HOW:   Uses Better Auth organization client actions, then asks the server to refresh the Convex compatibility bridge.
 */
export default function WorkspaceOrganizationSwitcher() {
  const router = useRouter();
  const { dictionary, direction, isRtl } = useWebLocale();
  const { data: organizations, isPending: isLoadingOrganizations } =
    authClient.useListOrganizations() as {
      data?: OrganizationSummary[] | null;
      isPending?: boolean;
    };
  const { data: activeOrganization } = authClient.useActiveOrganization() as {
    data?: OrganizationSummary | null;
  };
  const [status, setStatus] = useState<string | null>(null);
  const [pendingOrganizationId, setPendingOrganizationId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (organizationId: string) => {
    if (organizationId === pendingOrganizationId) {
      return;
    }

    setPendingOrganizationId(organizationId);
    setStatus(null);
    startTransition(async () => {
      try {
        const { error } = await authClient.organization.setActive({
          organizationId,
        } as never);
        if (error) {
          throw new Error(error.message ?? "Please try again.");
        }
        await fetch("/api/organizations/current/sync", {
          method: "POST",
        });
        router.refresh();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Please try again.");
      } finally {
        setPendingOrganizationId(null);
      }
    });
  };

  if (isLoadingOrganizations) {
    return (
      <div className="rounded-xl border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[var(--workspace-panel)] px-3 py-2">
        <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--workspace-muted)]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="workspace-organization-switcher"
      className="space-y-2 rounded-[16px] border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[var(--workspace-panel)] p-2"
      dir={direction}
    >
      <div className={cn("flex items-center justify-between gap-2 px-1", isRtl ? "flex-row-reverse" : "flex-row")}>
        <div className={cn("text-[11px] font-black uppercase tracking-[0.16em] text-[var(--workspace-muted)]", isRtl ? "text-right" : "text-left")}>
          {dictionary.settings.organization}
        </div>
        <Link
          href="/ws?onboarding=required"
          className="inline-flex items-center gap-1 rounded-full border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] px-2.5 py-1 text-[10px] font-bold text-[var(--workspace-bubble-other-foreground)] transition hover:bg-[var(--workspace-elevated)]"
        >
          <Plus className="h-3 w-3" />
          <span>Create</span>
        </Link>
      </div>

      <div className="space-y-1">
        {(organizations ?? []).map((organization) => {
          const isActive = organization.id === activeOrganization?.id;
          const isLoading = pendingOrganizationId === organization.id && isPending;

          return (
            <button
              key={organization.id}
              type="button"
              onClick={() => handleSwitch(organization.id)}
              disabled={isLoading}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-start transition-all",
                isActive
                  ? "bg-[var(--workspace-highlight)] text-white"
                  : "bg-transparent text-[var(--workspace-bubble-other-foreground)] hover:bg-[var(--workspace-elevated)]",
              )}
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold">{organization.name}</div>
                <div className={cn("mt-0.5 truncate text-[11px] font-medium", isActive ? "text-white/80" : "text-[var(--workspace-muted)]")}>
                  {organization.slug ?? "organization"}
                </div>
              </div>
              <div className="shrink-0">
                {isLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : isActive ? (
                  <Check className="h-4 w-4" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {status ? (
        <div className="rounded-xl bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-700 dark:text-red-300">
          {status}
        </div>
      ) : null}
    </div>
  );
}
