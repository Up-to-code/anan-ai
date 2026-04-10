"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, RefreshCw } from "lucide-react";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";

function readMemberships(source: unknown) {
  const resource = source as { data?: unknown[] } | undefined;
  return Array.isArray(resource?.data) ? resource.data : [];
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function getOrganizationFromMembership(membership: unknown) {
  return ((membership as { organization?: Record<string, unknown> } | null)?.organization ?? null);
}

/**
 * WHY:   The workspace navbar needs a fully custom org switcher that matches Anan's brand while Clerk owns org truth.
 * WHAT:  Lists the current user's Clerk organization memberships and switches the active org on demand.
 * HOW:   Uses Clerk's low-level hooks, then posts to the sync route so the Convex compatibility bridge follows the active org.
 */
export default function WorkspaceOrganizationSwitcher() {
  const router = useRouter();
  const { dictionary, direction, isRtl } = useWebLocale();
  const clerkOrganizations = useOrganizationList({
    userMemberships: {
      infinite: true,
      keepPreviousData: true,
    },
  } as never) as unknown as {
    isLoaded?: boolean;
    setActive?: (args: { organization: string }) => Promise<unknown>;
    userMemberships?: unknown;
  };
  const activeOrganization = (useOrganization() as unknown as {
    organization?: Record<string, unknown> | null;
  }).organization;
  const memberships = useMemo(
    () => readMemberships(clerkOrganizations.userMemberships),
    [clerkOrganizations.userMemberships],
  );
  const [status, setStatus] = useState<string | null>(null);
  const [pendingOrganizationId, setPendingOrganizationId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (organizationId: string) => {
    if (!clerkOrganizations.setActive || organizationId === pendingOrganizationId) {
      return;
    }

    setPendingOrganizationId(organizationId);
    setStatus(null);
    startTransition(async () => {
      try {
        await clerkOrganizations.setActive?.({ organization: organizationId });
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

  if (!clerkOrganizations.isLoaded) {
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
        {memberships.map((membership) => {
          const organization = getOrganizationFromMembership(membership);
          const organizationId = readString(organization?.id);
          if (!organization || !organizationId) {
            return null;
          }

          const isActive = organizationId === readString(activeOrganization?.id);
          const isLoading = pendingOrganizationId === organizationId && isPending;

          return (
            <button
              key={organizationId}
              type="button"
              onClick={() => handleSwitch(organizationId)}
              disabled={isLoading}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-start transition-all",
                isActive
                  ? "bg-[var(--workspace-highlight)] text-white"
                  : "bg-transparent text-[var(--workspace-bubble-other-foreground)] hover:bg-[var(--workspace-elevated)]",
              )}
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold">
                  {readString(organization.name) ?? "Organization"}
                </div>
                <div className={cn("mt-0.5 truncate text-[11px] font-medium", isActive ? "text-white/80" : "text-[var(--workspace-muted)]")}>
                  {readString((membership as { role?: unknown } | null)?.role) ?? "org:member"}
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
