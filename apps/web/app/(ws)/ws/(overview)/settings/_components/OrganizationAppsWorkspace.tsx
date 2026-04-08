"use client";

import { useState, useTransition } from "react";
import { Clock3, PlugZap, ShieldBan } from "lucide-react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import type { OAuthAuthorizedAppSummary } from "@/server/contracts/oauth";

type OrganizationAppsWorkspaceProps = {
  initialApps: OAuthAuthorizedAppSummary[];
  canManage: boolean;
  hasOrganization: boolean;
  showLegacyNotice: boolean;
  onRevokeApp: (clientId: string) => Promise<{ ok: true; message: string } | { ok: false; message: string }>;
};

export default function OrganizationAppsWorkspace({
  initialApps,
  canManage,
  hasOrganization,
  showLegacyNotice,
  onRevokeApp,
}: OrganizationAppsWorkspaceProps) {
  const { dictionary, locale } = useWebLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "medium",
  });
  const [apps, setApps] = useState(initialApps);
  const [status, setStatus] = useState<string | null>(null);
  const [revokingClientId, setRevokingClientId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!hasOrganization) {
    return (
      <div className="rounded-[28px] bg-[var(--workspace-panel)] p-6 text-sm text-slate-500 dark:text-slate-300">
        {dictionary.settings.organizationNoOrganization}
      </div>
    );
  }

  async function handleRevoke(clientId: string) {
    const confirmed = window.confirm(dictionary.settings.connectedAppsRevokeConfirm);
    if (!confirmed) return;

    setRevokingClientId(clientId);
    setStatus(dictionary.settings.connectedAppsRevoking);
    startTransition(async () => {
      const result = await onRevokeApp(clientId);
      setStatus(result.message);
      setRevokingClientId(null);
      if (result.ok) {
        setApps((current) => current.filter((app) => app.clientId !== clientId));
      }
    });
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-[var(--workspace-panel)] p-6 sm:p-7">
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-950 dark:text-slate-100">
            {dictionary.settings.connectedAppsPageTitle}
          </h2>
          <p className="text-sm leading-7 text-slate-500 dark:text-slate-300">
            {dictionary.settings.connectedAppsPageDescription}
          </p>
        </div>

        {showLegacyNotice ? (
          <div className="mt-5 rounded-[22px] bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
            {dictionary.settings.connectedAppsLegacyNotice}
          </div>
        ) : null}

        {!canManage ? (
          <div className="mt-4 rounded-[22px] bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
            {dictionary.settings.connectedAppsReadonlyNotice}
          </div>
        ) : null}

        {status ? (
          <div className="mt-4 rounded-[18px] bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
            {status}
          </div>
        ) : null}
      </section>

      {apps.length === 0 ? (
        <section className="rounded-[28px] bg-[var(--workspace-panel)] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            <PlugZap className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-slate-100">
            {dictionary.settings.connectedAppsEmptyTitle}
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-300">
            {dictionary.settings.connectedAppsEmptyDescription}
          </p>
        </section>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => {
            const isRevoking = isPending && revokingClientId === app.clientId;
            return (
              <section
                key={app.clientId}
                className="rounded-[28px] bg-[var(--workspace-panel)] p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-slate-100 text-sm font-black uppercase text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      {(app.appName ?? "?").slice(0, 1)}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-base font-bold text-slate-950 dark:text-slate-100">{app.appName}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                          {app.publisherName}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-900">
                          {dictionary.settings.connectedAppsConnectedAt}: {dateFormatter.format(new Date(app.createdAt))}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-900">
                          <Clock3 className="h-3.5 w-3.5" />
                          {dictionary.settings.connectedAppsLastUsed}:{" "}
                          {app.lastUsedAt
                            ? dateFormatter.format(new Date(app.lastUsedAt))
                            : dictionary.settings.connectedAppsNeverUsed}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canManage ? (
                    <button
                      type="button"
                      disabled={isRevoking}
                      onClick={() => handleRevoke(app.clientId)}
                      className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      <ShieldBan className="h-4 w-4" />
                      {isRevoking ? dictionary.settings.connectedAppsRevoking : dictionary.settings.connectedAppsRevoke}
                    </button>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(app.scopeDetails ?? []).map((scope) => (
                    <span
                      key={scope.id}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                    >
                      {scope.label}
                    </span>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
