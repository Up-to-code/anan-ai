import Link from "next/link";
import { Clock3, Link2 } from "lucide-react";
import { redirect } from "next/navigation";
import { buildWorkspaceSecurityAppsPath, getAuthenticatedSession } from "@/lib/serverSession";
import { PageHeader, WorkspacePanel } from "@/app/(ws)/ws/public";
import type { OAuthAuthorizedAppSummary } from "@/server/contracts/oauth";
import { listAuthorizedAppsForCurrentUser } from "@/server/domains/auth/oauth/service";

function AuthorizedAppCard({ app }: { app: OAuthAuthorizedAppSummary }) {
  return (
    <Link href={buildWorkspaceSecurityAppsPath(app.clientId)}>
      <WorkspacePanel className="flex flex-col gap-4 transition hover:border-blue-600 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-bold uppercase text-white dark:bg-slate-100 dark:text-slate-950">
            {(app.appName ?? "?").slice(0, 1)}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100">{app.appName}</div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{app.publisherName}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(app.scopeDetails ?? []).slice(0, 3).map((scope) => (
            <span
              key={scope.id}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black uppercase tracking-widest text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {scope.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Link2 className="h-3.5 w-3.5 text-blue-600" />
            {new Date(app.createdAt).toLocaleDateString("ar-SA")}
          </span>
          <span className="flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5 text-blue-600" />
            {app.lastUsedAt ? new Date(app.lastUsedAt).toLocaleDateString("ar-SA") : "لم يُستخدم"}
          </span>
        </div>
      </WorkspacePanel>
    </Link>
  );
}

function SecurityAppsList({ apps }: { apps: OAuthAuthorizedAppSummary[] }) {
  if (apps.length === 0) {
    return (
      <WorkspacePanel className="py-8 text-center text-sm text-slate-500">
        لا توجد تطبيقات مرتبطة بعد.
      </WorkspacePanel>
    );
  }
  return apps.map((app) => <AuthorizedAppCard key={app.clientId} app={app} />);
}

/**
 * WHY:   Connected-app management stays in the overview account area after the workspace shell split.
 * WHAT:  Lists the OAuth apps authorized by the current user.
 * HOW:   Reads the authenticated session, redirects anonymous users, and renders the app summaries in workspace panels.
 */
export default async function WorkspaceSecurityAppsPage() {
  const { token } = await getAuthenticatedSession();
  if (!token) redirect(`/signin?returnTo=${encodeURIComponent(buildWorkspaceSecurityAppsPath())}`);
  const apps = await listAuthorizedAppsForCurrentUser();

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 px-6 pt-6 dark:border-slate-800 lg:px-10 lg:pt-10">
        <PageHeader
          eyebrow="Connected Apps"
          title="التطبيقات المرتبطة"
          description="راجع التطبيقات المتصلة بحسابك في عنان."
        />
      </div>

      <div className="space-y-3 bg-background p-6 text-foreground lg:p-10">
        <SecurityAppsList apps={apps} />
      </div>
    </div>
  );
}
